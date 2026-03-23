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
import { colors, spacing, radius } from '@/constants/theme'

const LEVEL_ORDER = { local: 0, state: 1, federal: 2 }

export default function RepsScreen() {
  const { reps, isLoading, error, setReps, setIsLoading, setError } = useGroundStore()
  const { zip } = useUserStore()

  const loadReps = useCallback(async (_refresh = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const fetched = await fetchRepsByZip(zip)
      const sorted = [...fetched].sort(
        (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
      )
      setReps(sorted)
    } catch (err) {
      setError('Could not load representatives. Pull down to retry.')
    } finally {
      setIsLoading(false)
    }
  }, [zip])

  useEffect(() => { loadReps() }, [zip])

  const localReps = reps.filter(r => r.level === 'local')
  const stateReps = reps.filter(r => r.level === 'state')
  const federalReps = reps.filter(r => r.level === 'federal')

  if (isLoading && reps.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reps</Text>
          <Text style={styles.headerSub}>Zip {zip} · Tarzana, Los Angeles</Text>
        </View>
        {[1, 2, 3].map(i => <SkeletonCard key={i} variant="rep" />)}
      </SafeAreaView>
    )
  }

  if (error && reps.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reps</Text>
        </View>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadReps(true)}>
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
            onRefresh={() => loadReps(true)}
            tintColor={colors.text.accent}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reps</Text>
          <Text style={styles.headerSub}>Zip {zip} · Tarzana, Los Angeles</Text>
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introText}>
            Your elected representatives at every level of government.
            Direct contact is the highest-impact civic action you can take.
          </Text>
        </View>

        {localReps.length > 0 && (
          <View style={styles.repGroup}>
            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionLabel}>LOCAL GOVERNMENT</Text>
            </View>
            {localReps.map((rep, i) => (
              <RepCard key={i} rep={rep} currentAction={rep.current_action} />
            ))}
          </View>
        )}

        {stateReps.length > 0 && (
          <View style={styles.repGroup}>
            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionLabel}>STATE GOVERNMENT</Text>
            </View>
            {stateReps.map((rep, i) => (
              <RepCard key={i} rep={rep} currentAction={rep.current_action} />
            ))}
          </View>
        )}

        {federalReps.length > 0 && (
          <View style={styles.repGroup}>
            <View style={styles.sectionLabelRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionLabel}>FEDERAL GOVERNMENT</Text>
            </View>
            {federalReps.map((rep, i) => (
              <RepCard key={i} rep={rep} currentAction={rep.current_action} />
            ))}
          </View>
        )}

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
  introCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.text.accent,
  },
  introText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  repGroup: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionAccent: {
    width: 3,
    height: 14,
    backgroundColor: colors.text.accent,
    borderRadius: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 1,
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
