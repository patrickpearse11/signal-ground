import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { SignalTeaser } from '@/types/brief'
import { EscalationBadge } from '@/components/shared/EscalationBadge'
import { colors, spacing, radius } from '@/constants/theme'

interface Props {
  teasers: SignalTeaser[]
}

export function SignalsTeaserCard({ teasers }: Props) {
  const router = useRouter()

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>KEY SIGNALS</Text>
      </View>
      <Text style={styles.title}>Highest-impact items right now</Text>
      <View style={styles.items}>
        {teasers.map((teaser, i) => (
          <TouchableOpacity
            key={i}
            style={styles.teaserRow}
            onPress={() => router.push('/(tabs)/signal')}
            activeOpacity={0.7}
          >
            <View style={styles.teaserContent}>
              <EscalationBadge level={teaser.escalation_level} />
              <Text style={styles.teaserTitle} numberOfLines={2}>{teaser.title}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.viewAllBtn}
        onPress={() => router.push('/(tabs)/signal')}
        activeOpacity={0.7}
      >
        <Text style={styles.viewAllText}>View full Signal feed →</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.secondary,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  items: { gap: 2 },
  teaserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  teaserContent: { flex: 1, gap: 6 },
  teaserTitle: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  arrow: { fontSize: 16, color: colors.text.secondary },
  viewAllBtn: { paddingTop: spacing.sm, alignItems: 'flex-end' },
  viewAllText: { fontSize: 13, color: colors.text.accent, fontWeight: '600' },
})
