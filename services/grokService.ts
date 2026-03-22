import { supabase } from './supabaseClient'
import { SignalCard, ChokepointCard } from '@/types/signal'

/**
 * Calls generate-signal Edge Function — Grok web_search finds today's stories itself.
 * No headlines needed — the Edge Function searches the web directly.
 */
export async function generateSignals(): Promise<SignalCard[]> {
  try {
    const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-signal`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
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
 * Used by the Signal feed screen.
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
      return shared.length >= 2
    })
    if (!isDupe) seen.push(tags)
    return !isDupe
  })
}

export async function fetchChokepoints(): Promise<ChokepointCard[]> {
  try {
    const { data, error } = await supabase
      .from('trade_routes')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data || []).map((row: any) => ({
      id: row.id,
      route_name: row.route_name,
      status: row.status as ChokepointCard['status'],
      grok_oneliner: row.grok_oneliner,
      region: row.region || '',
      impact_category: (row.impact_category || 'prices') as ChokepointCard['impact_category'],
      updated_at: row.updated_at,
    }))
  } catch (err) {
    console.warn('fetchChokepoints failed:', err)
    return []
  }
}
