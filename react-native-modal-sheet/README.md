# React Native Modal Sheet

A performant, gesture-enabled bottom sheet component for React Native using the built-in Modal component. No native dependencies required!

<p align="center">
  <img src="https://img.shields.io/badge/platform-ios%20%7C%20android-lightgrey.svg" alt="Platforms">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/typescript-supported-blue.svg" alt="TypeScript">
</p>

## Features

- 🎯 **Snap Points** - Multi-point snapping with smooth transitions (NEW in v1.1.0!)
- 🎨 **Smooth Animations** - 60fps native-driven animations with transform-based approach
- 🚀 **High Performance** - No layout recalculations, content rendered once
- 🎯 **Zero Native Dependencies** - Built with React Native's Animated API
- 📱 **Cross Platform** - Works on both iOS and Android
- 🎭 **Backdrop Animation** - Independent opacity animation for backdrop
- 👆 **Gesture Support** - Drag to snap or close with intelligent detection
- 🎨 **Fully Customizable** - Customize colors, dimensions, and animations
- 📦 **Lightweight** - Minimal overhead, no external dependencies
- 🎯 **Modern Pressable API** - Uses Pressable for better touch feedback and accessibility
- 🔒 **TypeScript Support** - Full TypeScript definitions included

## Installation

```bash
npm install react-native-modal-sheet
# or
yarn add react-native-modal-sheet
```

## Quick Start

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

## API Reference

### Props

#### Basic Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Content to be rendered inside the bottom sheet |
| `height` | `number` | - | Height of the bottom sheet in pixels (auto-sizes if not provided) |
| `maxHeight` | `number` | 90% of screen | Maximum height constraint for auto-sizing |
| `minHeight` | `number` | `150` | Minimum height constraint for auto-sizing |
| `onClose` | `() => void` | - | Callback when the sheet is closed |
| `onOpen` | `() => void` | - | Callback when the sheet is opened |
| `backgroundColor` | `string` | `'white'` | Background color of the sheet |
| `borderRadius` | `number` | `20` | Border radius of the top corners |
| `showHandle` | `boolean` | `true` | Show the drag handle indicator |
| `handleColor` | `string` | `'#DDD'` | Color of the drag handle |
| `backdropOpacity` | `number` | `0.5` | Opacity of the backdrop (0-1) |
| `dragThreshold` | `number` | `125` | Distance to drag before sheet closes |
| `animationDuration` | `number` | `300` | Animation duration in milliseconds |
| `springDamping` | `number` | `20` | Spring animation damping value |
| `containerStyle` | `ViewStyle` | - | Custom styles for the sheet container |
| `modalProps` | `Partial<ModalProps>` | - | Additional props for the Modal component |

#### Snap Points Props (NEW in v1.1.0)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `snapPoints` | `number[]` | - | Array of snap positions (0-1 for percentage, >1 for pixels). Example: `[0.3, 0.6, 0.9]` |
| `initialSnapIndex` | `number` | `0` | Initial snap point index to open at |
| `enableScrollToExpand` | `boolean` | `false` | Enable scroll-to-expand behavior (expand to next snap on scroll) |
| `onSnapPointChange` | `(index: number) => void` | - | Callback when snap point changes, receives new index |

#### Accessibility Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accessibilityLabel` | `string` | `'Bottom sheet'` | Accessibility label for the modal |
| `accessibilityHint` | `string` | - | Accessibility hint for the modal |
| `backdropAccessibilityLabel` | `string` | `'Close bottom sheet'` | Accessibility label for the backdrop |
| `handleAccessibilityLabel` | `string` | `'Drag to close'` | Accessibility label for the drag handle |
| `handleAccessibilityHint` | `string` | `'Double tap to close, or drag down'` | Accessibility hint for the drag handle |
| `openAccessibilityAnnouncement` | `string` | `'Bottom sheet opened'` | Announcement when sheet opens |
| `closeAccessibilityAnnouncement` | `string` | `'Bottom sheet closed'` | Announcement when sheet closes |
| `autoFocus` | `boolean` | `true` | Whether to focus on sheet content when opened |
| `accessibilityLiveRegion` | `'none' \| 'polite' \| 'assertive'` | `'polite'` | Live region setting for announcements |
| `sheetAccessibilityProps` | `object` | `{}` | Additional accessibility props for the sheet container |

