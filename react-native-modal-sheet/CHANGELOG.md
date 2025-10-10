# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.1] - 2025-10-10

### Changed
- **Major Internal Refactoring**: Complete architectural overhaul for better maintainability
  - Separated component logic into modular structure with dedicated directories
  - Extracted custom hooks for keyboard handling, animations, gestures, and scroll behavior
  - Moved TypeScript interfaces to centralized types module
  - Extracted styles into separate StyleSheet module
  - Created utility functions and constants modules
  - Reduced main component from 1166 lines to ~350 lines

### Improved
- **Code Organization**: Clear separation of concerns with single-responsibility modules
- **Maintainability**: Each feature now in its own file for easier updates
- **Developer Experience**: More intuitive file structure for contributions
- **Type Safety**: Centralized type definitions for better consistency
- **Performance**: Potential performance improvements through optimized hook usage
- **Testing**: Modular structure enables easier unit testing

### Technical Details
- No breaking changes - API remains identical
- All existing features preserved
- Backwards compatible with v2.1.0

## [2.1.0] - 2025-10-10

### Added
- **`enableDragAndDrop` Prop**: New optional prop for automatic GestureHandlerRootView wrapping
  - Set to `true` when using gesture-based components like DraggableFlatList
  - Eliminates need for manual GestureHandlerRootView wrapper in modal content
  - Default is `false` for better performance when gesture handling is not needed
  - Simplifies integration with react-native-draggable-flatlist and similar libraries

### Improved
- **Cleaner API**: Gesture-enabled components now work with a simple prop toggle
- **Better Performance**: GestureHandlerRootView only added when explicitly needed
- **Developer Experience**: Removed boilerplate code from examples

### Dependencies
- Added `react-native-gesture-handler` as a peer dependency (when using `enableDragAndDrop`)

## [2.0.1] - 2025-10-09

### Fixed
- Documentation updates and minor bug fixes

## [2.0.0] - 2025-10-08

### Added - Major Feature: Scroll-to-Expand & Interactive Snap Points

#### Scroll-to-Expand Features
- **Natural Scrolling**: Expand/collapse sheet by scrolling within content
- **Velocity Detection**: Fast swipes jump multiple snap points or to extremes
- **Smart Boundaries**: Scroll up at top to collapse, scroll down to expand
- **New Props**:
  - `enableScrollToExpand`: Enable/disable scroll expansion (default: true)
  - `scrollExpandThreshold`: Pixels to scroll before triggering snap (default: 50)
- **New Ref Methods**:
  - `handleScroll`: Process scroll events for expansion
  - `handleScrollBeginDrag`: Track scroll gesture start
  - `handleScrollEndDrag`: Detect pull-down gestures at top

#### Interactive Snap Points
- **Flexible Definition**: Support for percentage strings (e.g., "50%") and SharedValue
- **Smooth Transitions**: Bezier curve easing for natural movement
- **Keyboard Awareness**: Snap points adjust when keyboard appears
- **Performance**: All animations use native driver at 60fps

### Breaking Changes
- `snapPoints` prop now accepts `(string | number)[]` instead of just `number[]`

## [1.1.0] - 2025-10-08

### Added - Major Feature: Snap Points Implementation

#### Snap Point Features
- **Multi-Point Snapping**: Supports multiple snap heights (e.g., 30%, 60%, 90%)
- **Intelligent Detection**: Automatically snaps to closest snap point based on final drag position
- **Cross-Point Dragging**: Can skip multiple snap points in one continuous swipe
- **Direct Close**: Can close from any snap point without returning to smallest first
- **New Props**:
  - `snapPoints`: Array of snap positions (percentage or pixels)
  - `initialSnapIndex`: Starting snap point index (default: 0)
  - `enableScrollToExpand`: Enable scroll-to-expand behavior
  - `onSnapPointChange`: Callback when snap point changes
- **New Ref Method**: `snapToPoint(index)` - Programmatically snap to specific point

#### Architecture Improvements
- **Transform-Based Animation**: Switched from height changes to `translateY` transforms
  - All animations use `useNativeDriver: true` for 60fps performance
  - No more flickering or visual glitches during transitions
- **Full Height Rendering**: Modal sheet renders at maximum snap point height
  - Content is pre-rendered once and never recalculated
  - Eliminates layout recalculations during snap transitions
- **Viewport Drawer Approach**: Sheet acts like a drawer sliding behind a viewport

#### Performance Optimizations
- **Faster Animations**: Reduced from 200ms → **150ms** for quicker response
- **Predictable Timing**: Uses `Animated.timing` with `Easing.out(Easing.cubic)`
- **Animation Blocking**: Added `isAnimating` state to prevent gesture conflicts
- ✅ **No Layout Recalculations**: Content never re-renders during snaps
- ✅ **Native Driver**: All animations run on UI thread at 60fps
- ✅ **Memory Efficient**: Content rendered once, not recreated

### Fixed
- **Draggable List Example**: Fixed height constraint issue preventing items from rendering
  - Changed from `flex: 1` to explicit height calculation
  - Removed unnecessary `containerStyle` from DraggableFlatList

### Changed
- **Code Cleanup**: Removed unused viewport wrapper and simplified structure
- **Optimized Keyboard Handling**: Simplified keyboard event listeners

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
