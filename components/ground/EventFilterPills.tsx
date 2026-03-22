import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { colors, spacing } from '@/constants/theme'
import { CivicEvent } from '@/types/ground'
import { lightTap } from '@/utils/haptics'

type FilterType = 'all' | CivicEvent['event_type']

interface Props {
  value: FilterType
  onChange: (value: FilterType) => void
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'town_hall', label: 'Town Halls' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'vote', label: 'Vote' },
]

export function EventFilterPills({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f.value}
          style={[styles.pill, value === f.value && styles.pillActive]}
          onPress={() => { lightTap(); onChange(f.value) }}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillLabel, value === f.value && styles.pillLabelActive]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.text.accent,
    borderColor: colors.text.accent,
  },
  pillLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  pillLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
})
