import { create } from 'zustand'
import { SignalCard } from '@/types/signal'

interface FeedState {
  signals: SignalCard[]
  isLoading: boolean
  isRefreshing: boolean
  lastUpdated: Date | null
  error: string | null

  setSignals: (signals: SignalCard[]) => void
  appendSignals: (signals: SignalCard[]) => void
  setIsLoading: (value: boolean) => void
  setIsRefreshing: (value: boolean) => void
  setLastUpdated: (date: Date) => void
  setError: (error: string | null) => void
}

export const useFeedStore = create<FeedState>((set) => ({
  signals: [],
  isLoading: false,
  isRefreshing: false,
  lastUpdated: null,
  error: null,

  setSignals: (signals) => set({ signals }),
  appendSignals: (signals) => set((state) => ({ signals: [...state.signals, ...signals] })),
  setIsLoading: (value) => set({ isLoading: value }),
  setIsRefreshing: (value) => set({ isRefreshing: value }),
  setLastUpdated: (date) => set({ lastUpdated: date }),
  setError: (error) => set({ error }),
}))
