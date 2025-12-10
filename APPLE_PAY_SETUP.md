# Apple Pay / In-App Purchases Setup Guide

## Overview
This app uses `expo-in-app-purchases` to handle premium subscriptions through Apple's StoreKit.

## Setup Steps

### 1. App Store Connect Configuration

1. **Go to App Store Connect**: https://appstoreconnect.apple.com
2. **Select your app** (or create a new app)
3. **Go to "Features" → "In-App Purchases"**
4. **Create two subscription products**:

   **Monthly Subscription:**
   - Product ID: `com.skornakrystof.birthdayreminder.premium.monthly`
   - Type: Auto-Renewable Subscription
   - Subscription Group: Create a new group (e.g., "Premium")
   - Duration: 1 Month
   - Price: $2.99 (or your preferred price)

   **Yearly Subscription:**
   - Product ID: `com.skornakrystof.birthdayreminder.premium.yearly`
   - Type: Auto-Renewable Subscription
   - Subscription Group: Same as monthly (Premium)
   - Duration: 1 Year
   - Price: $19.99 (or your preferred price)

5. **Add subscription metadata**:
   - Display name
   - Description
   - Review screenshot (required for App Review)

### 2. Testing with Sandbox

1. **Create a Sandbox Tester Account**:
   - App Store Connect → Users and Access → Sandbox Testers
   - Create a new tester with a unique email

2. **Sign out of your regular Apple ID** on your test device:
   - Settings → App Store → Sign Out

3. **When testing purchases**, you'll be prompted to sign in with the sandbox account

### 3. Product IDs

The product IDs are defined in `services/purchases.ts`:
- Monthly: `com.skornakrystof.birthdayreminder.premium.monthly`
- Yearly: `com.skornakrystof.birthdayreminder.premium.yearly`

**Important**: These must match exactly what you configure in App Store Connect!

### 4. Receipt Validation

Currently, the app does basic local validation. For production, you should:

1. **Set up a backend server** to validate receipts with Apple
2. **Update `verifyPurchase()` in `services/purchases.ts`** to call your backend
3. **Store subscription status** on your server for cross-device sync

### 5. Testing Checklist

- [ ] Products are configured in App Store Connect
- [ ] Product IDs match exactly
- [ ] Sandbox tester account created
- [ ] Test monthly subscription purchase
- [ ] Test yearly subscription purchase
- [ ] Test restore purchases
- [ ] Verify premium features unlock after purchase
- [ ] Test subscription expiration (wait for sandbox period)

### 6. Production Considerations

1. **Receipt Validation**: Implement server-side receipt validation
2. **Subscription Status**: Check subscription status on app launch
3. **Grace Period**: Handle subscription grace periods
4. **Family Sharing**: Consider if you want to support Family Sharing
5. **Promotional Offers**: Set up promotional pricing if needed

### 7. Common Issues

**"Product not found" error:**
- Check product IDs match exactly
- Ensure products are approved in App Store Connect
- Wait a few minutes after creating products (propagation delay)

**Sandbox purchases not working:**
- Make sure you're signed out of regular Apple ID
- Use a sandbox tester account
- Check that the app is using the correct bundle ID

**Receipt validation fails:**
- For testing, local validation is OK
- For production, implement server-side validation

## Current Implementation

The app currently:
- ✅ Initializes StoreKit on app launch
- ✅ Shows premium onboarding modal
- ✅ Handles purchase flow for monthly/yearly subscriptions
- ✅ Stores purchase info locally
- ✅ Restores previous purchases
- ✅ Checks subscription status (basic validation)

## Next Steps

1. Configure products in App Store Connect
2. Test with sandbox account
3. Implement server-side receipt validation (for production)
4. Set up subscription status checking on app launch
5. Add subscription management UI (cancel subscription, etc.)


