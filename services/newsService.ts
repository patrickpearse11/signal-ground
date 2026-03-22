// News data — NewsAPI + GDELT
// IMPORTANT: NewsAPI free tier = 100 req/day, developer = 500 req/day
// Strategy: use GDELT as primary volume source, NewsAPI for enrichment only

// TODO Session 2: implement fetchTopHeadlines — NewsAPI top headlines
export async function fetchTopHeadlines(_zip: string): Promise<string[]> {
  // TODO
  return []
}

// TODO Session 2: implement fetchGdeltEvents — GDELT global event stream
export async function fetchGdeltEvents(): Promise<string[]> {
  // TODO
  return []
}
