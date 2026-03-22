import { useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, RefreshControl,
  StyleSheet, TouchableOpacity, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GlobalSnapshotCard } from '@/components/brief/GlobalSnapshotCard'
import { HomeImpactCard } from '@/components/brief/HomeImpactCard'
import { SignalsTeaserCard } from '@/components/brief/SignalsTeaserCard'
import { RepQuickActionCard } from '@/components/brief/RepQuickActionCard'
import { PersonalizedCloseCard } from '@/components/brief/PersonalizedCloseCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useBriefStore } from '@/store/briefStore'
import { useUserStore } from '@/store/userStore'
import { fetchTodaysBrief, fetchCachedBrief } from '@/services/briefService'
import { colors, spacing } from '@/constants/theme'

export default function BriefScreen() {
  const { brief, isLoading, error, setBrief, setIsLoading, setError } = useBriefStore()
  const { userId, zip } = useUserStore()

  const loadBrief = useCallback(async (refresh = false) => {
    if (!userId) return
    setIsLoading(true)
    setError(null)

    try {
      if (!refresh) {
        const cached = await fetchCachedBrief(userId)
        if (cached) {
          setBrief(cached)
          setIsLoading(false)
          return
        }
      }

      const fresh = await fetchTodaysBrief(userId, zip)
      if (fresh) setBrief(fresh)
      else setError('Could not load your brief. Pull down to retry.')

    } catch (err) {
      setError('Could not load your brief. Pull down to retry.')
      console.warn('Brief load error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, zip])

  useEffect(() => {
    loadBrief()
  }, [userId])

  const content = brief?.content_json

  const dateLabel = brief?.date
    ? new Date(brief.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      })

  if (isLoading && !content) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Brief</Text>
          <Text style={styles.headerDate}>{dateLabel}</Text>
        </View>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.text.accent} />
          <Text style={styles.loadingText}>Generating your Tarzana brief...</Text>
        </View>
        {[1, 2, 3].map((i) => <SkeletonCard key={i} variant="brief" />)}
      </SafeAreaView>
    )
  }

  if (error && !content) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Brief</Text>
        </View>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadBrief(true)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadBrief(true)}
            tintColor={colors.text.accent}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Brief</Text>
          <Text style={styles.headerDate}>{dateLabel}</Text>
          <Text style={styles.headerSub}>Your Tarzana · Los Angeles briefing</Text>
        </View>

        {content?.global_snapshot && <GlobalSnapshotCard data={content.global_snapshot} />}
        {content?.home_impact && <HomeImpactCard data={content.home_impact} />}
        {content?.signal_teasers && content.signal_teasers.length > 0 && (
          <SignalsTeaserCard teasers={content.signal_teasers} />
        )}
        {content?.rep_actions && content.rep_actions.length > 0 && (
          <RepQuickActionCard reps={content.rep_actions} />
        )}
        {content?.personalized_close && <PersonalizedCloseCard data={content.personalized_close} />}

        <Text style={styles.readTime}>5–7 min read · Updated daily at 7am</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  headerDate: { fontSize: 14, color: colors.text.accent, fontWeight: '600', marginTop: 2 },
  headerSub: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  loadingText: { fontSize: 13, color: colors.text.secondary },
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
  retryBtn: {
    borderWidth: 1,
    borderColor: colors.text.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryBtnText: { color: colors.text.accent, fontWeight: '600', fontSize: 14 },
  readTime: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingTop: spacing.md,
  },
})
