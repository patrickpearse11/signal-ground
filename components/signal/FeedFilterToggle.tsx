import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, radius } from '@/constants/theme'

interface Props {
  value: 'all' | 'chokepoints'
  onChange: (value: 'all' | 'chokepoints') => void
}

export function FeedFilterToggle({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {(['all', 'chokepoints'] as const).map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.option, value === option && styles.optionActive]}
          onPress={() => onChange(option)}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionText, value === option && styles.optionTextActive]}>
            {option === 'all' ? 'All Signals' : '🚢 Chokepoints'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 3,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  option: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  optionText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.text.primary,
    fontWeight: '700',
  },
})
