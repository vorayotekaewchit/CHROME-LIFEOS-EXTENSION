# LifeOS Chrome Extension - Project Summary

## Project Overview

**LifeOS Extension** is a Chrome browser extension that transforms productivity through a mission-based system. Built with React, TypeScript, Vite, and Tailwind CSS, it follows the philosophy: *"Stop tracking everything. Start finishing something. Three missions a day."*

The extension provides a focused, gamified approach to daily productivity by limiting users to three missions per day, encouraging intentional action over endless task lists. It combines XP progression, streak tracking, and momentum visualization to create a sustainable productivity habit.

---

## Core Features

### 1. **Mission Management System**
- **Three Missions Per Day**: Enforces focus by limiting daily missions to three
- **Mission Tags**: Categorize missions with tags (Focus, Health, Money, Admin, Relationships)
- **Mission Details**: Each mission includes:
  - Title
  - Duration (15-25 minutes)
  - Optional "Why" field for motivation
  - Tag categorization
- **Import from Yesterday**: Automatically carry over incomplete missions from the previous day

### 2. **Gamification & Progress Tracking**
- **XP System**: Earn 10 XP per completed mission, 2 XP for conscious skips
- **Level Progression**: Five levels with titles:
  - Level 0: Focus Explorer
  - Level 1: Focus Seeker
  - Level 2: Focus Builder
  - Level 3: Focus Architect
  - Level 4: Focus Master
- **Streak Tracking**: Daily streak counter that increments when at least one mission is completed
- **Weekly Momentum**: Visual 7-day momentum graph showing completion patterns

### 3. **Focus Timer**
- **Built-in Timer**: Visual countdown timer with circular progress ring
- **Mission Duration**: Each mission has a 15-25 minute time allocation
- **Start/Pause Controls**: Full timer control for focused work sessions
- **Auto-advance**: Automatically moves to next mission upon completion

### 4. **Reflection System**
- **Post-Mission Reflection**: After completing a mission, users reflect on how it felt:
  - 😊 Good
  - 😐 Neutral
  - 😞 Bad
- **XP Celebration**: Animated XP burst (+10 XP) after reflection

### 5. **Multi-Screen Workflow**
- **Input Screen**: Plan your three missions for the day
- **Plan Screen**: Review your mission plan before starting
- **Focus Screen**: Execute missions with timer and completion tracking
- **Dashboard Screen**: View progress, streaks, XP, and weekly momentum

### 6. **Data Persistence**
- **Chrome Storage Sync**: Uses Chrome's sync storage API for cross-device sync
- **LocalStorage Fallback**: Falls back to localStorage when Chrome APIs unavailable
- **Automatic Daily Reset**: Missions reset at midnight
- **Weekly Reset**: Momentum tracking resets on Mondays

### 7. **Notifications & Background Service**
- **Background Service Worker**: Handles notifications and alarms
- **Chrome Notifications API**: Supports reminder notifications (permissions configured)

---

## UI/UX Description

### Design Philosophy

The extension follows a **minimalist, focused design** that prioritizes clarity and reduces cognitive load. The UI emphasizes:

- **Clean, neutral color palette** with orange accents for primary actions
- **Generous whitespace** for visual breathing room
- **Smooth animations** using Motion (Framer Motion) for delightful interactions
- **Mobile-first responsive design** optimized for the 360x500px popup window

### Visual Design System

