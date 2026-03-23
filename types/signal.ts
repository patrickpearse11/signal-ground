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

export type TradeCategory =
  | 'maritime'
  | 'tariffs'
  | 'commodities'
  | 'supply_chain'
  | 'monetary'

export type TradeSeverity = 'clear' | 'watch' | 'disrupted' | 'critical'

export interface TradeCard {
  id?: string
  title: string
  category: TradeCategory
  severity: TradeSeverity
  summary: string
  tarzana_impact: string
  impact_detail: string
  tags: string[]
  route_name?: string
  updated_at?: string
}

export type FeedItem =
  | { type: 'signal'; data: SignalCard }
  | { type: 'trade'; data: TradeCard }
