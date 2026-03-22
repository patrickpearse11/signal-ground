import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROK_SYSTEM_PROMPT = `You are a senior neutral civic analyst. Summarize the provided news events into a calm, fact-only 3-sentence briefing. Never use loaded language or emotional words. If sources conflict, state the range of reported facts without favoring any side. Always end with one sentence on potential impact to Tarzana/Los Angeles residents (economy, prices, traffic, safety). Output strict JSON only — no preamble, no markdown:
{
  "neutral_title": string,
  "summary_paragraph": string,
  "perspectives": "balanced" | "consensus" | "divergent",
  "local_impact": string,
  "tags": string[],
  "escalation_level": 1 | 2 | 3 | 4 | 5
}`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // TODO Session 2: extract articles from req body
  // TODO Session 2: call Grok API (model: grok-4-1-fast)
  //   POST https://api.x.ai/v1/chat/completions (OpenAI-compatible format)
  //   model: grok-4-1-fast, temperature: 0.2, max_tokens: 1000
  // TODO Session 2: parse JSON response and validate shape
  // TODO Session 2: store result in Supabase briefs table
  // TODO Session 2: add Claude fallback (claude-sonnet-4-6) if Grok is unavailable

  return new Response(
    JSON.stringify({ status: 'scaffold ready' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
