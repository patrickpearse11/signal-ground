import { supabase } from './supabaseClient'

const SOCRATA_BASE = 'https://data.lacity.org/resource'
const TARZANA_ZIP = '91356'

// LA city datasets are split by year and lag by months — use most recent available
// 311: year-specific datasets; crime/permits: rolling datasets
const DATASET_311_CURRENT = 'h73f-gn57'  // MyLA311 2025 (most recent)
const DATASET_311_PREV    = 'b7dx-7gc3'  // MyLA311 2024 (fallback)
const DATASET_CRIME       = '2nrs-mtv8'  // LAPD Crime Incidents (rolling)
const DATASET_PERMITS     = 'xnhu-aczu'  // LA Build Permits (rolling)

const CACHE_HOURS: Record<string, number> = {
  crime: 24,
  '311': 12,
  permits: 48,
  infrastructure: 48,
  air_quality: 12,
}

// ─────────────────────────────────────────
// CACHE MANAGEMENT
// ─────────────────────────────────────────

async function getCachedData(datasetType: string, zip: string): Promise<any | null> {
  try {
    const hours = CACHE_HOURS[datasetType] || 24
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('socrata_data')
      .select('content_json, summary_json, fetched_at, covers_period')
      .eq('dataset_type', datasetType)
      .eq('zip', zip)
      .gte('fetched_at', cutoff)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

async function cacheData(
  datasetType: string,
  zip: string,
  contentJson: any,
  coversPeriod: string
): Promise<void> {
  try {
    await supabase
      .from('socrata_data')
      .delete()
      .eq('dataset_type', datasetType)
      .eq('zip', zip)

    await supabase.from('socrata_data').insert({
      dataset_type: datasetType,
      zip,
      content_json: contentJson,
      covers_period: coversPeriod,
      fetched_at: new Date().toISOString(),
    })
  } catch (err) {
    console.warn('cacheData failed:', err)
  }
}

// ─────────────────────────────────────────
// DATASET FETCHERS
// ─────────────────────────────────────────

export interface CrimeStats {
  total_incidents: number
  top_crimes: { type: string; count: number }[]
  vs_last_month: number
  period: string
  zip: string
}

export async function fetchCrimeStats(zip: string = TARZANA_ZIP): Promise<CrimeStats | null> {
  const cached = await getCachedData('crime', zip)
  if (cached) return cached.content_json as CrimeStats

  try {
    // Use 2-year window — LAPD data lags 12-15 months
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const dateStr = twoYearsAgo.toISOString().split('T')[0] + 'T00:00:00.000'

    const url = `${SOCRATA_BASE}/${DATASET_CRIME}.json?$where=date_occ>='${dateStr}' AND area_name='West Valley'&$limit=1000&$select=crm_cd_desc,date_occ`

    const response = await fetch(url)
    if (!response.ok) throw new Error(`LAPD API error: ${response.status}`)
    const raw = await response.json()

    const counts: Record<string, number> = {}
    raw.forEach((incident: any) => {
      const type = incident.crm_cd_desc || 'Unknown'
      counts[type] = (counts[type] || 0) + 1
    })

    const topCrimes = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))

    const stats: CrimeStats = {
      total_incidents: raw.length,
      top_crimes: topCrimes,
      vs_last_month: 0,
      period: 'Last 2 years',
      zip,
    }

    await cacheData('crime', zip, stats, 'Last 2 years')
    return stats
  } catch (err) {
    console.warn('fetchCrimeStats failed:', err)
    return null
  }
}

export interface ServiceRequest311 {
  total_requests: number
  open_requests: number
  avg_response_days: number
  top_issues: { type: string; count: number }[]
  period: string
  zip: string
}

export async function fetch311Stats(zip: string = TARZANA_ZIP): Promise<ServiceRequest311 | null> {
  const cached = await getCachedData('311', zip)
  if (cached) return cached.content_json as ServiceRequest311

  try {
    // Try current year dataset first, fall back to previous year
    let raw: any[] = []
    for (const datasetId of [DATASET_311_CURRENT, DATASET_311_PREV]) {
      const url = `${SOCRATA_BASE}/${datasetId}.json?$where=zipcode='${zip}'&$limit=500&$select=requesttype,status,createddate,closeddate&$order=createddate DESC`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) { raw = data; break }
      }
    }

    const counts: Record<string, number> = {}
    let totalResponseDays = 0
    let closedCount = 0
    let openCount = 0

    raw.forEach((req: any) => {
      const type = req.requesttype || 'General'
      counts[type] = (counts[type] || 0) + 1

      if (req.status === 'Closed' && req.closeddate && req.createddate) {
        const days = (new Date(req.closeddate).getTime() - new Date(req.createddate).getTime()) / (1000 * 60 * 60 * 24)
        totalResponseDays += days
        closedCount++
      } else {
        openCount++
      }
    })

    const topIssues = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))

    const stats: ServiceRequest311 = {
      total_requests: raw.length,
      open_requests: openCount,
      avg_response_days: closedCount > 0 ? Math.round(totalResponseDays / closedCount) : 0,
      top_issues: topIssues,
      period: 'Most recent available',
      zip,
    }

    await cacheData('311', zip, stats, 'Most recent available')
    return stats
  } catch (err) {
    console.warn('fetch311Stats failed:', err)
    return null
  }
}

export interface PermitActivity {
  total_permits: number
  new_construction: number
  renovations: number
  top_permit_types: { type: string; count: number }[]
  period: string
  zip: string
}

export async function fetchPermitActivity(zip: string = TARZANA_ZIP): Promise<PermitActivity | null> {
  const cached = await getCachedData('permits', zip)
  if (cached) return cached.content_json as PermitActivity

  try {
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const dateStr = ninetyDaysAgo.toISOString().split('T')[0]

    const url = `${SOCRATA_BASE}/${DATASET_PERMITS}.json?$where=zip_code='${zip}'&$limit=500&$select=permit_type,permit_sub_type,issue_date&$order=issue_date DESC`

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Permits API error: ${response.status}`)
    const raw = await response.json()

    const counts: Record<string, number> = {}
    let newConstruction = 0
    let renovations = 0

    raw.forEach((permit: any) => {
      const type = permit.permit_type || 'Other'
      counts[type] = (counts[type] || 0) + 1
      if (type.toLowerCase().includes('new') || type.toLowerCase().includes('addition')) {
        newConstruction++
      } else {
        renovations++
      }
    })

    const topTypes = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([type, count]) => ({ type, count }))

    const stats: PermitActivity = {
      total_permits: raw.length,
      new_construction: newConstruction,
      renovations,
      top_permit_types: topTypes,
      period: 'Most recent available',
      zip,
    }

    await cacheData('permits', zip, stats, 'Most recent available')
    return stats
  } catch (err) {
    console.warn('fetchPermitActivity failed:', err)
    return null
  }
}

// ─────────────────────────────────────────
// COMBINED NEIGHBORHOOD PULSE
// ─────────────────────────────────────────

export interface NeighborhoodPulse {
  crime: CrimeStats | null
  requests311: ServiceRequest311 | null
  permits: PermitActivity | null
  zip: string
  fetched_at: string
}

export async function fetchNeighborhoodPulse(zip: string = TARZANA_ZIP): Promise<NeighborhoodPulse> {
  const [requests311, permits] = await Promise.all([
    fetch311Stats(zip),
    fetchPermitActivity(zip),
  ])

  return {
    crime: null,  // LAPD data suspended since early 2025 — re-enable when restored
    requests311,
    permits,
    zip,
    fetched_at: new Date().toISOString(),
  }
}
