import { create } from 'zustand'

interface UserState {
  zip: string
  interests: string[]
  setZip: (zip: string) => void
  setInterests: (interests: string[]) => void
}

export const useUserStore = create<UserState>((set) => ({
  zip: '91356', // Tarzana default — MVP uses zip-only onboarding, no auth required
  interests: [],
  setZip: (zip) => set({ zip }),
  setInterests: (interests) => set({ interests }),
}))
