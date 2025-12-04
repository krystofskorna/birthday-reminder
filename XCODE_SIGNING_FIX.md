# Fix Xcode Signing Issue

## Quick Fix Steps

1. **Open Xcode** (should already be open with your project)

2. **Select the Project**:
   - In the left sidebar (Project Navigator), click on the top item: `boltexponativewind` (blue icon)

3. **Select the Target**:
   - In the main editor area, you'll see "PROJECT" and "TARGETS" sections
   - Under "TARGETS", click on `boltexponativewind`

4. **Go to Signing & Capabilities Tab**:
   - Click on the "Signing & Capabilities" tab at the top

5. **Enable Automatic Signing**:
   - Check the box: **"Automatically manage signing"**

6. **Select Your Team**:
   - In the "Team" dropdown, select your Apple Developer account
   - If you don't see your team:
     - Click "Add Account..." 
     - Sign in with your Apple ID (the same one you use for App Store/iCloud)
     - After signing in, select your team from the dropdown

7. **Verify Bundle Identifier**:
   - Make sure the Bundle Identifier is: `com.anonymous.bolt-expo-nativewind`
   - If there's a warning about the bundle ID, you can change it to something unique like: `com.yourname.birthdayreminder`

## Notes

- **Free Apple ID**: You can use a free Apple ID for development and simulator testing
- **Paid Developer Account**: Required only if you want to:
  - Test on physical devices
  - Submit to App Store
  - Use certain advanced features

- **For Simulator Only**: If you're just testing in the iOS Simulator, any team selection will work

## After Fixing

Once you've selected a team:
1. Xcode will automatically create a provisioning profile
2. The signing error should disappear
3. You can build and run the app (⌘R or click the Play button)

## Troubleshooting

**If you see "No accounts available":**
- Go to Xcode → Settings (Preferences) → Accounts
- Click the "+" button
- Sign in with your Apple ID

**If you see "Bundle identifier is already in use":**
- Change the Bundle Identifier in the Signing & Capabilities tab to something unique
- Example: `com.yourname.birthdayreminder`

**If signing still fails:**
- Clean build folder: Product → Clean Build Folder (⇧⌘K)
- Restart Xcode
- Try again

