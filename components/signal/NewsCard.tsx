import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { SignalCard } from '@/types/signal'
import { EscalationBadge } from '@/components/shared/EscalationBadge'
import { PerspectivesBadge } from '@/components/shared/PerspectivesBadge'
import { colors, spacing, radius } from '@/constants/theme'
import { supabase } from '@/services/supabaseClient'
import { useUserStore } from '@/store/userStore'

interface Props {
  signal: SignalCard
  onSaveToImpact?: (signal: SignalCard) => void
}

export function NewsCard({ signal, onSaveToImpact }: Props) {
  const { userId } = useUserStore()

  async function handleSaveToImpact() {
    if (!userId || !signal.id) return
    try {
      await supabase.from('impact_actions').insert({
        user_id: userId,
        action_type: 'saved_signal',
        description: signal.neutral_title,
      })
      onSaveToImpact?.(signal)
    } catch (err) {
      console.warn('Save to impact failed:', err)
    }
  }

  return (
    <View style={styles.card}>

      {/* Header row — escalation + perspectives */}
      <View style={styles.headerRow}>
        <EscalationBadge level={signal.escalation_level} />
        <PerspectivesBadge perspectives={signal.perspectives} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{signal.neutral_title}</Text>

      {/* Summary */}
      <Text style={styles.summary}>{signal.summary_paragraph}</Text>

      {/* Local impact */}
      <View style={styles.impactRow}>
        <View style={styles.impactDot} />
        <Text style={styles.impactText}>
          {signal.local_impact || 'Monitoring for local impact in Tarzana/LA area'}
        </Text>
      </View>

      {/* Tags */}
      {signal.tags?.length > 0 && (
        <View style={styles.tagsRow}>
          {signal.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={handleSaveToImpact} style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>+ Save to Impact</Text>
        </TouchableOpacity>
        <Text style={styles.timestamp}>
          {signal.created_at
            ? new Date(signal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: spacing.sm,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  summary: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  impactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.accent,
    marginTop: 4,
    flexShrink: 0,
  },
  impactText: {
    fontSize: 13,
    color: colors.text.accent,
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.background,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionBtn: {
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: 13,
    color: colors.text.accent,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: colors.text.secondary,
  },
})
