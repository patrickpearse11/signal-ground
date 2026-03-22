import { View, Text, StyleSheet } from 'react-native'
import { CommunityRipple } from '@/types/impact'
import { colors, spacing, radius, fonts } from '@/constants/theme'

interface Props {
  ripple: CommunityRipple
}

export function CommunityRippleCard({ ripple }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>COMMUNITY RIPPLE</Text>
      </View>
      <Text style={styles.headline}>
        {ripple.total_actions > 0
          ? `${ripple.total_actions.toLocaleString()} civic actions taken in Tarzana ${ripple.period_label}`
          : `Be the first to take action in Tarzana ${ripple.period_label}`
        }
      </Text>

      <View style={styles.grid}>
        {[
          { value: ripple.calls_made, label: 'Rep calls' },
          { value: ripple.emails_sent, label: 'Emails sent' },
          { value: ripple.events_rsvped, label: 'Events RSVPd' },
          { value: ripple.signals_saved, label: 'Signals saved' },
        ].map((metric) => (
          <View key={metric.label} style={styles.metric}>
            <Text style={styles.metricValue}>{metric.value.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      {ripple.total_actions > 0 && (
        <View style={styles.responseRow}>
          <Text style={styles.responseText}>
            Estimated rep response rate:{' '}
            <Text style={styles.responseRate}>{ripple.response_rate}%</Text>
          </Text>
        </View>
      )}
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
    gap: 6,
    marginBottom: spacing.sm,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.accent,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  headline: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: spacing.md,
    fontFamily: fonts.editorial,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metric: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  responseRow: {
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  responseText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  responseRate: {
    fontWeight: '700',
    color: colors.text.accent,
  },
})
