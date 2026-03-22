import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You generate individual global news articles for a civic intelligence feed. Each card is one story — a real news article summary with clear sourcing and a direct connection to life in Tarzana, Los Angeles.

For each story:
- "neutral_title": a clear, plain-language headline (max 12 words)
- "summary_paragraph": 2-3 sentences summarizing what happened, who is involved, and why it matters. Write like a journalist — specific, factual, human. Name places, leaders, numbers where known.
- "perspectives": "balanced" | "consensus" | "divergent" — how much do sources agree?
- "local_impact": one specific sentence on how this story directly affects people in Tarzana or Los Angeles — groceries, gas, jobs at the port, family in affected countries, air quality, housing costs, safety
- "tags": 2-4 topic tags
- "escalation_level": 1 (low) to 5 (critical)
- "source_region": the region where this story originates
- "sources": 1-3 real news outlets that have covered this story (e.g. Reuters, BBC, AP, Al Jazeera, Financial Times, NYT, WSJ)

Output a strict JSON array of exactly 8 objects. No preamble, no markdown. Just the raw JSON array.`

async function callGrokWithWebSearch(existingTitles: string[] = []): Promise<any[]> {
  const today = new Date().toISOString().split('T')[0]
  const avoidClause = existingTitles.length > 0
    ? `\n\nDo NOT generate stories about topics already covered today:\n${existingTitles.map(t => `- ${t}`).join('\n')}\n\nChoose entirely different stories.`
    : ''

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3',
      temperature: 0.3,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Today is ${today}. Based on your knowledge of current global events, generate 8 signal cards covering the domains listed. Each card must be about a DISTINCT topic — no two cards may share a region or a domain.${avoidClause}\n\nReturn exactly 8 signal cards as a JSON array.`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Grok error ${response.status}: ${text}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty Grok response')

  const clean = content.replace(/```json\n?|\n?```/g, '').trim()
  const parsed = JSON.parse(clean)
  if (!Array.isArray(parsed)) throw new Error('Grok did not return an array')
  return parsed
}

async function callClaudeFallback(existingTitles: string[] = []): Promise<any[]> {
  const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  if (!ANTHROPIC_KEY) throw new Error('No fallback API key available')

  const today = new Date().toISOString().split('T')[0]
  const avoidClause = existingTitles.length > 0
    ? `\n\nDo NOT generate stories about topics already covered today:\n${existingTitles.map(t => `- ${t}`).join('\n')}\n\nChoose entirely different stories.`
    : ''

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Today is ${today}. Generate 8 global intelligence signal cards. Each must be about a DISTINCT topic — no two cards may share a region or a domain.${avoidClause}\n\nReturn a JSON array.`,
      }],
    }),
  })

  if (!response.ok) throw new Error(`Claude fallback error: ${response.status}`)
  const data = await response.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error('Empty Claude response')
  const clean = content.replace(/```json\n?|\n?```/g, '').trim()
  const parsed = JSON.parse(clean)
  if (!Array.isArray(parsed)) throw new Error('Claude did not return an array')
  return parsed
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)

    // Cache check — skip generation if signals exist from last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('signals')
      .select('*')
      .gte('created_at', fifteenMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recent && recent.length >= 5) {
      return new Response(
        JSON.stringify({ success: true, cached: true, count: recent.length, signals: recent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch existing signals from last 24h to avoid topic overlap
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: recentSignals } = await supabase
      .from('signals')
      .select('neutral_title, tags')
      .gte('created_at', oneDayAgo)

    const existingTitles = (recentSignals || []).map((s: any) => s.neutral_title)
    const existingTagSets: string[][] = (recentSignals || []).map((s: any) => s.tags || [])

    // Fetch fresh signals, passing existing topics to avoid redundancy
    let cards: any[]
    try {
      cards = await callGrokWithWebSearch(existingTitles)
    } catch (err) {
      console.warn('Grok failed, trying Claude fallback:', err)
      cards = await callClaudeFallback(existingTitles)
    }

    // Dedup helper — returns true if card shares 2+ tags with any existing signal
    function hasTagOverlap(cardTags: string[]): boolean {
      const lower = cardTags.map((t: string) => t.toLowerCase())
      return existingTagSets.some(existing => {
        const existingLower = existing.map((t: string) => t.toLowerCase())
        const shared = lower.filter(t => existingLower.includes(t))
        return shared.length >= 2
      })
    }

    const results = []
    const insertedTagSets: string[][] = []

    for (const card of cards.slice(0, 8)) {
      if (!card.neutral_title || !card.summary_paragraph) {
        console.warn('Invalid card shape, skipping:', card)
        continue
      }

      const cardTags: string[] = card.tags || []

      // Skip if title already exists
      if (existingTitles.includes(card.neutral_title)) {
        console.log('Duplicate title, skipping:', card.neutral_title)
        continue
      }

      // Skip if topic already covered (2+ tag overlap with existing OR already inserted this run)
      const allTagSets = [...existingTagSets, ...insertedTagSets]
      const lowerCardTags = cardTags.map((t: string) => t.toLowerCase())
      const isDupe = allTagSets.some(existing => {
        const existingLower = existing.map((t: string) => t.toLowerCase())
        return lowerCardTags.filter(t => existingLower.includes(t)).length >= 3
      })

      if (isDupe) {
        console.log('Topic overlap, skipping:', card.neutral_title)
        continue
      }

      const { data, error } = await supabase
        .from('signals')
        .insert({
          neutral_title: card.neutral_title,
          summary_paragraph: card.summary_paragraph,
          perspectives: card.perspectives || 'balanced',
          local_impact: card.local_impact || '',
          tags: cardTags,
          escalation_level: card.escalation_level || 1,
          source_region: card.source_region || 'Global',
          sources: card.sources || [],
        })
        .select()
        .single()

      if (error) {
        console.warn('Supabase insert error:', error)
      } else {
        results.push(data)
        insertedTagSets.push(cardTags)
      }
    }

    return new Response(
      JSON.stringify({ success: true, cached: false, count: results.length, signals: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
