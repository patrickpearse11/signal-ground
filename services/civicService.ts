import { supabase } from './supabaseClient'
import { Rep } from '@/types/ground'

const OPEN_STATES_KEY = process.env.EXPO_PUBLIC_OPEN_STATES_KEY

// Default Tarzana/LA reps — always available as fallback
const DEFAULT_TARZANA_REPS: Rep[] = [
  {
    name: 'Bob Blumenfield',
    role: 'LA City Council',
    district: 'District 3',
    level: 'local',
    phone: '(818) 756-8501',
    email: 'councilmember.blumenfield@lacity.org',
    current_issue: 'Neighborhood infrastructure and street safety improvements',
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
    zip: '91356',
  },
  {
    name: 'Henry Stern',
    role: 'CA State Senate',
    district: 'District 27',
    level: 'state',
    phone: '(818) 876-3352',
    email: 'senator.stern@senate.ca.gov',
    current_issue: 'Environmental policy and clean energy transition',
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
    zip: '91356',
  },
]

/**
 * Fetches reps for a zip code.
 * Tries Supabase cache first, then Open States API, then hardcoded defaults.
 */
export async function fetchRepsByZip(zip: string): Promise<Rep[]> {
  const cached = await fetchCachedReps(zip)
  if (cached.length > 0) return cached

  if (OPEN_STATES_KEY) {
    const fromAPI = await fetchRepsFromOpenStates(zip)
    if (fromAPI.length > 0) {
      await cacheReps(fromAPI, zip)
      return fromAPI
    }
  }

  const defaults = DEFAULT_TARZANA_REPS
  await cacheReps(defaults, zip)
  return defaults
}

async function fetchRepsFromOpenStates(zip: string): Promise<Rep[]> {
  try {
    const response = await fetch(
      `https://v3.openstates.org/people.geo?lat=34.1683&lng=-118.5617&include=links&apikey=${OPEN_STATES_KEY}`,
      { headers: { 'X-API-KEY': OPEN_STATES_KEY! } }
    )
    if (!response.ok) throw new Error(`Open States error: ${response.status}`)
    const data = await response.json()

    return (data.results || []).map((p: any) => ({
      name: p.name,
      role: p.current_role?.title || 'Representative',
      district: p.current_role?.district || '',
      level: mapJurisdictionLevel(p.jurisdiction?.classification),
      phone: p.links?.find((l: any) => l.url?.includes('tel:'))?.url?.replace('tel:', '') || '',
      email: p.email || '',
      current_issue: '',
      zip,
    }))
  } catch (err) {
    console.warn('Open States API failed:', err)
    return []
  }
}

function mapJurisdictionLevel(classification: string): Rep['level'] {
  if (classification === 'government') return 'federal'
  if (classification === 'legislature') return 'state'
  return 'local'
}

async function fetchCachedReps(zip: string): Promise<Rep[]> {
  try {
    const { data: withDate, error } = await supabase
      .from('ground_data')
      .select('content_json, updated_at')
      .eq('type', 'rep')
      .eq('zip', zip)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !withDate) return []

    const ageMs = Date.now() - new Date(withDate.updated_at).getTime()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (ageMs > sevenDays) return []

    const { data, error: allError } = await supabase
      .from('ground_data')
      .select('content_json')
      .eq('type', 'rep')
      .eq('zip', zip)
      .order('updated_at', { ascending: false })

    if (allError || !data?.length) return []
    return data.map((row: any) => row.content_json as Rep)
  } catch (err) {
    console.warn('fetchCachedReps failed:', err)
    return []
  }
}

async function cacheReps(reps: Rep[], zip: string): Promise<void> {
  try {
    await supabase
      .from('ground_data')
      .delete()
      .eq('type', 'rep')
      .eq('zip', zip)

    const rows = reps.map(rep => ({
      type: 'rep',
      content_json: rep,
      zip,
    }))

    await supabase.from('ground_data').insert(rows)
  } catch (err) {
    console.warn('cacheReps failed:', err)
  }
}
