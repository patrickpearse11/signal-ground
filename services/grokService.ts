import { supabase } from './supabaseClient'
import { SignalCard, TradeCard } from '@/types/signal'

const FUNCTIONS_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

/**
 * Calls generate-signal Edge Function — Grok searches the web for today's top global stories.
 */
export async function generateSignals(): Promise<SignalCard[]> {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/generate-signal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({}),
    })
    if (!response.ok) throw new Error(`Edge function error: ${response.status}`)
    const data = await response.json()
    return data.signals || []
  } catch (err) {
    console.warn('generateSignals failed:', err)
    return []
  }
}

/**
 * Fetches the latest stored signals from Supabase.
 */
export async function fetchLatestSignals(limit = 20): Promise<SignalCard[]> {
  try {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return deduplicateByTags(data || [])
  } catch (err) {
    console.warn('fetchLatestSignals failed:', err)
    return []
  }
}

function deduplicateByTags(signals: SignalCard[]): SignalCard[] {
  const seen: string[][] = []
  return signals.filter(signal => {
    const tags = (signal.tags || []).map(t => t.toLowerCase())
    const isDupe = seen.some(existing => {
      const shared = tags.filter(t => existing.includes(t))
      return shared.length >= 3
    })
    if (!isDupe) seen.push(tags)
    return !isDupe
  })
}

const CATEGORY_MAP: Record<string, TradeCard['category']> = {
  maritime: 'maritime',
  tariffs: 'tariffs',
  commodities: 'commodities',
  supply_chain: 'supply_chain',
  monetary: 'monetary',
}

/**
 * Calls generate-trade-monitor Edge Function, falls back to reading trade_routes directly.
 */
export async function fetchTradeCards(): Promise<TradeCard[]> {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/generate-trade-monitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({}),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.cards && data.cards.length > 0) {
        return data.cards.map((row: any) => ({
          id: row.id,
          title: row.title || row.route_name,
          category: CATEGORY_MAP[row.category] || 'maritime',
          severity: (row.status || row.severity) as TradeCard['severity'],
          summary: row.summary || '',
          tarzana_impact: row.tarzana_impact || row.grok_oneliner || '',
          impact_detail: row.impact_detail || '',
          tags: row.tags || [],
          route_name: row.route_name,
          updated_at: row.updated_at,
        }))
      }
    }

    // Fallback: read from Supabase directly
    const { data, error } = await supabase
      .from('trade_routes')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(10)

    if (error) throw error

    // Deduplicate by route_name
    const seen = new Set<string>()
    const unique = (data || []).filter((row: any) => {
      if (seen.has(row.route_name)) return false
      seen.add(row.route_name)
      return true
    })

    return unique.map((row: any) => ({
      id: row.id,
      title: row.route_name,
      category: CATEGORY_MAP[row.category] || 'maritime',
      severity: row.status as TradeCard['severity'],
      summary: '',
      tarzana_impact: row.tarzana_impact || row.grok_oneliner || '',
      impact_detail: row.impact_detail || '',
      tags: [],
      route_name: row.route_name,
      updated_at: row.updated_at,
    }))
  } catch (err) {
    console.warn('fetchTradeCards failed:', err)
    return []
  }
}
