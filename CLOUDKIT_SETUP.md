# CloudKit Sync Setup Instructions

## Overview
CloudKit sync has been implemented with a service layer, but requires native iOS code for full functionality. The current implementation provides the structure and can be extended.

## Current Implementation

- ✅ CloudKit service structure (`services/cloudkit.ts`)
- ✅ Integration with SettingsContext
- ✅ Sync toggle in settings screen
- ✅ Merge logic for conflict resolution
- ⚠️ Requires native implementation for actual CloudKit access

## Options for Implementation

### Option 1: Native CloudKit Module (Recommended for iOS)

Create a native module to access CloudKit directly:

1. **Create Native Module** (requires Expo development build or bare workflow)
   - Create `ios/CloudKitModule.swift` or Objective-C equivalent
   - Implement CloudKit record operations
   - Expose to React Native via bridge

2. **CloudKit Setup**
   - Enable CloudKit in Xcode project capabilities
   - Configure CloudKit container
   - Set up record types: `Person`, `Settings`, `CustomType`

3. **Update Service**
   - Replace placeholder functions in `services/cloudkit.ts`
   - Call native module methods

### Option 2: iCloud Drive via Expo File System

Use iCloud Drive for file-based sync:

```bash
npm install expo-file-system
```

Then update `services/cloudkit.ts` to:
- Save JSON files to iCloud Drive directory
- Read from iCloud Drive
- Handle file conflicts

### Option 3: Backend Service Sync

Use a backend service (Supabase is already in dependencies):

1. Set up Supabase backend
2. Create tables for people, settings, custom types
3. Implement sync logic in `services/cloudkit.ts`
4. Use Supabase real-time sync or periodic sync

## Implementation Steps (Native CloudKit)

### 1. Enable CloudKit in Xcode

1. Open project in Xcode
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "CloudKit"
6. Configure CloudKit container

### 2. Create CloudKit Schema

1. Go to CloudKit Dashboard
2. Create record types:
   - `Person` (with fields: id, name, date, type, note, etc.)
   - `Settings` (with fields matching Settings interface)
   - `CustomType` (with fields: id, name, icon, color)

### 3. Create Native Module

Example Swift implementation:

```swift
import Foundation
import CloudKit

@objc(CloudKitModule)
class CloudKitModule: NSObject {
  private let container: CKContainer
  private let privateDatabase: CKDatabase
  
  override init() {
    container = CKContainer.default()
    privateDatabase = container.privateCloudDatabase
    super.init()
  }
  
  @objc func syncPeople(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // Implementation
  }
}
```

### 4. Update React Native Service

Replace placeholder functions in `services/cloudkit.ts` with actual CloudKit calls.

## Testing

1. Test on physical iOS device (CloudKit requires iCloud account)
2. Test sync across multiple devices
3. Test conflict resolution
4. Test offline behavior

## Notes

- CloudKit requires an active iCloud account
- CloudKit sync only works on iOS (use alternative for Android)
- The current implementation provides a foundation but needs native code
- Consider using a cross-platform solution if supporting Android

