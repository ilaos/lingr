# LINGR - Ambient Horror Presence App

## Overview

LINGR is a React Native mobile application that simulates an ambient, presence-based horror experience. Unlike traditional horror apps with jump scares, LINGR creates atmospheric dread through subtle, consent-driven interactions that make users feel as though a supernatural entity has attached itself to their device. The app uses eerie notifications, haptic feedback, cryptic messages, AR-style presence detection, and evolving entity behaviors to create a persistent sense of unease.

The application is built with Expo and React Native, featuring a dark, liminal aesthetic with smooth animations, atmospheric effects, and a narrative-driven progression system. All haunting features are opt-in with explicit user controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54
- Uses the new React Native architecture (enabled via `newArchEnabled: true`)
- React Compiler experimental feature enabled for performance optimization
- TypeScript for type safety across the codebase

**Navigation**: React Navigation v7 with bottom tab navigation
- Four main tabs: Presence (Home), Evidence, Episodes, Control
- Floating action button pattern for the Detector (AR Camera) screen
- Platform-specific blur effects on iOS tab bar using `expo-blur`
- Transparent headers with platform-specific rendering

**UI/UX Pattern**: Atmospheric, minimalist horror aesthetic
- Dark color scheme (`#0A0A0F` background with `#8B7FF5` purple accents)
- Reanimated v4 for smooth, spring-based animations and atmospheric effects
- Film grain overlays, subtle pulses, and ambient motion throughout
- All interactions feel "alive" with scale/opacity transitions

**Component Architecture**:
- Themed components (`ThemedView`, `ThemedText`) for consistent styling
- Reusable UI primitives (Button, Card, ControlToggle, FloatingButton)
- Specialized atmospheric components (BackgroundGrain, PresenceVisual, ApparitionOverlay)
- Screen wrapper components handling safe area insets and keyboard behavior

### State Management

**Local-First Architecture**: No backend or authentication required
- In-memory state management using React hooks
- AsyncStorage for persistence (notification scheduler state)
- Custom hooks for feature-specific state (`usePresenceState`, `useDetectorState`, `useEvidenceState`, `useControlState`)

**Entity Behavior Engine** (`data/entityEngine.ts`):
- Manages entity mood progression: Dormant → Restless → Active → Agitated
- Dynamic intensity fluctuation with cooldown periods
- Personality traits influence behavior (volatility, aggression, patience, curiosity)
- Timer-based mood shifts at irregular intervals
- Environment-aware behavior modulation (reduces intensity when AWAY from home)

**Message System** (`data/messages.ts`):
- Structured cryptic message pools organized by entity mood
- Weighted randomness with rarity tiers (common, uncommon, rare)
- Cooldown mechanisms prevent message repetition
- Context-aware message selection based on current entity state
- Environment-specific messages (HOME vs AWAY contexts)

**Evidence System** (`data/evidence.ts`):
- Three evidence types: captures (AR photos), messages (cryptic texts), anomalies (detected events)
- Auto-generated evidence with metadata (timestamp, location, intensity, mood, environment)
- In-memory storage with 100-item cap
- Category filtering and chronological sorting
- Environment mode tagged on all evidence entries

**Events Scheduler** (`data/eventsScheduler.ts`):
- Orchestrates random presence events (intensity changes, mood shifts, evidence generation)
- Irregular timing intervals (20-60 seconds) for unpredictability
- Event history tracking for narrative coherence
- Callback system for UI updates

**Apparition System** (`data/apparitions.ts`):
- Probabilistic visual manifestations during AR detection
- Mood-based appearance rates (2% dormant → 25% agitated)
- Brief duration flashes (100-400ms) with cooldown periods
- Triggers haptic feedback on detection
- Environment-aware probability modulation (60% reduction when AWAY, 30% when UNKNOWN)

### Camera & AR Features

**Camera Integration**: Expo Camera v17
- Live camera feed for presence detection screen
- Permission handling with graceful fallbacks
- Platform-specific: works on iOS/Android, shows fallback message on web
- Disabled state when user revokes camera permissions

**AR-Style Presence Detection**:
- Scanning reticle with animated scan lines
- Real-time presence detection based on entity intensity
- Capture functionality stores evidence with camera timestamp
- Apparition overlay system for subtle visual scares
- Haptic feedback on detection events

### Notification System

**Ambient Notification Scheduler** (`data/ambientNotificationScheduler.ts`):
- Local push notifications (no remote server required)
- Three frequency levels: low (2/day), normal (5/day), high (10/day)
- Quiet hours configuration (default 23:00-07:00)
- Daily state tracking with AsyncStorage persistence
- Automatic rescheduling on new day detection
- Respects user consent and presence active state

