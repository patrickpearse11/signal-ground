import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'

interface UserState {
  userId: string | null
  zip: string
  interests: string[]
  hasOnboarded: boolean
  isLoading: boolean
  setUserId: (id: string) => void
  setZip: (zip: string) => void
  setInterests: (interests: string[]) => void
  setHasOnboarded: (value: boolean) => void
  setIsLoading: (value: boolean) => void
}

const secureStorage = {
  getItem: async (key: string) => await SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => await SecureStore.setItemAsync(key, value),
  removeItem: async (key: string) => await SecureStore.deleteItemAsync(key),
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      zip: '91356',
      interests: [],
      hasOnboarded: false,
      isLoading: true,
      setUserId: (id) => set({ userId: id }),
      setZip: (zip) => set({ zip }),
      setInterests: (interests) => set({ interests }),
      setHasOnboarded: (value) => set({ hasOnboarded: value }),
      setIsLoading: (value) => set({ isLoading: value }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        userId: state.userId,
        zip: state.zip,
        interests: state.interests,
        hasOnboarded: state.hasOnboarded,
      }),
    }
  )
)
