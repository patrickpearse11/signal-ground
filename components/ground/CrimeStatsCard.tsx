import { View, Text, StyleSheet } from 'react-native'
import { CrimeStats } from '@/services/socrataService'
import { colors, spacing, radius } from '@/constants/theme'

interface Props { data: CrimeStats }

export function CrimeStatsCard({ data }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>CRIME & SAFETY</Text>
        <Text style={styles.period}>{data.period}</Text>
      </View>

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{data.total_incidents.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Reported incidents</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{data.top_crimes[0]?.count || 0}</Text>
          <Text style={styles.statLabel}>Most common type</Text>
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Top reported types</Text>
        {data.top_crimes.slice(0, 4).map((crime, i) => (
          <View key={i} style={styles.listRow}>
            <View style={styles.listBar}>
              <View style={[styles.listBarFill, {
                width: `${Math.round((crime.count / data.top_crimes[0].count) * 100)}%` as any,
                backgroundColor: i === 0 ? '#EF4444' : colors.border,
              }]} />
            </View>
            <Text style={styles.listLabel} numberOfLines={1}>{crime.type}</Text>
            <Text style={styles.listCount}>{crime.count}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.source}>Source: LAPD via DataLA · West Valley area</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 1,
    flex: 1,
  },
  period: { fontSize: 11, color: colors.text.secondary },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  statLabel: { fontSize: 11, color: colors.text.secondary, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 0.5, height: 40, backgroundColor: colors.border },
  listSection: { gap: 8 },
  listTitle: { fontSize: 12, fontWeight: '600', color: colors.text.secondary, marginBottom: 4 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listBar: { width: 60, height: 6, backgroundColor: colors.background, borderRadius: 3, overflow: 'hidden' },
  listBarFill: { height: '100%', borderRadius: 3 },
  listLabel: { flex: 1, fontSize: 12, color: colors.text.primary },
  listCount: { fontSize: 12, fontWeight: '600', color: colors.text.secondary, minWidth: 28, textAlign: 'right' },
  source: { fontSize: 10, color: colors.text.secondary, marginTop: spacing.sm, fontStyle: 'italic' },
})
