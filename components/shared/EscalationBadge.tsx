import { View, Text, StyleSheet } from 'react-native'
import { colors, fonts } from '@/constants/theme'

interface Props {
  level: 1 | 2 | 3 | 4 | 5
}

const LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Mild',
  3: 'Watch',
  4: 'Elevated',
  5: 'Critical',
}

export function EscalationBadge({ level }: Props) {
  const color = colors.escalation[level]

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i <= level ? color : colors.border }]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color }]}>{LABELS[level]}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    gap: 2,
  },
  bar: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 9,
    fontFamily: fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
})
