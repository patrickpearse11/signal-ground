import type { Rep, Meeting, Event } from '@/types/ground'

// Civic data — Open States v3, 5 Calls API, EmpowerLA

// TODO Session 4 (Ground tab): fetch reps by zip via Open States v3 + 5 Calls API
export async function fetchRepsByZip(_zip: string): Promise<Rep[]> {
  // TODO
  return []
}

// TODO Session 4 (Ground tab): fetch neighborhood council meetings via EmpowerLA
export async function fetchCouncilMeetings(_zip: string): Promise<Meeting[]> {
  // TODO
  return []
}

// TODO Session 4 (Ground tab): fetch community events (manual seed for v1)
export async function fetchLocalEvents(_zip: string): Promise<Event[]> {
  // TODO
  return []
}
