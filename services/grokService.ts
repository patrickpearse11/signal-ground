import { supabase } from './supabaseClient'
import { SignalCard, RawHeadline, ChokepointCard } from '@/types/signal'

/**
 * Sends headlines to the generate-signal Edge Function, gets back SignalCards.
 * All AI logic lives in the Edge Function — this is just the client caller.
 */
export async function generateSignals(headlines: RawHeadline[]): Promise<SignalCard[]> {
  try {
    const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-signal`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ headlines }),
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
    return data || []

  } catch (err) {
    console.warn('fetchLatestSignals failed:', err)
    return []
  }
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