### Methods (via ref)

| Method | Description |
|--------|-------------|
| `open()` | Opens the bottom sheet |
| `close()` | Closes the bottom sheet |
| `present()` | Alias for `open()` |
| `dismiss()` | Alias for `close()` |
| `snapToPoint(index)` | Snap to a specific snap point by index (NEW in v1.1.0) |

## Examples

### Snap Points (NEW in v1.1.0)

Snap points allow your bottom sheet to snap to predefined heights, similar to Apple Maps or Spotify's player.

```tsx
import React, { useRef, useState } from 'react';
import { Button, Text, View, StyleSheet, ScrollView } from 'react-native';
import ModalSheet, { ModalSheetRef } from 'react-native-modal-sheet';

function SnapPointsExample() {
  const sheetRef = useRef<ModalSheetRef>(null);
  const [currentSnap, setCurrentSnap] = useState(0);

  return (
    <View style={styles.container}>
      <Button title="Open Sheet" onPress={() => sheetRef.current?.open()} />

      <ModalSheet
        ref={sheetRef}
        snapPoints={[0.3, 0.6, 0.9]}  // 30%, 60%, 90% of screen height
        initialSnapIndex={0}
        onSnapPointChange={(index) => setCurrentSnap(index)}
        onClose={() => console.log('Sheet closed')}
      >
        <ScrollView showsVerticalScrollIndicator={false}> 
          <Text style={styles.title}>Snap Points Demo</Text>
          <Text style={styles.subtitle}>
            Currently at: {currentSnap === 0 ? 'Small (30%)' : currentSnap === 1 ? 'Medium (60%)' : 'Large (90%)'}
          </Text>

          <View style={styles.buttonRow}>
            <Button title="Small" onPress={() => sheetRef.current?.snapToPoint(0)} />
            <Button title="Medium" onPress={() => sheetRef.current?.snapToPoint(1)} />
            <Button title="Large" onPress={() => sheetRef.current?.snapToPoint(2)} />
          </View>

          {/* Add your content here */}
          <Text style={styles.content}>
            Drag the sheet up or down to snap between different heights!
            The sheet will automatically snap to the nearest point.
          </Text>
        </ScrollView>
      </ModalSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    padding: 20,
  },
});
```

#### Snap Points with Absolute Pixels

```tsx
<ModalSheet
  ref={sheetRef}
  snapPoints={[300, 600, 900]}  // Absolute pixel values
  initialSnapIndex={1}  // Start at 600px
>
  {/* Your content */}
</ModalSheet>
```

#### Music Player Example (Instagram/Spotify Style)

```tsx
function MusicPlayerSheet() {
  const sheetRef = useRef<ModalSheetRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <ModalSheet
      ref={sheetRef}
      snapPoints={[0.15, 0.5, 0.95]}  // Mini player, half screen, full screen
      initialSnapIndex={0}
      backgroundColor="#1a1a1a"
      handleColor="#666"
    >
      <View style={{ padding: 20 }}>
        {/* Mini player view at 15% */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={albumArt} style={{ width: 50, height: 50, borderRadius: 8 }} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Song Title</Text>
            <Text style={{ color: '#999', fontSize: 14 }}>Artist Name</Text>
          </View>
          <Button title={isPlaying ? '⏸' : '▶️'} onPress={() => setIsPlaying(!isPlaying)} />
        </View>

        {/* Full player controls shown at higher snap points */}
        <View style={{ marginTop: 40 }}>
          <Text style={{ color: 'white' }}>Progress bar, lyrics, etc.</Text>
        </View>
      </View>
    </ModalSheet>
  );
}
```

### Basic Usage

