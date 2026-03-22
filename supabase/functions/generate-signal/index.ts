import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a senior neutral global intelligence analyst. Search the web for today's most significant global stories across these domains:
- Geopolitical conflicts and diplomacy
- Trade chokepoints (Suez, Panama, Strait of Hormuz, etc.)
- Energy markets (oil, gas, electricity prices)
- Supply chain disruptions
- Central bank decisions and monetary policy
- Food and commodity prices
- Climate events with economic impact
- Trade policy and tariffs
- Tech and semiconductor supply chains

Find 5 distinct stories from different regions. For each story, output a JSON object with these exact fields:
{
  "neutral_title": "concise neutral headline (max 12 words)",
  "summary_paragraph": "3 calm fact-only sentences — no emotional language, no loaded terms. If sources conflict, state the range of reported facts.",
  "perspectives": "balanced" | "consensus" | "divergent",
  "local_impact": "one sentence on how this could affect Tarzana/Los Angeles residents (economy, prices, traffic, safety, jobs)",
  "tags": ["array", "of", "2-4", "topic", "tags"],
  "escalation_level": 1 | 2 | 3 | 4 | 5,
  "source_region": "region name e.g. Middle East, East Asia, Europe, South Asia, Latin America, North America, Africa"
}

Output a strict JSON array of exactly 5 objects. No preamble, no markdown, no explanation. Just the raw JSON array.`

async function callGrokWithWebSearch(): Promise<any[]> {
  const today = new Date().toISOString().split('T')[0]

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
      tools: [{ type: 'function', function: { name: 'web_search' } }],
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Today is ${today}. Search the web for today's most significant global intelligence stories across the domains listed. Return exactly 5 signal cards as a JSON array.`,
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

async function callClaudeFallback(): Promise<any[]> {
  const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  if (!ANTHROPIC_KEY) throw new Error('No fallback API key available')

  const today = new Date().toISOString().split('T')[0]

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
        content: `Today is ${today}. Generate 5 plausible global intelligence signal cards based on ongoing world events you know about. Return a JSON array.`,
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

    if (recent && recent.length >= 3) {
      return new Response(
        JSON.stringify({ success: true, cached: true, count: recent.length, signals: recent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch fresh signals
    let cards: any[]
    try {
      cards = await callGrokWithWebSearch()
    } catch (err) {
      console.warn('Grok web_search failed, trying Claude fallback:', err)
      cards = await callClaudeFallback()
    }

    const results = []
    for (const card of cards.slice(0, 5)) {
      if (!card.neutral_title || !card.summary_paragraph) {
        console.warn('Invalid card shape, skipping:', card)
        continue
      }

      // Dedup check
      const { data: existing } = await supabase
        .from('signals')
        .select('id')
        .eq('neutral_title', card.neutral_title)
        .limit(1)
        .single()

      if (existing) {
        console.log('Duplicate signal, skipping:', card.neutral_title)
        continue
      }

      const { data, error } = await supabase
        .from('signals')
        .insert({
          neutral_title: card.neutral_title,
          summary_paragraph: card.summary_paragraph,
          perspectives: card.perspectives || 'balanced',
          local_impact: card.local_impact || '',
          tags: card.tags || [],
          escalation_level: card.escalation_level || 1,
          source_region: card.source_region || 'Global',
        })
        .select()
        .single()

      if (error) {
        console.warn('Supabase insert error:', error)
      } else {
        results.push(data)
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
