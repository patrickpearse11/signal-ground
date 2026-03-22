import { useEffect, useCallback, useState } from 'react'
import {
  View, Text, ScrollView, RefreshControl,
  StyleSheet, TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ActionCard } from '@/components/impact/ActionCard'
import { ScoreMeter } from '@/components/impact/ScoreMeter'
import { CommunityRippleCard } from '@/components/impact/CommunityRippleCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useImpactStore } from '@/store/impactStore'
import { useUserStore } from '@/store/userStore'
import {
  fetchActionOpportunities,
  fetchCommunityRipple,
  fetchPersonalScore,
} from '@/services/impactService'
import { colors, spacing } from '@/constants/theme'

export default function ImpactScreen() {
  const { opportunities, ripple, score, isLoading, error,
    setOpportunities, setRipple, setScore, setIsLoading, setError } = useImpactStore()
  const { userId, zip } = useUserStore()
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const loadImpact = useCallback(async (_refresh = false) => {
    if (!userId) return
    setIsLoading(true)
    setError(null)
    try {
      const [ops, communityRipple, personalScore] = await Promise.all([
        fetchActionOpportunities(userId, zip),
        fetchCommunityRipple(zip),
        fetchPersonalScore(userId),
      ])
      setOpportunities(ops)
      setRipple(communityRipple)
      setScore(personalScore)
    } catch (err) {
      setError('Could not load impact data. Pull down to retry.')
    } finally {
      setIsLoading(false)
    }
  }, [userId, zip])

  useEffect(() => { loadImpact() }, [userId])

  function handleRSVP(id: string) {
    setCompletedIds(prev => new Set([...prev, id]))
    if (userId) fetchPersonalScore(userId).then(setScore)
  }

  const activeOpportunities = opportunities.filter(o => !completedIds.has(o.id))

  if (isLoading && !score) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Impact</Text>
          <Text style={styles.headerSub}>From awareness to action</Text>
        </View>
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </SafeAreaView>
    )
  }

  if (error && !score) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Impact</Text>
        </View>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadImpact(true)}>
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
            onRefresh={() => loadImpact(true)}
            tintColor={colors.text.accent}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Impact</Text>
          <Text style={styles.headerSub}>From awareness to action</Text>
        </View>

        {/* SECTION 1: ACTION OPPORTUNITIES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Action Opportunities</Text>
          <Text style={styles.sectionSub}>High-leverage actions you can take right now</Text>
        </View>

        <View style={styles.sectionContent}>
          {activeOpportunities.length > 0
            ? activeOpportunities.map(op => (
                <ActionCard key={op.id} opportunity={op} onRSVP={handleRSVP} />
              ))
            : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>All caught up</Text>
                <Text style={styles.emptyText}>
                  Check back tomorrow for new action opportunities, or visit the Ground tab to find upcoming events.
                </Text>
              </View>
            )
          }
        </View>

        <View style={styles.divider} />

        {/* SECTION 2: COMMUNITY RIPPLE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Ripple</Text>
          <Text style={styles.sectionSub}>Collective civic activity in Tarzana</Text>
        </View>

        <View style={styles.sectionContent}>
          {ripple && <CommunityRippleCard ripple={ripple} />}
        </View>

        <View style={styles.divider} />

        {/* SECTION 3: PERSONAL SCORE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Score</Text>
          <Text style={styles.sectionSub}>Updated after each action</Text>
        </View>

        <View style={styles.sectionContent}>
          {score && <ScoreMeter score={score} />}
        </View>

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
    paddingBottom: spacing.sm,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  headerSub: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  sectionSub: { fontSize: 13, color: colors.text.secondary, marginTop: 4 },
  sectionContent: { paddingHorizontal: spacing.md },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  emptyState: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
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
})
