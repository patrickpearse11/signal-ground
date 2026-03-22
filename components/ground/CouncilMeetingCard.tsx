import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native'
import { CouncilMeeting } from '@/types/ground'
import { colors, spacing, radius } from '@/constants/theme'

interface Props {
  meeting: CouncilMeeting
}

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const meeting = new Date(dateStr + 'T12:00:00')
  return Math.ceil((meeting.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function CouncilMeetingCard({ meeting }: Props) {
  const daysUntil = getDaysUntil(meeting.date)
  const isUpcoming = daysUntil >= 0
  const isSoon = daysUntil <= 7 && daysUntil >= 0
  const dateObj = new Date(meeting.date + 'T12:00:00')

  return (
    <View style={[styles.card, !isUpcoming && styles.cardPast]}>
      <View style={styles.dateColumn}>
        <Text style={styles.dateDay}>
          {dateObj.toLocaleDateString('en-US', { day: 'numeric' })}
        </Text>
        <Text style={styles.dateMonth}>
          {dateObj.toLocaleDateString('en-US', { month: 'short' })}
        </Text>
        {isSoon && (
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>Soon</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{meeting.title}</Text>
        <Text style={styles.detail}>{meeting.time}</Text>
        <Text style={styles.detail} numberOfLines={1}>{meeting.location}</Text>
        {meeting.agenda_url && (
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={() => Linking.openURL(meeting.agenda_url!)} activeOpacity={0.7}>
              <Text style={styles.agendaLink}>View agenda →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardPast: {
    opacity: 0.5,
  },
  dateColumn: {
    alignItems: 'center',
    minWidth: 40,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.accent,
    lineHeight: 28,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  soonBadge: {
    backgroundColor: 'rgba(232,168,56,0.15)',
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  soonText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#E8A838',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: 6,
  },
  detail: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 3,
  },
  actionsRow: {
    marginTop: 6,
  },
  agendaLink: {
    fontSize: 12,
    color: colors.text.accent,
    fontWeight: '600',
  },
})
