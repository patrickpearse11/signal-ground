import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { ActionOpportunity } from '@/types/impact'
import { supabase } from '@/services/supabaseClient'
import { useUserStore } from '@/store/userStore'
import { colors, spacing, radius } from '@/constants/theme'

interface Props {
  opportunity: ActionOpportunity
  onRSVP: (id: string) => void
}

const ACTION_CONFIG = {
  event: { label: 'Attend', color: '#1B7F4A', bg: '#D6F0E3' },
  call: { label: 'Call Rep', color: '#1A2744', bg: '#E8ECF4' },
  email: { label: 'Email Rep', color: '#0F5E9C', bg: '#E3F0FB' },
  petition: { label: 'Sign', color: '#B45309', bg: '#FEF3C7' },
}

export function ActionCard({ opportunity, onRSVP }: Props) {
  const { userId } = useUserStore()
  const router = useRouter()
  const config = ACTION_CONFIG[opportunity.action_type]

  async function handleAction() {
    if (!userId) return
    try {
      await supabase.from('impact_actions').insert({
        user_id: userId,
        action_type: opportunity.action_type === 'event' ? 'event_rsvp' : opportunity.action_type,
        description: opportunity.title,
      })
      onRSVP(opportunity.id)
      if (opportunity.source === 'ground') {
        router.push('/(tabs)/ground')
      }
    } catch (err) {
      console.warn('Action failed:', err)
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
        </View>
        {opportunity.date && (
          <Text style={styles.date}>
            {new Date(opportunity.date + 'T12:00:00').toLocaleDateString('en-US', {
              month: 'short', day: 'numeric'
            })}
          </Text>
        )}
      </View>

      <Text style={styles.title}>{opportunity.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {opportunity.description}
      </Text>

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: config.color }]}
        onPress={handleAction}
        activeOpacity={0.8}
      >
        <Text style={styles.actionBtnText}>{config.label} →</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
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
  typeBadge: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  date: { fontSize: 12, color: colors.text.secondary, fontWeight: '600' },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  actionBtn: {
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
