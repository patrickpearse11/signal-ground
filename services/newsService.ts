import { RawHeadline } from '@/types/signal'

// NOTE: NewsAPI free tier = 100 req/day. Fallback headlines used if unavailable.
const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY

const CIVIC_QUERIES = [
  'trade tariffs economy',
  'shipping ports supply chain',
  'Los Angeles local government',
  'California policy legislation',
  'federal reserve inflation prices',
  'energy oil gas prices',
]

export async function fetchCivicHeadlines(): Promise<RawHeadline[]> {
  try {
    const query = CIVIC_QUERIES.slice(0, 3).join(' OR ')
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`

    const response = await fetch(url)
    if (!response.ok) throw new Error(`NewsAPI error: ${response.status}`)

    const data = await response.json()
    if (data.status !== 'ok') throw new Error(data.message || 'NewsAPI failed')

    return data.articles
      .filter((a: any) => a.title && a.title !== '[Removed]')
      .slice(0, 8)
      .map((a: any) => ({
        title: a.title,
        description: a.description,
        source: a.source?.name || 'Unknown',
        url: a.url,
        publishedAt: a.publishedAt,
      }))

  } catch (err) {
    console.warn('NewsAPI fetch failed, using fallback:', err)
    return getFallbackHeadlines()
  }
}

function getFallbackHeadlines(): RawHeadline[] {
  return [
    {
      title: 'Federal Reserve holds interest rates steady amid inflation concerns',
      description: 'The Fed voted to maintain current rates as inflation data shows mixed signals.',
      source: 'Reuters',
      url: '',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'Port of Los Angeles reports shipping volume changes',
      description: 'Container traffic at the Port of LA reflects global supply chain shifts.',
      source: 'LA Times',
      url: '',
      publishedAt: new Date().toISOString(),
    },
    {
      title: 'California legislature considers new housing legislation',
      description: 'State lawmakers debate bills affecting housing costs across California.',
      source: 'CalMatters',
      url: '',
      publishedAt: new Date().toISOString(),
    },
  ]
}
