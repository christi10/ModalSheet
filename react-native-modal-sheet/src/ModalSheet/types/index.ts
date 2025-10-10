import { NativeScrollEvent, NativeSyntheticEvent, AccessibilityRole, ViewStyle, ModalProps } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

export interface ModalSheetRef {
  open: () => void;
  close: () => void;
  present: () => void;
  dismiss: () => void;
  snapToPoint: (index: number) => void;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  handleScrollBeginDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  handleScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export interface ModalSheetAccessibilityProps {
  /**
   * Accessible label for the modal
   */
  'aria-label'?: string;

  /**
   * Accessible description for the modal
   */
  'aria-describedby'?: string;

  /**
   * Accessible label for the backdrop
   */
  backdropAriaLabel?: string;

  /**
   * Additional ARIA props for the sheet container
   */
  sheetAriaProps?: {
    role?: AccessibilityRole;
    'aria-modal'?: boolean;
    'aria-hidden'?: boolean;
  };
}

export interface ModalSheetProps extends ModalSheetAccessibilityProps {
  /**
   * Content to be rendered inside the bottom sheet
   */
  children: React.ReactNode;

  /**
   * Enable drag and drop functionality by wrapping content in GestureHandlerRootView
   * Set to true when using components that require gesture handling (like DraggableFlatList)
   * Default is false for better performance when not needed
   */
  enableDragAndDrop?: boolean;

  /**
   * Enable keyboard avoidance to push sheet up when keyboard appears
   * Set to true when the sheet contains text inputs
   * Default is false for better performance when not needed
   */
  avoidKeyboard?: boolean;

  /**
   * Additional offset to add when keyboard is shown (in pixels)
   * Useful for fine-tuning keyboard avoidance behavior
   * Default is 0
   */
  keyboardOffset?: number;

  /**
   * Height of the bottom sheet
   * If not provided, the sheet will auto-size based on content
   */
  height?: number;

  /**
   * Maximum height of the bottom sheet (default: 90% of screen height)
   * Used when auto-sizing or when height exceeds this value
   */
  maxHeight?: number;

  /**
   * Minimum height of the bottom sheet (default: 150)
   * Ensures the sheet has a minimum size even with little content
   */
  minHeight?: number;

  /**
   * Snap points for the sheet as percentages of screen height or absolute pixel values
   * Example: [0.3, 0.7, 0.95] or [300, 600, 900]
   * If provided, enables snap point behavior
   */
  snapPoints?: (string | number)[] | SharedValue<(string | number)[]>;

  /**
   * Initial snap point index (default: 0)
   * Which snap point to open to initially
   */
  initialSnapIndex?: number;

  /**
   * Enable scroll-to-expand behavior (default: true)
   * When true:
   * - Slow scroll down: expand to next snap point
   * - Fast swipe down: jump multiple snap points or to max
   * - Slow scroll up at top: collapse to previous snap point
   * - Fast swipe up at top: jump back multiple snap points or close
   */
  enableScrollToExpand?: boolean;

  /**
   * Scroll threshold in pixels to trigger snap point expansion/collapse (default: 50)
   * How far the user needs to scroll to trigger the transition
   */
  scrollExpandThreshold?: number;

  /**
   * Callback when snap point changes
   */
  onSnapPointChange?: (index: number) => void;

  /**
   * Controlled visibility state (optional)
   * If provided, the component becomes controlled and ignores imperative ref methods
   */
  isVisible?: boolean;

  /**
   * Callback when the sheet is closed
   */
  onClose?: () => void;

  /**
   * Callback when the sheet is opened
   */
  onOpen?: () => void;

  /**
   * Background color of the sheet (default: 'white')
   */
  backgroundColor?: string;

  /**
   * Border radius of the top corners (default: 20)
   */
  borderRadius?: number;

  /**
   * Show drag handle indicator (default: true)
   */
  showHandle?: boolean;

  /**
   * Handle color (default: '#DDD')
   */
  handleColor?: string;

  /**
   * Backdrop opacity (default: 0.5)
   */
  backdropOpacity?: number;

  /**
   * Drag threshold in pixels to trigger close (default: 125)
   */
  dragThreshold?: number;

  /**
   * Animation duration in ms (default: 300)
   */
  animationDuration?: number;

  /**
   * Spring damping value (default: 20)
   */
  springDamping?: number;

  /**
   * Custom styles for the sheet container
   */
  containerStyle?: ViewStyle;

  /**
   * Additional Modal props
   */
  modalProps?: Partial<ModalProps>;
}