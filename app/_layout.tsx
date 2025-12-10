import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProviders } from '@/providers/AppProviders';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { initializeAds } from '@/services/ads';

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();

  useEffect(() => {
    registerForPushNotificationsAsync();
    initializeAds();
    // Initialize purchases lazily (only when needed)
    // Don't initialize on app start - let it initialize when user tries to purchase
    // This prevents errors if the module isn't available

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const personId = response.notification.request.content.data.personId;
      if (personId) {
        router.push(`/person/${personId}`);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add" />
        <Stack.Screen name="edit/[id]" />
        <Stack.Screen name="person/[id]" />
        <Stack.Screen name="checklist-templates" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  );
}
