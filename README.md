# ModalSheet Demo App

A React Native Expo app demonstrating the powerful **React Native Modal Sheet** component with multiple examples and interactive demos.

<p align="center">
  <img src="https://img.shields.io/badge/platform-ios%20%7C%20android-lightgrey.svg" alt="Platforms">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/typescript-supported-blue.svg" alt="TypeScript">
</p>

## 🚀 Features

- 🎨 **Smooth Animations** - Gesture-driven animations with spring physics
- 📍 **Snap Points** - Multiple snap points with percentage-based heights
- 🎯 **Zero Native Dependencies** - Built with React Native's Animated API
- 📱 **Cross Platform** - Works on both iOS and Android
- 🎭 **Backdrop Animation** - Independent opacity animation for backdrop
- 👆 **Gesture Support** - Drag to close with customizable threshold
- ⬆️ **Swipe Between Heights** - Swipe up/down to snap between different heights
- 🎨 **Fully Customizable** - Customize colors, dimensions, and animations
- 📦 **Lightweight** - Minimal overhead, no external dependencies
- 🎯 **Modern Pressable API** - Uses Pressable for better touch feedback and accessibility
- 🔒 **TypeScript Support** - Full TypeScript definitions included

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your device (iOS/Android)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/christi10/ModalSheet.git
cd ModalSheet
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npx expo start
```

4. **Run on your device**
   - **iOS**: Press `i` in terminal or scan QR code with Camera app
   - **Android**: Press `a` in terminal or scan QR code with Expo Go app

## 📱 Usage

The app includes three main sections:

### 🏠 Home Tab
- Welcome screen introducing ModalSheet
- Feature overview
- Quick navigation to examples

### 📋 Examples Tab
Interactive demonstrations of different modal sheet types:
- **Action Buttons** (300px) - Share, save, delete actions
- **Form Input** (450px) - Contact form with text inputs
- **Scrollable List** (600px) - Country selection with scrollable content
- **Large Content** (700px) - Terms of service with long text
- **Small Sheet** (200px) - Quick settings with icon buttons

### ℹ️ Explore Tab
- Detailed information about bottom sheet features
- Component capabilities overview

## 🔧 React Native Modal Sheet API

This app demonstrates the `react-native-modal-sheet` component with the following features:

### Basic Usage

```tsx
import React, { useRef } from 'react';
import { Button, Text, View } from 'react-native';
import ModalSheet, { ModalSheetRef } from 'react-native-modal-sheet';

function App() {
  const sheetRef = useRef<ModalSheetRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <Button title="Open Sheet" onPress={() => sheetRef.current?.open()} />

      <ModalSheet ref={sheetRef} height={400}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
          Hello Bottom Sheet! 👋
        </Text>
      </ModalSheet>
    </View>
  );
}
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Content to be rendered inside the bottom sheet |
| `height` | `number` | `400` | Height of the bottom sheet in pixels (ignored if snapPoints provided) |
| `snapPoints` | `number[]` | - | Snap points as percentages of screen height (e.g., [25, 50, 90]) |
| `initialSnapPointIndex` | `number` | `0` | Initial snap point index to open to |
| `enableSnapping` | `boolean` | `true` | Enable snapping between points |
| `onSnapPointChange` | `(index, snapPoint) => void` | - | Callback when snap point changes |
| `onClose` | `() => void` | - | Callback when the sheet is closed |
| `onOpen` | `() => void` | - | Callback when the sheet is opened |
| `backgroundColor` | `string` | `'white'` | Background color of the sheet |
| `borderRadius` | `number` | `20` | Border radius of the top corners |
| `showHandle` | `boolean` | `true` | Show the drag handle indicator |
| `handleColor` | `string` | `'#DDD'` | Color of the drag handle |
| `backdropOpacity` | `number` | `0.5` | Opacity of the backdrop (0-1) |
| `dragThreshold` | `number` | `125` | Distance to drag before sheet closes |

### Methods (via ref)

| Method | Description |
|--------|-------------|
| `open()` | Opens the bottom sheet |
| `close()` | Closes the bottom sheet |
| `snapToPoint(index)` | Programmatically snap to a specific snap point by index |

## 🎨 Customization Examples

### Custom Styling

```tsx
<ModalSheet
  ref={sheetRef}
  height={500}
  backgroundColor="#1a1a1a"
  borderRadius={30}
  handleColor="#666"
  backdropOpacity={0.8}
>
  <Text style={{ color: 'white' }}>Dark Theme Sheet</Text>
</ModalSheet>
```

### With Snap Points

```tsx
import { useRef, useState } from 'react';

function App() {
  const sheetRef = useRef<ModalSheetRef>(null);
  const [currentSnap, setCurrentSnap] = useState(25);

  return (
    <>
      <Button title="Open" onPress={() => sheetRef.current?.open()} />
      <Button title="Expand" onPress={() => sheetRef.current?.snapToPoint(2)} />

      <ModalSheet
        ref={sheetRef}
        snapPoints={[25, 50, 90]}
        initialSnapPointIndex={0}
        onSnapPointChange={(index, snapPoint) => {
          setCurrentSnap(snapPoint);
          console.log(`Now at ${snapPoint}%`);
        }}
      >
        <Text>Current height: {currentSnap}%</Text>
        <Text>Swipe up or down to change!</Text>
      </ModalSheet>
    </>
  );
}
```

### With Scrollable Content

```tsx
import { ScrollView } from 'react-native';

<ModalSheet ref={sheetRef} height={600}>
  <ScrollView>
    {[...Array(50)].map((_, i) => (
      <Text key={i} style={{ padding: 20 }}>Item {i + 1}</Text>
    ))}
  </ScrollView>
</ModalSheet>
```

## 🔒 Accessibility

The ModalSheet component is **fully accessible** and follows WCAG guidelines:

- ✅ **Screen Reader Support** - Proper labeling and hints for all interactive elements
- ✅ **Voice Announcements** - Announces when sheet opens/closes
- ✅ **Focus Management** - Handles focus correctly when modal appears
- ✅ **Semantic Roles** - Uses proper ARIA roles (dialog, button)
- ✅ **Gesture Alternatives** - Touch alternatives for drag gestures

## 🚀 Performance

- **Lightweight**: No external dependencies, minimal overhead
- **Smooth Animations**: 60fps animations using React Native's Animated API
- **Optimized Rendering**: Efficient re-renders and memory management

## 🛠️ Development

### Project Structure

```
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── _layout.tsx    # Tab navigator setup
│   │   ├── examples.tsx   # Modal sheet examples
│   │   ├── explore.tsx    # Info screen
│   │   └── index.tsx      # Home screen
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # App entry point
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── themed-text.tsx   # Themed text component
│   └── haptic-tab.tsx    # Tab with haptic feedback
├── constants/            # App constants
├── hooks/               # Custom hooks
├── assets/              # Images and icons
└── react-native-modal-sheet/  # Modal sheet source code
```

### Available Scripts

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Build for production
npx expo build
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](.github/CONTRIBUTING.md) before submitting pull requests.

## ☕ Support

If you find this project helpful, consider supporting its development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-☕-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/christi10)

Your support helps maintain and improve this project!

## 📄 License

MIT © Christian

---

**Made with ❤️ using React Native & Expo**
