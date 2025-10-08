# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-10-08

### Changed - Major Refactor: Snap Points Implementation

#### Architecture Overhaul
- **Full Height Rendering**: Modal sheet now always renders at maximum snap point height
  - Content is pre-rendered once and never recalculated
  - Eliminates layout recalculations during snap transitions
- **Transform-Based Animation**: Switched from height changes to `translateY` transforms
  - All animations use `useNativeDriver: true` for 60fps performance
  - No more flickering or visual glitches during transitions
- **Viewport Drawer Approach**: Sheet acts like a drawer sliding behind a viewport
  - Shows different portions of pre-rendered content
  - Instagram-like smooth behavior

#### Snap Point Logic Improvements
- **Multi-Point Snapping**: Supports multiple snap heights (e.g., 30%, 60%, 90%)
- **Intelligent Detection**: Automatically snaps to closest snap point based on final drag position
- **Cross-Point Dragging**: Can skip multiple snap points in one continuous swipe
- **Direct Close**: Can close from any snap point without returning to smallest first
- **Threshold-Based**: Uses drag distance to determine if user crossed into next snap point

#### Animation Optimizations
- **Faster Animations**: Reduced from 200ms → **150ms** for quicker response
- **Predictable Timing**: Replaced spring animations with `Animated.timing`
  - Uses `Easing.out(Easing.cubic)` for smooth deceleration
  - Fixed duration means no waiting for spring to settle
- **Animation Blocking**: Added `isAnimating` state to prevent gesture conflicts
  - Blocks new touch interactions during snap animations
  - Ensures smooth, uninterrupted transitions

#### Touch Handling Refactor
- **`handleTouchStart`**: Now checks `isAnimating` to prevent conflicts
- **`handleTouchMove`**: Direct translateY updates for 1:1 finger tracking
- **`handleTouchEnd`**: Calculates nearest snap point and triggers animation
- **Helper Functions**:
  - `getSnapTranslateY()`: Calculates transform offset for each snap index
  - `findTargetSnapIndex()`: Determines target based on current translateY position
  - `animateToSnapPoint()`: Handles snap animation with proper state management

#### State Management
- **New State**: `isAnimating` prevents touch during animations
- **Improved Tracking**: `currentSnapIndex` properly tracks active snap point
- **Animation Callbacks**: All animations properly clear state on completion

#### Code Cleanup
- **Removed Viewport Wrapper**: Eliminated extra `sheetViewport` container
- **Simplified Structure**: Background color applied directly to sheet
- **Cleaner Styles**: Removed unused `sheetViewport` and `contentAbsolute` styles
- **Removed Unused Code**: Cleaned up old `getCurrentSnapPosition` function
- **Optimized Keyboard Handling**: Simplified keyboard event listeners

#### Technical Details

**Before (Old Approach)**:
```javascript
// Dynamic height changes
height: snapPointsInPixels[currentSnapIndex]

// Used LayoutAnimation
LayoutAnimation.configureNext(...)
setCurrentSnapIndex(index)

// Content recalculated on each snap
```

**After (New Approach)**:
```javascript
// Fixed height at maximum
height: calculatedHeight

// Pure transform animations
transform: [{ translateY: translateY }]

// Content always rendered, just repositioned
```

#### Performance Benefits
- ✅ **No Layout Recalculations**: Content never re-renders during snaps
- ✅ **Native Driver**: All animations run on UI thread at 60fps
- ✅ **Reduced Jank**: No flickering or visual glitches
- ✅ **Faster Response**: 150ms animations feel instant
- ✅ **Memory Efficient**: Content rendered once, not recreated

#### Animation Timeline
| Event | Duration | Easing |
|-------|----------|--------|
| Snap to Point | 150ms | `Easing.out(Easing.cubic)` |
| Close Animation | 50ms | `Easing.out(Easing.ease)` |
| Spring Back (same point) | 150ms | `Easing.out(Easing.cubic)` |

### Fixed
- **Draggable List Example**: Fixed height constraint issue preventing items from rendering in examples

### Breaking Changes
None - All existing props and APIs remain backward compatible

## [1.0.2] - 2025-10-07

### Added
- **Draggable List Example**: New interactive drag & drop list example in modal sheet
  - 8 colorful draggable items with smooth animations
  - Long-press gesture to initiate drag
  - Spring-based drop animations for smooth transitions
  - Visual feedback during active drag (opacity and scale changes)
- **GestureHandlerRootView**: Added to Modal component for proper gesture support
  - Fixes gesture handler compatibility issues within React Native Modal
  - Enables draggable-flatlist to work correctly inside modals
- **Enhanced Gesture Isolation**: Swipe-to-close gesture now restricted to handle area only
  - Modal sheet handle area with dedicated pan responder
  - Content area remains fully interactive without gesture conflicts
  - Draggable list gestures work independently from modal dismiss gesture

### Changed
- **App Root Layout**: Wrapped with `GestureHandlerRootView` for global gesture support
- **Modal Sheet Architecture**: Refactored pan responder to only apply to handle area
  - Moved from full-sheet gesture detection to handle-only detection
  - Prevents gesture conflicts with interactive content inside modal

### Dependencies
- Added `react-native-draggable-flatlist` (^4.0.3)
  - Provides drag-and-drop functionality for FlatList
  - Includes ScaleDecorator for smooth scale animations
  - Powered by React Native Reanimated and Gesture Handler

### Technical Details
- Animation configuration: `damping: 20`, `stiffness: 100` for natural spring feel
- Item dimensions: 60px height for optimal touch target and gesture response
- Long-press delay: 70ms for quick drag initiation
- Gesture Handler integration fully compatible with Expo workflow

## Notes

### Known Issues Resolved
- Fixed: Draggable list not working inside React Native Modal
  - Solution: Added GestureHandlerRootView wrapper inside Modal component
- Fixed: Modal swipe-to-close interfering with content gestures
  - Solution: Limited swipe gesture to handle area only

### Browser/Platform Support
- ✅ iOS - Full gesture support
- ✅ Android - Full gesture support
- ✅ Expo Go - Compatible with development workflow
