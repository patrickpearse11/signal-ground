import { View, Text, StyleSheet } from 'react-native'
import { HomeImpact } from '@/types/brief'
import { colors, spacing, radius, fonts } from '@/constants/theme'

interface Props {
  data: HomeImpact
}

export function HomeImpactCard({ data }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>HOW IT AFFECTS TARZANA</Text>
      </View>
      <Text style={styles.headline}>{data.headline}</Text>
      <Text style={styles.explanation}>{data.explanation}</Text>
      <View style={styles.zipRow}>
        <Text style={styles.zipText}>Zip {data.zip} · Los Angeles</Text>
      </View>
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
    borderLeftWidth: 3,
    borderLeftColor: colors.text.accent,
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
    color: colors.text.accent,
    letterSpacing: 1,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 26,
    marginBottom: spacing.sm,
    fontFamily: fonts.editorial,
  },
  explanation: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  zipRow: {
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  zipText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
})
