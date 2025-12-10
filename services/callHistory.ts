// Call History Service
// Note: iOS has very limited access to call history for privacy reasons
// We can only access call history through CallKit framework, which requires:
// 1. CallKit extension
// 2. User permission
// 3. Only works for calls made through the app's CallKit integration

import { Platform, Linking } from 'react-native';
import { Person } from '@/types/events';

export interface CallHistoryEntry {
  phoneNumber: string;
  lastCallDate: Date | null;
  callCount: number;
}

/**
 * Check if we can access call history
 * On iOS, direct call history access is not available for privacy reasons
 * We can only track calls made through our app's CallKit integration
 */
export function canAccessCallHistory(): boolean {
  // iOS doesn't allow direct access to call history
  // We can only track calls made through our app
  return false; // For now, until we implement CallKit extension
}

/**
 * Get last call date for a phone number
 * This will only work for calls made through our app's CallKit
 */
export async function getLastCallDate(phoneNumber: string): Promise<Date | null> {
  try {
    // For now, we'll store call history locally when user makes calls through our app
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const callHistoryKey = `@call_history:${phoneNumber}`;
    const lastCall = await AsyncStorage.getItem(callHistoryKey);
    
    if (lastCall) {
      return new Date(lastCall);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get last call date:', error);
    return null;
  }
}

/**
 * Record a call made through our app
 * This should be called when user uses the "Call" button in our app
 */
export async function recordCall(phoneNumber: string): Promise<void> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const callHistoryKey = `@call_history:${phoneNumber}`;
    const now = new Date().toISOString();
    
    await AsyncStorage.setItem(callHistoryKey, now);
    
    // Also update the person's lastCallDate if they exist
    // This will be handled by the PeopleContext
  } catch (error) {
    console.error('Failed to record call:', error);
  }
}

/**
 * Get days since last call
 */
export async function getDaysSinceLastCall(phoneNumber: string): Promise<number | null> {
  const lastCall = await getLastCallDate(phoneNumber);
  
  if (!lastCall) {
    return null;
  }
  
  const now = new Date();
  const diffTime = now.getTime() - lastCall.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Check if we should send a "call reminder" notification
 * Sends notification if last call was more than 25 days ago
 */
export async function shouldSendCallReminder(phoneNumber: string): Promise<boolean> {
  const daysSince = await getDaysSinceLastCall(phoneNumber);
  
  if (daysSince === null) {
    // No call history - don't send reminder
    return false;
  }
  
  // Send reminder if it's been 25+ days
  return daysSince >= 25;
}

/**
 * Get all call history entries
 */
export async function getAllCallHistory(): Promise<CallHistoryEntry[]> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const keys = await AsyncStorage.getAllKeys();
    const callHistoryKeys = keys.filter(key => key.startsWith('@call_history:'));
    
    const entries: CallHistoryEntry[] = [];
    
    for (const key of callHistoryKeys) {
      const phoneNumber = key.replace('@call_history:', '');
      const lastCallDate = await getLastCallDate(phoneNumber);
      
      entries.push({
        phoneNumber,
        lastCallDate,
        callCount: 1, // We only track last call, not count
      });
    }
    
    return entries;
  } catch (error) {
    console.error('Failed to get call history:', error);
    return [];
  }
}

/**
 * Clear call history for a phone number
 */
export async function clearCallHistory(phoneNumber: string): Promise<void> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const callHistoryKey = `@call_history:${phoneNumber}`;
    await AsyncStorage.removeItem(callHistoryKey);
  } catch (error) {
    console.error('Failed to clear call history:', error);
  }
}


