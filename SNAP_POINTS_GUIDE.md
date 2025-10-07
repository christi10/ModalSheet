# Snap Points Guide

## Overview

Snap points allow your modal sheet to snap to predefined heights as a percentage of the screen height. Users can swipe up or down to transition between different snap points, creating a more dynamic and interactive bottom sheet experience.

## Features

- **Percentage-based heights**: Define snap points as percentages (0-100) of screen height
- **Multiple snap points**: Support for unlimited snap points
- **Smooth animations**: Spring-based animations between snap points
- **Gesture-driven**: Intuitive swipe up/down gestures to change snap points
- **Programmatic control**: Change snap points programmatically via ref methods
- **Callbacks**: Get notified when snap points change
- **Backward compatible**: Works alongside traditional fixed height mode

## Basic Usage

```tsx
import React, { useRef } from 'react';
import { View, Text, Button } from 'react-native';
import ModalSheet, { ModalSheetRef } from 'rn-modal-bottom-sheet';

function App() {
  const sheetRef = useRef<ModalSheetRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <Button title="Open Sheet" onPress={() => sheetRef.current?.open()} />

      <ModalSheet
        ref={sheetRef}
        snapPoints={[25, 50, 90]}
        initialSnapPointIndex={0}
      >
        <Text>Swipe up or down to change snap points!</Text>
      </ModalSheet>
    </View>
  );
}
```

## Props

### snapPoints

**Type:** `number[]`
**Optional**
**Example:** `[25, 50, 90]`

An array of snap points as percentages of screen height (0-100). The modal will snap to these heights when swiped or controlled programmatically.

- Values are automatically sorted from smallest to largest
- Values outside 0-100 range are filtered out
- If not provided, the modal uses the traditional `height` prop behavior

```tsx
<ModalSheet snapPoints={[30, 60, 95]} />
```

### initialSnapPointIndex

**Type:** `number`
**Default:** `0`

The index of the snap point to open to initially. Must be a valid index within the `snapPoints` array.

```tsx
// Opens to 50% (index 1)
<ModalSheet
  snapPoints={[25, 50, 90]}
  initialSnapPointIndex={1}
/>
```

### enableSnapping

**Type:** `boolean`
**Default:** `true` (when snapPoints are provided)

Enable or disable snapping behavior. When disabled, the modal behaves like a traditional fixed-height bottom sheet even with snap points defined.

```tsx
<ModalSheet
  snapPoints={[25, 50, 90]}
  enableSnapping={false}
/>
```

### onSnapPointChange

**Type:** `(index: number, snapPoint: number) => void`
**Optional**

Callback fired when the modal snaps to a new point.

- `index`: The array index of the new snap point
- `snapPoint`: The percentage value of the snap point

```tsx
<ModalSheet
  snapPoints={[25, 50, 90]}
  onSnapPointChange={(index, snapPoint) => {
    console.log(`Snapped to ${snapPoint}% (index ${index})`);
  }}
/>
```

## Ref Methods

### snapToPoint(index: number)

Programmatically snap to a specific snap point by its index.

```tsx
const sheetRef = useRef<ModalSheetRef>(null);

// Snap to the third snap point (90% in this example)
sheetRef.current?.snapToPoint(2);
```

**Parameters:**
- `index`: The zero-based index of the snap point in your snapPoints array

**Example:**

```tsx
function MyComponent() {
  const sheetRef = useRef<ModalSheetRef>(null);

  return (
    <>
      <Button
        title="Expand to Full"
        onPress={() => sheetRef.current?.snapToPoint(2)}
      />
      <Button
        title="Collapse to Peek"
        onPress={() => sheetRef.current?.snapToPoint(0)}
      />

      <ModalSheet ref={sheetRef} snapPoints={[25, 50, 90]}>
        <Text>Content</Text>
      </ModalSheet>
    </>
  );
}
```

## Complete Example

```tsx
import React, { useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import ModalSheet, { ModalSheetRef } from 'rn-modal-bottom-sheet';

export default function SnapPointsDemo() {
  const sheetRef = useRef<ModalSheetRef>(null);
  const [currentPosition, setCurrentPosition] = useState('Closed');

  const snapPointLabels = ['Peek (25%)', 'Half (50%)', 'Full (90%)'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snap Points Demo</Text>
      <Text style={styles.status}>Status: {currentPosition}</Text>

      <Button
        title="Open Sheet"
        onPress={() => sheetRef.current?.open()}
      />

      <View style={styles.controls}>
        <Button
          title="Peek View"
          onPress={() => sheetRef.current?.snapToPoint(0)}
        />
        <Button
          title="Half View"
          onPress={() => sheetRef.current?.snapToPoint(1)}
        />
        <Button
          title="Full View"
          onPress={() => sheetRef.current?.snapToPoint(2)}
        />
      </View>

      <ModalSheet
        ref={sheetRef}
        snapPoints={[25, 50, 90]}
        initialSnapPointIndex={1}
        onOpen={() => setCurrentPosition('Half (50%)')}
        onClose={() => setCurrentPosition('Closed')}
        onSnapPointChange={(index, snapPoint) => {
          setCurrentPosition(snapPointLabels[index]);
        }}
        backgroundColor="#FFFFFF"
        borderRadius={20}
      >
        <ScrollView>
          <Text style={styles.sheetTitle}>Interactive Snap Points</Text>
          <Text style={styles.sheetText}>
            Drag the handle up or down to experience smooth snapping between
            different heights. The sheet will automatically snap to the
            nearest point when you release.
          </Text>

          {/* Your content here */}
          <View style={styles.content}>
            <Text>Current Position: {currentPosition}</Text>
          </View>
        </ScrollView>
      </ModalSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  controls: {
    marginTop: 20,
    gap: 10,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sheetText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  content: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
});
```

