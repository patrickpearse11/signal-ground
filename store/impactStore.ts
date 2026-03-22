import { create } from 'zustand'
import { ActionOpportunity, CommunityRipple, ImpactScore, Outcome } from '@/types/impact'

interface ImpactState {
  opportunities: ActionOpportunity[]
  ripple: CommunityRipple | null
  score: ImpactScore | null
  outcomes: Outcome[]
  isLoading: boolean
  error: string | null

  setOpportunities: (ops: ActionOpportunity[]) => void
  setRipple: (ripple: CommunityRipple) => void
  setScore: (score: ImpactScore) => void
  setOutcomes: (outcomes: Outcome[]) => void
  setIsLoading: (value: boolean) => void
  setError: (error: string | null) => void
}

export const useImpactStore = create<ImpactState>((set) => ({
  opportunities: [],
  ripple: null,
  score: null,
  outcomes: [],
  isLoading: false,
  error: null,

  setOpportunities: (opportunities) => set({ opportunities }),
  setRipple: (ripple) => set({ ripple }),
  setScore: (score) => set({ score }),
  setOutcomes: (outcomes) => set({ outcomes }),
  setIsLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
}))
