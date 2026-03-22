import { supabase } from './supabaseClient'
import { ActionOpportunity, CommunityRipple, ImpactScore, Outcome } from '@/types/impact'
import { CivicEvent } from '@/types/ground'

const POINTS = {
  event_rsvp: 15,
  call: 10,
  email: 8,
  saved_signal: 5,
  petition: 12,
}

export async function fetchActionOpportunities(
  userId: string,
  zip: string
): Promise<ActionOpportunity[]> {
  try {
    const opportunities: ActionOpportunity[] = []

    const { data: events } = await supabase
      .from('ground_data')
      .select('content_json')
      .eq('type', 'event')
      .eq('zip', zip)

    if (events) {
      const upcoming = events
        .map((r: any) => r.content_json as CivicEvent)
        .filter(e => new Date(e.date + 'T12:00:00') >= new Date())
        .slice(0, 3)

      upcoming.forEach(event => {
        opportunities.push({
          id: `event-${event.title}`,
          title: event.title,
          description: event.description,
          action_type: 'event',
          source: 'ground',
          date: event.date,
        })
      })
    }

    const { data: savedSignals } = await supabase
      .from('impact_actions')
      .select('description')
      .eq('user_id', userId)
      .eq('action_type', 'saved_signal')
      .order('created_at', { ascending: false })
      .limit(2)

    if (savedSignals) {
      savedSignals.forEach((s: any, i: number) => {
        opportunities.push({
          id: `signal-${i}`,
          title: 'Follow up on: ' + s.description,
          description: 'You saved this signal — contact your rep or attend a related meeting.',
          action_type: 'call',
          source: 'signal',
        })
      })
    }

    return opportunities
  } catch (err) {
    console.warn('fetchActionOpportunities failed:', err)
    return []
  }
}

export async function fetchCommunityRipple(zip: string): Promise<CommunityRipple> {
  const defaultRipple: CommunityRipple = {
    zip,
    total_actions: 0,
    calls_made: 0,
    emails_sent: 0,
    events_rsvped: 0,
    signals_saved: 0,
    response_rate: 0,
    period_label: 'this month',
  }

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: actions, error } = await supabase
      .from('impact_actions')
      .select('action_type')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (error || !actions) return defaultRipple

    const calls = actions.filter(a => a.action_type === 'call').length
    const emails = actions.filter(a => a.action_type === 'email').length
    const events = actions.filter(a => a.action_type === 'event_rsvp').length
    const signals = actions.filter(a => a.action_type === 'saved_signal').length
    const total = actions.length

    return {
      zip,
      total_actions: total,
      calls_made: calls,
      emails_sent: emails,
      events_rsvped: events,
      signals_saved: signals,
      response_rate: total > 0 ? Math.min(Math.round((calls + emails) * 0.34), 100) : 0,
      period_label: 'this month',
    }
  } catch (err) {
    console.warn('fetchCommunityRipple failed:', err)
    return defaultRipple
  }
}

export async function fetchPersonalScore(userId: string): Promise<ImpactScore> {
  const defaultScore: ImpactScore = {
    score: 0,
    calls: 0,
    emails: 0,
    events: 0,
    saved_signals: 0,
    weekly_summary: 'Start taking action to build your civic impact score.',
    last_updated: new Date().toISOString(),
  }

  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: actions, error } = await supabase
      .from('impact_actions')
      .select('action_type, created_at')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())

    if (error || !actions) return defaultScore

    const calls = actions.filter(a => a.action_type === 'call').length
    const emails = actions.filter(a => a.action_type === 'email').length
    const events = actions.filter(a => a.action_type === 'event_rsvp').length
    const signals = actions.filter(a => a.action_type === 'saved_signal').length

    const rawScore =
      calls * POINTS.call +
      emails * POINTS.email +
      events * POINTS.event_rsvp +
      signals * POINTS.saved_signal

    const score = Math.min(rawScore, 100)

    return {
      score,
      calls,
      emails,
      events,
      saved_signals: signals,
      weekly_summary: generateLocalSummary(calls, emails, events, signals, score),
      last_updated: new Date().toISOString(),
    }
  } catch (err) {
    console.warn('fetchPersonalScore failed:', err)
    return defaultScore
  }
}

export async function fetchOutcomes(): Promise<Outcome[]> {
  try {
    const { data, error } = await supabase
      .from('outcomes')
      .select('*')
      .order('date', { ascending: false })
      .limit(10)

    if (error) throw error
    return (data || []).map((row: any) => ({
      id: row.id,
      rep_name: row.rep_name,
      action_taken: row.action_taken,
      result: row.result,
      status: row.status as Outcome['status'],
      date: row.date,
      signal_title: row.signal_title || undefined,
    }))
  } catch (err) {
    console.warn('fetchOutcomes failed:', err)
    return []
  }
}

function generateLocalSummary(
  calls: number,
  emails: number,
  events: number,
  signals: number,
  score: number
): string {
  if (score === 0) return 'Start taking action to build your civic impact score.'
  if (score >= 80) return `Outstanding week — you're in the top tier of civic engagement in Tarzana.`
  if (calls > 0 && events > 0) return `You called your reps and showed up in person — that combination moves the needle most.`
  if (calls > 0) return `${calls} rep call${calls > 1 ? 's' : ''} this week — direct contact is the highest-impact action you can take.`
  if (events > 0) return `${events} event${events > 1 ? 's' : ''} attended — showing up in person sends a signal no email can match.`
  if (emails > 0) return `${emails} email${emails > 1 ? 's' : ''} sent this week — keep it up and add a call to double your impact.`
  if (signals > 0) return `${signals} signal${signals > 1 ? 's' : ''} tracked — now take the next step and contact your rep.`
  return 'Good start — keep engaging to raise your score.'
}
