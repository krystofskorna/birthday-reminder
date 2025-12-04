# How to Find Signing Settings in Xcode

## Step-by-Step Visual Guide

### Step 1: Click the TOP project icon
In the **left sidebar** (Project Navigator), look at the **VERY TOP**:
- You'll see `boltexponativewind` with a **blue project icon** 📁
- This is the FIRST item in the list (above everything else)
- **Click on this one** - NOT the one under "Products"

### Step 2: Main editor area changes
After clicking the top project icon, the **center/main area** will show:
- Two sections: "PROJECT" and "TARGETS"
- Under **"TARGETS"**, you'll see `boltexponativewind`
- **Click on `boltexponativewind`** under TARGETS

### Step 3: Find the tabs
At the **top of the main editor area**, you'll see tabs like:
- General
- Signing & Capabilities  ← **Click this one!**
- Build Settings
- Build Phases
- Build Rules
- Info

### Step 4: Enable signing
In the "Signing & Capabilities" tab:
- Check the box: **"Automatically manage signing"**
- Select your team from the **"Team"** dropdown

## Visual Guide:

```
Left Sidebar (Project Navigator):
┌─────────────────────────────┐
│ 📁 boltexponativewind       │ ← CLICK THIS ONE (top, blue icon)
│   📄 AppDelegate            │
│   📁 Supporting            │
│   📁 Libraries            │
│   📁 Products             │
│     📄 boltexponativewind │ ← NOT this one!
│   📁 Frameworks           │
│   📁 Pods                 │
│   📁 ExpoModulesProviders │
└─────────────────────────────┘
```

## Alternative Method (If you can't find it):

1. Press **⌘1** (Command + 1) to focus on Project Navigator
2. Press **↑** (Up arrow) multiple times until you're at the very top
3. You should see the blue project icon `boltexponativewind`
4. Click it, then follow steps 2-4 above

## Still Can't Find It?

Try this:
1. In Xcode menu bar: **View** → **Navigators** → **Show Project Navigator** (or press ⌘1)
2. Look at the very top of the left sidebar
3. The first item should be `boltexponativewind` with a blue folder/project icon
4. Click it

