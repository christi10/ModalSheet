# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
