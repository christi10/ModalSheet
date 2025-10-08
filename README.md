# ModalSheet Demo App

A React Native Expo app demonstrating the powerful **React Native Modal Sheet** component with multiple examples and interactive demos.

<p align="center">
  <img src="https://img.shields.io/badge/platform-ios%20%7C%20android-lightgrey.svg" alt="Platforms">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/typescript-supported-blue.svg" alt="TypeScript">
</p>

## 🚀 Features

- 🎨 **Smooth Animations** - Buttery smooth bezier easing with 60fps performance
- 🎯 **Snap Points** - Multiple snap positions with intelligent detection
- 📜 **Scroll-to-Expand** - Automatically expand to next snap point while scrolling
- 👆 **Pull-to-Collapse** - Pull down at the top to collapse or close
- 🎯 **Zero Native Dependencies** - Built with React Native's Animated API
- 📱 **Cross Platform** - Works on both iOS and Android
- 🎭 **Backdrop Animation** - Independent opacity animation for backdrop
- 👆 **Gesture Support** - Drag to close with customizable threshold
- 🎨 **Fully Customizable** - Customize colors, dimensions, and animations
- 📦 **Lightweight** - Minimal overhead, no external dependencies
- ♿ **ARIA Compliant** - Full accessibility support with ARIA attributes
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
- **Drag & Drop List** (550px) - Interactive draggable list
- **Dynamic Sizing** - Auto-sized sheets based on content
- **Snap Points - 3 Points** - Small (30%), Medium (60%), Large (90%) with scroll-to-expand
- **Snap Points - 2 Points** - Small (30%), Large (90%) simplified example

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
| `height` | `number` | `400` | Height of the bottom sheet in pixels |
| `snapPoints` | `number[]` | - | Array of snap points as percentages (0-1) or pixels |
| `initialSnapIndex` | `number` | `0` | Which snap point to open to initially |
| `enableScrollToExpand` | `boolean` | `true` | Enable scroll-to-expand behavior |
| `scrollExpandThreshold` | `number` | `50` | Pixels to scroll before triggering transition |
| `onSnapPointChange` | `(index: number) => void` | - | Callback when snap point changes |
| `onClose` | `() => void` | - | Callback when the sheet is closed |
| `onOpen` | `() => void` | - | Callback when the sheet is opened |
| `backgroundColor` | `string` | `'white'` | Background color of the sheet |
| `borderRadius` | `number` | `20` | Border radius of the top corners |
| `showHandle` | `boolean` | `true` | Show the drag handle indicator |
| `handleColor` | `string` | `'#DDD'` | Color of the drag handle |
| `backdropOpacity` | `number` | `0.5` | Opacity of the backdrop (0-1) |
| `dragThreshold` | `number` | `125` | Distance to drag before sheet closes |
| `aria-label` | `string` | `'Bottom sheet'` | Accessible label for the modal |
| `aria-describedby` | `string` | - | ID of element describing the modal |
| `backdropAriaLabel` | `string` | `'Close bottom sheet'` | Accessible label for backdrop |

### Methods (via ref)

| Method | Description |
|--------|-------------|
| `open()` | Opens the bottom sheet |
| `close()` | Closes the bottom sheet |
| `present()` | Alias for `open()` |
| `dismiss()` | Alias for `close()` |
| `snapToPoint(index)` | Snap to a specific snap point by index |
| `handleScroll(event)` | Process scroll events for scroll-to-expand |
| `handleScrollBeginDrag(event)` | Track scroll start position |
| `handleScrollEndDrag(event)` | Handle pull-to-collapse gestures |

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

function MyComponent() {
  const sheetRef = useRef<ModalSheetRef>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <ModalSheet
      ref={sheetRef}
      snapPoints={[0.3, 0.6, 0.9]} // 30%, 60%, 90% of screen height
      initialSnapIndex={0}
      onSnapPointChange={(index) => setCurrentIndex(index)}
    >
      <Text>Current snap point: {currentIndex}</Text>
    </ModalSheet>
  );
}
```

### With Scroll-to-Expand

```tsx
import { ScrollView } from 'react-native';

<ModalSheet
  ref={sheetRef}
  snapPoints={[0.3, 0.9]}
  enableScrollToExpand={true}
  scrollExpandThreshold={20}
>
  <ScrollView
    onScroll={(e) => sheetRef.current?.handleScroll(e)}
    onScrollBeginDrag={(e) => sheetRef.current?.handleScrollBeginDrag(e)}
    onScrollEndDrag={(e) => sheetRef.current?.handleScrollEndDrag(e)}
    scrollEventThrottle={16}
  >
    {/* Your scrollable content */}
  </ScrollView>
</ModalSheet>
```

### With Scrollable Content

```tsx
import { ScrollView } from 'react-native';

<ModalSheet ref={sheetRef} height={600}>
  <ScrollView showsVerticalScrollIndicator={false}>
    {[...Array(50)].map((_, i) => (
      <Text key={i} style={{ padding: 20 }}>Item {i + 1}</Text>
    ))}
  </ScrollView>
</ModalSheet>
```

## 🔒 Accessibility

The ModalSheet component is **fully accessible** and follows WCAG guidelines:

- ✅ **ARIA Attributes** - Modern `aria-label`, `aria-modal`, `aria-describedby` support
- ✅ **Screen Reader Support** - Proper labeling and hints for all interactive elements
- ✅ **Voice Announcements** - Announces when sheet opens/closes
- ✅ **Focus Management** - Handles focus correctly when modal appears
- ✅ **Semantic Roles** - Uses proper ARIA roles (dialog, button)
- ✅ **Gesture Alternatives** - Touch alternatives for drag gestures

## 🚀 Performance

- **Transform-Based**: Uses `translateY` transforms instead of height changes
- **Native Driver**: All animations run on the UI thread at 60fps
- **Smooth Easing**: Custom bezier curve (0.25, 0.1, 0.25, 1) for natural feel
- **No Layout Recalculations**: Content pre-rendered once, just repositioned
- **Optimized Rendering**: Efficient re-renders and memory management
- **Lightweight**: No external dependencies, minimal overhead

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

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-☕-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/kareemtab)

Your support helps maintain and improve this project!

## 📄 License

MIT © Christian

---

**Made with ❤️ using React Native & Expo**
