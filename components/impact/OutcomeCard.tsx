import { View, Text, StyleSheet } from 'react-native'
import { Outcome } from '@/types/impact'
import { colors, spacing, radius, fonts } from '@/constants/theme'

interface Props {
  outcome: Outcome
  userActed?: boolean
}

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  statement: { label: 'Statement issued',  color: '#2DD4A8', bg: 'rgba(45,212,168,0.15)'  },
  vote:      { label: 'Vote recorded',     color: '#7B8CDE', bg: 'rgba(123,140,222,0.15)' },
  response:  { label: 'Response received', color: '#5DA4CF', bg: 'rgba(93,164,207,0.15)'  },
  meeting:   { label: 'Meeting held',      color: '#E8A838', bg: 'rgba(232,168,56,0.15)'  },
}

export function OutcomeCard({ outcome, userActed = false }: Props) {
  const config = ACTION_CONFIG[outcome.action_type || ''] ?? {
    label: 'Update',
    color: colors.text.secondary,
    bg: 'rgba(138,141,155,0.15)',
  }

  const date = outcome.outcome_date
    ? new Date(outcome.outcome_date + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : ''

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>

      <Text style={styles.repName}>{outcome.rep_name}</Text>
      {outcome.rep_role ? (
        <Text style={styles.repRole}>{outcome.rep_role}</Text>
      ) : null}

      <Text style={styles.outcomeText}>{outcome.outcome_text}</Text>

      {(outcome.before_value || outcome.after_value) ? (
        <View style={styles.dataRow}>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>Before</Text>
            <Text style={styles.dataBefore}>{outcome.before_value}</Text>
          </View>
          <Text style={styles.dataArrow}>→</Text>
          <View style={styles.dataItem}>
            <Text style={styles.dataLabel}>After</Text>
            <Text style={[styles.dataAfter, {
              color: (outcome.change_pct || 0) < 0 ? '#1B7F4A' : '#B91C1C',
            }]}>{outcome.after_value}</Text>
          </View>
          {outcome.change_pct !== undefined && outcome.change_pct !== 0 ? (
            <View style={[styles.changeBadge, {
              backgroundColor: (outcome.change_pct || 0) < 0 ? '#D6F0E3' : '#FEE2E2',
            }]}>
              <Text style={[styles.changeText, {
                color: (outcome.change_pct || 0) < 0 ? '#1B7F4A' : '#B91C1C',
              }]}>
                {(outcome.change_pct || 0) > 0 ? '+' : ''}{outcome.change_pct}%
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {outcome.verified ? (
        <View style={styles.verifiedRow}>
          <Text style={styles.verifiedText}>Verified via DataLA</Text>
        </View>
      ) : null}

      {outcome.related_issue ? (
        <Text style={styles.relatedIssue}>Re: {outcome.related_issue}</Text>
      ) : null}

      <View style={styles.footer}>
        {outcome.resident_actions ? (
          <Text style={styles.footerText}>
            {outcome.resident_actions} residents took action on this issue
          </Text>
        ) : (
          <Text style={styles.footerText}>Community action tracked</Text>
        )}
        {userActed ? (
          <View style={styles.youActedBadge}>
            <Text style={styles.youActedText}>✓ You acted</Text>
          </View>
        ) : null}
      </View>
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
    borderLeftWidth: 3,
    borderLeftColor: '#2DD4A8',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  repName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
    fontFamily: fonts.editorial,
  },
  repRole: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  outcomeText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  relatedIssue: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  youActedBadge: {
    backgroundColor: 'rgba(45,212,168,0.15)',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: spacing.sm,
  },
  youActedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2DD4A8',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  dataItem: { flex: 1 },
  dataLabel: { fontSize: 10, color: colors.text.secondary, marginBottom: 2, fontWeight: '600' },
  dataBefore: { fontSize: 14, fontWeight: '600', color: colors.text.secondary },
  dataAfter: { fontSize: 14, fontWeight: '700' },
  dataArrow: { fontSize: 16, color: colors.text.secondary },
  changeBadge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  changeText: { fontSize: 12, fontWeight: '700' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: spacing.xs },
  verifiedText: { fontSize: 11, color: '#1B7F4A', fontWeight: '600' },
})
