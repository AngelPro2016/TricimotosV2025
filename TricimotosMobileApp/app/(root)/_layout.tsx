// 📄 app/_layout.tsx

import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      {/* Tabs visibles como siempre */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Pantalla que no debe salir en tabs, pero se puede acceder */}
      <Stack.Screen name="EsperandoResScreen" options={{ headerShown: false }} />
    </Stack>
  )
}
