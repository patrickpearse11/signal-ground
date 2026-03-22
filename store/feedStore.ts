import { create } from 'zustand'
import { SignalCard, ChokepointCard } from '@/types/signal'

interface FeedState {
  signals: SignalCard[]
  chokepoints: ChokepointCard[]
  isLoading: boolean
  isRefreshing: boolean
  lastUpdated: Date | null
  error: string | null
  feedFilter: 'all' | 'chokepoints'

  setSignals: (signals: SignalCard[]) => void
  appendSignals: (signals: SignalCard[]) => void
  setChokepoints: (chokepoints: ChokepointCard[]) => void
  setIsLoading: (value: boolean) => void
  setIsRefreshing: (value: boolean) => void
  setLastUpdated: (date: Date) => void
  setError: (error: string | null) => void
  setFeedFilter: (filter: 'all' | 'chokepoints') => void
}

export const useFeedStore = create<FeedState>((set) => ({
  signals: [],
  chokepoints: [],
  isLoading: false,
  isRefreshing: false,
  lastUpdated: null,
  error: null,
  feedFilter: 'all',

  setSignals: (signals) => set({ signals }),
  appendSignals: (signals) => set((state) => ({ signals: [...state.signals, ...signals] })),
  setChokepoints: (chokepoints) => set({ chokepoints }),
  setIsLoading: (value) => set({ isLoading: value }),
  setIsRefreshing: (value) => set({ isRefreshing: value }),
  setLastUpdated: (date) => set({ lastUpdated: date }),
  setError: (error) => set({ error }),
  setFeedFilter: (filter) => set({ feedFilter: filter }),
}))
