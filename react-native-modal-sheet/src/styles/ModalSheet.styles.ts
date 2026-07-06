import { Dimensions, StyleSheet } from 'react-native';

// On the New Architecture (Fabric/Yoga), an absolutely-positioned view relying
// only on StyleSheet.absoluteFillObject (inset 0, no explicit size) inside a
// flex container can collapse to zero measured size. That makes the backdrop
// both invisible (no dim overlay) and unpressable (tap-outside-to-close stops
// working), while the in-flow sheet still renders. Pinning explicit window
// dimensions keeps the backdrop filling the screen on both architectures.
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

export const modalSheetStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  backdropAnimated: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    width: '100%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 20,
    width: '100%',
    backgroundColor: 'transparent',
    minHeight: 44,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
  },
  content: {
    flexShrink: 1,
  },
});