#### Color Palette
- **Primary**: Orange (#f97316) - Used for CTAs, progress indicators, and active states
- **Neutral Grays**: Extensive use of neutral-50 to neutral-900 for hierarchy
- **Background**: Gradient from neutral-50 to white for depth
- **Accents**: Blue for level badges, orange for streaks

#### Typography
- **Headings**: Bold, semibold weights for hierarchy
- **Body**: Regular weight, neutral-600/700 for readability
- **Small Text**: 9-11px for labels and metadata
- **Tight Tracking**: `tracking-tight` for headings

#### Components & Patterns

**1. Bottom Tab Navigation**
- Fixed bottom navigation bar with three tabs: Plan, Focus, Dashboard
- Smooth animated active indicator using Motion's `layoutId`
- Icon + label design for clarity
- Backdrop blur effect for modern glass-morphism

**2. Mission Cards**
- Card-based layout with subtle borders and shadows
- Expandable "Why" section with smooth height animations
- Tag pills with color-coded categories
- Duration badges (e.g., "15m", "20m")
- Hover states for interactivity

**3. Timer Interface**
- Large circular progress ring (SVG) with animated stroke
- Center-aligned time display in large, bold numerals
- Gradient progress fill (orange-500 to orange-600)
- Start/Pause button with clear visual feedback

**4. Progress Indicators**
- Horizontal progress bars with gradient fills
- Animated width transitions on state changes
- Shadow effects for depth
- Percentage displays for completion rates

**5. Reflection Modal**
- Full-screen overlay with backdrop blur
- Centered modal with rounded corners
- Three emoji buttons (😊 😐 😞) for quick selection
- Smooth scale and fade animations
- XP burst animation on completion

**6. Dashboard Elements**
- **Streak Pill**: Orange badge with fire emoji (🔥)
- **Level Chip**: Blue badge showing current level
- **Momentum Graph**: 7-day visualization with circular indicators
- **Mission List**: Collapsible list with completion states
- **Encouragement Messages**: Context-aware motivational text

### Interaction Patterns

#### Animations
- **Page Transitions**: Fade and slide animations between screens
- **Staggered Lists**: Sequential animation delays for list items
- **Micro-interactions**: Hover scale effects, active press states
- **Loading States**: Spinner with orange accent during data load

#### Feedback Mechanisms
- **Button States**: Clear hover, active, and disabled states
- **Scale Transitions**: Subtle scale on hover (1.02x) and press (0.98x)
- **Color Transitions**: Smooth color changes on state updates
- **Progress Updates**: Real-time visual feedback on mission completion

#### Navigation Flow

```
Input Screen → Plan Screen → Focus Screen → Dashboard
     ↑                                              ↓
     └──────────────────────────────────────────────┘
```

1. **Input Screen**: User adds up to 3 missions with tags and optional "why"
2. **Plan Screen**: Review missions, see total duration, view streak
3. **Focus Screen**: Execute missions one-by-one with timer
4. **Dashboard**: View overall progress, streaks, momentum, and completion status

### Accessibility Considerations

- **ARIA Labels**: Buttons and interactive elements have descriptive labels
- **Keyboard Navigation**: Tab navigation support
- **Color Contrast**: WCAG-compliant contrast ratios
- **Focus States**: Visible focus indicators on interactive elements
- **Semantic HTML**: Proper heading hierarchy and semantic elements

### Responsive Design

- **Fixed Popup Size**: 360x500px optimized for Chrome extension popup
- **Scrollable Content**: Content area scrolls when needed
- **Fixed Navigation**: Bottom tab bar always visible
- **Touch-Friendly**: Adequate touch targets (minimum 44x44px)

### User Experience Highlights

1. **Onboarding**: Simple, intuitive flow - no complex setup required
2. **Daily Reset**: Automatic reset at midnight prevents decision fatigue
3. **Flexibility**: "Skip" option with small XP reward for conscious choices
4. **Motivation**: Contextual encouragement messages based on progress
5. **Visual Progress**: Multiple progress indicators (XP, level, streak, momentum)
6. **Reflection**: Built-in reflection encourages mindfulness
7. **Persistence**: Data syncs across devices via Chrome sync

---

## Technical Architecture

### Technology Stack
- **Frontend Framework**: React 18.3.1
- **Language**: TypeScript 5.6.3
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS 3.4.14
- **Animations**: Motion (Framer Motion) 11.11.17
- **State Management**: Zustand 4.5.2
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

### Key Files & Structure
- `popup.html` - Extension popup entry point
- `popup.tsx` - React entry point
- `components/ChromeExtensionPopup.tsx` - Main container component
- `components/screens/` - Screen components (Input, Plan, Focus, Dashboard)
- `components/BottomTabBar.tsx` - Navigation component
- `utils/storage.ts` - Storage utilities with Chrome sync support
- `hooks/useLifeOState.ts` - Zustand store for UI state
- `manifest.json` - Chrome extension manifest (v3)
- `public/background.js` - Service worker for notifications

### Data Model

```typescript
interface Mission {
  id: string;
  title: string;
  tag: MissionTag; // "Focus" | "Health" | "Money" | "Admin" | "Relationships"
  duration: number; // 15-25 minutes
  why?: string;
  completed?: boolean;
  completedAt?: Date;
}

interface AppState {
  missions: Mission[];
  xp: number;
  streak: number;
  last7Days: number[]; // Completion counts for Mon-Sun
  currentView: "input" | "plan" | "focus" | "dashboard";
  lastResetDate: string;
  weekStartDate: string; // Monday of current week
}
```

---

## Development & Build

### Development
```bash
npm install
npm run dev  # Web preview only
```

### Building for Chrome Extension
```bash
npm run build  # Creates dist/ folder
```

### Loading in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

---

## Key Differentiators

1. **Constraint-Based Productivity**: Three missions max forces prioritization
2. **Gamification Without Overwhelm**: Simple XP/level system, not complex achievements
3. **Reflection Built-In**: Post-mission reflection encourages mindfulness
4. **Momentum Tracking**: Weekly visualization shows patterns, not just daily wins
5. **Minimalist Design**: Clean, distraction-free interface
6. **Browser Integration**: Always accessible via Chrome toolbar

---

## Future Enhancement Opportunities

- AI-powered mission suggestions
- Integration with calendar apps
- Team/community features
- Advanced analytics and insights
- Custom mission templates
- Export/import functionality
- Dark mode support
- Sound effects for timer completion
- Pomodoro technique integration
