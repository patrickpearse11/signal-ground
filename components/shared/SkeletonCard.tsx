import { View, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { colors, spacing, radius } from '@/constants/theme'

export function SkeletonCard() {
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
      <View style={styles.headerRow}>
        <View style={[styles.bar, { width: 80 }]} />
        <View style={[styles.bar, { width: 60 }]} />
      </View>
      <View style={[styles.bar, { width: '90%', height: 18, marginBottom: 8 }]} />
      <View style={[styles.bar, { width: '70%', height: 18, marginBottom: spacing.sm }]} />
      <View style={[styles.bar, { width: '100%', height: 12, marginBottom: 4 }]} />
      <View style={[styles.bar, { width: '100%', height: 12, marginBottom: 4 }]} />
      <View style={[styles.bar, { width: '60%', height: 12 }]} />
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
})
