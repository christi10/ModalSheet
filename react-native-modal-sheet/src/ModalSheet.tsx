import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Animated,
  Pressable,
  ViewStyle,
  ModalProps,
  AccessibilityRole,
  Keyboard,
  Platform,
  Dimensions,
  GestureResponderEvent,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export interface ModalSheetRef {
  open: () => void;
  close: () => void;
  present: () => void;
  dismiss: () => void;
  snapToPoint: (index: number) => void; // Snap to a specific snap point
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void; // Handle scroll events for expansion
  handleScrollBeginDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void; // Handle scroll begin
  handleScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void; // Handle scroll end
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

const ModalSheet = forwardRef<ModalSheetRef, ModalSheetProps>(
  (
    {
      children,
      enableDragAndDrop = false,
      avoidKeyboard = false,
      keyboardOffset = 0,
      height,
      maxHeight,
      minHeight: _minHeight = 150,
      snapPoints,
      initialSnapIndex = 0,
      enableScrollToExpand = true,
      scrollExpandThreshold = 50,
      onSnapPointChange,
      onClose,
      onOpen,
      backgroundColor = 'white',
      borderRadius = 20,
      showHandle = true,
      handleColor = '#DDD',
      backdropOpacity = 0.5,
      dragThreshold = 125,
      animationDuration = 300,
      containerStyle,
      modalProps,
      // Accessibility props
      'aria-label': ariaLabel = 'Bottom sheet',
      'aria-describedby': ariaDescribedBy,
      backdropAriaLabel = 'Close bottom sheet',
      sheetAriaProps = {},
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const visibleRef = useRef(visible);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [_measuredContentHeight, setMeasuredContentHeight] = useState(0);
    const hasMeasured = useRef(false);
    const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapIndex);
    const [isAnimating, setIsAnimating] = useState(false);
    const isImperativelyAnimating = useRef(false);
    const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);
    const translateY = useRef(new Animated.Value(0)).current;
    const backdropOpacityAnim = useRef(new Animated.Value(0)).current;

    // Swipe gesture tracking
    const touchStartY = useRef(0);
    const touchStartTranslateY = useRef(0);
    const isDragging = useRef(false);
    const isMouseDragging = useRef(false);

    // Scroll tracking for expansion
    const lastScrollY = useRef(0);
    const scrollVelocity = useRef(0);
    const canExpandFromScroll = useRef(true);
    const scrollStartY = useRef(0);
    const isDraggingSheet = useRef(false);

    // Keep visibleRef in sync with visible state
    useEffect(() => {
      visibleRef.current = visible;
    }, [visible]);

    // Get screen dimensions
    const screenHeight = Dimensions.get('window').height;

    // Calculate default max height (90% of screen height)
    const defaultMaxHeight = screenHeight * 0.9;
    const effectiveMaxHeight = maxHeight ?? defaultMaxHeight;

    // Convert snap points to pixel values
    const snapPointsInPixels = React.useMemo(() => {
      if (!snapPoints) return null;

      // Extract the actual array from SharedValue if needed
      const pointsArray = (snapPoints as any).value || snapPoints;

      if (!Array.isArray(pointsArray) || pointsArray.length === 0) return null;

      return pointsArray.map((point: string | number) => {
        // Handle string values (e.g., "50%")
        if (typeof point === 'string') {
          if (point.endsWith('%')) {
            const percentage = parseFloat(point) / 100;
            return screenHeight * percentage;
          }
          return parseFloat(point);
        }
        // If numeric value is between 0 and 1, treat as percentage
        if (point > 0 && point <= 1) {
          return screenHeight * point;
        }
        // Otherwise treat as absolute pixel value
        return point;
      });
    }, [snapPoints, screenHeight]);

    // Keyboard handling - only when avoidKeyboard is true
    useEffect(() => {
      if (!avoidKeyboard) return;

      const keyboardWillShowListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        (e: any) => {
          setKeyboardHeight(e.endCoordinates.height + keyboardOffset);
        }
      );

      const keyboardWillHideListener = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          setKeyboardHeight(0);
        }
      );

      return () => {
        keyboardWillShowListener?.remove();
        keyboardWillHideListener?.remove();
      };
    }, [avoidKeyboard, keyboardOffset]);

    // Calculate the final height for the modal - SIMPLIFIED
    const calculatedHeight = React.useMemo(() => {
      // If using snap points, always use the LARGEST snap point as container height
      if (snapPointsInPixels && snapPointsInPixels.length > 0) {
        return snapPointsInPixels[snapPointsInPixels.length - 1];
      }

      // If height is explicitly provided, use it
      if (height !== undefined) {
        return height;
      }

      // Otherwise use 'auto' by not setting a fixed height
      return undefined;
    }, [height, snapPointsInPixels]);

    // Get the translateY offset for a given snap index
    // The sheet is always full height, we just translate it up/down to show different amounts
    const getSnapTranslateY = useCallback(
      (index: number): number => {
        if (!snapPointsInPixels || snapPointsInPixels.length === 0) return 0;
        const maxHeight = snapPointsInPixels[snapPointsInPixels.length - 1];
        const targetHeight = snapPointsInPixels[index];
        // Return how much to hide (push down) from the max height
        return maxHeight - targetHeight;
      },
      [snapPointsInPixels]
    );

    // Animate sheet position when keyboard appears/disappears
    useEffect(() => {
      if (!avoidKeyboard || !visible) return;

      // Animate the sheet up or down based on keyboard height
      Animated.timing(translateY, {
        toValue: snapPointsInPixels
          ? getSnapTranslateY(currentSnapIndex) - keyboardHeight
          : -keyboardHeight,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [
      keyboardHeight,
      avoidKeyboard,
      visible,
      translateY,
      snapPointsInPixels,
      currentSnapIndex,
      getSnapTranslateY,
    ]);

    // Snap to a specific snap point
    const snapToPoint = useCallback(
      (index: number) => {
        if (!snapPointsInPixels || index < 0 || index >= snapPointsInPixels.length) return;

        const targetTranslateY = getSnapTranslateY(index);

        // Update state
        setCurrentSnapIndex(index);
        onSnapPointChange?.(index);
        setIsAnimating(true);

        // Use timing with smooth bezier easing
        Animated.timing(translateY, {
          toValue: targetTranslateY,
          duration: 280,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }).start(() => {
          setIsAnimating(false);
        });
      },
      [snapPointsInPixels, onSnapPointChange, translateY, getSnapTranslateY]
    );

    // Helper: Determine target snap index based on current position
    const findTargetSnapIndex = useCallback(
      (currentTranslateY: number): number | 'close' => {
        if (!snapPointsInPixels || snapPointsInPixels.length === 0) return currentSnapIndex;

        const maxSnapTranslateY = getSnapTranslateY(0);

        // Check if should close (dragged beyond smallest snap + threshold)
        if (currentTranslateY > maxSnapTranslateY + dragThreshold) {
          return 'close';
        }

        // Find closest snap point to current translateY position
        let targetIndex = 0;
        let minDistance = Infinity;

        for (let i = 0; i < snapPointsInPixels.length; i++) {
          const snapTranslateY = getSnapTranslateY(i);
          const distance = Math.abs(currentTranslateY - snapTranslateY);
          if (distance < minDistance) {
            minDistance = distance;
            targetIndex = i;
          }
        }

        return targetIndex;
      },
      [snapPointsInPixels, currentSnapIndex, dragThreshold, getSnapTranslateY]
    );

    // Helper: Animate to target snap point
    const animateToSnapPoint = useCallback(
      (targetIndex: number) => {
        if (!snapPointsInPixels) return;

        const targetTranslateY = getSnapTranslateY(targetIndex);

        // Update state
        setCurrentSnapIndex(targetIndex);
        onSnapPointChange?.(targetIndex);
        setIsAnimating(true);

        // Use timing with smooth bezier easing
        Animated.timing(translateY, {
          toValue: targetTranslateY,
          duration: 280,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }).start(() => {
          setIsAnimating(false);
        });
      },
      [snapPointsInPixels, onSnapPointChange, translateY, getSnapTranslateY]
    );

    // Handle touch start
    const handleTouchStart = useCallback(
      (e: GestureResponderEvent) => {
        // Prevent touch interactions during animation
        if (isAnimating) return;

        touchStartY.current = e.nativeEvent.pageY;
        touchStartTranslateY.current = (translateY as any)._value || 0;
        isDragging.current = true;
      },
      [translateY, isAnimating]
    );

    // Handle touch move
    const handleTouchMove = useCallback(
      (e: GestureResponderEvent) => {
        if (!isDragging.current) return;

        const deltaY = e.nativeEvent.pageY - touchStartY.current;
        const newTranslateY = touchStartTranslateY.current + deltaY;

        // If using snap points
        if (snapPointsInPixels && snapPointsInPixels.length > 0) {
          const maxSnapTranslateY = getSnapTranslateY(snapPointsInPixels.length - 1);

          // Only prevent swiping UP (negative deltaY) when at maximum height
          if (
            currentSnapIndex === snapPointsInPixels.length - 1 &&
            newTranslateY < maxSnapTranslateY
          ) {
            // Lock at maximum height - don't allow upward movement beyond max
            translateY.setValue(maxSnapTranslateY);
            return;
          }

          // Allow all downward movement (deltaY > 0 means dragging down)
          // This allows collapsing from any snap point
        }

        // For non-snap mode, prevent upward dragging beyond 0
        if (!snapPointsInPixels && newTranslateY < 0) {
          translateY.setValue(0);
          return;
        }

        // Apply translateY for immediate visual feedback during drag
        translateY.setValue(newTranslateY);
      },
      [translateY, snapPointsInPixels, currentSnapIndex, getSnapTranslateY]
    );

    const open = useCallback(() => {
      // Prevent opening if already animating imperatively or already visible
      if (isImperativelyAnimating.current || visibleRef.current) {
        return;
      }

      // Cancel any in-progress animation
      if (currentAnimation.current) {
        currentAnimation.current.stop();
        currentAnimation.current = null;
      }

      isImperativelyAnimating.current = true;
      setVisible(true);

      // Set initial translateY position
      // For snap points: use the initial snap index position
      // For regular mode: start off-screen to animate in like a drawer
      const initialTranslateY = snapPointsInPixels
        ? getSnapTranslateY(initialSnapIndex)
        : screenHeight;
      translateY.setValue(initialTranslateY);

      // Animate both backdrop and sheet position
      currentAnimation.current = Animated.parallel([
        Animated.timing(backdropOpacityAnim, {
          toValue: backdropOpacity,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        // Animate sheet sliding in from bottom (only for non-snap mode)
        ...(!snapPointsInPixels
          ? [
              Animated.timing(translateY, {
                toValue: 0,
                duration: animationDuration,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]
          : []),
      ]);

      currentAnimation.current.start(() => {
        currentAnimation.current = null;
        isImperativelyAnimating.current = false;

        // Defer only the callback to avoid useInsertionEffect warning
        setTimeout(() => {
          onOpen?.();
        }, 0);
      });
    }, [
      snapPointsInPixels,
      initialSnapIndex,
      backdropOpacity,
      animationDuration,
      onOpen,
      translateY,
      backdropOpacityAnim,
      getSnapTranslateY,
      screenHeight,
    ]);

    const close = useCallback(() => {
      // Only prevent if already closed (allow swipe gesture to close)
      if (!visibleRef.current) {
        return;
      }

      // Cancel any in-progress animation
      if (currentAnimation.current) {
        currentAnimation.current.stop();
        currentAnimation.current = null;
      }

      // Set flag to prevent rapid imperative calls, but allow swipe
      isImperativelyAnimating.current = true;

      currentAnimation.current = Animated.parallel([
        Animated.timing(backdropOpacityAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: screenHeight + 100, // Move completely off screen + extra margin
          duration: animationDuration * 0.8,
          useNativeDriver: true,
        }),
      ]);

      currentAnimation.current.start(() => {
        currentAnimation.current = null;
        isImperativelyAnimating.current = false;

        // Defer state updates to avoid useInsertionEffect warning
        setTimeout(() => {
          setVisible(false);
          onClose?.();
        }, 0);
      });
    }, [animationDuration, screenHeight, onClose, translateY, backdropOpacityAnim]);

    // Handle mouse events for web platform
    const handleMouseDown = useCallback(
      (e: any) => {
        // Prevent default to avoid text selection during drag
        e.preventDefault?.();

        // Prevent if animating
        if (isAnimating) return;

        const pageY = e.pageY || e.clientY;
        touchStartY.current = pageY;
        touchStartTranslateY.current = (translateY as any)._value || 0;
        isMouseDragging.current = true;
      },
      [translateY, isAnimating]
    );

    const handleMouseMove = useCallback(
      (e: any) => {
        if (!isMouseDragging.current) return;

        const pageY = e.pageY || e.clientY;
        const deltaY = pageY - touchStartY.current;
        const newTranslateY = touchStartTranslateY.current + deltaY;

        // If using snap points
        if (snapPointsInPixels && snapPointsInPixels.length > 0) {
          const maxSnapTranslateY = getSnapTranslateY(snapPointsInPixels.length - 1);

          // Only prevent swiping UP (negative deltaY) when at maximum height
          if (
            currentSnapIndex === snapPointsInPixels.length - 1 &&
            newTranslateY < maxSnapTranslateY
          ) {
            // Lock at maximum height
            translateY.setValue(maxSnapTranslateY);
            return;
          }
        }

        // For non-snap mode, prevent upward dragging beyond 0
        if (!snapPointsInPixels && newTranslateY < 0) {
          translateY.setValue(0);
          return;
        }

        // Apply translateY for immediate visual feedback during drag
        translateY.setValue(newTranslateY);
      },
      [translateY, snapPointsInPixels, currentSnapIndex, getSnapTranslateY]
    );

    const handleMouseUp = useCallback(
      (e: any) => {
        if (!isMouseDragging.current) return;
        isMouseDragging.current = false;

        const pageY = e.pageY || e.clientY;
        const currentTranslateY = (translateY as any)._value || 0;

        // Handle snap points behavior
        if (snapPointsInPixels && snapPointsInPixels.length > 0) {
          const target = findTargetSnapIndex(currentTranslateY);

          if (target === 'close') {
            close();
            return;
          }

          // Animate to target snap point
          animateToSnapPoint(target);
        } else {
          const deltaY = pageY - touchStartY.current;
          // Original behavior without snap points
          const isSwipeDown = deltaY > dragThreshold;

          if (isSwipeDown && deltaY > 0) {
            Animated.parallel([
              Animated.timing(backdropOpacityAnim, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: screenHeight + 100,
                duration: 50,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setTimeout(() => {
                setVisible(false);
                onClose?.();
              }, 0);
            });
          } else {
            Animated.timing(translateY, {
              toValue: 0,
              duration: 50,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }).start();
          }
        }
      },
      [
        snapPointsInPixels,
        findTargetSnapIndex,
        animateToSnapPoint,
        close,
        translateY,
        dragThreshold,
        backdropOpacityAnim,
        screenHeight,
        onClose,
      ]
    );

    // Add global mouse event listeners for web platform
    useEffect(() => {
      // Only set up listeners on web platform
      if (
        Platform.OS === 'web' &&
        typeof globalThis !== 'undefined' &&
        (globalThis as any).document
      ) {
        const handleGlobalMouseUp = (e: MouseEvent) => {
          if (isMouseDragging.current) {
            handleMouseUp(e);
          }
        };

        const handleGlobalMouseMove = (e: MouseEvent) => {
          if (isMouseDragging.current) {
            handleMouseMove(e);
          }
        };

        const doc = (globalThis as any).document;
        doc.addEventListener('mouseup', handleGlobalMouseUp);
        doc.addEventListener('mousemove', handleGlobalMouseMove);

        return () => {
          doc.removeEventListener('mouseup', handleGlobalMouseUp);
          doc.removeEventListener('mousemove', handleGlobalMouseMove);
        };
      }

      // Return undefined for all other cases
      return undefined;
    }, [handleMouseUp, handleMouseMove]);

    // Handle touch end
    const handleTouchEnd = useCallback(
      (e: GestureResponderEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;

        const currentTranslateY = (translateY as any)._value || 0;

        // Handle snap points behavior
        if (snapPointsInPixels && snapPointsInPixels.length > 0) {
          const target = findTargetSnapIndex(currentTranslateY);

          if (target === 'close') {
            close();
            return;
          }

          // Animate to target snap point
          animateToSnapPoint(target);
        } else {
          const deltaY = e.nativeEvent.pageY - touchStartY.current;
          // Original behavior without snap points
          const isSwipeDown = deltaY > dragThreshold;

          if (isSwipeDown && deltaY > 0) {
            Animated.parallel([
              Animated.timing(backdropOpacityAnim, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: screenHeight + 100,
                duration: 50,
                useNativeDriver: true,
              }),
            ]).start(() => {
              setTimeout(() => {
                setVisible(false);
                onClose?.();
              }, 0);
            });
          } else {
            Animated.timing(translateY, {
              toValue: 0,
              duration: 50,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }).start();
          }
        }
      },
      [
        snapPointsInPixels,
        findTargetSnapIndex,
        animateToSnapPoint,
        close,
        translateY,
        dragThreshold,
        backdropOpacityAnim,
        screenHeight,
        onClose,
      ]
    );

    // Handle scroll begin drag - track initial scroll position
    const handleScrollBeginDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset } = event.nativeEvent;
      scrollStartY.current = contentOffset.y;
      isDraggingSheet.current = false;
    }, []);

    // Handle scroll end drag - check if user tried to pull down at top to collapse
    const handleScrollEndDrag = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!snapPointsInPixels || snapPointsInPixels.length === 0) {
          return;
        }

        const { contentOffset, velocity } = event.nativeEvent;
        const currentScrollY = contentOffset.y;

        // Check if scroll started at top (scrollY = 0) and user pulled down
        const isAtTop = scrollStartY.current <= 0 && currentScrollY <= 0;

        // If at top and has downward velocity (negative means pulling down)
        if (isAtTop && velocity && velocity.y < -0.3) {
          // Prevent multiple rapid triggers
          if (!canExpandFromScroll.current) return;

          canExpandFromScroll.current = false;

          const velocityMagnitude = Math.abs(velocity.y);

          // Check for big/fast swipe - close completely (lowered threshold)
          if (velocityMagnitude > 1.0) {
            close();
          } else {
            // Normal pull - move to previous snap point
            const targetIndex = currentSnapIndex - 1;

            // Close if at first snap point or target is below 0
            if (currentSnapIndex === 0 || targetIndex < 0) {
              close();
            } else {
              snapToPoint(targetIndex);
            }
          }

          // Reset flag after animation completes
          setTimeout(() => {
            canExpandFromScroll.current = true;
          }, 400);
        }
      },
      [snapPointsInPixels, currentSnapIndex, snapToPoint, close]
    );

    // Handle scroll events for scroll-to-expand behavior
    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!enableScrollToExpand || !snapPointsInPixels || snapPointsInPixels.length === 0) {
          return;
        }

        const { contentOffset, velocity } = event.nativeEvent;
        const currentScrollY = contentOffset.y;

        // Store velocity for expansion detection
        if (velocity) {
          scrollVelocity.current = velocity.y;
        }

        // Check if user is scrolling down (trying to see more content below)
        const isScrollingDown = currentScrollY > lastScrollY.current;
        // Check if user is scrolling up (at top, trying to go back)
        const isScrollingUp = currentScrollY < lastScrollY.current;
        const isAtTop = currentScrollY <= 0;

        // If scrolling down and not at max snap point, expand to show more content
        if (
          isScrollingDown &&
          canExpandFromScroll.current &&
          currentSnapIndex < snapPointsInPixels.length - 1
        ) {
          const scrollDelta = currentScrollY - lastScrollY.current;

          // If scroll delta exceeds threshold or has downward velocity, expand
          if (scrollDelta >= scrollExpandThreshold || (velocity && velocity.y > 0.8)) {
            canExpandFromScroll.current = false;

            // Determine how many snap points to jump based on velocity
            let targetIndex = currentSnapIndex + 1;
            if (velocity && velocity.y > 3.5) {
              // Very big swipe down - jump to the last snap point
              targetIndex = snapPointsInPixels.length - 1;
            } else if (velocity && velocity.y > 2.2) {
              // Medium swipe - jump 2 snap points
              targetIndex = Math.min(currentSnapIndex + 2, snapPointsInPixels.length - 1);
            }
            // Otherwise just move to next snap point (gentle scroll)

            snapToPoint(targetIndex);

            // Reset flag after animation
            setTimeout(() => {
              canExpandFromScroll.current = true;
            }, 500);
          }
        }

        // If scrolling up at the top, collapse to previous snap point or close
        if (isAtTop && isScrollingUp && canExpandFromScroll.current) {
          const scrollDelta = Math.abs(lastScrollY.current - currentScrollY);

          // If scroll delta exceeds threshold or has upward velocity
          if (scrollDelta >= scrollExpandThreshold || (velocity && velocity.y < -0.8)) {
            canExpandFromScroll.current = false;

            // Determine how many snap points to jump back based on velocity
            let targetIndex = currentSnapIndex - 1;
            if (velocity && velocity.y < -3.5) {
              // Very big swipe up - jump to first snap point or close
              targetIndex = 0;
            } else if (velocity && velocity.y < -2.2) {
              // Medium swipe - jump back 2 snap points
              targetIndex = Math.max(currentSnapIndex - 2, 0);
            }
            // Otherwise just move to previous snap point (gentle scroll)

            // If target is below 0 or we're at the first snap point, close the modal
            if (targetIndex < 0 || currentSnapIndex === 0) {
              close();
            } else {
              snapToPoint(targetIndex);
            }

            // Reset flag after animation
            setTimeout(() => {
              canExpandFromScroll.current = true;
            }, 500);
          }
        }

        lastScrollY.current = currentScrollY;
      },
      [
        enableScrollToExpand,
        snapPointsInPixels,
        currentSnapIndex,
        scrollExpandThreshold,
        snapToPoint,
        close,
      ]
    );

    // Expose imperative methods through ref
    useImperativeHandle(ref, () => ({
      open,
      close,
      present: open,
      dismiss: close,
      snapToPoint,
      handleScroll,
      handleScrollBeginDrag,
      handleScrollEndDrag,
    }));

    useEffect(() => {
      if (!visible) {
        translateY.setValue(screenHeight + 100);
        backdropOpacityAnim.setValue(0);
        // Reset measurement flag when sheet closes
        hasMeasured.current = false;
        setMeasuredContentHeight(0);
      }
    }, [visible, screenHeight]);

    // Compute sheet styles for cleaner code
    const sheetStyles = React.useMemo(() => {
      const baseStyles: (ViewStyle | typeof styles.sheet)[] = [
        styles.sheet,
        {
          ...(calculatedHeight !== undefined && {
            height: calculatedHeight,
          }),
          maxHeight: effectiveMaxHeight,
          backgroundColor,
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
          transform: [{ translateY: translateY }],
        },
      ];

      // Add container style if provided
      if (containerStyle) {
        baseStyles.push(containerStyle);
      }

      return baseStyles;
    }, [
      calculatedHeight,
      effectiveMaxHeight,
      backgroundColor,
      borderRadius,
      translateY,
      containerStyle,
    ]);

    // Create the modal content
    const modalContent = (
      <View style={styles.container}>
        <Pressable
          onPress={close}
          role="button"
          aria-label={backdropAriaLabel}
          style={styles.backdrop}
        >
          <Animated.View
            style={[
              styles.backdropAnimated,
              {
                opacity: backdropOpacityAnim,
              },
            ]}
          />
        </Pressable>

        <Animated.View
          style={sheetStyles}
          accessibilityRole={sheetAriaProps.role as any}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-modal={sheetAriaProps['aria-modal'] ?? true}
          aria-hidden={sheetAriaProps['aria-hidden'] ?? false}
        >
          <View
            style={[
              styles.handleContainer,
              Platform.OS === 'web' && {
                cursor: (isMouseDragging.current ? 'grabbing' : 'grab') as any,
                // @ts-ignore: Web-specific style properties
                userSelect: 'none',
                WebkitUserSelect: 'none',
              },
            ]}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            {...(Platform.OS === 'web'
              ? {
                  onMouseDown: handleMouseDown,
                  onMouseMove: handleMouseMove,
                  onMouseUp: handleMouseUp,
                  onMouseLeave: handleMouseUp, // Handle mouse leaving the area
                }
              : {})}
          >
            {showHandle && (
              <Pressable
                onPress={close}
                role="button"
                aria-label="Close bottom sheet"
                style={({ pressed }) => [
                  styles.handle,
                  {
                    backgroundColor: handleColor,
                    opacity: pressed ? 0.6 : 1,
                    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
                  },
                ]}
              />
            )}
          </View>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    );

    return (
      <Modal
        animationType={'fade'}
        transparent={true}
        visible={visible}
        onRequestClose={close}
        statusBarTranslucent
        aria-modal={true}
        {...modalProps}
      >
        {enableDragAndDrop ? (
          <GestureHandlerRootView style={{ flex: 1 }}>{modalContent}</GestureHandlerRootView>
        ) : (
          modalContent
        )}
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropAnimated: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    width: '100%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
    backgroundColor: 'transparent',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flexShrink: 1,
  },
});

export default ModalSheet;
