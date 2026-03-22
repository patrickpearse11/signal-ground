import { useEffect, useCallback, useState } from 'react'
import {
  View, Text, ScrollView, RefreshControl,
  StyleSheet, TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RepCard } from '@/components/ground/RepCard'
import { CouncilMeetingCard } from '@/components/ground/CouncilMeetingCard'
import { EventCard } from '@/components/ground/EventCard'
import { EventFilterPills } from '@/components/ground/EventFilterPills'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useGroundStore } from '@/store/groundStore'
import { useUserStore } from '@/store/userStore'
import { useBriefStore } from '@/store/briefStore'
import { fetchRepsByZip, fetchCouncilMeetings, fetchCivicEvents } from '@/services/civicService'
import { colors, spacing } from '@/constants/theme'
import { CivicEvent } from '@/types/ground'

type EventFilter = 'all' | CivicEvent['event_type']
const LEVEL_ORDER = { local: 0, state: 1, federal: 2 }

export default function GroundScreen() {
  const { reps, meetings, events, isLoading, error,
    setReps, setMeetings, setEvents, setIsLoading, setError } = useGroundStore()
  const { zip } = useUserStore()
  const { brief } = useBriefStore()
  const [eventFilter, setEventFilter] = useState<EventFilter>('all')

  const loadGround = useCallback(async (_refresh = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const [fetchedReps, fetchedMeetings, fetchedEvents] = await Promise.all([
        fetchRepsByZip(zip),
        fetchCouncilMeetings(zip),
        fetchCivicEvents(zip),
      ])
      setReps([...fetchedReps].sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]))
      setMeetings(fetchedMeetings)
      setEvents(fetchedEvents)
    } catch (err) {
      setError('Could not load civic data. Pull down to retry.')
      console.warn('Ground load error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [zip])

  useEffect(() => { loadGround() }, [zip])

  const filteredEvents = eventFilter === 'all'
    ? events
    : events.filter(e => e.event_type === eventFilter)

  const localReps = reps.filter(r => r.level === 'local')
  const stateReps = reps.filter(r => r.level === 'state')
  const federalReps = reps.filter(r => r.level === 'federal')

  if (isLoading && reps.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ground</Text>
          <Text style={styles.headerSub}>Your civic foundation</Text>
        </View>
        {[1, 2, 3].map((i) => <SkeletonCard key={i} variant="rep" />)}
      </SafeAreaView>
    )
  }

  if (error && reps.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ground</Text>
        </View>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadGround(true)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadGround(true)}
            tintColor={colors.text.accent}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ground</Text>
          <Text style={styles.headerSub}>Zip {zip} · Tarzana, Los Angeles</Text>
        </View>

        {/* SECTION 1: REPRESENTATIVES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Representatives</Text>
          <Text style={styles.sectionSub}>Sorted by who can act fastest on local issues</Text>
        </View>

        {localReps.length > 0 && (
          <View style={styles.repGroup}>
            <Text style={styles.groupLabel}>LOCAL GOVERNMENT</Text>
            {localReps.map((rep, i) => (
              <RepCard
                key={i}
                rep={rep}
                currentAction={brief?.content_json.rep_actions.find(r => r.name === rep.name)?.issue}
              />
            ))}
          </View>
        )}
        {stateReps.length > 0 && (
          <View style={styles.repGroup}>
            <Text style={styles.groupLabel}>STATE GOVERNMENT</Text>
            {stateReps.map((rep, i) => (
              <RepCard
                key={i}
                rep={rep}
                currentAction={brief?.content_json.rep_actions.find(r => r.name === rep.name)?.issue}
              />
            ))}
          </View>
        )}
        {federalReps.length > 0 && (
          <View style={styles.repGroup}>
            <Text style={styles.groupLabel}>FEDERAL GOVERNMENT</Text>
            {federalReps.map((rep, i) => (
              <RepCard
                key={i}
                rep={rep}
                currentAction={brief?.content_json.rep_actions.find(r => r.name === rep.name)?.issue}
              />
            ))}
          </View>
        )}

        <View style={styles.divider} />

        {/* SECTION 2: NEIGHBORHOOD COUNCIL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Neighborhood Council</Text>
          <Text style={styles.sectionSub}>Tarzana NC · Upcoming meetings</Text>
        </View>

        <View style={styles.councilHow}>
          <Text style={styles.councilHowTitle}>How to participate</Text>
          <Text style={styles.councilHowText}>
            Any resident can attend, speak during public comment, or submit written comments. Meetings are free and open to all.
          </Text>
          <Text style={styles.councilHowLink}>tarzananc.org →</Text>
        </View>

        <View style={styles.sectionContent}>
          {meetings.length > 0
            ? meetings.map((m, i) => <CouncilMeetingCard key={i} meeting={m} />)
            : <Text style={styles.emptyText}>No upcoming meetings — check back soon</Text>
          }
        </View>

        <View style={styles.divider} />

        {/* SECTION 3: COMMUNITY EVENTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Events</Text>
          <Text style={styles.sectionSub}>Upcoming civic opportunities in Tarzana/LA</Text>
        </View>

        <EventFilterPills value={eventFilter} onChange={setEventFilter} />

        <View style={styles.sectionContent}>
          {filteredEvents.length > 0
            ? filteredEvents.map((e, i) => (
                <EventCard
                  key={i}
                  event={e}
                  onRSVP={(event) => console.log('RSVP logged:', event.title)}
                />
              ))
            : <Text style={styles.emptyText}>
                No {eventFilter === 'all' ? '' : eventFilter} events — pull down to refresh
              </Text>
          }
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  headerSub: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  sectionSub: { fontSize: 13, color: colors.text.secondary, marginTop: 4 },
  sectionContent: { paddingHorizontal: spacing.md },
  repGroup: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  groupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  councilHow: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  councilHowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  councilHowText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  councilHowLink: {
    fontSize: 13,
    color: colors.text.accent,
    fontWeight: '600',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: 80,
  },
  errorText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: colors.text.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryBtnText: { color: colors.text.accent, fontWeight: '600', fontSize: 14 },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
})
