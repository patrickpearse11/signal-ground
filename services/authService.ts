import { supabase } from './supabaseClient'

export interface AuthResult {
  userId: string | null
  error: string | null
}

export async function initAuth(): Promise<AuthResult> {
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session?.user) {
      return { userId: sessionData.session.user.id, error: null }
    }
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) return { userId: null, error: error.message }
    return { userId: data.user?.id ?? null, error: null }
  } catch (err) {
    console.warn('Auth failed, proceeding offline:', err)
    return { userId: null, error: 'offline' }
  }
}

export async function ensureUserRecord(userId: string, zip: string): Promise<void> {
  try {
    await supabase
      .from('users')
      .upsert({ id: userId, zip }, { onConflict: 'id', ignoreDuplicates: true })
  } catch (err) {
    console.warn('Could not create user record:', err)
  }
}

export async function updateUserZip(userId: string, zip: string): Promise<void> {
  try {
    await supabase.from('users').update({ zip }).eq('id', userId)
  } catch (err) {
    console.warn('Could not update zip:', err)
  }
}
