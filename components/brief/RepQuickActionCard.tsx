import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native'
import { RepAction } from '@/types/brief'
import { colors, spacing, radius } from '@/constants/theme'
import { lightTap, mediumTap } from '@/utils/haptics'

interface Props {
  reps: RepAction[]
}

export function RepQuickActionCard({ reps }: Props) {
  function handleCall(phone: string) {
    mediumTap()
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`)
  }

  function handleEmail(email: string) {
    lightTap()
    const subject = encodeURIComponent('Constituent inquiry — Tarzana resident')
    Linking.openURL(`mailto:${email}?subject=${subject}`)
  }

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>YOUR REPS · QUICK ACTIONS</Text>
      </View>
      <Text style={styles.title}>Contact your representatives today</Text>
      {reps.map((rep, i) => (
        <View key={i} style={styles.repRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {rep.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View style={styles.repInfo}>
            <Text style={styles.repName}>{rep.name}</Text>
            <Text style={styles.repRole}>{rep.role}</Text>
            <Text style={styles.repIssue} numberOfLines={1}>{rep.issue}</Text>
          </View>
          <View style={styles.repActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleCall(rep.phone)} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={() => handleEmail(rep.email)} activeOpacity={0.7}>
              <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  repRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: colors.text.accent },
  repInfo: { flex: 1 },
  repName: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  repRole: { fontSize: 12, color: colors.text.secondary, marginTop: 1 },
  repIssue: { fontSize: 11, color: colors.text.secondary, marginTop: 2, fontStyle: 'italic' },
  repActions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    backgroundColor: colors.text.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.text.accent,
  },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  actionBtnTextSecondary: { color: colors.text.accent },
})
