import { supabase } from './supabaseClient'
import { EDGE_FUNCTIONS } from '@/constants/config'
import type { BriefContent } from '@/types/brief'
import type { SignalCard } from '@/types/signal'

// TODO Session 2: implement generateBrief — calls generate-brief Edge Function
// Takes array of news article strings, returns BriefContent
export async function generateBrief(_articles: string[]): Promise<BriefContent> {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.generateBrief, {
    body: { articles: _articles },
  })
  if (error) throw error
  return data as BriefContent
}

// TODO Session 3: implement generateSignal — calls generate-signal Edge Function
// Takes a single news article, returns a neutral SignalCard
export async function generateSignal(_article: string): Promise<SignalCard> {
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTIONS.generateSignal, {
    body: { article: _article },
  })
  if (error) throw error
  return data as SignalCard
}
