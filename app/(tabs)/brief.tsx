import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { colors, spacing } from '@/constants/theme'
import { useUserStore } from '@/store/userStore'
import { fetchCivicHeadlines } from '@/services/newsService'
import { generateSignals, fetchLatestSignals } from '@/services/grokService'

export default function BriefScreen() {
  const { zip } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  async function testPipeline() {
    setLoading(true)
    setResult('Fetching headlines...')
    const headlines = await fetchCivicHeadlines()
    setResult(`Got ${headlines.length} headlines. Sending to Grok...`)
    const signals = await generateSignals(headlines.slice(0, 2))
    setResult(`Done. ${signals.length} signals generated.\n\n"${signals[0]?.neutral_title}"`)
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.label}>Brief</Text>
        <Text style={styles.sublabel}>Daily Global-to-Home Briefing</Text>
        <Text style={styles.zip}>Zip: {zip}</Text>

        <TouchableOpacity style={styles.button} onPress={testPipeline} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Test Pipeline</Text>}
        </TouchableOpacity>

        {result ? <Text style={styles.result}>{result}</Text> : null}
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
  button: { backgroundColor: colors.text.accent, borderRadius: 12, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, marginTop: spacing.xl },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  result: { marginTop: spacing.lg, fontSize: 13, color: colors.text.secondary, textAlign: 'center', paddingHorizontal: spacing.lg },
})
