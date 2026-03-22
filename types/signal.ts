export type PerspectivesType = 'balanced' | 'consensus' | 'divergent'

export interface SignalCard {
  id: string
  neutral_title: string
  summary_paragraph: string
  perspectives: PerspectivesType
  local_impact: string
  tags: string[]
  escalation_level: 1 | 2 | 3 | 4 | 5
  created_at: string
}

// Chokepoint cards — powered by trade_routes table in Supabase
export interface ChokepointCard {
  id: string
  route_name: string   // e.g. "Panama Canal", "Suez Canal", "Strait of Hormuz"
  status: string       // e.g. "open", "congested", "closed"
  grok_oneliner: string // Grok-generated one-line status summary
  updated_at: string
}
