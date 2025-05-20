import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'Inicio', tabBarIcon: () => null }} />
      <Tabs.Screen name="RidesScreen" options={{ title: 'Solicitar', tabBarIcon: () => null }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: () => null }} />
    </Tabs>
  );
}
