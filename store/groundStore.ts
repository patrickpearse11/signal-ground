import { create } from 'zustand'
import { Rep, CouncilMeeting, CivicEvent } from '@/types/ground'

interface GroundState {
  reps: Rep[]
  meetings: CouncilMeeting[]
  events: CivicEvent[]
  isLoading: boolean
  error: string | null

  setReps: (reps: Rep[]) => void
  setMeetings: (meetings: CouncilMeeting[]) => void
  setEvents: (events: CivicEvent[]) => void
  setIsLoading: (value: boolean) => void
  setError: (error: string | null) => void
}

export const useGroundStore = create<GroundState>((set) => ({
  reps: [],
  meetings: [],
  events: [],
  isLoading: false,
  error: null,

  setReps: (reps) => set({ reps }),
  setMeetings: (meetings) => set({ meetings }),
  setEvents: (events) => set({ events }),
  setIsLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
}))
