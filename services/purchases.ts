// In-App Purchase service using StoreKit
import { Platform, Alert } from 'react-native';

// Dynamic import to handle module loading gracefully
let InAppPurchases: any = null;
let moduleLoadAttempted = false;

async function ensurePurchasesModule() {
  if (moduleLoadAttempted) {
    return InAppPurchases;
  }
  
  moduleLoadAttempted = true;
  
  try {
    // Try to load the module
    const module = await import('expo-in-app-purchases');
    
    // Check if the module has the required functions
    if (module && typeof module.connectAsync === 'function') {
      InAppPurchases = module;
      return InAppPurchases;
    } else {
      console.warn('expo-in-app-purchases module loaded but missing required functions');
      return null;
    }
  } catch (error: any) {
    // Module not available - this is OK in development
    console.log('expo-in-app-purchases not available:', error.message);
    return null;
  }
}

// Product IDs - These need to be configured in App Store Connect
// For testing, you can use these test product IDs
export const PRODUCT_IDS = {
  MONTHLY: 'com.skornakrystof.birthdayreminder.premium.monthly',
  YEARLY: 'com.skornakrystof.birthdayreminder.premium.yearly',
};

export type SubscriptionType = 'monthly' | 'yearly';

let isInitialized = false;

/**
 * Initialize in-app purchases
 */
export async function initializePurchases(): Promise<boolean> {
  if (isInitialized) return true;
  
  try {
    if (Platform.OS !== 'ios') {
      console.warn('In-app purchases are only supported on iOS');
      return false;
    }

    const module = await ensurePurchasesModule();
    if (!module || !module.connectAsync) {
      // Module not available - silently fail (OK for development)
      return false;
    }

    // Connect to App Store
    await module.connectAsync();
    isInitialized = true;
    console.log('In-app purchases initialized');
    return true;
  } catch (error: any) {
    // Silently fail - don't log errors in production
    // This allows the app to work without purchases module
    return false;
  }
}

/**
 * Get available products
 */
export async function getProducts(): Promise<any[]> {
  try {
    await initializePurchases();
    const module = await ensurePurchasesModule();
    if (!module) return [];
    
    const products = await module.getProductsAsync([
      PRODUCT_IDS.MONTHLY,
      PRODUCT_IDS.YEARLY,
    ]);
    return products.results || [];
  } catch (error) {
    console.error('Failed to get products:', error);
    return [];
  }
}

/**
 * Purchase a subscription
 */
export async function purchaseSubscription(
  type: SubscriptionType
): Promise<{ success: boolean; error?: string }> {
  try {
    await initializePurchases();
    const module = await ensurePurchasesModule();
    if (!module) {
      return { success: false, error: 'In-app purchases not available' };
    }
    
    const productId = type === 'monthly' ? PRODUCT_IDS.MONTHLY : PRODUCT_IDS.YEARLY;
    
    // Purchase the product
    const purchase = await module.purchaseItemAsync(productId);
    
    if (purchase.responseCode === module.IAPResponseCode.OK) {
      // Verify the purchase
      const verified = await verifyPurchase(purchase);
      return { success: verified };
    } else {
      return { success: false, error: 'Purchase was cancelled or failed' };
    }
  } catch (error: any) {
    console.error('Purchase failed:', error);
    return { 
      success: false, 
      error: error.message || 'Purchase failed. Please try again.' 
    };
  }
}

/**
 * Verify a purchase receipt
 */
async function verifyPurchase(
  purchase: any
): Promise<boolean> {
  try {
    // In production, you should verify the receipt with your backend server
    // For now, we'll do basic validation
    
    const module = await ensurePurchasesModule();
    if (!module) return false;
    
    // Check if purchase is valid
    if (purchase.responseCode === module.IAPResponseCode?.OK) {
      // Store purchase info locally
      await storePurchaseInfo(purchase);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to verify purchase:', error);
    return false;
  }
}

/**
 * Store purchase information
 */
async function storePurchaseInfo(purchase: any): Promise<void> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('@premium_purchase', JSON.stringify({
      productId: purchase.productId,
      purchaseTime: purchase.purchaseTime,
      transactionReceipt: purchase.transactionReceipt,
    }));
  } catch (error) {
    console.error('Failed to store purchase info:', error);
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<boolean> {
  try {
    await initializePurchases();
    const module = await ensurePurchasesModule();
    if (!module) return false;
    
    const history = await module.getPurchaseHistoryAsync();
    
    if (history.results && history.results.length > 0) {
      // Find the most recent premium purchase
      const premiumPurchase = history.results.find(
        (purchase) => 
          purchase.productId === PRODUCT_IDS.MONTHLY || 
          purchase.productId === PRODUCT_IDS.YEARLY
      );
      
      if (premiumPurchase) {
        await storePurchaseInfo(premiumPurchase);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return false;
  }
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const purchaseInfo = await AsyncStorage.getItem('@premium_purchase');
    
    if (!purchaseInfo) {
      // Try to restore purchases
      return await restorePurchases();
    }
    
    // In production, verify with App Store receipt validation
    // For now, check if purchase exists and is recent
    const purchase = JSON.parse(purchaseInfo);
    const purchaseDate = new Date(purchase.purchaseTime);
    const now = new Date();
    
    // Check if purchase is within subscription period
    // Monthly: 30 days, Yearly: 365 days
    const daysSincePurchase = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
    const isMonthly = purchase.productId === PRODUCT_IDS.MONTHLY;
    const subscriptionPeriod = isMonthly ? 30 : 365;
    
    return daysSincePurchase < subscriptionPeriod;
  } catch (error) {
    console.error('Failed to check subscription:', error);
    return false;
  }
}

/**
 * Disconnect from App Store (cleanup)
 */
export async function disconnectPurchases(): Promise<void> {
  try {
    if (isInitialized) {
      const module = await ensurePurchasesModule();
      if (module) {
        await module.disconnectAsync();
        isInitialized = false;
      }
    }
  } catch (error) {
    console.error('Failed to disconnect purchases:', error);
  }
}

