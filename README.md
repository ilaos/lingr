# LINGR - Ambient Horror Presence App

An ambient, presence-based horror experience that creates the illusion of a supernatural entity attached to your device. LINGR focuses on atmospheric dread through subtle, consent-driven interactions rather than jump scares.

## Project Overview

LINGR is a mobile app built with React Native and Expo that simulates a haunting experience through:
- Eerie ambient presence visualization
- Evidence collection system
- AR-style presence detector
- Comprehensive consent and control center
- Device-level interactions (notifications, haptics)

## Current Implementation

### Screens

#### 1. Presence Screen (Home)
**Location:** `screens/PresenceScreen.tsx`

The main screen featuring an evolving entity profile with:
- Animated presence visualization with floating/pulsing effects
- Real-time activity timestamp
- Dynamic intensity meter showing presence strength
- Cryptic messages from the entity

#### 2. Evidence Screen
**Location:** `screens/EvidenceScreen.tsx`

A gallery of captured anomalies and manifestations:
- Grid layout (2 columns) for evidence cards
- Three evidence types: captures, messages, anomalies
- Each card shows timestamp and type indicator
- Empty state with atmospheric illustration
- Currently uses in-memory state (no persistence)

#### 3. Detector Screen (AR Camera)
**Location:** `screens/DetectorScreen.tsx`

Presence detection interface with:
- Full-screen camera placeholder with scanning reticle
- Animated scan lines when active
- Detection status indicator
- Capture button with glow effect when presence detected
- Haptic feedback on detection events
- Play/pause scanning controls

#### 4. Control Center
**Location:** `screens/ControlScreen.tsx`

Comprehensive settings and safety controls:
- Master presence on/off toggle
- Permission controls (notifications, haptics, camera, location)
- Behavior settings (public space adaptation)
- Safety features:
  - Pause for 24 hours
  - Clear all evidence (with confirmation)
  - Remove presence (double confirmation required)
- App version and info

### Components

#### Core UI Components
- **`PresenceVisual.tsx`** - Animated entity visualization with float/pulse effects
- **`ActivityMeter.tsx`** - Intensity indicator with glow effects
- **`EvidenceCard.tsx`** - Evidence item with press animations
- **`FloatingButton.tsx`** - Animated button with pulse effects for active states
- **`ControlToggle.tsx`** - Settings toggle with descriptions
- **`ThemedText.tsx`** - Text component respecting theme colors
- **`ThemedView.tsx`** - View component with theme backgrounds
- **`ScreenScrollView.tsx`** - Scroll view with safe area handling
- **`Card.tsx`** - Base card component with elevation

#### Helper Components
- **`HeaderTitle.tsx`** - Custom header with app logo and name
- **`ErrorBoundary.tsx`** - App crash handler with restart functionality
- **`Spacer.tsx`** - Spacing utility component

### Hooks

#### State Management Hooks
- **`usePresenceState.ts`** - Entity data, activity tracking, intensity levels
- **`useEvidenceState.ts`** - Evidence collection (currently empty array)
- **`useDetectorState.ts`** - Scanner state, detection logic, haptic feedback
- **`useControlState.ts`** - Settings and permissions management

#### Utility Hooks
- **`useTheme.ts`** - Dark theme access and color scheme
- **`useScreenInsets.ts`** - Safe area calculations with tab bar height
- **`useColorScheme.ts`** - Platform color scheme detection

### Design System

**Location:** `constants/theme.ts`

#### Colors
- **Background:** `#0A0A0F` (near-black with blue tint)
- **Surface:** `#151520` (elevated surfaces)
- **Border:** `#2A2A35` (subtle separation)
- **Accent:** `#8B7FF5` (ethereal purple for active presence)
- **Warning:** `#FF6B6B` (muted red for destructive actions)
- **Success:** `#4ECDC4` (teal for detection events)
- **Text:** `#E8E8F0` (ghost white)
- **Dimmed:** `#6B6B7A` (secondary text)

#### Typography
- **Title:** 28pt, Weight 700 (entity names, headers)
- **Heading:** 20pt, Weight 600 (section titles)
- **Body:** 16pt, Weight 400 (main content)
- **Caption:** 13pt, Weight 500 (labels, metadata)
- **Monospace:** 14pt (timestamps, data)

