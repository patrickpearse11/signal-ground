import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useUserStore } from '@/store/userStore'
import { updateUserZip } from '@/services/authService'
import { colors, spacing, radius } from '@/constants/theme'

export default function OnboardingScreen() {
  const { userId, setZip, setHasOnboarded } = useUserStore()
  const [zipInput, setZipInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function isValidZip(zip: string) {
    return /^\d{5}$/.test(zip)
  }

  async function handleContinue() {
    const zip = zipInput.trim() || '91356'
    if (zipInput.trim() && !isValidZip(zipInput.trim())) {
      setError('Please enter a valid 5-digit zip code')
      return
    }
    setLoading(true)
    setZip(zip)
    setHasOnboarded(true)
    if (userId) await updateUserZip(userId, zip)
    setLoading(false)
    router.replace('/(tabs)/brief')
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={styles.content}>
          <View style={styles.logoRow}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>Signal + Ground</Text>
          </View>
          <Text style={styles.headline}>Know what's happening.{'\n'}Show up where it matters.</Text>
          <Text style={styles.body}>We'll translate global events into exactly what they mean for your neighborhood.</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your zip code</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={zipInput}
              onChangeText={(t) => { setZipInput(t); setError('') }}
              placeholder="e.g. 91356"
              placeholderTextColor={colors.text.secondary}
              keyboardType="number-pad"
              maxLength={5}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.inputHint}>Leave blank to start with Tarzana, Los Angeles</Text>
          </View>
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleContinue} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get my local brief →</Text>}
          </TouchableOpacity>
        </View>
        <Text style={styles.footer}>Signal + Ground is a civic intelligence tool.{'\n'}No ads. No partisan slant. Just the facts and your front door.</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: 'space-between', padding: spacing.lg },
  content: { flex: 1, justifyContent: 'center', paddingBottom: spacing.xl },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  logoDot: { width: 10, height: 10, borderRadius: 99, backgroundColor: colors.text.accent },
  logoText: { fontSize: 13, fontWeight: '600', color: colors.text.accent, letterSpacing: 0.5, textTransform: 'uppercase' },
  headline: { fontSize: 30, fontWeight: '700', color: colors.text.primary, lineHeight: 38, marginBottom: spacing.md, fontFamily: 'Georgia' },
  body: { fontSize: 16, color: colors.text.secondary, lineHeight: 24, marginBottom: spacing.xl },
  inputGroup: { marginBottom: spacing.xl },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: 20, color: colors.text.primary, backgroundColor: colors.surface, letterSpacing: 2 },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 13, color: '#EF4444', marginTop: spacing.xs },
  inputHint: { fontSize: 13, color: colors.text.secondary, marginTop: spacing.sm },
  button: { backgroundColor: colors.text.accent, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  footer: { fontSize: 12, color: colors.text.secondary, textAlign: 'center', lineHeight: 18, paddingBottom: spacing.md },
})
