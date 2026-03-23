import { View, Text, StyleSheet } from 'react-native'
import { TradeCard as TradeCardType } from '@/types/signal'
import { colors, spacing, radius } from '@/constants/theme'

interface Props { card: TradeCardType }

const SEVERITY_CONFIG = {
  clear:     { label: 'Clear',     color: '#2DD4A8', bg: 'rgba(45,212,168,0.15)',  dot: '#2DD4A8' },
  watch:     { label: 'Watch',     color: '#E8A838', bg: 'rgba(232,168,56,0.15)',  dot: '#E8A838' },
  disrupted: { label: 'Disrupted', color: '#E84C4C', bg: 'rgba(232,76,76,0.15)',   dot: '#E84C4C' },
  critical:  { label: 'Critical',  color: '#E84C4C', bg: 'rgba(232,76,76,0.2)',    dot: '#E84C4C' },
}

const CATEGORY_CONFIG = {
  maritime:     { label: 'Maritime',     accent: '#2DD4A8' },
  tariffs:      { label: 'Tariffs',      accent: '#E8A838' },
  commodities:  { label: 'Commodities',  accent: '#7B8CDE' },
  supply_chain: { label: 'Supply Chain', accent: '#B87FDB' },
  monetary:     { label: 'Monetary',     accent: '#5DA4CF' },
}

export function TradeCard({ card }: Props) {
  const severity = SEVERITY_CONFIG[card.severity] ?? SEVERITY_CONFIG.watch
  const category = CATEGORY_CONFIG[card.category] ?? CATEGORY_CONFIG.maritime

  return (
    <View style={[styles.card, { borderLeftColor: category.accent }]}>
      <View style={styles.headerRow}>
        <View style={styles.categoryLabel}>
          <Text style={[styles.categoryText, { color: category.accent }]}>
            {category.label.toUpperCase()}
          </Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: severity.bg }]}>
          <View style={[styles.severityDot, { backgroundColor: severity.dot }]} />
          <Text style={[styles.severityText, { color: severity.color }]}>{severity.label}</Text>
        </View>
      </View>

      <Text style={styles.title}>{card.title}</Text>

      {card.summary ? (
        <Text style={styles.summary}>{card.summary}</Text>
      ) : null}

      <View style={styles.impactRow}>
        <Text style={styles.impactLabel}>LOCAL IMPACT</Text>
        <Text style={styles.impactText}>{card.tarzana_impact}</Text>
      </View>

      {card.impact_detail ? (
        <Text style={styles.impactDetail}>{card.impact_detail}</Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerLabel}>TRADE & ECONOMIC MONITOR</Text>
        <Text style={styles.timestamp}>
          {card.updated_at
            ? new Date(card.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  summary: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  impactRow: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  impactLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.accent,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  impactText: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '600',
    lineHeight: 20,
  },
  impactDetail: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.8,
  },
  timestamp: {
    fontSize: 11,
    color: colors.text.secondary,
  },
})
