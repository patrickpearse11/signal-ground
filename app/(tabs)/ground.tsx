import { useEffect, useCallback, useState } from 'react'
import {
  View, Text, ScrollView, RefreshControl,
  StyleSheet, TouchableOpacity, Linking
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CouncilMeetingCard } from '@/components/ground/CouncilMeetingCard'
import { EventCard } from '@/components/ground/EventCard'
import { EventFilterPills } from '@/components/ground/EventFilterPills'
import { ServiceRequests311Card } from '@/components/ground/ServiceRequests311Card'
import { PermitActivityCard } from '@/components/ground/PermitActivityCard'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { useGroundStore } from '@/store/groundStore'
import { useUserStore } from '@/store/userStore'
import { fetchCouncilMeetings, fetchCivicEvents } from '@/services/civicService'
import { fetchNeighborhoodPulse, NeighborhoodPulse } from '@/services/socrataService'
import { colors, spacing, radius } from '@/constants/theme'
import { CivicEvent } from '@/types/ground'

type EventFilter = 'all' | CivicEvent['event_type']

export default function GroundScreen() {
  const { meetings, events, isLoading, error,
    setMeetings, setEvents, setIsLoading, setError } = useGroundStore()
  const { zip } = useUserStore()
  const [eventFilter, setEventFilter] = useState<EventFilter>('all')
  const [pulse, setPulse] = useState<NeighborhoodPulse | null>(null)

  const loadGround = useCallback(async (_refresh = false) => {
    setIsLoading(true)
    setError(null)
    try {
      const [fetchedMeetings, fetchedEvents, neighborhoodPulse] = await Promise.all([
        fetchCouncilMeetings(zip),
        fetchCivicEvents(zip),
        fetchNeighborhoodPulse(zip),
      ])
      setMeetings(fetchedMeetings)
      setEvents(fetchedEvents)
      setPulse(neighborhoodPulse)
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

  if (isLoading && meetings.length === 0 && events.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ground</Text>
          <Text style={styles.headerSub}>Civic calendar · City data · Zip {zip}</Text>
        </View>
        {[1, 2, 3].map((i) => <SkeletonCard key={i} variant="rep" />)}
      </SafeAreaView>
    )
  }

  if (error && meetings.length === 0 && events.length === 0) {
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
          <Text style={styles.headerSub}>Civic calendar · City data · Zip {zip}</Text>
        </View>

        {/* SECTION 1: NEIGHBORHOOD COUNCIL */}
        <SectionHeader
          title="Neighborhood Council"
          subtitle="Tarzana NC · Upcoming meetings"
        />

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

        {/* SECTION 2: COMMUNITY EVENTS */}
        <SectionHeader
          title="Community Events"
          subtitle="Upcoming civic opportunities in Tarzana/LA"
        />

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

        <View style={styles.divider} />

        {/* SECTION 3: NEIGHBORHOOD PULSE */}
        <SectionHeader
          title="Neighborhood Pulse"
          subtitle={`Real city data · Zip ${zip}`}
        />

        <View style={styles.sectionContent}>
          {pulse?.requests311 && <ServiceRequests311Card data={pulse.requests311} />}
          <View style={styles.crimeUnavailable}>
            <View style={styles.crimeUnavailableHeader}>
              <Text style={styles.crimeUnavailableTitle}>Crime data unavailable</Text>
            </View>
            <Text style={styles.crimeUnavailableText}>
              LAPD suspended public crime data updates in early 2025 while transitioning to a new reporting system. No timeline has been given for restoration. The data on DataLA has not been updated since December 2024.
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://laist.com/news/lapd-records-data-refusal')}
              activeOpacity={0.7}
            >
              <Text style={styles.crimeUnavailableLink}>Read the full story → LAist</Text>
            </TouchableOpacity>
          </View>
          {pulse?.permits && <PermitActivityCard data={pulse.permits} />}
          {!pulse && (
            <Text style={styles.emptyText}>Loading neighborhood data...</Text>
          )}
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
  sectionContent: { paddingHorizontal: spacing.md },
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
  crimeUnavailable: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  crimeUnavailableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  crimeUnavailableTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  crimeUnavailableText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  crimeUnavailableLink: {
    fontSize: 13,
    color: colors.text.accent,
    fontWeight: '600',
  },
})
