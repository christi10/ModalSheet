import React, {useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback} from 'react';
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
  LayoutChangeEvent,
  Easing,
} from 'react-native';

export interface ModalSheetRef {
  open: () => void;
  close: () => void;
  present: () => void; // Alias for open()
  dismiss: () => void; // Alias for close()
  snapToPoint: (index: number) => void; // Snap to a specific snap point
}

export interface ModalSheetAccessibilityProps {
  /**
   * Accessibility label for the modal
   */
  accessibilityLabel?: string;

  /**
   * Accessibility hint for the modal
   */
  accessibilityHint?: string;

  /**
   * Accessibility label for the backdrop
   */
  backdropAccessibilityLabel?: string;

  /**
   * Additional accessibility props for the sheet container
   */
  sheetAccessibilityProps?: {
    accessibilityRole?: AccessibilityRole;
    accessibilityState?: any;
    importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  };
}

export interface ModalSheetProps extends ModalSheetAccessibilityProps {
  /**
   * Content to be rendered inside the bottom sheet
   */
  children: React.ReactNode;

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
  snapPoints?: number[];

  /**
   * Initial snap point index (default: 0)
   * Which snap point to open to initially
   */
  initialSnapIndex?: number;

  /**
   * Enable scroll-to-expand behavior (default: false)
   * When true, scrolling up on content will expand to the next snap point
   */
  enableScrollToExpand?: boolean;

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
          height,
          maxHeight,
          minHeight = 150,
          snapPoints,
          initialSnapIndex = 0,
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
          accessibilityLabel = 'Bottom sheet',
          accessibilityHint,
          backdropAccessibilityLabel = 'Close bottom sheet',
          sheetAccessibilityProps = {},
        },
        ref,
    ) => {
      const [visible, setVisible] = useState(false);
      const visibleRef = useRef(visible);
      const [keyboardHeight, setKeyboardHeight] = useState(0);
      const [contentHeight, setContentHeight] = useState(0);
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
        if (!snapPoints || snapPoints.length === 0) return null;
        return snapPoints.map(point => {
          // If value is between 0 and 1, treat as percentage
          if (point > 0 && point <= 1) {
            return screenHeight * point;
          }
          // Otherwise treat as absolute pixel value
          return point;
        });
      }, [snapPoints, screenHeight]);

      // Keyboard handling
      useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e: any) => {
              setKeyboardHeight(e.endCoordinates.height);
            },
        );

        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
              setKeyboardHeight(0);
            },
        );

        return () => {
          keyboardWillShowListener?.remove();
          keyboardWillHideListener?.remove();
        };
      }, []);

      // Handle content layout to measure its height
      const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
        const {height: measuredHeight} = event.nativeEvent.layout;
        // Add handle height (40) + padding (top 12 + bottom 20 = 32) = 72
        const totalHeight = measuredHeight + 72;
        setContentHeight(totalHeight);
      }, []);

      // Calculate the final height for the modal
      const calculatedHeight = React.useMemo(() => {
        // If using snap points, always use the LARGEST snap point as container height
        if (snapPointsInPixels && snapPointsInPixels.length > 0) {
          return snapPointsInPixels[snapPointsInPixels.length - 1];
        }

        // If height is explicitly provided, use it
        if (height !== undefined) {
          // Respect maxHeight constraint
          const constrainedHeight = Math.min(height, effectiveMaxHeight);
          // Respect minHeight constraint
          return Math.max(constrainedHeight, minHeight);
        }

        // Auto-sizing based on content
        if (contentHeight > 0) {

          // When keyboard is visible, limit height
          if (keyboardHeight > 0) {
            const availableHeight = screenHeight - keyboardHeight - 50;
            return Math.max(
                minHeight,
                Math.min(contentHeight, availableHeight, effectiveMaxHeight)
            );
          }

          // Normal case: use content height with constraints
          return Math.max(minHeight, Math.min(contentHeight, effectiveMaxHeight));
        }

        // Default to minHeight while measuring
        return minHeight;
      }, [height, contentHeight, keyboardHeight, effectiveMaxHeight, minHeight, screenHeight, snapPointsInPixels]);

      // Get the translateY offset for a given snap index
      // The sheet is always full height, we just translate it up/down to show different amounts
      const getSnapTranslateY = useCallback((index: number): number => {
        if (!snapPointsInPixels || snapPointsInPixels.length === 0) return 0;
        const maxHeight = snapPointsInPixels[snapPointsInPixels.length - 1];
        const targetHeight = snapPointsInPixels[index];
        // Return how much to hide (push down) from the max height
        return maxHeight - targetHeight;
      }, [snapPointsInPixels]);

      // Snap to a specific snap point
      const snapToPoint = useCallback((index: number) => {
        if (!snapPointsInPixels || index < 0 || index >= snapPointsInPixels.length) return;

        const targetTranslateY = getSnapTranslateY(index);

        // Update state
        setCurrentSnapIndex(index);
        onSnapPointChange?.(index);
        setIsAnimating(true);

        // Use timing for predictable, quick animations
        Animated.timing(translateY, {
          toValue: targetTranslateY,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setIsAnimating(false);
        });
      }, [snapPointsInPixels, onSnapPointChange, translateY, getSnapTranslateY]);

      // Helper: Determine target snap index based on current position
      const findTargetSnapIndex = useCallback((currentTranslateY: number): number | 'close' => {
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
      }, [snapPointsInPixels, currentSnapIndex, dragThreshold, getSnapTranslateY]);

      // Helper: Animate to target snap point
      const animateToSnapPoint = useCallback((targetIndex: number) => {
        if (!snapPointsInPixels) return;

        const targetTranslateY = getSnapTranslateY(targetIndex);

        // Update state
        setCurrentSnapIndex(targetIndex);
        onSnapPointChange?.(targetIndex);
        setIsAnimating(true);

        // Use timing for predictable, quick animations
        Animated.timing(translateY, {
          toValue: targetTranslateY,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          setIsAnimating(false);
        });
      }, [snapPointsInPixels, onSnapPointChange, translateY, getSnapTranslateY]);

      // Handle touch start
      const handleTouchStart = useCallback((e: GestureResponderEvent) => {
        // Prevent touch interactions during animation
        if (isAnimating) return;

        touchStartY.current = e.nativeEvent.pageY;
        touchStartTranslateY.current = (translateY as any)._value || 0;
        isDragging.current = true;
      }, [translateY, isAnimating]);

      // Handle touch move
      const handleTouchMove = useCallback((e: GestureResponderEvent) => {
        if (!isDragging.current) return;

        const deltaY = e.nativeEvent.pageY - touchStartY.current;
        const newTranslateY = touchStartTranslateY.current + deltaY;

        // Apply translateY for immediate visual feedback during drag
        translateY.setValue(newTranslateY);
      }, [translateY]);

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

        // Set initial translateY position for snap points
        const initialTranslateY = snapPointsInPixels ? getSnapTranslateY(initialSnapIndex) : 0;
        translateY.setValue(initialTranslateY);

        currentAnimation.current = Animated.timing(backdropOpacityAnim, {
          toValue: backdropOpacity,
          duration: animationDuration,
          useNativeDriver: true,
        });

        currentAnimation.current.start(() => {
          currentAnimation.current = null;
          isImperativelyAnimating.current = false;

          // Defer only the callback to avoid useInsertionEffect warning
          setTimeout(() => {
            onOpen?.();
          }, 0);
        });
      }, [snapPointsInPixels, initialSnapIndex, backdropOpacity, animationDuration, onOpen, translateY, backdropOpacityAnim, getSnapTranslateY]);

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
          setVisible(false);
          isImperativelyAnimating.current = false;

          // Defer only the callback to avoid useInsertionEffect warning
          setTimeout(() => {
            onClose?.();
          }, 0);
        });
      }, [animationDuration, screenHeight, onClose, translateY, backdropOpacityAnim]);

      // Handle touch end
      const handleTouchEnd = useCallback((e: GestureResponderEvent) => {
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
              setVisible(false);
              setTimeout(() => {
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
      }, [snapPointsInPixels, findTargetSnapIndex, animateToSnapPoint, close, translateY, dragThreshold, backdropOpacityAnim, screenHeight, onClose]);

      // Expose imperative methods through ref
      useImperativeHandle(ref, () => ({
        open,
        close,
        present: open,
        dismiss: close,
        snapToPoint,
      }));

      useEffect(() => {
        if (!visible) {
          translateY.setValue(screenHeight + 100);
          backdropOpacityAnim.setValue(0);
        }
      }, [visible, screenHeight]);

      return (
          <Modal
              transparent={true}
              visible={visible}
              onRequestClose={close}
              statusBarTranslucent
              accessibilityViewIsModal={true}
              {...modalProps}>
            <View style={styles.container}>
              <Pressable
                  onPress={close}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={backdropAccessibilityLabel}
                  accessibilityHint="Tap to close the bottom sheet"
                  style={styles.backdrop}>
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
                  style={[
                    styles.sheet,
                    {
                      height: calculatedHeight,
                      backgroundColor,
                      borderTopLeftRadius: borderRadius,
                      borderTopRightRadius: borderRadius,
                      transform: [{translateY: translateY}],
                    },
                    containerStyle,
                  ]}
                  accessible={true}
                  accessibilityRole="none"
                  accessibilityLabel={accessibilityLabel}
                  accessibilityHint={accessibilityHint}
                  importantForAccessibility="yes"
                  {...sheetAccessibilityProps}>
                <View
                    style={styles.handleContainer}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}>
                  {showHandle && (
                      <Pressable
                          onPress={close}
                          accessible={true}
                          accessibilityRole="button"
                          style={({pressed}) => [
                            styles.handle,
                            {
                              backgroundColor: handleColor,
                              opacity: pressed ? 0.6 : 1,
                            },
                          ]}
                      />
                  )}
                </View>
                <View style={styles.content} onLayout={handleContentLayout}>
                  {children}
                </View>
              </Animated.View>
            </View>
          </Modal>
      );
    },
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
    flex: 1,
    minHeight: 50,
  },
});

export default ModalSheet;
