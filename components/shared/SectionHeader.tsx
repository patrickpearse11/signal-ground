import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing } from '@/constants/theme'

interface Props {
  title: string
  subtitle?: string
}

export function SectionHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.accent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accent: {
    width: 3,
    height: 22,
    backgroundColor: colors.text.accent,
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    paddingLeft: 13,
  },
})
