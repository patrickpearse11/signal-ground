import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { PersonalizedClose } from '@/types/brief'
import { colors, spacing, radius, fonts } from '@/constants/theme'
import { lightTap } from '@/utils/haptics'

interface Props {
  data: PersonalizedClose
}

export function PersonalizedCloseCard({ data }: Props) {
  const router = useRouter()

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>YOUR MOVE TODAY</Text>
      </View>
      <Text style={styles.action}>{data.action}</Text>
      {data.deadline ? (
        <View style={styles.deadlineRow}>
          <Text style={styles.deadlineIcon}>⏱</Text>
          <Text style={styles.deadlineText}>{data.deadline}</Text>
        </View>
      ) : null}
      <View style={styles.ctaRow}>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => { lightTap(); router.push('/(tabs)/ground') }} activeOpacity={0.85}>
          <Text style={styles.ctaBtnText}>{data.cta_ground}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctaBtn, styles.ctaBtnSecondary]} onPress={() => { lightTap(); router.push('/(tabs)/impact') }} activeOpacity={0.85}>
          <Text style={[styles.ctaBtnText, styles.ctaBtnTextSecondary]}>{data.cta_impact}</Text>
        </TouchableOpacity>
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
    backgroundColor: colors.text.accent,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.accent,
    letterSpacing: 1,
  },
  action: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: spacing.sm,
    fontFamily: fonts.editorial,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  deadlineIcon: {
    fontSize: 12,
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.accent,
  },
  ctaRow: { flexDirection: 'row', gap: spacing.sm },
  ctaBtn: {
    flex: 1,
    backgroundColor: colors.text.accent,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaBtnSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.text.accent,
  },
  ctaBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  ctaBtnTextSecondary: { color: colors.text.accent },
})
