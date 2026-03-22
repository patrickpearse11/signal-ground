import type { PerspectivesType } from './signal'

// Matches the strict JSON output shape of the Grok system prompt
export interface BriefContent {
  neutral_title: string
  summary_paragraph: string
  perspectives: PerspectivesType
  local_impact: string
  tags: string[]
  escalation_level: 1 | 2 | 3 | 4 | 5
}
