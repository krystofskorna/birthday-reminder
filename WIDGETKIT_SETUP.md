# WidgetKit Extension Setup Instructions

## Overview
WidgetKit extension structure has been created for showing upcoming events. This requires native iOS code and an Xcode project setup.

## Current Implementation

- ✅ Widget Swift template (`widgets/UpcomingEventsWidget.swift`)
- ✅ Widget data sharing service (`services/widgetData.ts`)
- ✅ Integration with PeopleContext (updates widget data on changes)
- ⚠️ Requires Xcode project and Widget Extension target

## Setup Steps

### 1. Create Widget Extension Target in Xcode

1. Open your project in Xcode (after running `npx expo prebuild`)
2. File → New → Target
3. Select "Widget Extension"
4. Name it "UpcomingEventsWidgetExtension"
5. Choose "Include Configuration Intent" (optional, for interactive widgets)

### 2. Configure App Group

1. Select your main app target
2. Go to "Signing & Capabilities"
3. Click "+ Capability"
4. Add "App Groups"
5. Create/select group: `group.com.yourcompany.birthdayreminder`
6. Repeat for Widget Extension target

### 3. Copy Widget Files

1. Copy `widgets/UpcomingEventsWidget.swift` to your Widget Extension target
2. Update the file to match your project structure
3. Update `APP_GROUP_IDENTIFIER` in `services/widgetData.ts` to match your App Group

### 4. Create Native Module for Data Sharing

Create a native module to share data between React Native and Widget:

**ios/WidgetDataModule.swift:**
```swift
import Foundation
import React

@objc(WidgetDataModule)
class WidgetDataModule: NSObject {
  
  @objc
  func saveToAppGroup(_ groupId: String, key: String, data: [String: Any], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    guard let sharedDefaults = UserDefaults(suiteName: groupId) else {
      rejecter("ERROR", "Failed to access App Group", nil)
      return
    }
    
    if let jsonData = try? JSONSerialization.data(withJSONObject: data) {
      sharedDefaults.set(jsonData, forKey: key)
      sharedDefaults.synchronize()
      resolver(true)
    } else {
      rejecter("ERROR", "Failed to serialize data", nil)
    }
  }
}
```

**ios/WidgetDataModule.m:**
```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetDataModule, NSObject)

RCT_EXTERN_METHOD(saveToAppGroup:(NSString *)groupId
                  key:(NSString *)key
                  data:(NSDictionary *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
```

### 5. Update WidgetData Service

Update `services/widgetData.ts` to use the native module:

```typescript
import { NativeModules } from 'react-native';

const { WidgetDataModule } = NativeModules;

export async function updateWidgetData(): Promise<void> {
  const people = await loadPeople();
  const formatted = formatPeopleForWidget(people);
  
  await WidgetDataModule.saveToAppGroup(
    APP_GROUP_IDENTIFIER,
    WIDGET_DATA_KEY,
    { people: formatted }
  );
}
```

### 6. Configure Widget Extension

1. Update `Info.plist` in Widget Extension
2. Set minimum deployment target (iOS 14+)
3. Configure widget display name and description

### 7. Test Widget

1. Build and run on iOS device/simulator
2. Long press home screen
3. Tap "+" to add widget
4. Find "Upcoming Celebrations" widget
5. Add to home screen

## Widget Sizes

The widget supports three sizes:
- **Small**: Shows 1-2 upcoming events
- **Medium**: Shows 3-4 upcoming events  
- **Large**: Shows 5+ upcoming events with more details

## Data Flow

1. User adds/updates person in app
2. `PeopleContext` saves to AsyncStorage
3. `updateWidgetData()` is called
4. Data is saved to App Group UserDefaults
5. Widget Extension reads from App Group
6. Widget timeline updates

## Timeline Refresh

The widget uses a timeline provider that:
- Updates every hour
- Shows events for the next 7 days
- Refreshes when app updates data

## Notes

- Widget requires iOS 14+
- App Group must be configured for both app and extension
- Widget data is limited (keep payload small)
- Test on physical device for best results
- Consider adding interactive widgets (iOS 17+) for quick actions

## Troubleshooting

- **Widget not showing data**: Check App Group configuration
- **Widget not updating**: Verify `updateWidgetData()` is called
- **Build errors**: Ensure Widget Extension target is properly configured
- **Data format issues**: Verify JSON serialization matches between app and widget

