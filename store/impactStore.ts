import { create } from 'zustand'
import { ActionOpportunity, CommunityRipple, ImpactScore } from '@/types/impact'

interface ImpactState {
  opportunities: ActionOpportunity[]
  ripple: CommunityRipple | null
  score: ImpactScore | null
  isLoading: boolean
  error: string | null

  setOpportunities: (ops: ActionOpportunity[]) => void
  setRipple: (ripple: CommunityRipple) => void
  setScore: (score: ImpactScore) => void
  setIsLoading: (value: boolean) => void
  setError: (error: string | null) => void
}

export const useImpactStore = create<ImpactState>((set) => ({
  opportunities: [],
  ripple: null,
  score: null,
  isLoading: false,
  error: null,

  setOpportunities: (opportunities) => set({ opportunities }),
  setRipple: (ripple) => set({ ripple }),
  setScore: (score) => set({ score }),
  setIsLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
}))