```tsx
import React, { useRef } from 'react';
import { Button, Text, View, StyleSheet, Pressable } from 'react-native';
import ModalSheet, { ModalSheetRef } from 'react-native-modal-sheet';

function BasicExample() {
  const sheetRef = useRef<ModalSheetRef>(null);

  return (
    <View style={styles.container}>
      <Button title="Open Sheet" onPress={() => sheetRef.current?.open()} />
      
      <ModalSheet ref={sheetRef} height={300}>
        <View style={styles.content}>
          <Text style={styles.title}>Basic Bottom Sheet</Text>
          <Pressable 
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={() => sheetRef.current?.close()}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </ModalSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

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

### Form Example

```tsx
import { TextInput, Pressable } from 'react-native';

<ModalSheet ref={sheetRef} height={400}>
  <View style={{ padding: 20 }}>
    <Text style={styles.title}>Contact Form</Text>
    
    <TextInput
      style={styles.input}
      placeholder="Name"
      placeholderTextColor="#999"
    />
    
    <TextInput
      style={styles.input}
      placeholder="Email"
      keyboardType="email-address"
      placeholderTextColor="#999"
    />
    
    <TextInput
      style={[styles.input, { height: 100 }]}
      placeholder="Message"
      multiline
      textAlignVertical="top"
      placeholderTextColor="#999"
    />
    
    <Pressable 
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.8 : 1 }
      ]}
    >
      <Text style={styles.buttonText}>Submit</Text>
    </Pressable>
  </View>
</ModalSheet>
```

### Action Sheet Style

```tsx
<ModalSheet 
  ref={sheetRef} 
  height={300}
  dragThreshold={50}
  animationDuration={250}
>
  <View style={{ padding: 20 }}>
    <Pressable 
      style={({ pressed }) => [
        styles.actionButton,
        { opacity: pressed ? 0.8 : 1 }
      ]}
    >
      <Text>Share</Text>
    </Pressable>
    <Pressable 
      style={({ pressed }) => [
        styles.actionButton,
        { opacity: pressed ? 0.8 : 1 }
      ]}
    >
      <Text>Edit</Text>
    </Pressable>
    <Pressable 
      style={({ pressed }) => [
        styles.actionButton, 
        styles.deleteButton,
        { opacity: pressed ? 0.8 : 1 }
      ]}
    >
      <Text style={{ color: 'red' }}>Delete</Text>
    </Pressable>
  </View>
</ModalSheet>
```

## Advanced Usage

### Controlled State

```tsx
function ControlledExample() {
  const sheetRef = useRef<ModalSheetRef>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    sheetRef.current?.open();
  };

  const handleClose = () => {
    setIsOpen(false);
    sheetRef.current?.close();
  };

  return (
    <View>
      <Text>Sheet is {isOpen ? 'open' : 'closed'}</Text>
      <Button title="Toggle" onPress={isOpen ? handleClose : handleOpen} />
      
      <ModalSheet
        ref={sheetRef}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
      >
        <Text>Controlled Sheet</Text>
      </ModalSheet>
    </View>
  );
}
```

### Dynamic Height

```tsx
function DynamicHeightExample() {
  const sheetRef = useRef<ModalSheetRef>(null);
  const [sheetHeight, setSheetHeight] = useState(300);

  return (
    <View>
      <Button title="Small (300px)" onPress={() => setSheetHeight(300)} />
      <Button title="Medium (500px)" onPress={() => setSheetHeight(500)} />
      <Button title="Large (700px)" onPress={() => setSheetHeight(700)} />
      
      <ModalSheet ref={sheetRef} height={sheetHeight}>
        <Text>Height: {sheetHeight}px</Text>
      </ModalSheet>
    </View>
  );
}
```

### With Keyboard

```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<ModalSheet ref={sheetRef} height={400}>
  <KeyboardAvoidingView 
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
  >
    <TextInput placeholder="Type here..." />
  </KeyboardAvoidingView>
</ModalSheet>
```

## Styling Guide

### Custom Handle

```tsx
<ModalSheet
  ref={sheetRef}
  showHandle={false}
  containerStyle={{ paddingTop: 0 }}