## Common Use Cases

### 1. Map with Search Results

```tsx
<ModalSheet
  snapPoints={[15, 40, 85]}
  initialSnapPointIndex={0}
>
  {/* 15%: Quick peek at results */}
  {/* 40%: See list of results */}
  {/* 85%: Detailed view with filters */}
</ModalSheet>
```

### 2. Music Player

```tsx
<ModalSheet
  snapPoints={[10, 95]}
  initialSnapPointIndex={0}
>
  {/* 10%: Mini player */}
  {/* 95%: Full player with queue */}
</ModalSheet>
```

### 3. Product Details

```tsx
<ModalSheet
  snapPoints={[30, 60, 90]}
  initialSnapPointIndex={1}
>
  {/* 30%: Quick info */}
  {/* 60%: Description & specs */}
  {/* 90%: Reviews & full details */}
</ModalSheet>
```

### 4. Form with Multiple Steps

```tsx
<ModalSheet
  snapPoints={[50, 85]}
  initialSnapPointIndex={0}
  onSnapPointChange={(index) => {
    if (index === 1) {
      // User expanded to see more options
      trackAnalytics('form_expanded');
    }
  }}
>
  {/* Your form content */}
</ModalSheet>
```

## Behavior Notes

### Gesture Behavior

- **Swipe down from any snap point**: Moves to the next lower snap point or closes if at the lowest point
- **Swipe up from any snap point**: Moves to the next higher snap point
- **Fast swipes**: Snap based on velocity
- **Slow swipes**: Snap based on distance (crosses midpoint between snap points)
- **Drag threshold**: Configurable via `dragThreshold` prop

### Snap Point Selection

The modal determines which snap point to transition to based on:

1. **Velocity**: Fast swipes (> 0.5 units) immediately trigger a snap
2. **Distance**: Crossing the midpoint between two snap points
3. **Direction**: Up vs down swipe direction

### Height Calculation

Snap points are percentage-based for better cross-device compatibility:

```typescript
actualHeight = (screenHeight * snapPoint) / 100

// Example: 50% snap point on iPhone 14 (844px screen height)
actualHeight = (844 * 50) / 100 = 422px
```

### Keyboard Handling

When the keyboard appears, the modal automatically adjusts to accommodate it, temporarily overriding snap point heights to ensure the content remains visible.

## Migration from Fixed Height

If you're currently using a fixed height, migrating to snap points is straightforward:

**Before:**
```tsx
<ModalSheet height={400} />
```

**After:**
```tsx
<ModalSheet snapPoints={[50]} /> {/* Approximately 50% on most phones */}
```

Or keep multiple heights:
```tsx
<ModalSheet snapPoints={[30, 60, 90]} initialSnapPointIndex={1} />
```

## Tips & Best Practices

1. **Optimal snap point count**: 2-4 snap points work best for most use cases
2. **Spacing**: Ensure at least 15-20% difference between consecutive snap points
3. **Initial position**: Consider starting at a medium snap point (not the smallest or largest)
4. **Content aware**: Design content that works well at all defined snap points
5. **Visual feedback**: Use `onSnapPointChange` to update UI elements based on current height
6. **Accessibility**: Provide alternative ways to change snap points (buttons) for users who can't use gestures

## Troubleshooting

### Modal doesn't snap to correct height

Ensure your snap points are valid percentages (0-100):
```tsx
// ❌ Invalid
<ModalSheet snapPoints={[200, 400, 600]} />

// ✅ Correct
<ModalSheet snapPoints={[25, 50, 75]} />
```

### Snap points feel unresponsive

Adjust the `dragThreshold` prop:
```tsx
<ModalSheet
  snapPoints={[25, 50, 90]}
  dragThreshold={100} // Lower value = more sensitive
/>
```

### Can't scroll content inside modal

Ensure you're using ScrollView for scrollable content:
```tsx
<ModalSheet snapPoints={[50, 90]}>
  <ScrollView>
    {/* Your scrollable content */}
  </ScrollView>
</ModalSheet>
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
interface ModalSheetRef {
  open: () => void;
  close: () => void;
  snapToPoint: (index: number) => void;
}

interface ModalSheetProps {
  snapPoints?: number[];
  initialSnapPointIndex?: number;
  enableSnapping?: boolean;
  onSnapPointChange?: (index: number, snapPoint: number) => void;
  // ... other props
}
```
