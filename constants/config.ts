// API endpoints and app-wide defaults

export const DEFAULT_ZIP = '91356' // Tarzana, CA

// Supabase Edge Function URLs (relative — called via supabase.functions.invoke)
export const EDGE_FUNCTIONS = {
  generateBrief: 'generate-brief',   // Daily briefing from news events
  generateSignal: 'generate-signal', // Per-article neutral signal cards
}

// AI model configuration
// NOTE: Verify grok-4.1-fast is a valid xAI model ID before Session 2
export const AI_MODELS = {
  grok: 'grok-4-1-fast',             // Confirmed model ID (dashes, not dots)
  claudeFallback: 'claude-sonnet-4-6', // Used if Grok is unavailable
}

// Grok generation settings
export const GROK_CONFIG = {
  temperature: 0.2,
  maxTokens: 1000,
}

// NewsAPI
// NOTE: Free tier = 100 req/day, Developer = 500 req/day
// Use GDELT as primary volume source; NewsAPI for enrichment only
export const NEWS_CONFIG = {
  pageSize: 20,
}
