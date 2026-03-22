import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Reuses the same system prompt as generate-brief — same JSON output shape
// This function processes individual articles for the Signal tab feed
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

  // TODO Session 3 (Signal tab): extract single article from req body
  // TODO Session 3: call Grok API (model: grok-4-1-fast, OpenAI-compatible format)
  // TODO Session 3: store result in Supabase signals table
  // TODO Session 3: add Claude fallback (claude-sonnet-4-6) if Grok is unavailable

  return new Response(
    JSON.stringify({ status: 'scaffold ready' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
