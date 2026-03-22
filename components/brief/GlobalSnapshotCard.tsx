import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { GlobalSnapshot } from '@/types/brief'
import { colors, spacing, radius, fonts } from '@/constants/theme'
import { lightTap } from '@/utils/haptics'

interface Props {
  data: GlobalSnapshot
}

export function GlobalSnapshotCard({ data }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<string | null>(null)

  async function fetchDeepDive() {
    if (report) {
      lightTap()
      setExpanded(e => !e)
      return
    }
    lightTap()
    setLoading(true)
    try {
      const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-deep-dive`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ bullets: data.bullets }),
      })
      const json = await res.json()
      setReport(json.report || 'Unable to load deep dive.')
      setExpanded(true)
    } catch {
      setReport('Unable to load deep dive right now.')
      setExpanded(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>GLOBAL SNAPSHOT</Text>
      </View>
      <Text style={styles.title}>What's happening in the world today</Text>
      <View style={styles.bullets}>
        {data.bullets.map((bullet, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletNumber}>{i + 1}</Text>
            <Text style={styles.bulletText}>{bullet}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.deepDiveBtn} onPress={fetchDeepDive} activeOpacity={0.8} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.text.accent} />
        ) : (
          <Text style={styles.deepDiveBtnText}>{expanded ? 'Hide Deep Dive' : 'Deep Dive →'}</Text>
        )}
      </TouchableOpacity>

      {expanded && report ? (
        <View style={styles.reportContainer}>
          <Text style={styles.reportText}>{report}</Text>
        </View>
      ) : null}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text.secondary,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontFamily: fonts.editorial,
  },
  bullets: {
    gap: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  bulletNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.accent,
    width: 16,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 21,
    flex: 1,
  },
  deepDiveBtn: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.text.accent,
    minWidth: 44,
    alignItems: 'center',
  },
  deepDiveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.accent,
    letterSpacing: 0.5,
  },
  reportContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  reportText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
  },
})
