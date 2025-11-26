import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="person/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  );
}
