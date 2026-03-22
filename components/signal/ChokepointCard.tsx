import { View, Text, StyleSheet } from 'react-native'
import { ChokepointCard as ChokepointCardType } from '@/types/signal'
import { colors, spacing, radius } from '@/constants/theme'

interface Props {
  chokepoint: ChokepointCardType
}

const STATUS_CONFIG = {
  clear:     { label: 'Clear',     color: '#2DD4A8', bg: 'rgba(45,212,168,0.15)'  },
  watch:     { label: 'Watch',     color: '#E8A838', bg: 'rgba(232,168,56,0.15)'  },
  disrupted: { label: 'Disrupted', color: '#E84C4C', bg: 'rgba(232,76,76,0.15)'  },
  critical:  { label: 'Critical',  color: '#E84C4C', bg: 'rgba(232,76,76,0.2)'   },
}

const IMPACT_ICONS: Record<string, string> = {
  prices:  '🛒',
  fuel:    '⛽',
  jobs:    '🏗️',
  imports: '📦',
}

export function ChokepointCard({ chokepoint }: Props) {
  const status = STATUS_CONFIG[chokepoint.status] ?? STATUS_CONFIG.watch

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.routeLabel}>
          <Text style={styles.routeIcon}>🚢</Text>
          <Text style={styles.routeName}>{chokepoint.route_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.onelineRow}>
        <Text style={styles.impactIcon}>
          {IMPACT_ICONS[chokepoint.impact_category] ?? '📊'}
        </Text>
        <Text style={styles.oneliner}>{chokepoint.grok_oneliner}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerLabel}>TRADE ROUTE MONITOR</Text>
        <Text style={styles.timestamp}>
          {chokepoint.updated_at
            ? new Date(chokepoint.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
            : ''}
        </Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  routeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  routeIcon: { fontSize: 16 },
  routeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  onelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  impactIcon: { fontSize: 14, marginTop: 1 },
  oneliner: {
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.secondary,
    letterSpacing: 0.8,
  },
  timestamp: { fontSize: 11, color: colors.text.secondary },
})
