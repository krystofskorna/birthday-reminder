// One-tap action service for Call/SMS/WhatsApp (PREMIUM ONLY)
import { Linking, Platform, Alert } from 'react-native';
import { recordCall } from './callHistory';

/**
 * Make a phone call
 */
export async function makeCall(phoneNumber: string): Promise<boolean> {
  if (!phoneNumber) {
    Alert.alert('Error', 'No phone number available');
    return false;
  }

  try {
    const phoneUrl = `tel:${phoneNumber}`;
    const canOpen = await Linking.canOpenURL(phoneUrl);
    
            if (canOpen) {
              await Linking.openURL(phoneUrl);
              // Record the call in our history
              await recordCall(phoneNumber);
              return true;
            } else {
      Alert.alert('Error', 'Cannot make phone calls on this device');
      return false;
    }
  } catch (error) {
    console.error('Failed to make call:', error);
    Alert.alert('Error', 'Failed to open phone dialer');
    return false;
  }
}

/**
 * Send SMS
 */
export async function sendSMS(phoneNumber: string, message?: string): Promise<boolean> {
  if (!phoneNumber) {
    Alert.alert('Error', 'No phone number available');
    return false;
  }

  try {
    // Remove any non-digit characters except + for international numbers
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const smsUrl = message 
      ? `sms:${cleanNumber}&body=${encodeURIComponent(message)}`
      : `sms:${cleanNumber}`;
    
    const canOpen = await Linking.canOpenURL(smsUrl);
    
    if (canOpen) {
      await Linking.openURL(smsUrl);
      return true;
    } else {
      Alert.alert('Error', 'Cannot send SMS on this device');
      return false;
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    Alert.alert('Error', 'Failed to open SMS app');
    return false;
  }
}

/**
 * Open WhatsApp
 */
export async function openWhatsApp(phoneNumber: string, message?: string): Promise<boolean> {
  if (!phoneNumber) {
    Alert.alert('Error', 'No phone number available');
    return false;
  }

  try {
    // Remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    
    // WhatsApp URL format: whatsapp://send?phone=1234567890&text=message
    let whatsappUrl = `whatsapp://send?phone=${cleanNumber}`;
    if (message) {
      whatsappUrl += `&text=${encodeURIComponent(message)}`;
    }
    
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return true;
    } else {
      // Fallback to web WhatsApp if app is not installed
      const webUrl = `https://wa.me/${cleanNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
      const canOpenWeb = await Linking.canOpenURL(webUrl);
      
      if (canOpenWeb) {
        await Linking.openURL(webUrl);
        return true;
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on this device');
        return false;
      }
    }
  } catch (error) {
    console.error('Failed to open WhatsApp:', error);
    Alert.alert('Error', 'Failed to open WhatsApp');
    return false;
  }
}

