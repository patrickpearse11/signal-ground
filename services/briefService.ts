import { supabase } from './supabaseClient'
import { Brief } from '@/types/brief'

/**
 * Fetches today's brief for the user.
 * Calls the Edge Function which either returns cached or generates fresh.
 */
export async function fetchTodaysBrief(userId: string, zip: string): Promise<Brief | null> {
  try {
    const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-brief`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ user_id: userId, zip }),
    })

    if (!response.ok) throw new Error(`Brief function error: ${response.status}`)
    const data = await response.json()
    return data.brief || null

  } catch (err) {
    console.warn('fetchTodaysBrief failed:', err)
    return null
  }
}

/**
 * Fetches today's stored brief from Supabase directly.
 * Fast cache fallback if the Edge Function is slow.
 */
export async function fetchCachedBrief(userId: string): Promise<Brief | null> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (error) return null
    return data
  } catch (err) {
    console.warn('fetchCachedBrief failed:', err)
    return null
  }
}
