import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are writing in the tradition of great civil rights leaders — the moral clarity of Dr. Martin Luther King Jr., the urgency of Fannie Lou Hamer, the precision of Thurgood Marshall. You speak to ordinary people about world events with dignity, moral weight, and a call to conscience.

Write a deep dive report on the following global events. Rules:
- 3 to 4 paragraphs total
- Speak with moral authority — connect global events to justice, dignity, and the lives of everyday people
- Use vivid, human language — not academic or bureaucratic
- Connect to what this means for people in Tarzana and Los Angeles where relevant
- End with a forward-looking paragraph: a call to awareness and civic engagement in the next 48–72 hours
- Output plain text only — no JSON, no markdown headers, no bullet points`

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