#### Spacing & Layout
- Consistent spacing scale (xs: 4px → 5xl: 48px)
- Border radius scale (xs: 8px → full: 9999px)
- Floating button shadows with glow effects
- 44pt minimum touch targets

### Navigation

**Location:** `navigation/MainTabNavigator.tsx`

Bottom tab navigation with 4 tabs:
1. **Presence** (Home) - Entity profile
2. **Evidence** - Captured anomalies
3. **Detector** - AR camera
4. **Control** - Settings

Features:
- Transparent headers with blur effect on iOS
- Custom header title for main screen
- Feather icons from `@expo/vector-icons`

### Visual Assets

**Location:** `assets/images/`

- **icon.png** - Generated app icon (shadowy presence silhouette)
- **entity-presence.png** - Main entity visualization (400x400)
- **evidence-empty.png** - Empty state illustration

## Features Ready for Extension

### 1. Event Scheduler System
**Not Yet Implemented**

Create a randomized event system for ambient scares:

```typescript
// Example structure for future implementation
interface ScareEvent {
  id: string;
  type: 'notification' | 'haptic' | 'visual' | 'audio';
  weight: number;
  minDelay: number;
  maxDelay: number;
  trigger?: 'time' | 'location' | 'interaction';
}

// Configuration file to define event types
const scareConfig = {
  events: [...],
  globalSettings: {
    minTimeBetweenEvents: 900000, // 15 minutes
    maxEventsPerDay: 12,
  }
};
```

**Implementation Notes:**
- Use background tasks for scheduling
- Respect user's activity frequency settings
- Check consent toggles before triggering
- Implement quiet hours (11pm - 7am by default)

### 2. Push Notifications
**Permissions Requested, Not Implemented**

Add cryptic notifications using `expo-notifications`:
- Request permissions in Control Center
- Schedule random notifications based on event system
- Messages should be brief, unsettling, context-free
- Examples: "It's watching", "Did you hear that?", "You're not alone"

**Implementation:**
```typescript
import * as Notifications from 'expo-notifications';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Schedule notification
await Notifications.scheduleNotificationAsync({
  content: { title: '', body: 'It\'s watching' },
  trigger: { seconds: randomDelay },
});
```

### 3. AR Camera Integration
**UI Implemented, Camera Not Active**

Replace placeholder with actual camera:
- Use `expo-camera` for live camera feed
- Implement AR detection effects (visual glitches, shadows)
- Capture screenshots when presence detected
- Save to Evidence with timestamp and location

**Implementation:**
```typescript
import { Camera } from 'expo-camera';

// Request permissions
const { status } = await Camera.requestCameraPermissionsAsync();

// In DetectorScreen, replace placeholder:
<Camera style={StyleSheet.absoluteFill} type={Camera.Constants.Type.back}>
  {/* Overlay UI */}
</Camera>
```

### 4. Location-Based Behavior
**Permission Toggle Exists, Not Implemented**

Adapt presence behavior based on location:
- Use `expo-location` for GPS tracking
- Define "home" location after first use
- Reduce activity in public spaces when setting enabled
- Increase intensity when user returns home

**Implementation:**
```typescript
import * as Location from 'expo-location';

// Track location in background
const location = await Location.getCurrentPositionAsync({});

// Determine if in public space
const isPublic = !isNearHome(location.coords);

// Adjust event frequency accordingly
```

### 5. Evidence Persistence
**Currently In-Memory Only**

Implement persistent storage for evidence:
- Use `@react-native-async-storage/async-storage`
- Store captured moments, timestamps, locations
- Implement evidence deletion
- Add share functionality for evidence

**Implementation:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save evidence
await AsyncStorage.setItem('evidence', JSON.stringify(evidenceArray));

