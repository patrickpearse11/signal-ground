import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native'
import { Rep } from '@/types/ground'
import { colors, spacing, radius, fonts } from '@/constants/theme'
import { lightTap, mediumTap } from '@/utils/haptics'

interface Props {
  rep: Rep
  currentAction?: string
}

const LEVEL_CONFIG = {
  local:   { label: 'LOCAL',   color: '#2DD4A8', bg: 'rgba(45,212,168,0.15)' },
  state:   { label: 'STATE',   color: '#7B8CDE', bg: 'rgba(123,140,222,0.15)' },
  federal: { label: 'FEDERAL', color: '#E8A838', bg: 'rgba(232,168,56,0.15)' },
}

export function RepCard({ rep, currentAction }: Props) {
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

      {currentAction ? (
        <View style={styles.actionRow}>
          <Text style={styles.actionLabel}>THIS WEEK: </Text>
          <Text style={styles.actionText}>{currentAction}</Text>
        </View>
      ) : rep.current_issue ? (
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
    fontSize: 9,
    fontFamily: fonts.mono,
    letterSpacing: 0.8,
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(232,168,56,0.08)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.text.accent,
  },
  actionLabel: {
    fontSize: 11,
    color: colors.text.accent,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionText: {
    fontSize: 12,
    color: colors.text.accent,
    flex: 1,
    fontWeight: '500',
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
