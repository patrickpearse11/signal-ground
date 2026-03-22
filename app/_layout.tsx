import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { initAuth, ensureUserRecord } from '@/services/authService'
import { useUserStore } from '@/store/userStore'

export default function RootLayout() {
  const { userId, zip, hasOnboarded, setUserId, setIsLoading } = useUserStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useUserStore.persist.onFinishHydration(() => setHydrated(true))
    if (useUserStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated) return
    async function bootstrap() {
      setIsLoading(true)
      const { userId: id } = await initAuth()
      if (id) { setUserId(id); await ensureUserRecord(id, zip) }
      setIsLoading(false)
    }
    bootstrap()
  }, [hydrated])

  if (!hydrated) return null

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {!hasOnboarded
          ? <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          : <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        }
      </Stack>
    </>
  )
}
