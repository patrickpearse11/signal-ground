export interface Rep {
  id: string
  name: string
  title: string
  party: string
  phone?: string
  email?: string
  district?: string
}

export interface Meeting {
  id: string
  title: string
  date: string
  location: string
  agenda_url?: string
  zip: string
}

export interface Event {
  id: string
  title: string
  date: string
  location: string
  description?: string
  action_url?: string
  zip: string
}
