import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { RepAction } from '@/types/brief'
import { colors, spacing, radius } from '@/constants/theme'

interface Props {
  reps: RepAction[]
}

export function RepQuickActionCard({ reps }: Props) {
  const router = useRouter()
  const topRep = reps[0]
  if (!topRep) return null

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>YOUR REPS</Text>
      </View>

      <View style={styles.repRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {topRep.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.repInfo}>
          <Text style={styles.repName}>{topRep.name}</Text>
          <Text style={styles.repRole}>{topRep.role}</Text>
          <Text style={styles.repIssue} numberOfLines={2}>{topRep.issue}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.goToRepsBtn}
        onPress={() => router.push('/(tabs)/reps')}
        activeOpacity={0.85}
      >
        <Text style={styles.goToRepsBtnText}>View all your reps →</Text>
      </TouchableOpacity>
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
  labelDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.text.secondary },
  label: { fontSize: 10, fontWeight: '700', color: colors.text.secondary, letterSpacing: 1 },
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: colors.text.accent },
  repInfo: { flex: 1 },
  repName: { fontSize: 15, fontWeight: '700', color: colors.text.primary },
  repRole: { fontSize: 12, color: colors.text.secondary, marginTop: 1 },
  repIssue: { fontSize: 12, color: colors.text.secondary, marginTop: 2, fontStyle: 'italic', lineHeight: 17 },
  goToRepsBtn: {
    backgroundColor: colors.text.accent,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  goToRepsBtnText: { fontSize: 14, fontWeight: '700', color: '#000000' },
})
