export type PerspectivesType = 'balanced' | 'consensus' | 'divergent'

export interface SignalCard {
  id?: string
  neutral_title: string
  summary_paragraph: string
  perspectives: PerspectivesType
  local_impact: string
  tags: string[]
  escalation_level: 1 | 2 | 3 | 4 | 5
  source_region?: string
  sources?: string[]
  created_at?: string
}

export interface RawHeadline {
  title: string
  description: string | null
  source: string
  url: string
  publishedAt: string
}

export interface ChokepointCard {
  id?: string
  route_name: string
  status: 'clear' | 'disrupted' | 'watch' | 'critical'
  grok_oneliner: string
  region: string
  impact_category: 'prices' | 'fuel' | 'jobs' | 'imports'
  updated_at?: string
}

export type FeedItem =
  | { type: 'signal'; data: SignalCard }
  | { type: 'chokepoint'; data: ChokepointCard }
