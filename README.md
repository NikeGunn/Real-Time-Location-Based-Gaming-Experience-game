<div align="center">

<!-- App Hero Banner -->
<img src="https://github.com/NikeGunn/imagess/blob/main/Location%20game/GEO%20LOCATION%20GAME.png?raw=true" alt="Location Game - Mobile App Banner" width="100%" style="border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);" />

<!-- App Title & Badges -->
<h1 style="margin-top: 24px; margin-bottom: 8px;">
  🎮 Location Game
  <br />
  <sub>React Native Mobile App</sub>
</h1>

<!-- Technology Badges -->
<p>
  <img src="https://img.shields.io/badge/React%20Native-0.79.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo%20SDK-53-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-FCM-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</p>

<!-- Status Badges -->
<p>
  <img src="https://img.shields.io/badge/Status-Production%20Ready-00C851?style=for-the-badge" alt="Production Ready" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=for-the-badge" alt="Cross Platform" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
</p>

<!-- App Description -->
<h3 style="color: #007AFF; margin-top: 24px; margin-bottom: 16px;">
  🌍 Real-Time Location-Based Gaming Experience
</h3>

<p style="font-size: 18px; line-height: 1.6; max-width: 800px; margin: 0 auto;">
  Battle for control of zones in the real world, claim territories, and compete with other players in an immersive augmented reality experience. Built with React Native, Expo, and TypeScript.
</p>

<!-- Key Features Preview -->
<div style="margin: 32px 0; display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;">
  <div style="text-align: center;">
    <div style="font-size: 48px; margin-bottom: 8px;">🗺️</div>
    <strong>Interactive Map</strong>
    <br />
    <small>Real-time zones</small>
  </div>
  <div style="text-align: center;">
    <div style="font-size: 48px; margin-bottom: 8px;">⚔️</div>
    <strong>Strategic Combat</strong>
    <br />
    <small>Attack & defend</small>
  </div>
  <div style="text-align: center;">
    <div style="font-size: 48px; margin-bottom: 8px;">🏆</div>
    <strong>Leaderboards</strong>
    <br />
    <small>Global rankings</small>
  </div>
  <div style="text-align: center;">
    <div style="font-size: 48px; margin-bottom: 8px;">📱</div>
    <strong>Push Notifications</strong>
    <br />
    <small>Real-time alerts</small>
  </div>
</div>

<!-- Quick Action Buttons -->
<p style="margin: 32px 0;">
  <a href="#-quick-start">
    <img src="https://img.shields.io/badge/🚀%20Quick%20Start-Get%20Started-007AFF?style=for-the-badge&logoColor=white" alt="Quick Start" />
  </a>
  <a href="#-api-integration">
    <img src="https://img.shields.io/badge/🔧%20API%20Docs-Integration-34C759?style=for-the-badge&logoColor=white" alt="API Documentation" />
  </a>
  <a href="#-deployment">
    <img src="https://img.shields.io/badge/🚀%20Deploy-Production-FF9500?style=for-the-badge&logoColor=white" alt="Deployment Guide" />
  </a>
</p>

---

</div>

## 🎨 Design & User Interface

### 📱 Mobile-First Design
Our app features a clean, intuitive interface optimized for mobile gaming with smooth animations and responsive touch interactions.

<div align="center">

| 🗺️ **Interactive Map** | ⚔️ **Battle System** | 📊 **Leaderboards** | 👤 **User Profile** |
|:---:|:---:|:---:|:---:|
| ![Map Screen](assets/screenshots/map-screen.png) | ![Attack Screen](assets/screenshots/attack-screen.png) | ![Leaderboard](assets/screenshots/leaderboard.png) | ![Profile](assets/screenshots/profile.png) |
| Real-time zone visualization with color-coded territories | Strategic battle interface with animated combat | Live rankings and statistics | Progress tracking and achievements |

</div>

### 🎨 Visual Design System

