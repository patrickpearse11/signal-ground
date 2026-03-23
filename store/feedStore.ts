import { create } from 'zustand'
import { SignalCard, TradeCard } from '@/types/signal'
import { FeedFilter } from '@/components/signal/TradeFilterBar'

interface FeedState {
  signals: SignalCard[]
  tradeCards: TradeCard[]
  isLoading: boolean
  isRefreshing: boolean
  lastUpdated: Date | null
  error: string | null
  feedFilter: FeedFilter

  setSignals: (signals: SignalCard[]) => void
  appendSignals: (signals: SignalCard[]) => void
  setTradeCards: (cards: TradeCard[]) => void
  setIsLoading: (value: boolean) => void
  setIsRefreshing: (value: boolean) => void
  setLastUpdated: (date: Date) => void
  setError: (error: string | null) => void
  setFeedFilter: (filter: FeedFilter) => void
}

export const useFeedStore = create<FeedState>((set) => ({
  signals: [],
  tradeCards: [],
  isLoading: false,
  isRefreshing: false,
  lastUpdated: null,
  error: null,
  feedFilter: 'all',

  setSignals: (signals) => set({ signals }),
  appendSignals: (signals) => set((state) => ({ signals: [...state.signals, ...signals] })),
  setTradeCards: (tradeCards) => set({ tradeCards }),
  setIsLoading: (value) => set({ isLoading: value }),
  setIsRefreshing: (value) => set({ isRefreshing: value }),
  setLastUpdated: (date) => set({ lastUpdated: date }),
  setError: (error) => set({ error }),
  setFeedFilter: (filter) => set({ feedFilter: filter }),
}))