**Notification Service** (`services/notificationService.ts`):
- Expo Notifications wrapper with permission management
- Scheduled notification creation at specific times
- Silent notifications with no sound (atmospheric only)
- Notification response handling for user interactions

### Location Awareness System

**Location Service** (`services/locationService.ts`):
- Coarse location tracking using Expo Location API (foreground only)
- Permission handling with graceful fallback to UNKNOWN state
- Coordinate reading for home base setting and distance calculations
- Privacy-conscious design: no address storage, coarse coordinates only

**Environment Engine** (`data/environmentEngine.ts`):
- Environment classification: HOME (within 100m of home base), AWAY (beyond threshold), UNKNOWN (no home set or permissions denied)
- Distance-based classification using Haversine formula
- Persistent environment state storage via AsyncStorage
- Real-time environment mode updates (polled every 5 seconds on Presence screen)
- Modulates entity behavior, apparitions, notifications, and messages based on location context

### Consent & Control System

**Control Center** (`screens/ControlScreen.tsx`):
- Master presence toggle (pause/resume all haunting)
- Granular feature toggles: notifications, haptics, camera, location awareness, manifestations
- Location awareness toggle with explicit permission requests
- Set Home Base button for defining home coordinates (only shown when location awareness enabled)
- Notification frequency slider and quiet hours configuration
- Evidence clearing and complete presence removal options
- All changes immediately sync with background systems

**Notification Sync Hook** (`hooks/useNotificationSync.ts`):
- Monitors control state changes
- Automatically updates ambient notification scheduler
- Ensures notification system respects user preferences
- Handles permission denied states gracefully

### Animation System

**Reanimated v4 Worklets**:
- Spring physics for all interactive elements (damping: 10-15, stiffness: 100-400)
- Easing functions for atmospheric drift and pulse effects
- Shared values for coordinated animations across components
- withRepeat/withSequence for continuous ambient motion
- Performance-optimized worklets run on UI thread

**Atmospheric Effects**:
- Background grain with breathing opacity (0.03-0.05)
- Presence visual drift (±4px Y, ±2px X over 5-6 seconds)
- Intensity meter smooth spring transitions
- Apparition flash sequences (fade in 50ms, hold, fade out)
- Floating button pulse when active (scale 1.0-1.1)

### Data Persistence Strategy

**Current State**: In-memory with minimal persistence
- Entity state resets on app restart (by design for fresh haunting sessions)
- Evidence stored in memory only (cleared on restart)
- Notification scheduler state persists via AsyncStorage
- User preferences stored in React state (ephemeral)

**Rationale**: Maintains the illusion that the presence "lives" in the current session rather than accumulating permanent data, keeping each haunting experience fresh and immediate.

## External Dependencies

### Core Framework
- **Expo SDK 54**: Application framework and native module access
- **React Native 0.81**: Cross-platform mobile UI framework
- **React 19**: UI library with compiler optimizations

### Navigation & Layout
- **React Navigation v7**: Bottom tabs and native stack navigation
- **React Native Gesture Handler**: Touch gesture recognition
- **React Native Safe Area Context**: Safe area inset handling
- **React Native Screens**: Native screen optimization
- **React Native Keyboard Controller**: Keyboard-aware scrolling

### Animation & Visual Effects
- **React Native Reanimated v4**: Declarative animation library
- **React Native Worklets**: JavaScript worklet runtime for animations
- **Expo Blur**: Native blur effects (iOS tab bar)
- **Expo Glass Effect**: Liquid glass visual effects

### Device Capabilities
- **Expo Camera**: Live camera feed for AR detection
- **Expo Haptics**: Tactile feedback on detection events
- **Expo Notifications**: Local push notification scheduling and handling
- **Expo Location**: Coarse location tracking for environment awareness

### Storage & Assets
- **AsyncStorage**: Key-value persistence for notification state
- **Expo Image**: Optimized image loading and caching
- **Expo Font**: Custom font loading
- **Expo Vector Icons**: Feather icon set

### System Integration
- **Expo Constants**: Environment and device information
- **Expo System UI**: System UI customization
- **Expo Linking**: Deep linking support
- **Expo Splash Screen**: Launch screen management
- **Expo Status Bar**: Status bar styling
- **Expo Symbols**: SF Symbols support (iOS)
- **Expo Web Browser**: In-app browser functionality

### Development Tools
- **TypeScript**: Static type checking
- **ESLint**: Code linting with Expo config
- **Prettier**: Code formatting
- **Babel Module Resolver**: Path aliasing (`@/` imports)

### Platform Support
- **iOS**: Full feature support including blur effects and haptics
- **Android**: Full feature support with edge-to-edge display
- **Web**: Limited support (camera features disabled, keyboard controller fallback)