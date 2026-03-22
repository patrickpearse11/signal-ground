import { View, Text, StyleSheet } from 'react-native'
import { Outcome } from '@/types/impact'
import { colors, spacing, radius, fonts } from '@/constants/theme'

interface Props {
  outcome: Outcome
}

const STATUS_CONFIG = {
  won:     { label: 'WON',     color: '#1B7F4A', bg: '#D6F0E3' },
  lost:    { label: 'LOST',    color: '#B91C1C', bg: '#FEE2E2' },
  partial: { label: 'PARTIAL', color: '#B45309', bg: '#FEF3C7' },
  pending: { label: 'PENDING', color: '#6B7280', bg: '#F3F4F6' },
}

export function OutcomeCard({ outcome }: Props) {
  const config = STATUS_CONFIG[outcome.status]
  const formattedDate = new Date(outcome.date + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      <Text style={styles.repName}>{outcome.rep_name}</Text>
      {outcome.signal_title ? (
        <Text style={styles.signalTitle}>Re: {outcome.signal_title}</Text>
      ) : null}

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Action taken: </Text>
        <Text style={styles.rowValue}>{outcome.action_taken}</Text>
      </View>
      <View style={styles.resultRow}>
        <Text style={styles.rowLabel}>Result: </Text>
        <Text style={styles.resultValue}>{outcome.result}</Text>
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
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  repName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
    fontFamily: fonts.editorial,
  },
  signalTitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  rowValue: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  resultValue: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
})
