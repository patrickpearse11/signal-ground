import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { CivicEvent } from '@/types/ground'
import { supabase } from '@/services/supabaseClient'
import { useUserStore } from '@/store/userStore'
import { colors, spacing, radius } from '@/constants/theme'
import { successTap } from '@/utils/haptics'

interface Props {
  event: CivicEvent
  onRSVP?: (event: CivicEvent) => void
}

const EVENT_TYPE_CONFIG = {
  meeting: { label: 'Meeting', color: '#1A2744', bg: '#E8ECF4' },
  town_hall: { label: 'Town Hall', color: '#1B7F4A', bg: '#D6F0E3' },
  volunteer: { label: 'Volunteer', color: '#B45309', bg: '#FEF3C7' },
  vote: { label: 'Vote', color: '#B91C1C', bg: '#FEE2E2' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

export function EventCard({ event, onRSVP }: Props) {
  const { userId } = useUserStore()
  const config = EVENT_TYPE_CONFIG[event.event_type]

  async function handleRSVP() {
    if (!userId) return
    successTap()
    try {
      await supabase.from('impact_actions').insert({
        user_id: userId,
        action_type: 'event_rsvp',
        description: event.title,
      })
      onRSVP?.(event)
    } catch (err) {
      console.warn('RSVP failed:', err)
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={styles.date}>{formatDate(event.date)}</Text>
      </View>

      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{event.description}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{event.time}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.meta} numberOfLines={1}>{event.location}</Text>
      </View>

      <TouchableOpacity style={styles.rsvpBtn} onPress={handleRSVP} activeOpacity={0.8}>
        <Text style={styles.rsvpBtnText}>+ I'll be there</Text>
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
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  metaDot: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  rsvpBtn: {
    borderWidth: 1,
    borderColor: colors.text.accent,
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rsvpBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.accent,
  },
})