>
  <View style={customHandleStyles.handle}>
    <View style={customHandleStyles.handleBar} />
    <Text style={customHandleStyles.handleText}>Swipe down to close</Text>
  </View>
  {/* Your content */}
</ModalSheet>
```

### Gradient Background

```tsx
import LinearGradient from 'react-native-linear-gradient';

<ModalSheet ref={sheetRef} backgroundColor="transparent">
  <LinearGradient
    colors={['#4c669f', '#3b5998', '#192f6a']}
    style={{ flex: 1, borderRadius: 20 }}
  >
    {/* Your content */}
  </LinearGradient>
</ModalSheet>
```

## Performance Tips

1. **Avoid Heavy Computations**: Keep render methods lightweight
2. **Use React.memo**: Memoize child components when possible
3. **Optimize Lists**: Use FlatList for long scrollable content
4. **Lazy Load Content**: Load heavy content after sheet opens

```tsx
function OptimizedSheet() {
  const sheetRef = useRef<ModalSheetRef>(null);
  const [content, setContent] = useState(null);

  return (
    <ModalSheet 
      ref={sheetRef}
      onOpen={() => {
        // Load heavy content after opening
        loadHeavyContent().then(setContent);
      }}
      onClose={() => setContent(null)}
    >
      {content ? <HeavyComponent data={content} /> : <LoadingSpinner />}
    </ModalSheet>
  );
}
```

## Accessibility

The component is **fully accessible** and follows WCAG guidelines. It includes comprehensive accessibility support out of the box.

### Built-in Accessibility Features

- ✅ **Screen Reader Support** - Proper labeling and hints for all interactive elements
- ✅ **Voice Announcements** - Announces when sheet opens/closes
- ✅ **Focus Management** - Handles focus correctly when modal appears
- ✅ **Semantic Roles** - Uses proper ARIA roles (dialog, button)
- ✅ **Gesture Alternatives** - Touch alternatives for drag gestures
- ✅ **Live Regions** - Updates are announced to screen readers
- ✅ **Modal Behavior** - Proper modal accessibility with backdrop handling

### Default Accessibility Configuration

```tsx
// These are applied automatically
<ModalSheet
  accessibilityLabel="Bottom sheet"
  backdropAccessibilityLabel="Close bottom sheet"
  handleAccessibilityLabel="Drag to close"
  handleAccessibilityHint="Double tap to close, or drag down"
  openAccessibilityAnnouncement="Bottom sheet opened"
  closeAccessibilityAnnouncement="Bottom sheet closed"
  accessibilityLiveRegion="polite"
>
  {/* Your content */}
</ModalSheet>
```

### Custom Accessibility Labels

```tsx
<ModalSheet
  ref={sheetRef}
  accessibilityLabel="Settings menu"
  accessibilityHint="Contains app settings and preferences"
  backdropAccessibilityLabel="Close settings menu"
  openAccessibilityAnnouncement="Settings menu opened"
  closeAccessibilityAnnouncement="Settings menu closed"
>
  <Text accessibilityRole="header">Settings</Text>
  {/* Settings content */}
</ModalSheet>
```

### Advanced Accessibility Configuration

```tsx
<ModalSheet
  ref={sheetRef}
  accessibilityLiveRegion="assertive"  // For important announcements
  sheetAccessibilityProps={{
    accessibilityRole: "menu",
    accessibilityState: { expanded: true },
    importantForAccessibility: "yes"
  }}
  handleAccessibilityLabel="Close button"
  autoFocus={true}
>
  {/* Content with proper accessibility */}
  <TouchableOpacity 
    accessibilityRole="menuitem"
    accessibilityLabel="Profile settings"
  >
    <Text>Profile</Text>
  </TouchableOpacity>
