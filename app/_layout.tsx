import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProviders } from '@/providers/AppProviders';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { initializeAds } from '@/services/ads';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';

const ONBOARDING_KEY = '@birthday_reminder:onboarding_completed';

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!completed) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

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

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  if (isLoading) {
    return null; // or a loading screen
  }

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
      {showOnboarding && (
        <OnboardingTutorial
          visible={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}
    </AppProviders>
  );
}
