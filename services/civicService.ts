import { supabase } from './supabaseClient'
import { Rep, CouncilMeeting, CivicEvent } from '@/types/ground'

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const CICERO_BASE = 'https://app.cicerodata.com/v3.1'
const CICERO_USERNAME = process.env.EXPO_PUBLIC_CICERO_USERNAME
const CICERO_PASSWORD = process.env.EXPO_PUBLIC_CICERO_PASSWORD

// Phone/email lookup for known Tarzana reps — Cicero doesn't return contact info
const TARZANA_CONTACTS: Record<string, { phone: string; email: string }> = {
  'blumenfield': { phone: '(818) 756-8501', email: 'councilmember.blumenfield@lacity.org' },
  'horvath':     { phone: '(213) 974-3333', email: 'Supervisor3@bos.lacounty.gov' },
  'gabriel':     { phone: '(818) 904-3840', email: 'assemblymember.gabriel@assembly.ca.gov' },
  'stern':       { phone: '(818) 876-3352', email: 'senator.stern@senate.ca.gov' },
  'sherman':     { phone: '(818) 501-9200', email: 'https://sherman.house.gov/contact' },
  'bass':        { phone: '(213) 978-0600', email: 'mayor.feedback@lacity.org' },
  'padilla':     { phone: '(202) 224-3553', email: 'https://www.padilla.senate.gov/contact/' },
  'schiff':      { phone: '(202) 224-3841', email: 'https://www.schiff.senate.gov/contact/' },
}

// District types we care about — elected reps only, no cabinet/exec appointees
const RELEVANT_DISTRICT_TYPES = [
  'LOCAL',          // City Council
  'LOCAL_EXEC',     // Mayor
  'COUNTY',         // County Board
  'COUNTY_EXEC',    // County Supervisor
  'STATE_UPPER',    // State Senate
  'STATE_LOWER',    // State Assembly
  'NATIONAL_UPPER', // US Senate
  'NATIONAL_LOWER', // US House
]

// ─────────────────────────────────────────
// HARDCODED FALLBACK — always available
// ─────────────────────────────────────────

const DEFAULT_TARZANA_REPS: Rep[] = [
  {
    name: 'Bob Blumenfield',
    role: 'LA City Council',
    district: 'District 3',
    level: 'local',
    phone: '(818) 756-8501',
    email: 'councilmember.blumenfield@lacity.org',
    current_issue: 'Neighborhood infrastructure and street safety',
    current_action: '',
    zip: '91356',
  },
  {
    name: 'Lindsey Horvath',
    role: 'LA County Supervisor',
    district: 'District 3',
    level: 'local',
    phone: '(213) 974-3333',
    email: 'Supervisor3@bos.lacounty.gov',
    current_issue: 'County mental health services and housing affordability',
    current_action: '',
    zip: '91356',
  },
  {
    name: 'Jesse Gabriel',
    role: 'CA State Assembly',
    district: 'District 46',
    level: 'state',
    phone: '(818) 904-3840',
    email: 'assemblymember.gabriel@assembly.ca.gov',
    current_issue: 'Education funding and wildfire preparedness',
    current_action: '',
    zip: '91356',
  },
  {
    name: 'Henry Stern',
    role: 'CA State Senate',
    district: 'District 27',
    level: 'state',
    phone: '(818) 876-3352',
    email: 'senator.stern@senate.ca.gov',
    current_issue: 'Environmental policy and clean energy',
    current_action: '',
    zip: '91356',
  },
  {
    name: 'Brad Sherman',
    role: 'US House of Representatives',
    district: 'CA District 32',
    level: 'federal',
    phone: '(818) 501-9200',
    email: 'https://sherman.house.gov/contact',
    current_issue: 'Foreign policy and local economic development',
    current_action: '',
    zip: '91356',
  },
]

// ─────────────────────────────────────────
// CICERO TOKEN MANAGEMENT
// ─────────────────────────────────────────

async function getCiceroAuth(): Promise<{ token: string; userId: number } | null> {
  if (!CICERO_USERNAME || !CICERO_PASSWORD) return null

  try {
    const { data: cached } = await supabase
      .from('cicero_tokens')
      .select('token, user_id, expires_at')
      .single()

    if (cached && new Date(cached.expires_at) > new Date()) {
      return { token: cached.token, userId: Number(cached.user_id) }
    }

    const response = await fetch(`${CICERO_BASE}/token/new.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(CICERO_USERNAME)}&password=${encodeURIComponent(CICERO_PASSWORD)}`,
    })

    if (!response.ok) throw new Error(`Cicero auth error: ${response.status}`)
    const data = await response.json()
    if (!data.token) throw new Error('No token in Cicero response')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setUTCHours(23, 59, 59, 0)

    await supabase.from('cicero_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('cicero_tokens').insert({
      token: data.token,
      user_id: String(data.user),
      expires_at: tomorrow.toISOString(),
    })

    return { token: data.token, userId: data.user }
  } catch (err) {
    console.warn('[Cicero] getCiceroAuth failed:', err)
    return null
  }
}

// ─────────────────────────────────────────
// CICERO REP LOOKUP
// ─────────────────────────────────────────

