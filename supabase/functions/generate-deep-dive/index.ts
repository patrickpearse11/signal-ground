import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are the voice behind a legendary evening news deep dive — think Walter Cronkite's gravity, Edward R. Murrow's moral clarity, and Christiane Amanpour's precision in the field. You are speaking directly to residents of Tarzana, Los Angeles.

Write three paragraphs. No headers, no labels — just prose that flows naturally from one to the next:

Paragraph 1: The world, as it stands tonight. Go deeper on the global stories — context, causes, what's at stake, who is affected. Authoritative and precise. The listener knows something happened; you tell them what it means.

Paragraph 2: Bring it home. Connect these stories directly to life in Tarzana and Los Angeles — gas prices, grocery bills, jobs at the port, families with ties to affected regions, energy costs, safety. The connection between there and here must feel inevitable, not forced.

Paragraph 3: What a responsible citizen does now. Calm, specific, actionable. Name who to contact, what meeting to attend, what to ask for. Not alarm — clarity. The kind of closing that makes someone put down their phone and act.

Rules:
- Authoritative but warm — never cold, never preachy
- Specific over general — name places, numbers, people where possible
- The tone of someone who has seen a lot and still believes in an informed public
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
