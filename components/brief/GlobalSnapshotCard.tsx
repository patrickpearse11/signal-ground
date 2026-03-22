import { View, Text, StyleSheet } from 'react-native'
import { GlobalSnapshot } from '@/types/brief'
import { colors, spacing, radius, fonts } from '@/constants/theme'

interface Props {
  data: GlobalSnapshot
}

export function GlobalSnapshotCard({ data }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>GLOBAL SNAPSHOT</Text>
      </View>
      <Text style={styles.title}>What's happening in the world today</Text>
      <View style={styles.bullets}>
        {data.bullets.map((bullet, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletNumber}>{i + 1}</Text>
            <Text style={styles.bulletText}>{bullet}</Text>
          </View>
        ))}
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: fonts.editorial,
  },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  bulletNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.accent,
    width: 16,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 21,
    flex: 1,
  },
})