async function fetchRepsFromCicero(zip: string): Promise<Rep[]> {
  const auth = await getCiceroAuth()
  if (!auth) return []

  try {
    // Cicero requires a full address for geocoding — use a known Tarzana address
    const address = zip === '91356'
      ? '5655 Reseda Blvd, Tarzana, CA 91356'
      : `${zip}, CA`

    const url = `${CICERO_BASE}/official?search_loc=${encodeURIComponent(address)}&user=${auth.userId}&token=${auth.token}`

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Cicero lookup error: ${response.status}`)

    const data = await response.json()
    const officials: any[] = data?.response?.results?.candidates?.[0]?.officials || []

    const now = new Date()

    return officials
      .filter((o: any) => {
        // Must be currently active
        if (!o.valid_from) return false
        if (o.valid_to && new Date(o.valid_to) < now) return false
        // Must be a relevant district type
        const dt = o.office?.district?.district_type || ''
        return RELEVANT_DISTRICT_TYPES.includes(dt)
      })
      .map((o: any) => {
        const rep = mapCiceroOfficial(o, zip)
        // Fill in phone/email from hardcoded defaults if Cicero doesn't have them
        const fallback = DEFAULT_TARZANA_REPS.find(d =>
          d.name.toLowerCase() === rep.name.toLowerCase()
        )
        if (fallback) {
          rep.phone = rep.phone || fallback.phone
          rep.email = rep.email || fallback.email
          rep.current_issue = fallback.current_issue
        }
        return rep
      })
      .filter((r: Rep) => r.name)
      // Sort: local first, state, federal
      .sort((a, b) => {
        const order = { local: 0, state: 1, federal: 2 }
        return order[a.level] - order[b.level]
      })
  } catch (err) {
    console.warn('fetchRepsFromCicero failed:', err)
    return []
  }
}

function mapCiceroOfficial(o: any, zip: string): Rep {
  const districtType: string = o.office?.district?.district_type || ''

  const level: Rep['level'] =
    districtType.startsWith('NATIONAL') ? 'federal'
    : districtType.startsWith('STATE') ? 'state'
    : 'local'

  const lastName = o.last_name?.toLowerCase() || ''
  const contacts = TARZANA_CONTACTS[lastName] ?? { phone: '', email: '' }

  return {
    name: `${o.first_name} ${o.last_name}`.trim(),
    role: o.office?.title || 'Representative',
    district: o.office?.district?.label || o.office?.district?.district_id || '',
    level,
    phone: contacts.phone,
    email: contacts.email,
    current_issue: '',
    current_action: '',
    zip,
  }
}

// ─────────────────────────────────────────
// SUPABASE CACHE
// ─────────────────────────────────────────

async function fetchCachedReps(zip: string): Promise<Rep[]> {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('ground_data')
      .select('content_json, updated_at')
      .eq('type', 'rep')
      .eq('zip', zip)
      .gte('updated_at', sevenDaysAgo.toISOString())
      .order('updated_at', { ascending: false })

    if (error || !data?.length) return []
    return data.map((row: any) => row.content_json as Rep)
  } catch (err) {
    console.warn('fetchCachedReps failed:', err)
    return []
  }
}

async function cacheReps(reps: Rep[], zip: string): Promise<void> {
  try {
    await supabase.from('ground_data').delete().eq('type', 'rep').eq('zip', zip)
    const rows = reps.map(rep => ({
      type: 'rep',
      content_json: rep,
      zip,
      updated_at: new Date().toISOString(),
    }))
    await supabase.from('ground_data').insert(rows)
  } catch (err) {
    console.warn('cacheReps failed:', err)
  }
}

// ─────────────────────────────────────────
// MAIN EXPORT — fetchRepsByZip
// ─────────────────────────────────────────

export async function fetchRepsByZip(zip: string): Promise<Rep[]> {
  // Layer 1: Supabase cache (7-day freshness)
  const cached = await fetchCachedReps(zip)
  if (cached.length > 0) return cached

  // Layer 2: Cicero API
  const reps = await fetchRepsFromCicero(zip)
  if (reps.length > 0) {
    await cacheReps(reps, zip)
    return reps
  }

  // Layer 3: Hardcoded Tarzana defaults
  await cacheReps(DEFAULT_TARZANA_REPS, zip)
  return DEFAULT_TARZANA_REPS
}

// ─────────────────────────────────────────
// COUNCIL MEETINGS & EVENTS (unchanged)
// ─────────────────────────────────────────

export async function fetchCouncilMeetings(zip: string): Promise<CouncilMeeting[]> {
  try {
    const { data, error } = await supabase
      .from('ground_data')
      .select('content_json')
      .eq('type', 'meeting')
      .eq('zip', zip)
      .order('updated_at', { ascending: false })

    if (error || !data?.length) return []
    return data
      .map((row: any) => row.content_json as CouncilMeeting)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (err) {
    console.warn('fetchCouncilMeetings failed:', err)
    return []
  }
}

export async function fetchCivicEvents(zip: string): Promise<CivicEvent[]> {
  try {
    const { data, error } = await supabase
      .from('ground_data')
      .select('content_json')
      .eq('type', 'event')
      .eq('zip', zip)
      .order('updated_at', { ascending: false })

    if (error || !data?.length) return []
    return data
      .map((row: any) => row.content_json as CivicEvent)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (err) {
    console.warn('fetchCivicEvents failed:', err)
    return []
  }
}
