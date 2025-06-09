// 📄 app/_layout.tsx

import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      {/* Tabs visibles como siempre */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabstrici)" options={{ headerShown: false }} />
      
    </Stack>
  )
}
