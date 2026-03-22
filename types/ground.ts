export interface Rep {
  id?: string
  name: string
  role: string
  district: string
  level: 'local' | 'state' | 'federal'
  phone: string
  email: string
  party?: string
  current_issue?: string
  zip: string
}

export interface CouncilMeeting {
  id?: string
  title: string
  date: string
  time: string
  location: string
  agenda_url?: string
  zip: string
}

export interface CivicEvent {
  id?: string
  title: string
  date: string
  time: string
  location: string
  event_type: 'meeting' | 'town_hall' | 'volunteer' | 'vote'
  description: string
  zip: string
}
