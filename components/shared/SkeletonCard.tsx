import { View, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { colors, spacing, radius } from '@/constants/theme'

interface Props {
  variant?: 'news' | 'rep' | 'event' | 'brief' | 'default'
}

export function SkeletonCard({ variant = 'default' }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      {variant === 'rep' && (
        <>
          <View style={styles.repRow}>
            <View style={styles.avatar} />
            <View style={styles.repInfo}>
              <View style={[styles.bar, { width: '60%', height: 16 }]} />
              <View style={[styles.bar, { width: '40%', height: 12, marginTop: 6 }]} />
            </View>
          </View>
          <View style={[styles.bar, { width: '100%', height: 12, marginTop: 8 }]} />
          <View style={styles.btnRow}>
            <View style={styles.btn} />
            <View style={styles.btn} />
          </View>
        </>
      )}
      {variant === 'event' && (
        <>
          <View style={styles.eventHeader}>
            <View style={[styles.bar, { width: 80, height: 24, borderRadius: 99 }]} />
            <View style={[styles.bar, { width: 60, height: 12 }]} />
          </View>
          <View style={[styles.bar, { width: '85%', height: 16, marginBottom: 8 }]} />
          <View style={[styles.bar, { width: '100%', height: 12, marginBottom: 4 }]} />
          <View style={[styles.bar, { width: '70%', height: 12 }]} />
        </>
      )}
      {variant === 'brief' && (
        <>
          <View style={[styles.bar, { width: 100, height: 10, marginBottom: 12 }]} />
          <View style={[styles.bar, { width: '80%', height: 18, marginBottom: 8 }]} />
          <View style={[styles.bar, { width: '100%', height: 13, marginBottom: 4 }]} />
          <View style={[styles.bar, { width: '100%', height: 13, marginBottom: 4 }]} />
          <View style={[styles.bar, { width: '60%', height: 13 }]} />
        </>
      )}
      {(variant === 'news' || variant === 'default') && (
        <>
          <View style={styles.headerRow}>
            <View style={[styles.bar, { width: 80 }]} />
            <View style={[styles.bar, { width: 60 }]} />
          </View>
          <View style={[styles.bar, { width: '90%', height: 18, marginBottom: 8 }]} />
          <View style={[styles.bar, { width: '70%', height: 18, marginBottom: spacing.sm }]} />
          <View style={[styles.bar, { width: '100%', height: 12, marginBottom: 4 }]} />
          <View style={[styles.bar, { width: '100%', height: 12, marginBottom: 4 }]} />
          <View style={[styles.bar, { width: '60%', height: 12 }]} />
        </>
      )}
    </Animated.View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  bar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 6,
  },
  repRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  repInfo: { flex: 1 },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 36,
    backgroundColor: colors.border,
    borderRadius: radius.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
})
