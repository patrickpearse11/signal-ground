import { View, Text, StyleSheet } from 'react-native'
import { ImpactScore } from '@/types/impact'
import { colors, spacing, radius } from '@/constants/theme'

interface Props {
  score: ImpactScore
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#2DD4A8'
  if (score >= 50) return '#E8A838'
  if (score >= 25) return '#E84C4C'
  return colors.text.secondary
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Civic Leader'
  if (score >= 50) return 'Active'
  if (score >= 25) return 'Engaged'
  if (score > 0) return 'Getting Started'
  return 'Not Yet Started'
}

export function ScoreMeter({ score: scoreData }: Props) {
  const color = getScoreColor(scoreData.score)
  const label = getScoreLabel(scoreData.score)

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>YOUR IMPACT SCORE</Text>
      </View>

      <View style={styles.scoreRow}>
        <Text style={[styles.scoreNumber, { color }]}>{scoreData.score}</Text>
        <View style={styles.scoreMeta}>
          <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
          <Text style={styles.scorePeriod}>This week</Text>
        </View>
      </View>

      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${scoreData.score}%` as any, backgroundColor: color }
          ]}
        />
      </View>

      <View style={styles.breakdown}>
        {[
          { label: 'Calls', value: scoreData.calls, pts: scoreData.calls * 10 },
          { label: 'Emails', value: scoreData.emails, pts: scoreData.emails * 8 },
          { label: 'Events', value: scoreData.events, pts: scoreData.events * 15 },
          { label: 'Saved', value: scoreData.saved_signals, pts: scoreData.saved_signals * 5 },
        ].map((item) => (
          <View key={item.label} style={styles.breakdownItem}>
            <Text style={styles.breakdownValue}>{item.value}</Text>
            <Text style={styles.breakdownLabel}>{item.label}</Text>
            <Text style={styles.breakdownPts}>+{item.pts}pts</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{scoreData.weekly_summary}</Text>
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
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 60,
  },
  scoreMeta: {
    gap: 4,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  scorePeriod: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  breakdownLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  breakdownPts: {
    fontSize: 10,
    color: colors.text.accent,
    fontWeight: '600',
    marginTop: 1,
  },
  summaryBox: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  summaryText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
})
