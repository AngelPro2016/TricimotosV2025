// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in-trici" options={{ headerShown: false }} />
<<<<<<< HEAD

=======
>>>>>>> df15065904df5640020b1b88635d9963568a3c7f
    </Stack>
  );
};

export default Layout;
