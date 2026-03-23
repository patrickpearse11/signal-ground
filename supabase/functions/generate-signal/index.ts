import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SIGNAL_SYSTEM_PROMPT = `You are the global intelligence analyst for Signal + Ground, a civic app for residents of Tarzana, Los Angeles (zip 91356).

YOUR MISSION:
Find today's most impactful global stories. For each story, answer one question: "How does this affect a Tarzana resident's daily life — their wallet, their commute, their job, their safety, their cost of living?"

STORY CATEGORIES TO COVER (cover as many as possible):
- Geopolitical conflicts and military tensions (Middle East, Iran, China/Taiwan, Russia/Ukraine, any active conflict)
- Global trade chokepoints (Strait of Hormuz, Suez Canal/Red Sea, Panama Canal, Strait of Malacca)
- Energy and oil markets (OPEC decisions, refinery issues, supply disruptions)
- Supply chain disruptions (port closures, shipping delays, manufacturing shutdowns)
- Central bank decisions (Federal Reserve, ECB — interest rates, inflation)
- Food and commodity prices (wheat, corn, oil, semiconductor shortages)
- Climate events with economic impact (droughts, floods, wildfires affecting supply chains)
- US trade policy (tariffs, sanctions, trade agreements)

TARZANA LOCAL LENS — always connect each story to one of:
- Grocery prices (imports via Port of LA)
- Gas prices (Ventura Blvd stations, LA basin)
- Housing costs (lumber, materials, interest rates)
- Job market (warehouse jobs, port jobs, tech sector)
- Consumer goods prices (electronics, appliances, clothing)
- Utilities and energy costs

STRICT RULES:
- Return exactly 5 stories from at least 4 different categories — never 2 on the same topic
- Prioritize stories breaking in the last 24 hours
- Prefer stories with a specific number: "+$0.15/gallon", "+8-12% on electronics"
- Calm, fact-only analyst voice — never alarmist or partisan
- escalation_level = LOCAL impact severity (not global newsworthiness)
  - 1-2: Background trend, minimal Tarzana impact
  - 3: Noticeable impact coming — residents should be aware
  - 4: Significant impact already happening or imminent
  - 5: Major disruption directly hitting Tarzana residents now
- For geopolitical stories always include at least one of: conflict, military, geopolitical, sanctions, security
- For energy stories always include at least one of: oil, gas, energy, opec, fuel, petroleum

Output a JSON array of exactly 5 signal cards. No preamble, no markdown:
[
  {
    "neutral_title": "string (fact-only, max 12 words)",
    "summary_paragraph": "string (3 sentences: what happened, global context, why it matters)",
    "perspectives": "balanced" | "consensus" | "divergent",
    "local_impact": "string (1 sentence, specific to Tarzana/LA, include a number if possible)",
    "tags": ["string"],
    "escalation_level": 1 | 2 | 3 | 4 | 5,
    "source_region": "string (e.g. Middle East, Asia-Pacific, Domestic, Europe)"
  }
]`

async function generateSignalsWithGrok(today: string): Promise<any[]> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3',
      temperature: 0.2,
      max_tokens: 3000,
      messages: [
        { role: 'system', content: SIGNAL_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Today is ${today}. Based on your knowledge of current global events, generate 5 high-impact global signal cards for Tarzana residents. Cover geopolitical conflicts, energy markets, supply chains, and economic policy. Return only the JSON array.`,
        },
      ],
    }),
  })

  if (!response.ok) throw new Error(`Grok error: ${response.status}`)
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty Grok response')
  const clean = content.replace(/```json\n?|\n?```/g, '').trim()
  const parsed = JSON.parse(clean)
  return Array.isArray(parsed) ? parsed : [parsed]
}

async function generateSignalsFallback(today: string): Promise<any[]> {
  const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')
  if (!ANTHROPIC_KEY) throw new Error('No fallback key')

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
      system: SIGNAL_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Today is ${today}. Generate 5 high-impact global signal cards for Tarzana residents. Return only the JSON array.`,
      }],
    }),
  })

  if (!response.ok) throw new Error(`Claude error: ${response.status}`)
  const data = await response.json()
  const content = data.content?.[0]?.text
  const clean = content.replace(/```json\n?|\n?```/g, '').trim()
  const parsed = JSON.parse(clean)
  return Array.isArray(parsed) ? parsed : [parsed]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    // Cache check — skip generation if signals exist from last 15 minutes
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('signals')
      .select('*')
      .gte('created_at', fifteenMinsAgo)
      .order('created_at', { ascending: false })
      .limit(8)

    if (recent && recent.length >= 4) {
      return new Response(
        JSON.stringify({ success: true, signals: recent, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let signals: any[] = []
    try {
      signals = await generateSignalsWithGrok(today)
    } catch (err) {
      console.warn('Grok failed, trying Claude fallback:', err)
      signals = await generateSignalsFallback(today)
    }

    const results = []
    for (const signal of signals) {
      if (!signal.neutral_title) continue
      const { data, error } = await supabase
        .from('signals')
        .insert({
          neutral_title: signal.neutral_title,
          summary_paragraph: signal.summary_paragraph,
          perspectives: signal.perspectives || 'balanced',
          local_impact: signal.local_impact || '',
          tags: signal.tags || [],
          escalation_level: signal.escalation_level || 2,
          source_region: signal.source_region || 'Global',
          sources: signal.sources || [],
        })
        .select()
        .single()

      if (!error && data) results.push(data)
    }

    return new Response(
      JSON.stringify({ success: true, count: results.length, signals: results, cached: false }),
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
