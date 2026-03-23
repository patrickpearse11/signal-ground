import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { colors, spacing } from '@/constants/theme'

export type FeedFilter = 'all' | 'trade' | 'conflicts' | 'energy'

interface Props {
  value: FeedFilter
  onChange: (value: FeedFilter) => void
  tradeCount?: number
}

const FILTERS: { value: FeedFilter; label: string }[] = [
  { value: 'all',       label: 'All Signals'    },
  { value: 'trade',     label: 'Trade & Economy' },
  { value: 'conflicts', label: 'Conflicts'       },
  { value: 'energy',    label: 'Energy & Fuel'   },
]

export function TradeFilterBar({ value, onChange, tradeCount }: Props) {
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
          onPress={() => onChange(f.value)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pillLabel, value === f.value && styles.pillLabelActive]}>
            {f.label}
          </Text>
          {f.value === 'trade' && tradeCount && tradeCount > 0 ? (
            <View style={[styles.badge, value === 'trade' && styles.badgeActive]}>
              <Text style={[styles.badgeText, value === 'trade' && styles.badgeTextActive]}>
                {tradeCount}
              </Text>
            </View>
          ) : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
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
  badge: {
    backgroundColor: colors.background,
    borderRadius: 99,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.text.secondary },
  badgeTextActive: { color: '#FFFFFF' },
})
