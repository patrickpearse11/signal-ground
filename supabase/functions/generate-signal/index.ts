import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const GROK_SYSTEM_PROMPT = `You are a senior neutral civic analyst. Summarize the provided news events into a calm, fact-only 3-sentence briefing. Never use loaded language or emotional words. If sources conflict, state the range of reported facts without favoring any side. Always end with one sentence on potential impact to Tarzana/Los Angeles residents (economy, prices, traffic, safety). Output strict JSON only — no preamble, no markdown backticks, no explanation. Just the raw JSON object:
{
  "neutral_title": "string",
  "summary_paragraph": "string",
  "perspectives": "balanced" | "consensus" | "divergent",
  "local_impact": "string",
  "tags": ["string"],
  "escalation_level": 1 | 2 | 3 | 4 | 5
}`

async function callGrok(headline: any): Promise<any> {
  const userMessage = `Headline: ${headline.title}\n\nDescription: ${headline.description || 'No description available'}\n\nSource: ${headline.source}`

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast', // Confirmed model ID (dashes, not dots)
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          { role: 'system', content: GROK_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!response.ok) throw new Error(`Grok error: ${response.status}`)
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty Grok response')

    // Strip markdown code fences if Grok wraps JSON in them
    const clean = content.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(clean)

  } catch (err) {
    console.warn('Grok failed, trying Claude fallback:', err)
    return await callClaudeFallback(userMessage)
  }
}

async function callClaudeFallback(userMessage: string): Promise<any> {
  const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  if (!ANTHROPIC_KEY) throw new Error('No fallback API key available')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: GROK_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) throw new Error(`Claude fallback error: ${response.status}`)
  const data = await response.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error('Empty Claude response')
  const clean = content.replace(/```json\n?|\n?```/g, '').trim()
  return JSON.parse(clean)
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)

    const { headlines } = await req.json()
    if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No headlines provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results = []
    for (const headline of headlines.slice(0, 5)) {
      try {
        const parsed = await callGrok(headline)

        if (!parsed.neutral_title || !parsed.summary_paragraph) {
          console.warn('Invalid Grok response shape, skipping:', parsed)
          continue
        }

        const { data: existing } = await supabase
          .from('signals')
          .select('id')
          .eq('neutral_title', parsed.neutral_title)
          .limit(1)
          .single()

        if (existing) {
          console.log('Duplicate signal, skipping:', parsed.neutral_title)
          continue
        }

        const { data, error } = await supabase
          .from('signals')
          .insert({
            neutral_title: parsed.neutral_title,
            summary_paragraph: parsed.summary_paragraph,
            perspectives: parsed.perspectives || 'balanced',
            local_impact: parsed.local_impact || '',
            tags: parsed.tags || [],
            escalation_level: parsed.escalation_level || 1,
          })
          .select()
          .single()

        if (error) {
          console.warn('Supabase insert error:', error)
        } else {
          results.push(data)
        }

      } catch (err) {
        console.warn('Failed to process headline:', headline.title, err)
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: results.length, signals: results }),
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