#### Color Palette
```css
🔵 Primary Blue: #007AFF    /* Owned zones, primary actions */
🔴 Enemy Red: #FF3B30       /* Enemy zones, danger actions */
🟢 Success Green: #34C759   /* Success states, claimed zones */
🟡 Warning Orange: #FF9500  /* Warnings, neutral zones */
⚫ Background: #1C1C1E      /* Dark theme background */
⚪ Surface: #2C2C2E         /* Card backgrounds */
🔘 Text Primary: #FFFFFF    /* Primary text */
🔘 Text Secondary: #8E8E93  /* Secondary text */
```

#### Typography
- **Headers**: SF Pro Display (iOS) / Roboto (Android) - Bold
- **Body**: SF Pro Text (iOS) / Roboto (Android) - Regular
- **UI Elements**: System fonts for optimal performance

#### Iconography
- **Zone States**: 🏴 Claimed, ⚔️ Under Attack, 🛡️ Defended
- **Actions**: 📍 Claim, ⚡ Attack, ✅ Check-in
- **Navigation**: 🗺️ Map, 🏆 Leaderboard, 👤 Profile, 🔔 Notifications

### 📱 Screen Designs

#### 🗺️ Map Screen (Primary Interface)
```
┌─────────────────────────┐
│ ◀ Location Game    🔔●  │ ← Header with notifications
├─────────────────────────┤
│                         │
│    🗺️ Interactive Map    │ ← Real-time zone overlay
│   ┌─────┐ ┌─────┐       │
│   │🔵 Z1│ │🔴 Z2│       │ ← Color-coded zones
│   └─────┘ └─────┘       │
│      📍 You              │ ← User location marker
│                         │
├─────────────────────────┤
│ Stats: L5 | 1,250 XP    │ ← User stats overlay
│ Zones: 3 | Nearby: 7    │
└─────────────────────────┘
│ 🗺️ Map | 🏆 Ranks | 👤  │ ← Bottom navigation
└─────────────────────────┘
```

#### ⚔️ Attack Interface
```
┌─────────────────────────┐
│ ◀ Attacking Zone #A5F3  │
├─────────────────────────┤
│    ⚔️ BATTLE ARENA       │
│                         │
│  👤 You (Lv.5)  VS  👤  │ ← Player comparison
│    ⚡ 85 Power      🛡️   │
│                         │
│  📊 Success Rate: 73%   │ ← Battle prediction
│                         │
│  ┌─────────────────────┐ │
│  │   🎯 ATTACK NOW     │ │ ← Primary action
│  └─────────────────────┘ │
├─────────────────────────┤
│ 💰 Potential Reward:    │ ← Reward preview
│ +45 XP, Zone Control    │
└─────────────────────────┘
```

#### 🏆 Leaderboard Design
```
┌─────────────────────────┐
│ 🏆 Global Leaderboard   │
├─────────────────────────┤
│ 📊 XP | 🗺️ Zones | ⚔️   │ ← Category tabs
├─────────────────────────┤
│ 🥇 #1 MasterGamer       │
│    Level 25 • 25,000 XP │
├─────────────────────────┤
│ 🥈 #2 ZoneHunter        │
│    Level 23 • 23,500 XP │
├─────────────────────────┤
│ 🥉 #3 TerritoryKing     │
│    Level 22 • 22,100 XP │
├─────────────────────────┤
│ ⭐ #15 YOU               │ ← User's position
│    Level 5 • 5,250 XP  │
└─────────────────────────┘
```

### 🎭 Animation & Interactions

#### Zone Interactions
- **Pulse Animation**: Available zones gently pulse to indicate interactivity
- **Color Transitions**: Smooth color changes when zone ownership changes
- **Scale Feedback**: Zones scale slightly when tapped for tactile feedback

#### Battle Animations
- **Shake Effect**: Screen shakes during attacks for impact
- **Progress Bars**: Animated health/power bars during combat
- **Particle Effects**: Victory/defeat particles for emotional feedback

#### Navigation Transitions
- **Slide Transitions**: Smooth screen transitions with momentum
- **Modal Animations**: Bottom sheet modals with spring physics
- **Tab Switching**: Quick fade transitions between main tabs

### 📐 Responsive Layout

