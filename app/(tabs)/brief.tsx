import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '@/constants/theme'
import { useUserStore } from '@/store/userStore'

export default function BriefScreen() {
  const { zip } = useUserStore()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.label}>Brief</Text>
        <Text style={styles.sublabel}>Daily Global-to-Home Briefing</Text>
        <Text style={styles.zip}>Zip: {zip}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 28, fontWeight: '700', color: colors.text.primary },
  sublabel: { fontSize: 14, color: colors.text.secondary, marginTop: 8 },
  zip: { fontSize: 13, color: colors.text.accent, marginTop: spacing.sm },
})
