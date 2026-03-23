import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native'
import { ServiceRequest311 } from '@/services/socrataService'
import { colors, spacing, radius } from '@/constants/theme'

interface Props { data: ServiceRequest311 }

export function ServiceRequests311Card({ data }: Props) {
  const responseColor = data.avg_response_days <= 5 ? '#1B7F4A'
    : data.avg_response_days <= 14 ? '#B45309' : '#B91C1C'

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>311 SERVICE REQUESTS</Text>
        <Text style={styles.period}>{data.period}</Text>
      </View>

      <View style={styles.statsRow}>
        {[
          { value: data.total_requests, label: 'Total filed', color: undefined },
          { value: data.open_requests, label: 'Still open', color: undefined },
          { value: `${data.avg_response_days}d`, label: 'Avg response', color: responseColor },
        ].map((s, i) => (
          <View key={i} style={styles.stat}>
            <Text style={[styles.statNumber, s.color ? { color: s.color } : {}]}>
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
            </Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Top issues reported</Text>
        {data.top_issues.slice(0, 4).map((issue, i) => (
          <View key={i} style={styles.issueRow}>
            <Text style={styles.issueRank}>{i + 1}</Text>
            <Text style={styles.issueType} numberOfLines={1}>{issue.type}</Text>
            <Text style={styles.issueCount}>{issue.count}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.reportBtn}
        onPress={() => Linking.openURL('https://myla311.lacity.org')}
        activeOpacity={0.7}
      >
        <Text style={styles.reportBtnText}>Report an issue via MyLA311 →</Text>
      </TouchableOpacity>

      <Text style={styles.source}>Source: LA 311 via DataLA · Zip {data.zip}</Text>
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
  statNumber: { fontSize: 24, fontWeight: '700', color: colors.text.primary },
  statLabel: { fontSize: 11, color: colors.text.secondary, marginTop: 2, textAlign: 'center' },
  listSection: { gap: 6, marginBottom: spacing.sm },
  listTitle: { fontSize: 12, fontWeight: '600', color: colors.text.secondary, marginBottom: 4 },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  issueRank: { fontSize: 12, fontWeight: '700', color: colors.text.accent, width: 16 },
  issueType: { flex: 1, fontSize: 13, color: colors.text.primary },
  issueCount: { fontSize: 12, fontWeight: '600', color: colors.text.secondary },
  reportBtn: { paddingTop: spacing.sm, alignItems: 'flex-end' },
  reportBtnText: { fontSize: 13, color: colors.text.accent, fontWeight: '600' },
  source: { fontSize: 10, color: colors.text.secondary, marginTop: spacing.xs, fontStyle: 'italic' },
})