#### Device Compatibility
```
📱 Phone Sizes:
- iPhone SE (375×667) to iPhone 15 Pro Max (430×932)
- Android phones (360×640) to (412×915)

🖥️ Orientation Support:
- Portrait: Optimized primary experience
- Landscape: Map-focused layout with side panels
```

#### Adaptive Components
- **Zone Size**: Automatically scales based on screen density
- **Touch Targets**: Minimum 44pt tap targets on all devices
- **Text Scaling**: Supports iOS/Android accessibility text sizing
- **Safe Areas**: Respects notches, home indicators, and status bars

### 🌙 Theme Support

#### Dark Mode (Default)
- **Background**: Deep blacks and dark grays
- **Accent Colors**: Vibrant blues and greens for contrast
- **Text**: High contrast whites and light grays

#### Light Mode (Optional)
- **Background**: Clean whites and light grays
- **Accent Colors**: Darker blues and greens
- **Text**: Dark grays and blacks for readability

### ♿ Accessibility Features

#### Visual Accessibility
- **High Contrast**: WCAG AA compliant color combinations
- **Color Independence**: Information not conveyed by color alone
- **Font Scaling**: Supports system font size preferences
- **Reduced Motion**: Respects user's motion preferences

#### Interactive Accessibility
- **Voice Over**: Full screen reader support on iOS
- **TalkBack**: Complete accessibility on Android
- **Semantic Labels**: Descriptive labels for all UI elements
- **Focus Management**: Logical tab order and focus indicators

### 🎮 Game UI Elements

#### Zone Overlay Design
```
Zone States:
🔘 Unclaimed: Gray circle with dashed border
🔵 Owned: Blue filled circle with solid border
🔴 Enemy: Red filled circle with warning icon
⚡ Under Attack: Pulsing red with lightning effect
🛡️ Defended: Blue with shield overlay
```

#### Status Indicators
```
User Status:
📍 Current Location: Blue dot with accuracy circle
⚡ Attack Ready: Green indicator
⏳ Cooldown: Orange timer with countdown
🔄 Syncing: Spinning refresh icon
🚫 Offline: Gray indicator with warning
```

### 📊 Data Visualization

#### Progress Indicators
- **XP Progress**: Circular progress rings with level indicators
- **Zone Control**: Horizontal bars showing territory dominance
- **Attack Success**: Probability meters with color coding
- **Cooldown Timers**: Countdown circles with remaining time

#### Statistics Display
- **Heat Maps**: Zone activity density overlays
- **Trend Charts**: XP gain over time graphs
- **Comparison Bars**: Player vs. opponent statistics
- **Achievement Badges**: Unlockable visual rewards

---

## 🌟 Features

### 🗺️ Core Game Mechanics
- **Zone Claiming**: Capture zones within 20m radius of your physical location
- **Attack System**: Battle other players for zone control with strategic combat mechanics
- **XP & Leveling**: Gain experience points through zone claiming, attacking, and check-ins
- **Zone Expiry**: Zones automatically become available after 24 hours without check-ins
- **Attack Cooldowns**: 30-minute cooldown between attacks for strategic gameplay

### 📱 Mobile Features
- **Real-time Map**: Interactive map showing all zones with live status updates
- **Location-based Gameplay**: GPS integration for authentic location-based gaming
- **Push Notifications**: Real-time alerts for zone attacks, victories, and level-ups
- **Offline Support**: Local data caching with automatic sync when online
- **Cross-platform**: Works on both iOS and Android devices

### 🎯 User Experience
- **Leaderboards**: Multiple ranking categories (XP, zones owned, attack success)
- **Attack History**: Track your battles and see detailed statistics
- **Profile Management**: Monitor your progress, level, and achievements
- **Notification Settings**: Granular control over notification preferences
- **Real-time Updates**: Live zone status changes and game events

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio (for emulators)
- Physical device for location-based features

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd LocationGameApp

# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser
```

### Environment Setup
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your environment variables:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

3. Set up Firebase:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Cloud Messaging (FCM) for push notifications
   - Download and configure Firebase config files

4. Get Google Maps API key:
   - Visit [Google Cloud Console](https://console.cloud.google.com)
   - Enable Maps SDK for Android/iOS
   - Create an API key and add it to your environment

## 🏗️ Architecture

### Tech Stack
- **Framework**: React Native 0.79.3 with Expo SDK 53
- **Language**: TypeScript for type safety
- **State Management**: Zustand with persistence
- **API Layer**: React Query for data fetching and caching
- **Navigation**: React Navigation 7 with bottom tabs and stack navigation
- **Maps**: React Native Maps with custom zone overlays
- **Notifications**: Expo Notifications + Firebase Cloud Messaging
- **Location**: Expo Location with background tracking
- **Storage**: Expo SecureStore for sensitive data

### Project Structure
```
LocationGameApp/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Generic UI components
│   │   └── game/           # Game-specific components
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   ├── services/           # API and external services
│   ├── store/              # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions and constants
├── assets/                 # Images, fonts, and static files
├── .env                    # Environment variables
├── app.config.js          # Expo configuration
└── package.json           # Dependencies and scripts
```

### State Management
- **Auth Store**: User authentication and profile data
- **Game Store**: Zones, attacks, user location, and game state
- **Notification Store**: Push notifications and user preferences

## 🎮 Game Mechanics

### Zone System
- **Grid-based Zones**: World divided into ~100m grid zones
- **Zone States**: Unclaimed (gray), owned (blue), enemy (red)
- **Capture Radius**: Must be within 20 meters to interact
- **Ownership Duration**: 24 hours without check-in = zone expires

### Combat System
- **Attack Success Rate**: Based on attacker/defender levels + zone defense
- **Cooldowns**: 30 minutes between attacks on same zone
- **XP Rewards**: Gain XP for successful attacks and defenses
- **Zone Defense**: Increases over time with check-ins

### Progression System
- **XP Calculation**: 1000 XP per level
- **Sources**: Zone claiming (+50 XP), check-ins (+10-25 XP), attacks (+15-50 XP)
- **Level Benefits**: Higher attack power, better success rates
- **Leaderboards**: XP-based, zone count, attack statistics

## 🔧 API Integration

### Backend Requirements
The app connects to a Django GeoDjango backend. Required endpoints:

#### Authentication
- `POST /auth/login/` - User login with JWT tokens
- `POST /auth/register/` - User registration
- `POST /auth/token/refresh/` - Token refresh
- `POST /auth/push-token/` - Register FCM push token

#### Zones
- `GET /zones/` - Get all zones
- `GET /zones/nearby/` - Get zones near user location
- `POST /zones/{id}/claim/` - Claim a zone
- `POST /zones/{id}/checkin/` - Check into owned zone

#### Attacks
- `POST /attacks/` - Attack a zone
- `GET /attacks/history/` - Get user attack history
- `GET /attacks/stats/` - Get attack statistics

#### Leaderboards
- `GET /leaderboard/` - Get leaderboard rankings
- `GET /leaderboard/stats/` - Get overall game statistics

### Data Flow
1. **Authentication**: JWT tokens stored securely with auto-refresh
2. **Location Updates**: Real-time GPS tracking with privacy controls
3. **Zone Sync**: Automatic zone data refresh every 30 seconds
4. **Push Notifications**: Firebase FCM for real-time game events
5. **Offline Support**: Local caching with conflict resolution

## 📱 Development

### Development Workflow
```bash
# Start development server
npm start

# Run tests
npm test

# Type checking
npx tsc --noEmit

# Lint code
npx eslint app/

# Build for production
npm run build
```

### Testing Location Features
1. **Physical Device**: Best for accurate GPS and real-world testing
2. **Simulator**: Use location simulation for development
3. **Mock Data**: Demo zones and user data available for offline testing

### Debugging
- **Flipper**: Network requests, Redux state, and performance
- **React Native Debugger**: Component inspection and debugging
- **Expo Dev Tools**: Metro bundler and device logs
- **Firebase Console**: Push notification delivery and analytics

## 🚀 Deployment

### Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for development
eas build --platform all --profile development

# Build for production
eas build --platform all --profile production

# Submit to app stores
eas submit --platform all
```

