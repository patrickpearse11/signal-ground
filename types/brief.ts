export interface GlobalSnapshot {
  bullets: string[] // exactly 3 neutral bullet points
}

export interface HomeImpact {
  headline: string    // e.g. "Red Sea disruption → +12% grocery price risk"
  explanation: string // 2 sentences expanding on the number
  zip: string
}

export interface SignalTeaser {
  title: string
  escalation_level: 1 | 2 | 3 | 4 | 5
  signal_id: string
}

export interface RepAction {
  name: string
  role: string
  phone: string
  email: string
  issue: string // current top issue for this rep
}

export interface PersonalizedClose {
  action: string    // "One thing you can do today"
  cta_ground: string
  cta_impact: string
}

export interface BriefContent {
  global_snapshot: GlobalSnapshot
  home_impact: HomeImpact
  signal_teasers: SignalTeaser[]
  rep_actions: RepAction[]
  personalized_close: PersonalizedClose
  generated_at: string
  zip: string
}

export interface Brief {
  id?: string
  user_id: string
  date: string // YYYY-MM-DD
  content_json: BriefContent
  created_at?: string
}
