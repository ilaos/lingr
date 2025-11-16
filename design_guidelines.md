# LINGR Design Guidelines

## Architecture Decisions

### Authentication
**No Auth Required** - LINGR is a single-user, local-first haunting experience.
- No login/signup screens needed
- Data stored locally to maintain the illusion of device possession
- Settings/Consent Center serves as the control interface

### Navigation
**Tab Navigation** (4 tabs with floating AR trigger)
- **Home** (Entity Profile) - The presence visualization
- **Evidence** (Locker) - Captured anomalies and messages
- **Detect** (Floating Action Button) - Triggers AR Presence Detector
- **Control** (Consent Center) - Settings and safety controls

The floating AR button emphasizes the investigative nature and keeps the core interaction easily accessible.

## Screen Specifications

### 1. Home (Entity Profile)
**Purpose**: Atmospheric presence visualization that evolves with haunting progression
- **Header**: Transparent, no title, minimal interference with presence
  - Right button: "?" info icon (explains what you're seeing)
- **Layout**: Scrollable root view
  - Top safe area inset: headerHeight + Spacing.xl
  - Bottom safe area inset: tabBarHeight + Spacing.xl
- **Content**:
  - Large central presence visualization (static image asset that changes based on haunting state)
  - Entity name (cryptic, evolving text)
  - "Last Activity" timestamp with subtle animation
  - Activity intensity meter (minimal, ambient indicator)
  - Recent cryptic message/observation
- **Interaction**: Slow parallax scroll, subtle ambient animations on presence visual

### 2. Evidence Locker
**Purpose**: Gallery of captured anomalies, AR moments, and messages
- **Header**: Transparent with search bar
  - Title: "EVIDENCE"
  - Right button: Filter/sort icon
- **Layout**: Grid-based scrollable list
  - Top safe area inset: headerHeight + Spacing.xl
  - Bottom safe area inset: tabBarHeight + Spacing.xl
- **Content**:
  - Grid of evidence cards (2 columns)
  - Each card shows thumbnail, timestamp, type indicator
  - Empty state: "No evidence captured... yet"
- **Interaction**: Tap card to view full evidence detail (modal screen)

### 3. Presence Detector (AR Camera)
**Purpose**: AR investigation tool for detecting presence manifestations
- **Header**: None (full-screen camera)
- **Layout**: Camera view with floating UI overlay
  - Top safe area inset: insets.top + Spacing.xl
  - Bottom safe area inset: tabBarHeight + Spacing.xl
- **Floating Elements**:
  - Top: Scanning indicator (animated text/graphic)
  - Center: Crosshair/detection reticle
  - Bottom: Capture button (prominent, glowing when presence detected)
  - Bottom-left: Flash toggle
  - Bottom-right: Close/minimize button
- **Interaction**: Camera continuously "scans" environment, subtle haptic feedback when presence detected

### 4. Control Center (Settings/Consent)
**Purpose**: Explicit consent toggles and safety controls
- **Header**: Standard navigation header
  - Title: "CONTROL CENTER"
- **Layout**: Scrollable form
  - Top safe area inset: Spacing.xl
  - Bottom safe area inset: tabBarHeight + Spacing.xl
- **Content Sections**:
  - **Presence Status**: ON/OFF master toggle (large, prominent)
  - **Permissions**:
    - Push Notifications toggle
    - Haptic Feedback toggle
    - Camera/AR Access toggle
    - Location Awareness toggle
  - **Behavior Settings**:
    - Activity Frequency slider (Rare → Frequent)
    - Public Space Behavior toggle
  - **Safety**:
    - "Pause for 24 hours" button
    - "Clear all evidence" button
    - "Remove presence" button (destructive, requires confirmation)
  - **About**: Version, credits, support link

### Modal Screens
**Evidence Detail** (Modal)
- Full-screen view of captured evidence
- Timestamp, location (if applicable), description
- Share button (to save externally)
- Delete button
- Close button in header

**Entity Info** (Modal from Home "?")
- Brief cryptic description of the presence
- Lore snippets
- Activity history
- Close button

## Design System

### Color Palette
**Primary Colors**:
- Background: `#0A0A0F` (near-black with slight blue tint)
- Surface: `#151520` (elevated surfaces)
- Border: `#2A2A35` (subtle separation)

**Accent Colors**:
- Primary Accent: `#8B7FF5` (ethereal purple - for active presence)
- Warning: `#FF6B6B` (muted red - for destructive actions)
- Success: `#4ECDC4` (teal - for detection events)
- Ghost White: `#E8E8F0` (primary text)
- Dimmed: `#6B6B7A` (secondary text)

**Atmospheric Effects**:
- Noise overlay: 5% opacity film grain texture
- Vignette: Subtle darkening at edges (10% black radial gradient)

### Typography
**Font Family**: SF Pro (iOS) / Roboto (Android) with monospace for timestamps/data
- **Title**: 28pt, Weight 700, Tracking -0.5, Ghost White
- **Heading**: 20pt, Weight 600, Ghost White
- **Body**: 16pt, Weight 400, Ghost White
- **Caption**: 13pt, Weight 500, Dimmed
- **Monospace Data**: 14pt, SF Mono/Roboto Mono, Primary Accent

### Component Specifications

**Cards** (Evidence items):
- Background: Surface color
- Border: 1px Border color
- Border radius: 8px
- Subtle noise texture overlay
- Press state: Scale 0.98, opacity 0.85

**Buttons**:
- **Primary** (Presence Detector capture): 
  - 64x64 circular, Primary Accent glow (shadowRadius: 12, shadowOpacity: 0.6)
  - Inner pulse animation when active
- **Secondary** (Header buttons):
  - Ghost White icons, no background
  - Press state: opacity 0.6
- **Destructive** (Remove presence):
  - Warning color, border only
  - Requires double confirmation alert

**Toggles/Switches**:
- Track: Border color (off), Primary Accent (on)
- Thumb: Ghost White with subtle glow when on

**Presence Visualization**:
- Large central asset (400x400 base size)
- Subtle continuous float animation (2-3px vertical, 8s duration, ease-in-out)
- Slight opacity pulse (0.85 → 1.0, 4s duration)
- Blur effect increases slightly with activity intensity

**Detection Reticle** (AR Camera):
- Feather "crosshair" or "target" icon
- Animated scanning lines
- Color shifts from Dimmed → Primary Accent when presence detected
- Haptic feedback pulse on detection

**Activity Indicator**:
- Horizontal bar or circular ring
- Fills with Primary Accent based on intensity
- Subtle glow effect on active sections

### Visual Feedback
- **All touchable elements**: opacity 0.7 when pressed
- **Floating buttons**: Drop shadow (offset: 0/2, opacity: 0.10, radius: 2)
- **Haptic patterns**: Use device haptics for presence detection, evidence capture, warnings
- **Animations**: Slow, deliberate (300-500ms), ease-in-out curves
- **Transitions**: Cross-fade between screens (250ms)

### Critical Assets
1. **Default Entity Presence** (400x400): Abstract, unsettling form - shadowy humanoid silhouette with distortion/static effect
2. **Evidence Type Icons** (32x32 each):
   - AR Capture (camera with ghost overlay)
   - Message (speech bubble with static)
   - Anomaly (warning triangle with glitch)
3. **Detection Reticle** (128x128): Animated crosshair/target graphic
4. **Empty State Illustrations**:
   - Evidence Locker empty (subtle ghost outline)

### Accessibility
- Minimum touch target: 44x44pt
- Support dynamic type for all text except monospace data
- Provide haptic alternatives to visual-only feedback
- High contrast mode: Increase Border and Dimmed colors
- Screen reader labels for all interactive elements
- Alert before triggering camera/AR for users with motion sensitivity

### Platform-Specific Notes
- **iOS**: Use SF Symbols for system icons where appropriate
- **Android**: Use Feather icons from @expo/vector-icons
- Respect system dark mode (app is dark-only, but honor reduced motion preferences)
- Request permissions with clear explanations of horror context