### Environment Configuration
Create environment-specific configurations:

**Development** (`.env.development`):
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

**Production** (`.env.production`):
```env
EXPO_PUBLIC_API_BASE_URL=https://api.locationgame.com/api/v1
```

### Over-the-Air Updates
```bash
# Publish update to development channel
eas update --branch development

# Publish update to production channel
eas update --branch production
```

## 🔐 Security

### Data Protection
- **Secure Storage**: Sensitive data encrypted with Expo SecureStore
- **JWT Tokens**: Automatic refresh with secure storage
- **API Communication**: HTTPS only in production
- **Location Privacy**: User consent required, location data not stored permanently

### Best Practices
- Environment variables for all sensitive configuration
- No hardcoded API keys or secrets in source code
- Secure token handling with automatic expiration
- Input validation and sanitization
- Rate limiting protection for API calls

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the code style guidelines
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- **TypeScript**: Strict mode enabled, all components typed
- **ESLint**: Airbnb configuration with React Native rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Use conventional commit messages

### Testing Guidelines
- Unit tests for utilities and pure functions
- Integration tests for API services
- Component tests for UI interactions
- E2E tests for critical user flows

## 📋 Production Checklist

### Before Release
- [ ] **Environment Variables**: All production values configured
- [ ] **API Integration**: Backend endpoints tested and working
- [ ] **Firebase Setup**: Push notifications configured and tested
- [ ] **Maps Integration**: Google Maps API key configured
- [ ] **App Store Assets**: Icons, screenshots, app store descriptions
- [ ] **Privacy Policy**: Data collection and location usage disclosed
- [ ] **Terms of Service**: Game rules and user agreements
- [ ] **Analytics**: Crash reporting and user analytics configured
- [ ] **Performance**: App tested on low-end devices
- [ ] **Security**: Security audit completed

### Launch Configuration
- [ ] **Production Build**: EAS production build tested
- [ ] **App Store Submission**: iOS App Store and Google Play Store
- [ ] **Backend Deployment**: Production server configured and scaled
- [ ] **CDN Configuration**: Static assets delivered via CDN
- [ ] **Monitoring**: Error tracking and performance monitoring
- [ ] **Backup Strategy**: Database backups and disaster recovery

## 📊 Performance

### Optimization Strategies
- **Map Rendering**: Zone clustering for high-density areas
- **Data Caching**: React Query with optimized cache policies
- **Image Optimization**: Compressed assets and lazy loading
- **Bundle Splitting**: Dynamic imports for large features
- **Location Updates**: Throttled GPS updates to preserve battery

### Monitoring
- **Crash Reporting**: Automated crash detection and reporting
- **Performance Metrics**: App startup time, screen transitions
- **User Analytics**: Feature usage and engagement metrics
- **Network Monitoring**: API response times and error rates

## 🆘 Troubleshooting

### Common Issues

**Location Not Working**:
- Check device location permissions
- Ensure GPS is enabled on device
- Test on physical device (simulators have limited GPS support)

**Push Notifications Not Received**:
- Verify Firebase configuration
- Check notification permissions
- Test with physical device (not Expo Go)

**Map Not Loading**:
- Verify Google Maps API key
- Check network connectivity
- Ensure API key has proper permissions

**Build Failures**:
- Clear Metro cache: `npx expo start --clear`
- Clean node modules: `rm -rf node_modules && npm install`
- Check Expo CLI version: `expo --version`

### Support
- **Documentation**: [Expo Docs](https://docs.expo.dev/)
- **Community**: [Expo Discord](https://discord.gg/expo)
- **Issues**: Create GitHub issues for bugs
- **Feature Requests**: Use GitHub discussions

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the amazing React Native development platform
- **Firebase**: For reliable push notification infrastructure
- **React Navigation**: For smooth navigation experiences
- **Zustand**: For simple and powerful state management
- **React Query**: For intelligent data fetching and caching

---

Built with ❤️ using React Native and Expo. Happy gaming! 🎮
