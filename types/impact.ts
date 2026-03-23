export interface ActionOpportunity {
  id: string
  title: string
  description: string
  action_type: 'event' | 'call' | 'email' | 'petition'
  source: 'ground' | 'signal'
  date?: string
  rep_name?: string
}

export interface CommunityRipple {
  zip: string
  total_actions: number
  calls_made: number
  emails_sent: number
  events_rsvped: number
  signals_saved: number
  response_rate: number
  period_label: string
}

export interface Outcome {
  id?: string
  rep_name: string
  rep_role?: string
  action_type?: string
  outcome_text: string
  related_issue?: string
  resident_actions?: number
  zip?: string
  outcome_date: string
  data_source?: string
  before_value?: string
  after_value?: string
  change_pct?: number
  dataset_type?: string
  verified?: boolean
}

export interface ImpactScore {
  score: number
  calls: number
  emails: number
  events: number
  saved_signals: number
  weekly_summary: string
  last_updated: string
}
