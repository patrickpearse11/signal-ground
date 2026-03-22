import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native'
import { Rep } from '@/types/ground'
import { colors, spacing, radius } from '@/constants/theme'
import { lightTap, mediumTap } from '@/utils/haptics'

interface Props {
  rep: Rep
}

const LEVEL_CONFIG = {
  local: { label: 'LOCAL', color: '#1B7F4A', bg: '#D6F0E3' },
  state: { label: 'STATE', color: '#1A2744', bg: '#E8ECF4' },
  federal: { label: 'FEDERAL', color: '#B45309', bg: '#FEF3C7' },
}

export function RepCard({ rep }: Props) {
  const levelConfig = LEVEL_CONFIG[rep.level]

  function handleCall() {
    mediumTap()
    const cleaned = rep.phone.replace(/\D/g, '')
    if (!cleaned) return
    Linking.openURL(`tel:${cleaned}`)
  }

  function handleEmail() {
    lightTap()
    if (!rep.email) return
    if (rep.email.startsWith('http')) {
      Linking.openURL(rep.email)
      return
    }
    const subject = encodeURIComponent('Constituent inquiry — Tarzana resident')
    Linking.openURL(`mailto:${rep.email}?subject=${subject}`)
  }

  const initials = rep.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{rep.name}</Text>
            <View style={[styles.levelBadge, { backgroundColor: levelConfig.bg }]}>
              <Text style={[styles.levelText, { color: levelConfig.color }]}>
                {levelConfig.label}
              </Text>
            </View>
          </View>
          <Text style={styles.role}>{rep.role}</Text>
          <Text style={styles.district}>{rep.district}</Text>
        </View>

      </View>

      {rep.current_issue ? (
        <View style={styles.issueRow}>
          <Text style={styles.issueLabel}>Current focus: </Text>
          <Text style={styles.issueText}>{rep.current_issue}</Text>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.btn, !rep.phone && styles.btnDisabled]}
          onPress={handleCall}
          disabled={!rep.phone}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary, !rep.email && styles.btnDisabled]}
          onPress={handleEmail}
          disabled={!rep.email}
          activeOpacity={0.8}
        >
          <Text style={[styles.btnText, styles.btnTextSecondary]}>Email</Text>
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
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.accent,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  levelBadge: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  role: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  district: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 1,
  },
  issueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  issueLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  issueText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    backgroundColor: colors.text.accent,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.text.accent,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnTextSecondary: {
    color: colors.text.accent,
  },
})