</ModalSheet>
```

### Accessibility Best Practices

#### 1. Use Semantic Content

```tsx
<ModalSheet ref={sheetRef} accessibilityLabel="User profile options">
  <Text accessibilityRole="header" style={styles.title}>
    Profile Options
  </Text>
  
  <Pressable 
    style={({ pressed }) => [
      styles.menuItem,
      { backgroundColor: pressed ? '#F2F2F7' : 'transparent' }
    ]}
    accessibilityRole="button"
    accessibilityLabel="Edit profile information"
    accessibilityHint="Opens profile editing screen"
  >
    <Text>Edit Profile</Text>
  </Pressable>
  
  <Pressable 
    style={({ pressed }) => [
      styles.menuItem,
      { backgroundColor: pressed ? '#F2F2F7' : 'transparent' }
    ]}
    accessibilityRole="button"
    accessibilityLabel="Account settings"
  >
    <Text>Settings</Text>
  </Pressable>
</ModalSheet>
```

#### 2. Form Accessibility

```tsx
<ModalSheet 
  ref={sheetRef}
  accessibilityLabel="Contact form"
  closeAccessibilityAnnouncement="Contact form closed"
>
  <Text accessibilityRole="header">Contact Us</Text>
  
  <TextInput
    accessibilityLabel="Your name"
    accessibilityHint="Enter your full name"
    placeholder="Name"
  />
  
  <TextInput
    accessibilityLabel="Email address"
    accessibilityHint="Enter a valid email address"
    keyboardType="email-address"
    placeholder="Email"
  />
  
  <Pressable 
    style={({ pressed }) => [
      styles.submitButton,
      { opacity: pressed ? 0.8 : 1 }
    ]}
    accessibilityRole="button"
    accessibilityLabel="Submit form"
    accessibilityHint="Sends your message"
  >
    <Text>Send Message</Text>
  </Pressable>
</ModalSheet>
```

#### 3. List/Menu Accessibility

```tsx
<ModalSheet 
  ref={sheetRef}
  accessibilityLabel="Country selection"
  sheetAccessibilityProps={{
    accessibilityRole: "menu"
  }}
>
  <Text accessibilityRole="header">Select Country</Text>
  
  <ScrollView showsVerticalScrollIndicator={false}>
    {countries.map((country) => (
      <Pressable
        key={country.code}
        style={({ pressed }) => [
          styles.countryItem,
          { backgroundColor: pressed ? '#F2F2F7' : 'transparent' }
        ]}
        accessibilityRole="menuitem"
        accessibilityLabel={`Select ${country.name}`}
        accessibilityHint={`Country code ${country.code}`}
      >
        <Text>{country.name}</Text>
      </Pressable>
    ))}
  </ScrollView>
</ModalSheet>
```

### Testing Accessibility

#### iOS (VoiceOver)
1. Enable VoiceOver in Settings > Accessibility
2. Navigate through the sheet using swipe gestures
3. Verify all elements are announced correctly
4. Test double-tap gestures on interactive elements

#### Android (TalkBack)
1. Enable TalkBack in Settings > Accessibility
2. Use explore-by-touch to navigate
3. Verify semantic roles and labels
4. Test gesture alternatives

### Accessibility Props Reference

```tsx
// Complete accessibility interface
interface ModalSheetAccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  backdropAccessibilityLabel?: string;
  handleAccessibilityLabel?: string;
  handleAccessibilityHint?: string;
  openAccessibilityAnnouncement?: string;
  closeAccessibilityAnnouncement?: string;
  autoFocus?: boolean;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  sheetAccessibilityProps?: {
    accessibilityRole?: string;
    accessibilityState?: any;
    importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  };
}
```

## Troubleshooting

### Sheet not showing
- Ensure you're calling `ref.current?.open()`
- Check that the ref is properly attached
- Verify the sheet has content and height

### Gesture not working
- Ensure no conflicting gesture handlers
- Check `dragThreshold` value
- Verify touch events aren't blocked

### Performance issues
- Reduce animation complexity
- Use `useNativeDriver: true` (already enabled)
- Optimize child component renders

## Contributing

Contributions are welcome! Please read our [contributing guidelines](https://github.com/christi10/ModalSheet/blob/main/.github/CONTRIBUTING.md) first.

## Support

If you find this package helpful, consider supporting its development:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-☕-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/christi10)

Your support helps maintain and improve this package!

## License

MIT © [Christian]

---

Made with ❤️ using React Native
