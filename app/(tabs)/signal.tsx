import { useEffect, useCallback, useMemo, useState } from 'react'
import { View, Text, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NewsCard } from '@/components/signal/NewsCard'
import { TradeCard } from '@/components/signal/TradeCard'
import { TradeFilterBar } from '@/components/signal/TradeFilterBar'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { Toast } from '@/components/shared/Toast'
import { useFeedStore } from '@/store/feedStore'
import { fetchLatestSignals, generateSignals, fetchTradeCards } from '@/services/grokService'
import { colors, spacing } from '@/constants/theme'
import { FeedItem, SignalCard } from '@/types/signal'

export default function SignalScreen() {
  const {
    signals, tradeCards, isLoading, isRefreshing,
    lastUpdated, error, feedFilter,
    setSignals, setTradeCards, setIsLoading, setIsRefreshing,
    setLastUpdated, setError, setFeedFilter,
  } = useFeedStore()
  const [toast, setToast] = useState({ visible: false, message: '' })

  const loadFeed = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)

    try {
      const [cached, freshTradeCards] = await Promise.all([
        fetchLatestSignals(20),
        fetchTradeCards(),
      ])

      if (cached.length > 0) setSignals(cached)
      if (freshTradeCards.length > 0) setTradeCards(freshTradeCards)
      setLastUpdated(new Date())

      if (refresh || cached.length === 0) {
        const fresh = await generateSignals()
        if (fresh.length > 0) {
          const updated = await fetchLatestSignals(20)
          setSignals(updated)
          setLastUpdated(new Date())
        }
      }
    } catch (err) {
      setError('Could not load signals. Pull down to retry.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => { loadFeed() }, [])

  const feedItems: FeedItem[] = useMemo(() => {
    if (feedFilter === 'trade') {
      return tradeCards.map(c => ({ type: 'trade' as const, data: c }))
    }

    if (feedFilter === 'conflicts') {
      return signals
        .filter(s =>
          s.tags?.some(t =>
            ['conflict', 'military', 'geopolitical', 'war', 'sanctions', 'security'].includes(t.toLowerCase())
          ) || ['Middle East', 'Asia-Pacific', 'Europe'].includes(s.source_region || '')
        )
        .map(s => ({ type: 'signal' as const, data: s }))
    }

    if (feedFilter === 'energy') {
      const energyTrade = tradeCards
        .filter(c => c.category === 'commodities' || c.category === 'maritime')
        .map(c => ({ type: 'trade' as const, data: c }))
      const energySignals = signals
        .filter(s => s.tags?.some(t =>
          ['oil', 'gas', 'energy', 'opec', 'fuel', 'petroleum'].includes(t.toLowerCase())
        ))
        .map(s => ({ type: 'signal' as const, data: s }))
      return [...energyTrade, ...energySignals]
    }

    // 'all' — interleave trade cards every 3 signals
    const items: FeedItem[] = []
    signals.forEach((s, i) => {
      items.push({ type: 'signal' as const, data: s })
      if ((i + 1) % 3 === 0 && tradeCards[Math.floor(i / 3)]) {
        items.push({ type: 'trade' as const, data: tradeCards[Math.floor(i / 3)] })
      }
    })
    return items
  }, [signals, tradeCards, feedFilter])

  function handleSaveToImpact(signal: SignalCard) {
    setToast({ visible: true, message: 'Saved to Impact' })
  }

  if (isLoading && signals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Signal</Text>
          <Text style={styles.headerSub}>Global intelligence feed</Text>
        </View>
        <TradeFilterBar value={feedFilter} onChange={setFeedFilter} />
        {[1, 2, 3].map((i) => <SkeletonCard key={i} variant="news" />)}
      </SafeAreaView>
    )
  }

  if (error && signals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Signal</Text>
        </View>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadFeed()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={feedItems}
        keyExtractor={(item) =>
          item.type === 'signal'
            ? (item.data.id ?? item.data.neutral_title)
            : (item.data.id ?? item.data.title)
        }
        renderItem={({ item }) =>
          item.type === 'signal'
            ? <NewsCard signal={item.data} onSaveToImpact={handleSaveToImpact} />
            : <TradeCard card={item.data} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Signal</Text>
              <Text style={styles.headerSub}>
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Global intelligence feed'}
              </Text>
            </View>
            <TradeFilterBar
              value={feedFilter}
              onChange={setFeedFilter}
              tradeCount={tradeCards.length}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>No signals yet</Text>
            <Text style={styles.emptySubText}>Pull down to refresh</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadFeed(true)}
            tintColor={colors.text.accent}
          />
        }
        contentContainerStyle={styles.listContent}
        removeClippedSubviews
        maxToRenderPerBatch={5}
        showsVerticalScrollIndicator={false}
      />
      <Toast
        message={toast.message}
        visible={toast.visible}
        onHide={() => setToast({ visible: false, message: '' })}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  headerSub: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  listContent: { paddingBottom: spacing.xl },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: 80,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm },
  emptySubText: { fontSize: 14, color: colors.text.secondary },
  retryBtn: {
    borderWidth: 1,
    borderColor: colors.text.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryBtnText: { color: colors.text.accent, fontWeight: '600', fontSize: 14 },
})