// Load evidence
const stored = await AsyncStorage.getItem('evidence');
const evidence = stored ? JSON.parse(stored) : [];
```

### 6. Voice Activation
**Not Implemented**

Add voice trigger functionality:
- Listen for "Hey Lingr" or similar phrase
- Respond with haptic feedback or subtle visual
- Could trigger special events or easter eggs

**Note:** Voice recognition requires additional native modules not compatible with Expo Go. Would need custom development build.

### 7. Haptic Patterns
**Basic Implementation Complete**

Expand haptic feedback system:
- Create unsettling vibration patterns
- Use for ambient presence indication
- Trigger during detection events
- Respect user's haptic toggle setting

Current implementation uses `expo-haptics` for:
- Button presses (light impact)
- Presence detection (medium impact)
- Evidence capture (notification feedback)

### 8. Activity Intensity Adaptation
**Basic Meter Implemented**

Make intensity affect behavior:
- Higher intensity = more frequent events
- Visual effects intensify (blur, distortion)
- Haptic patterns become more aggressive
- Linked to user interaction patterns

## Technical Architecture

### State Management
- Currently using React hooks and local state
- No global state management (Redux, Context) needed yet
- Each screen manages its own state via custom hooks
- Easy to migrate to persistent storage when needed

### Animation System
- Uses `react-native-reanimated` for smooth animations
- Spring physics for natural movement
- Continuous loops for ambient effects (floating, pulsing)
- Press animations on all interactive elements

### Performance Considerations
- FlatList for evidence grid (supports large lists)
- Image optimization for presence visuals
- Memoization opportunities for heavy components
- Background task management for events

## Development Notes

### Running the App

```bash
npm run dev
```

This starts the Expo development server. You can:
- Scan QR code with Expo Go app (iOS/Android)
- Press `w` to open in web browser
- Press `a` for Android emulator
- Press `i` for iOS simulator

### Expo Go Compatibility

All dependencies are Expo Go compatible. The app works without custom native code.

**Key Libraries:**
- `expo-haptics` - Vibration feedback
- `expo-image` - Optimized image loading
- `react-native-reanimated` - Animations
- `@react-navigation/bottom-tabs` - Tab navigation
- `expo-blur` - iOS blur effects

### Design Guidelines

Full design specifications in `design_guidelines.md`:
- Screen layouts and safe area handling
- Component specifications
- Color palette and typography
- Interaction patterns
- Accessibility requirements

## Future Backend Considerations

When ready to add server functionality:

### Event Scheduling Service
- Node.js/Express server for centralized event management
- Store event history and user preferences
- Push notification service integration
- Real-time presence intensity calculations

### Analytics & Insights
- Track user engagement patterns
- Optimize scare timing based on behavior
- A/B test different event types
- Anonymous usage metrics

### Content Management
- Admin panel for updating entity messages
- New entity types and behaviors
- Episodic content releases
- Community-contributed events

## File Structure

```
/
├── screens/               # Main app screens
│   ├── PresenceScreen.tsx
│   ├── EvidenceScreen.tsx
│   ├── DetectorScreen.tsx
│   └── ControlScreen.tsx
├── components/            # Reusable UI components
│   ├── PresenceVisual.tsx
│   ├── ActivityMeter.tsx
│   ├── EvidenceCard.tsx
│   ├── FloatingButton.tsx
│   ├── ControlToggle.tsx
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── usePresenceState.ts
│   ├── useEvidenceState.ts
│   ├── useDetectorState.ts
│   ├── useControlState.ts
│   └── useTheme.ts
├── navigation/            # Navigation setup
│   ├── MainTabNavigator.tsx
│   └── screenOptions.ts
├── constants/             # Design system
│   └── theme.ts
├── assets/               # Images and media
│   └── images/
├── App.tsx               # Root component
└── app.json              # Expo configuration
```

## Design Philosophy

LINGR prioritizes:
1. **Atmosphere over shock** - Subtle dread, not jump scares
2. **Consent over intrusion** - Everything is opt-in with clear controls
3. **Ambiguity over explanation** - Mystery maintains the illusion
4. **Minimalism over complexity** - Less is more for horror
5. **Consistency over variety** - Unified aesthetic strengthens immersion

## Safety & Ethics

The app includes robust safety features:
- Master kill switch (disable all presence activity)
- 24-hour pause option
- Clear evidence deletion
- Complete presence removal (with double confirmation)
- Visible consent toggles for all intrusive features

All scary elements are:
- Clearly labeled as horror content
- Opt-in by design
- Controllable by the user
- Never truly malicious or harmful

---

**Version:** 1.0.0  
**Built with:** React Native, Expo, TypeScript  
**Platform:** iOS, Android, Web

For questions or development guidance, refer to the design guidelines and this README.
