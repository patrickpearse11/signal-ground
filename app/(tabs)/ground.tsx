import { useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, RefreshControl,
  StyleSheet, TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RepCard } from '@/components/ground/RepCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useGroundStore } from '@/store/groundStore'
import { useUserStore } from '@/store/userStore'
import { fetchRepsByZip } from '@/services/civicService'
import { colors, spacing } from '@/constants/theme'

const LEVEL_ORDER = { local: 0, state: 1, federal: 2 }

export default function GroundScreen() {
  const { reps, isLoading, error, setReps, setIsLoading, setError } = useGroundStore()
  const { zip } = useUserStore()

  const loadGround = useCallback(async (_refresh = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedReps = await fetchRepsByZip(zip)
      const sorted = [...fetchedReps].sort(
        (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
      )
      setReps(sorted)
    } catch (err) {
      setError('Could not load civic data. Pull down to retry.')
      console.warn('Ground load error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [zip])

  useEffect(() => { loadGround() }, [zip])

  if (isLoading && reps.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ground</Text>
          <Text style={styles.headerSub}>Your civic foundation</Text>
        </View>
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </SafeAreaView>
    )
  }

  if (error && reps.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ground</Text>
        </View>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadGround(true)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const localReps = reps.filter(r => r.level === 'local')
  const stateReps = reps.filter(r => r.level === 'state')
  const federalReps = reps.filter(r => r.level === 'federal')

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadGround(true)}
            tintColor={colors.text.accent}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ground</Text>
          <Text style={styles.headerSub}>Zip {zip} · Tarzana, Los Angeles</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Representatives</Text>
          <Text style={styles.sectionSub}>
            Sorted by who can act fastest on local issues
          </Text>
        </View>

        {localReps.length > 0 && (
          <View style={styles.repGroup}>
            <Text style={styles.repGroupLabel}>LOCAL GOVERNMENT</Text>
            {localReps.map((rep, i) => <RepCard key={i} rep={rep} />)}
          </View>
        )}

        {stateReps.length > 0 && (
          <View style={styles.repGroup}>
            <Text style={styles.repGroupLabel}>STATE GOVERNMENT</Text>
            {stateReps.map((rep, i) => <RepCard key={i} rep={rep} />)}
          </View>
        )}

        {federalReps.length > 0 && (
          <View style={styles.repGroup}>
            <Text style={styles.repGroupLabel}>FEDERAL GOVERNMENT</Text>
            {federalReps.map((rep, i) => <RepCard key={i} rep={rep} />)}
          </View>
        )}

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>
            Neighborhood Council & Community Events — coming next
          </Text>
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
  section: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
  },
  repGroup: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  repGroupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
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
  retryBtnText: {
    color: colors.text.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  comingSoon: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})
