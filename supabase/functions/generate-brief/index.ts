import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const BRIEF_SYSTEM_PROMPT = `You are a senior neutral civic analyst generating a daily briefing for residents of Tarzana, Los Angeles (zip: {ZIP}).

Your tone: calm, authoritative, precise. Never alarmist. Always ties global → local.

You will receive:
- Top global news signals from today
- Current trade route statuses
- Local representative information including their current active issues/votes

URGENCY REQUIREMENT: Every action in personalized_close must reference a REAL upcoming deadline — a vote scheduled this week, a comment period closing, a city council meeting, a budget deadline. Use specific dates. Never say "when you have time" or vague language. If you know of a real deadline this week, use it.

Generate a complete daily brief as strict JSON only — no preamble, no markdown, just the raw JSON:

{
  "global_snapshot": {
    "bullets": ["string", "string", "string"]
  },
  "home_impact": {
    "headline": "string (global event → local number, e.g. 'Red Sea disruption → +12% grocery price risk this month')",
    "explanation": "string (2 sentences expanding on why this affects Tarzana/LA specifically)",
    "zip": "{ZIP}"
  },
  "signal_teasers": [
    {
      "title": "string",
      "escalation_level": 1,
      "signal_id": "string"
    }
  ],
  "rep_actions": [
    {
      "name": "string",
      "role": "string",
      "phone": "string",
      "email": "string",
      "issue": "string (the specific vote, hearing, or action this rep is engaged in THIS WEEK — be specific, not generic)"
    }
  ],
  "personalized_close": {
    "action": "string (one specific thing the resident can do today, referencing a real issue)",
    "deadline": "string (specific deadline e.g. 'Council vote is Thursday, March 27' or 'Comment period closes Friday')",
    "cta_ground": "string (e.g. 'View your reps')",
    "cta_impact": "string (e.g. 'See local actions')"
  },
  "generated_at": "string (ISO timestamp)",
  "zip": "{ZIP}"
}`

const DEFAULT_REPS = [
  {
    name: 'Bob Blumenfield',
    role: 'LA City Council, District 3',
    phone: '(818) 756-8501',
    email: 'councilmember.blumenfield@lacity.org',
    issue: 'Local infrastructure and neighborhood services',
  },
  {
    name: 'Lindsey Horvath',
    role: 'LA County Supervisor, District 3',
    phone: '(213) 974-3333',
    email: 'Supervisor3@bos.lacounty.gov',
    issue: 'County services and regional planning',
  },
]

async function callGrok(prompt: string, zip: string): Promise<any> {
  const systemPrompt = BRIEF_SYSTEM_PROMPT.replaceAll('{ZIP}', zip)

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3',
        temperature: 0.3,
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!response.ok) throw new Error(`Grok error: ${response.status}`)
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty Grok response')
    const clean = content.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(clean)

  } catch (err) {
    console.warn('Grok failed, trying Claude fallback:', err)
    return await callClaudeFallback(prompt, systemPrompt)
  }
}

async function callClaudeFallback(userPrompt: string, systemPrompt: string): Promise<any> {
  const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  if (!ANTHROPIC_KEY) throw new Error('No fallback API key')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
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
    const { user_id, zip = '91356' } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const today = new Date().toISOString().split('T')[0]

    // Return cached brief if already generated today
    const { data: existing } = await supabase
      .from('briefs')
      .select('*')
      .eq('user_id', user_id)
      .eq('date', today)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ brief: existing, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: signals } = await supabase
      .from('signals')
      .select('id, neutral_title, escalation_level')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: routes } = await supabase
      .from('trade_routes')
      .select('route_name, status, grok_oneliner')

    const userPrompt = `
TODAY'S DATE: ${today}
ZIP CODE: ${zip}

TOP NEWS SIGNALS:
${(signals || []).map((s: any, i: number) => `${i + 1}. [ID: ${s.id}] ${s.neutral_title} (escalation: ${s.escalation_level})`).join('\n')}

TRADE ROUTE STATUS:
${(routes || []).map((r: any) => `• ${r.route_name}: ${r.status} — ${r.grok_oneliner}`).join('\n')}

LOCAL REPRESENTATIVES FOR ZIP ${zip}:
${DEFAULT_REPS.map(r => `• ${r.name}, ${r.role} | ${r.phone} | ${r.email} — known issue: ${r.issue}`).join('\n')}

Generate the complete daily brief JSON for a Tarzana resident at zip ${zip}.
For signal_teasers, use the actual signal IDs provided above.
For rep_actions, use the representatives listed above but ENRICH each rep's "issue" field with what you know about their CURRENT votes, hearings, or actions THIS WEEK (${today}). Be specific — name the bill, budget item, or council motion if you know it.
For personalized_close.deadline, give a REAL upcoming deadline this week. Be specific with the date.
`.trim()

    const briefContent = await callGrok(userPrompt, zip)
    briefContent.generated_at = new Date().toISOString()
    briefContent.zip = zip

    const { data: saved, error: saveError } = await supabase
      .from('briefs')
      .insert({ user_id, date: today, content_json: briefContent })
      .select()
      .single()

    if (saveError) throw saveError

    return new Response(
      JSON.stringify({ brief: saved, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('generate-brief error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
