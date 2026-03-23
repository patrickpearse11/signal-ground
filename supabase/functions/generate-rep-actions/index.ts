import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GROK_API_KEY = Deno.env.get('GROK_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)

    // Fetch all cached reps
    const { data: repRows, error } = await supabase
      .from('ground_data')
      .select('id, content_json')
      .eq('type', 'rep')
      .eq('zip', '91356')

    if (error || !repRows?.length) {
      return new Response(
        JSON.stringify({ error: 'No reps found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const updated: { name: string; action: string }[] = []

    for (const row of repRows) {
      const rep = row.content_json as any
      if (!rep.name) continue

      try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'grok-3-fast',
            temperature: 0.2,
            max_tokens: 200,
            tools: [{
              type: 'function',
              function: { name: 'web_search', description: 'Search for current news' },
            }],
            tool_choice: 'auto',
            messages: [
              {
                role: 'system',
                content: `You are a civic assistant. Search the web for what ${rep.name} (${rep.role}) has done or is scheduled to do THIS WEEK. Return a single sentence describing one specific, timely action (a vote, hearing, statement, or meeting). Format: "[Action verb] on [specific topic] [when]". Examples: "Voting on Ventura Blvd rezoning Thursday April 8" or "Testified on port fees Tuesday — public comment open until Friday". If nothing specific found this week, return "No upcoming actions found this week." Never return generic descriptions.`,
              },
              {
                role: 'user',
                content: `Today is ${today}. What is ${rep.name} (${rep.role}, ${rep.district}) doing or scheduled to do this week? Search now and return one specific sentence.`,
              },
            ],
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const action = data.choices?.[0]?.message?.content?.trim()

          if (action && !action.includes('No upcoming actions')) {
            await supabase
              .from('ground_data')
              .update({
                content_json: { ...rep, current_action: action },
                updated_at: new Date().toISOString(),
              })
              .eq('id', row.id)

            updated.push({ name: rep.name, action })
          }
        }
      } catch (err) {
        console.warn(`Failed to get action for ${rep.name}:`, err)
      }

      // Small delay between reps to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return new Response(
      JSON.stringify({ success: true, updated: updated.length, actions: updated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('generate-rep-actions error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
