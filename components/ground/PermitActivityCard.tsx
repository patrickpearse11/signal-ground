import { View, Text, StyleSheet } from 'react-native'
import { PermitActivity } from '@/services/socrataService'
import { colors, spacing, radius } from '@/constants/theme'

interface Props { data: PermitActivity }

export function PermitActivityCard({ data }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>BUILDING & PERMITS</Text>
        <Text style={styles.period}>{data.period}</Text>
      </View>

      <View style={styles.statsRow}>
        {[
          { value: data.total_permits, label: 'Total permits' },
          { value: data.new_construction, label: 'New construction' },
          { value: data.renovations, label: 'Renovations' },
        ].map((s, i) => (
          <View key={i} style={styles.stat}>
            <Text style={styles.statNumber}>{s.value.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Permit types filed</Text>
        {data.top_permit_types.map((pt, i) => (
          <View key={i} style={styles.typeRow}>
            <View style={[styles.typeDot, { backgroundColor: i === 0 ? colors.text.accent : colors.border }]} />
            <Text style={styles.typeLabel} numberOfLines={1}>{pt.type}</Text>
            <Text style={styles.typeCount}>{pt.count}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.source}>Source: LADBS via DataLA · Zip {data.zip}</Text>
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
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '700', color: colors.text.primary },
  statLabel: { fontSize: 11, color: colors.text.secondary, marginTop: 2, textAlign: 'center' },
  listSection: { gap: 6 },
  listTitle: { fontSize: 12, fontWeight: '600', color: colors.text.secondary, marginBottom: 4 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeLabel: { flex: 1, fontSize: 13, color: colors.text.primary },
  typeCount: { fontSize: 12, fontWeight: '600', color: colors.text.secondary },
  source: { fontSize: 10, color: colors.text.secondary, marginTop: spacing.sm, fontStyle: 'italic' },
})
