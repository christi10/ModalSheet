export const DEFAULT_VALUES = {
  minHeight: 150,
  backgroundColor: 'white',
  borderRadius: 20,
  handleColor: '#DDD',
  backdropOpacity: 0.5,
  dragThreshold: 125,
  animationDuration: 300,
  springDamping: 20,
  scrollExpandThreshold: 50,
  initialSnapIndex: 0,
  keyboardOffset: 0,
  backdropAriaLabel: 'Close bottom sheet',
  ariaLabel: 'Bottom sheet',
  showHandle: true,
  enableScrollToExpand: true,
  enableDragAndDrop: false,
  avoidKeyboard: false,
} as const;

export const ANIMATION_CONFIG = {
  snapPointDuration: 280,
  closeDuration: 50,
  keyboardAnimationDuration: 250,
} as const;