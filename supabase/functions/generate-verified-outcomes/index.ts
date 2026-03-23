import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SOCRATA_BASE = 'https://data.lacity.org/resource'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const thirtyStr = thirtyDaysAgo.toISOString().split('T')[0]
    const sixtyStr = sixtyDaysAgo.toISOString().split('T')[0]

    const [recent311, previous311] = await Promise.all([
      fetch(`${SOCRATA_BASE}/pvft-t768.json?$where=createddate>='${thirtyStr}'&zipcode=91356&$select=count(service_request_number)&$group=requesttype&$limit=10`).then(r => r.json()),
      fetch(`${SOCRATA_BASE}/pvft-t768.json?$where=createddate>='${sixtyStr}' AND createddate<'${thirtyStr}'&zipcode=91356&$select=count(service_request_number)&$group=requesttype&$limit=10`).then(r => r.json()),
    ])

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-3-fast',
        temperature: 0.3,
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `You are a civic data analyst for Tarzana, Los Angeles. You will be given 311 service request data for two 30-day periods. Identify any meaningful changes (improvements or worsening) and generate outcome stories that connect these changes to potential resident actions. Be factual and conservative — only report real changes visible in the data. Output a JSON array only, no other text:
[{
  "rep_name": "string (City official or department responsible)",
  "rep_role": "string",
  "action_type": "improvement" | "worsening" | "neutral",
  "outcome_text": "string (factual description of the change)",
  "related_issue": "string",
  "resident_actions": number,
  "before_value": "string (e.g. '47 requests/month')",
  "after_value": "string (e.g. '31 requests/month')",
  "change_pct": number,
  "verified": true
}]`,
          },
          {
            role: 'user',
            content: `Recent 30 days 311 data for Tarzana 91356:\n${JSON.stringify(recent311, null, 2)}\n\nPrevious 30 days:\n${JSON.stringify(previous311, null, 2)}\n\nGenerate outcome stories for meaningful changes. Return only the JSON array.`,
          },
        ],
      }),
    })

    if (!response.ok) throw new Error(`Grok error: ${response.status}`)
    const grokData = await response.json()
    const content = grokData.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty Grok response')
    const clean = content.replace(/```json\n?|\n?```/g, '').trim()
    const outcomes = JSON.parse(clean)

    const today = new Date().toISOString().split('T')[0]
    for (const outcome of outcomes) {
      await supabase.from('outcomes').upsert({
        ...outcome,
        zip: '91356',
        outcome_date: today,
        data_source: 'socrata_311',
      }, { onConflict: 'rep_name,outcome_date' })
    }

    return new Response(
      JSON.stringify({ success: true, outcomes_generated: outcomes.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('generate-verified-outcomes error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
