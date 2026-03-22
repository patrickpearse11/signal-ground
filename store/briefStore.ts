import { create } from 'zustand'
import { Brief } from '@/types/brief'

interface BriefState {
  brief: Brief | null
  isLoading: boolean
  error: string | null
  lastLoadedDate: string | null

  setBrief: (brief: Brief) => void
  setIsLoading: (value: boolean) => void
  setError: (error: string | null) => void
  setLastLoadedDate: (date: string) => void
}

export const useBriefStore = create<BriefState>((set) => ({
  brief: null,
  isLoading: false,
  error: null,
  lastLoadedDate: null,

  setBrief: (brief) => set({ brief }),
  setIsLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  setLastLoadedDate: (date) => set({ lastLoadedDate: date }),
}))
