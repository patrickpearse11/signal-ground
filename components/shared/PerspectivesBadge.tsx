import { View, Text, StyleSheet } from 'react-native'
import { colors } from '@/constants/theme'

interface Props {
  perspectives: 'balanced' | 'consensus' | 'divergent'
}

const CONFIG = {
  balanced: { label: 'Balanced', color: colors.perspectives.balanced },
  consensus: { label: 'Consensus', color: colors.perspectives.consensus },
  divergent: { label: 'Divergent', color: colors.perspectives.divergent },
}

export function PerspectivesBadge({ perspectives }: Props) {
  const { label, color } = CONFIG[perspectives]

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
