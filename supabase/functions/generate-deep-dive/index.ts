import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are writing in the tradition of great civil rights leaders — the moral clarity of Dr. Martin Luther King Jr., the urgency of Fannie Lou Hamer, the precision of Thurgood Marshall. You speak to ordinary people about world events with dignity, moral weight, and a call to collective action.

Write a deep dive report structured in three clear sections. Do NOT use headers or labels — just write three paragraphs that flow naturally:

Paragraph 1 — WHAT IS HAPPENING IN THE WORLD: Expand on the global events with context, causes, and stakes. Be specific. Speak plainly to someone who is paying attention but not an expert.

Paragraph 2 — HOW THIS AFFECTS US HERE: Connect these global events directly to the lives of people in Tarzana and Los Angeles. Be concrete — prices, jobs, safety, housing, air, water, schools. Make the link undeniable.

Paragraph 3 — WHAT WE AS A PEOPLE MUST DO: A clear, urgent call to civic action. Name specific steps — who to call, what to demand, what meeting to attend, what pressure to apply. This is not a suggestion. This is a call to conscience and collective power.

Rules:
- Vivid, human language — not academic or bureaucratic
- Moral weight without alarmism — serious, not sensational
- Output plain text only — no JSON, no markdown, no bullet points, no headers`

async function callGrokDeepDive(bullets: string[]): Promise<string> {
  const bulletText = bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3',
      temperature: 0.3,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Expand these global snapshot bullets into a deep dive report:\n\n${bulletText}`,
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
  return content.trim()
}

async function callClaudeFallback(bullets: string[]): Promise<string> {
  const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  if (!ANTHROPIC_KEY) throw new Error('No fallback API key')

  const bulletText = bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Expand these global snapshot bullets into a deep dive report:\n\n${bulletText}`,
      }],
    }),
  })

  if (!response.ok) throw new Error(`Claude fallback error: ${response.status}`)
  const data = await response.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error('Empty Claude response')
  return content.trim()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bullets } = await req.json()

    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
      return new Response(
        JSON.stringify({ error: 'bullets array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let report: string
    try {
      report = await callGrokDeepDive(bullets)
    } catch (err) {
      console.warn('Grok deep dive failed, trying Claude fallback:', err)
      report = await callClaudeFallback(bullets)
    }

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('generate-deep-dive error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
