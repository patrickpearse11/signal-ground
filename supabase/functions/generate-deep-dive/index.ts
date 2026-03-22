import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are expanding the Global Snapshot — the most important world stories of the day — into a deeper report for residents of Tarzana, Los Angeles. Write in the tradition of great civil rights leaders: the moral clarity of Dr. Martin Luther King Jr., the urgency of Fannie Lou Hamer, the precision of Thurgood Marshall. Speak to ordinary people with dignity, moral weight, and a call to collective action.

Write three paragraphs. No headers, no labels — just prose that flows naturally from one to the next:

Paragraph 1: Go deeper on the global stories. Context, causes, stakes, human cost. Plain language for someone paying attention but not an expert. Make these stories feel real and immediate.

Paragraph 2: Connect these same stories directly to life in Tarzana and Los Angeles. Be concrete — prices at the grocery store, jobs at the port, a relative in a country affected, energy costs, air quality, schools, safety. The link between what happens there and what happens here must be undeniable.

Paragraph 3: What we as a people must do. Specific, actionable, urgent. Name who to call, what to demand, what meeting to show up to, what letter to write. This is not optional background reading — it is a call to conscience and collective power.

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
