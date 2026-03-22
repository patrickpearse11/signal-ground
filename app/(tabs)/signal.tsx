import { useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, RefreshControl,
  StyleSheet, TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NewsCard } from '@/components/signal/NewsCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useFeedStore } from '@/store/feedStore'
import { fetchLatestSignals, generateSignals } from '@/services/grokService'
import { fetchCivicHeadlines } from '@/services/newsService'
import { colors, spacing } from '@/constants/theme'
import { SignalCard } from '@/types/signal'

// Only call Grok if last update was more than 15 minutes ago
const REFRESH_COOLDOWN_MS = 15 * 60 * 1000

export default function SignalScreen() {
  const {
    signals, isLoading, isRefreshing, lastUpdated, error,
    setSignals, setIsLoading, setIsRefreshing, setLastUpdated, setError,
  } = useFeedStore()

  const loadSignals = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)

    try {
      // Always load from Supabase cache first
      const cached = await fetchLatestSignals(20)
      if (cached.length > 0) {
        setSignals(cached)
        setLastUpdated(new Date())
      }

      // Only call Grok if refreshing AND cooldown has passed (saves API credits)
      const cooldownPassed = !lastUpdated || Date.now() - lastUpdated.getTime() > REFRESH_COOLDOWN_MS
      if ((refresh && cooldownPassed) || cached.length === 0) {
        const headlines = await fetchCivicHeadlines()
        const fresh = await generateSignals(headlines)
        if (fresh.length > 0) {
          const updated = await fetchLatestSignals(20)
          setSignals(updated)
          setLastUpdated(new Date())
        }
      }
    } catch (err) {
      setError('Could not load signals. Pull down to retry.')
      console.warn('Signal load error:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [lastUpdated])

  useEffect(() => {
    loadSignals()
  }, [])

  function handleSaveToImpact(signal: SignalCard) {
    console.log('Saved to impact:', signal.neutral_title)
  }

  if (isLoading && signals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Signal</Text>
          <Text style={styles.headerSub}>Civic intelligence feed</Text>
        </View>
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
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
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadSignals()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={signals}
        keyExtractor={(item) => item.id ?? item.neutral_title}
        renderItem={({ item }) => (
          <NewsCard signal={item} onSaveToImpact={handleSaveToImpact} />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Signal</Text>
            <Text style={styles.headerSub}>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Civic intelligence feed'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>No signals yet</Text>
            <Text style={styles.emptySubText}>Pull down to load your civic feed</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadSignals(true)}
            tintColor={colors.text.accent}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={5}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSub: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  centerState: {
    flex: 1,
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
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: colors.text.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryBtnText: {
    color: colors.text.accent,
    fontWeight: '600',
    fontSize: 14,
  },
})
