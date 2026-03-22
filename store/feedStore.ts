import { create } from 'zustand'
import type { SignalCard } from '@/types/signal'

interface FeedState {
  signals: SignalCard[]
  isLoading: boolean
  setSignals: (signals: SignalCard[]) => void
  setLoading: (loading: boolean) => void
}

export const useFeedStore = create<FeedState>((set) => ({
  signals: [],
  isLoading: false,
  setSignals: (signals) => set({ signals }),
  setLoading: (isLoading) => set({ isLoading }),
}))
