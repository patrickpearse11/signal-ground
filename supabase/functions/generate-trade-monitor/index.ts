import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TRADE_MONITOR_PROMPT = `You are the trade and economic intelligence analyst for Signal + Ground, a civic app for Tarzana, Los Angeles residents (zip 91356).

YOUR MISSION:
Identify the most impactful global trade and economic developments right now. For each item, calculate the specific dollar impact on a Tarzana resident's daily life.

CATEGORIES TO COVER (at least one item per category):

1. MARITIME — Strait of Hormuz, Suez Canal/Red Sea, Panama Canal, Strait of Malacca, Trans-Pacific lanes
   Impact: Port of LA import costs → Tarzana grocery, appliance, electronics prices

2. TARIFFS — US-China tariffs, steel/aluminum, semiconductor export controls, new sanctions
   Impact: Consumer goods prices, manufacturing costs, product availability at local retailers

3. COMMODITIES — Oil/gas (WTI, Brent), wheat/corn, lumber, semiconductors, lithium
   Impact: Gas at Ventura Blvd, grocery staples, construction costs, EV and electronics prices

4. SUPPLY CHAIN — Port backlogs, factory shutdowns, freight rate changes, labor disputes
   Impact: Delivery delays, product shortages, price increases at local stores

5. MONETARY — Federal Reserve statements, dollar strength, Treasury yields, inflation data
   Impact: Mortgage rates, credit card rates, savings rates, purchasing power for Tarzana families

DOLLAR IMPACT RULES:
- Always include a specific number: "+$0.20/gallon", "+8-12% on electronics", "3-4 week delay"
- Reference local landmarks: "Ventura Blvd gas stations", "Port of LA", "local retailers"
- Use timeframes: "within 2 weeks", "already happening", "expected next month"

SEVERITY:
- clear: Normal conditions
- watch: Situation developing, monitor closely
- disrupted: Active disruption affecting trade flows
- critical: Severe disruption with immediate price/availability impact

Output a JSON array of exactly 6 trade monitor cards. No preamble, no markdown:
[
  {
    "title": "string (descriptive, max 10 words)",
    "category": "maritime" | "tariffs" | "commodities" | "supply_chain" | "monetary",
    "severity": "clear" | "watch" | "disrupted" | "critical",
    "summary": "string (2 sentences: what is happening + global context)",
    "tarzana_impact": "string (specific dollar/time impact on Tarzana residents)",
    "impact_detail": "string (which local prices/products/services are affected)",
    "tags": ["string"],
    "route_name": "string or null (for maritime only: Panama Canal, Strait of Hormuz, etc.)"
  }
]`

async function generateTradeCards(today: string): Promise<any[]> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3',
      temperature: 0.2,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: TRADE_MONITOR_PROMPT },
        {
          role: 'user',
          content: `Today is ${today}. Generate the Trade & Economic Monitor for Tarzana residents. Cover all 5 categories. Return only the JSON array.`,
        },
      ],
    }),
  })

  if (!response.ok) throw new Error(`Grok error: ${response.status}`)
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response')
  const clean = content.replace(/```json\n?|\n?```/g, '').trim()
  const parsed = JSON.parse(clean)
  return Array.isArray(parsed) ? parsed : [parsed]
}

async function generateTradeCardsFallback(today: string): Promise<any[]> {
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
      max_tokens: 4000,
      system: TRADE_MONITOR_PROMPT,
      messages: [{
        role: 'user',
        content: `Today is ${today}. Generate trade monitor cards covering maritime, tariffs, commodities, supply chain, and monetary. Return only the JSON array.`,
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

    // Cache check — return cached cards if updated within last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('trade_routes')
      .select('*')
      .gte('updated_at', oneHourAgo)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (recent && recent.length >= 4) {
      const cards = recent.map((row: any) => ({
        ...row,
        title: row.route_name,
        severity: row.status,
      }))
      return new Response(
        JSON.stringify({ success: true, cards, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let rawCards: any[] = []
    try {
      rawCards = await generateTradeCards(today)
    } catch (err) {
      console.warn('Grok failed, trying Claude fallback:', err)
      rawCards = await generateTradeCardsFallback(today)
    }

    // Clear old trade_routes
    await supabase
      .from('trade_routes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    const results = []
    for (const card of rawCards) {
      if (!card.title) continue
      const { data, error } = await supabase
        .from('trade_routes')
        .insert({
          route_name: card.route_name || card.title,
          status: card.severity,
          grok_oneliner: card.tarzana_impact,
          category: card.category,
          impact_detail: card.impact_detail || '',
          tarzana_impact: card.tarzana_impact,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!error && data) {
        results.push({
          ...data,
          title: card.title,
          summary: card.summary,
          tags: card.tags || [],
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: results.length, cards: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('generate-trade-monitor error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
