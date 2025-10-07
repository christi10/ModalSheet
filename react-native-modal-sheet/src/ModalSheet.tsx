import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Animated,
  PanResponder,
  Pressable,
  ViewStyle,
  ModalProps,
  AccessibilityRole,
  Keyboard,
  Platform,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ModalSheetRef {
  open: () => void;
  close: () => void;
  snapToPoint: (index: number) => void;
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
   * Height of the bottom sheet (default: 400)
   * Ignored if snapPoints are provided
   */
  height?: number;

  /**
   * Snap points as percentages of screen height (0-100)
   * Example: [25, 50, 90] creates snap points at 25%, 50%, and 90% of screen height
   * If provided, this overrides the height prop
   */
  snapPoints?: number[];

  /**
   * Initial snap point index (default: 0)
   * Determines which snap point to open to initially
   */
  initialSnapPointIndex?: number;

  /**
   * Enable snapping between points (default: true when snapPoints are provided)
   */
  enableSnapping?: boolean;

  /**
   * Callback when snap point changes
   * @param index - The index of the current snap point
   * @param snapPoint - The percentage value of the snap point
   */
  onSnapPointChange?: (index: number, snapPoint: number) => void;

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
   * Drag threshold to trigger close (default: 125)
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

const ModalSheet = forwardRef<ModalSheetRef, ModalSheetProps>(({
  children,
  height = 400,
  snapPoints,
  initialSnapPointIndex = 0,
  enableSnapping = true,
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
  springDamping = 20,
  containerStyle,
  modalProps,
  // Accessibility props
  accessibilityLabel = 'Bottom sheet',
  accessibilityHint,
  backdropAccessibilityLabel = 'Close bottom sheet',
  sheetAccessibilityProps = {},
}, ref) => {
  const [visible, setVisible] = React.useState(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [currentSnapPointIndex, setCurrentSnapPointIndex] = React.useState(initialSnapPointIndex);
  const translateY = useRef(new Animated.Value(0)).current; // Initialize with 0, will be set properly in useEffect
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;

  // Get screen dimensions
  const screenHeight = Dimensions.get('window').height;

  // Calculate 90% of screen height
  const maxHeight = screenHeight * 0.9;

  // Validate and sort snap points
  const validatedSnapPoints = React.useMemo(() => {
    if (!snapPoints || snapPoints.length === 0) return null;
    return [...snapPoints]
      .filter(point => point > 0 && point <= 100)
      .sort((a, b) => a - b);
  }, [snapPoints]);

  // Calculate snap point heights in pixels
  const snapPointHeights = React.useMemo(() => {
    if (!validatedSnapPoints) return null;
    return validatedSnapPoints.map(point => (screenHeight * point) / 100);
  }, [validatedSnapPoints, screenHeight]);

  // Always position at bottom - the height will cover the tabs
  const modalPosition = 0;

  // Keyboard handling
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: any) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        // Ensure modal is properly positioned at bottom when keyboard hides
        setTimeout(() => {
          if (visible) {
            translateY.setValue(modalPosition);
          }
        }, 100);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, [visible, modalPosition]);

  // Calculate minimum height to cover bottom tabs (approximately 30% of screen for safety)
  const minCoverHeight = screenHeight * 0.3;

  // Get current height based on snap points or default height
  const currentHeight = React.useMemo(() => {
    if (snapPointHeights && snapPointHeights.length > 0) {
      const index = Math.min(currentSnapPointIndex, snapPointHeights.length - 1);
      return snapPointHeights[index];
    }
    return height;
  }, [snapPointHeights, currentSnapPointIndex, height]);

  // Adjust height when keyboard is visible - use 90% of screen height
  const adjustedHeight = React.useMemo(() => {
    if (keyboardHeight > 0) {
      // When keyboard is visible, use 90% of screen height
      return Math.min(maxHeight, screenHeight - keyboardHeight - 50);
    }
    // When keyboard is hidden, use snap point height or minimum height to cover bottom tabs
    return Math.max(currentHeight, minCoverHeight);
  }, [currentHeight, keyboardHeight, maxHeight, screenHeight, minCoverHeight]);

  // Helper function to find nearest snap point
  const findNearestSnapPoint = (dragDistance: number, velocity: number): number => {
    if (!snapPointHeights || !validatedSnapPoints || !enableSnapping) {
      return currentSnapPointIndex;
    }

    const currentHeightPx = snapPointHeights[currentSnapPointIndex];

    // If dragging down significantly, check if should close or go to lower snap point
    if (dragDistance > 0) {
      // Fast downward swipe or exceeded threshold - close
      if (velocity > 0.5 || dragDistance > dragThreshold) {
        return -1; // Indicates should close
      }

      // Find next lower snap point
      if (currentSnapPointIndex > 0) {
        const prevHeight = snapPointHeights[currentSnapPointIndex - 1];
        const midPoint = (currentHeightPx - prevHeight) / 2;

        if (dragDistance > midPoint || velocity > 0.2) {
          return currentSnapPointIndex - 1;
        }
      } else if (dragDistance > dragThreshold / 2) {
        return -1; // Close if at lowest snap point and dragged enough
      }
    } else {
      // Dragging up - check if should go to higher snap point
      const absDrag = Math.abs(dragDistance);

      if (currentSnapPointIndex < snapPointHeights.length - 1) {
        const nextHeight = snapPointHeights[currentSnapPointIndex + 1];
        const midPoint = (nextHeight - currentHeightPx) / 2;

        if (absDrag > midPoint || velocity < -0.2) {
          return currentSnapPointIndex + 1;
        }
      }
    }

    return currentSnapPointIndex;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 3);
      },
      onPanResponderGrant: () => {
        // Capture the starting position when the gesture begins
        translateY.stopAnimation((value) => {
          translateY.setOffset(value);
          translateY.setValue(0);
        });
      },
      onPanResponderMove: (_, gestureState) => {
        if (snapPointHeights && enableSnapping) {
          // With snap points, allow more flexible dragging
          if (gestureState.dy > 0) {
            // Dragging down - follow finger directly
            translateY.setValue(gestureState.dy);
          } else {
            // Dragging up - follow finger with slight resistance
            const canDragUp = currentSnapPointIndex < snapPointHeights.length - 1;
            if (canDragUp) {
              translateY.setValue(gestureState.dy * 0.8);
            } else {
              // At highest point, add more resistance
              translateY.setValue(gestureState.dy * 0.3);
            }
          }
        } else {
          // Original behavior without snap points
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          } else {
            translateY.setValue(gestureState.dy * 0.3);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();

        if (snapPointHeights && enableSnapping) {
          // Handle snapping logic
          const targetIndex = findNearestSnapPoint(gestureState.dy, gestureState.vy);

          if (targetIndex === -1) {
            close();
          } else if (targetIndex !== currentSnapPointIndex) {
            snapToPoint(targetIndex);
          } else {
            // Snap back to current position
            Animated.spring(translateY, {
              toValue: modalPosition,
              damping: springDamping,
              stiffness: 500,
              overshootClamping: true,
              useNativeDriver: true,
            }).start();
          }
        } else {
          // Original behavior without snap points
          const shouldClose =
            gestureState.vy > 0.5 ||
            (gestureState.dy > dragThreshold / 2 && gestureState.vy > 0.1) ||
            gestureState.dy > dragThreshold;

          if (shouldClose) {
            close();
          } else {
            Animated.spring(translateY, {
              toValue: modalPosition,
              damping: springDamping,
              stiffness: 500,
              overshootClamping: true,
              useNativeDriver: true,
            }).start();
          }
        }
      },
    })
  ).current;

  const snapToPoint = (index: number) => {
    if (!snapPointHeights || !validatedSnapPoints) return;

    const targetIndex = Math.max(0, Math.min(index, snapPointHeights.length - 1));

    if (targetIndex === currentSnapPointIndex) return;

    // Configure smooth layout animation for height change
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        300,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.scaleY
      )
    );

    // Update state to trigger height change
    setCurrentSnapPointIndex(targetIndex);

    // Animate translateY back to position
    Animated.spring(translateY, {
      toValue: modalPosition,
      damping: springDamping,
      stiffness: 500,
      overshootClamping: true,
      useNativeDriver: true,
    }).start(() => {
      onSnapPointChange?.(targetIndex, validatedSnapPoints[targetIndex]);
    });
  };

  const open = () => {
    setVisible(true);
    // Reset to initial snap point when opening
    if (snapPointHeights && initialSnapPointIndex !== currentSnapPointIndex) {
      setCurrentSnapPointIndex(initialSnapPointIndex);
    }

    Animated.parallel([
      Animated.timing(backdropOpacityAnim, {
        toValue: backdropOpacity,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: modalPosition,
        damping: springDamping,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onOpen?.();
    });
  };

  const close = () => {
    Animated.parallel([
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
    ]).start(() => {
      setVisible(false);
      onClose?.();
    });
  };

  useImperativeHandle(ref, () => ({
    open,
    close,
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
      {...modalProps}
    >
      <View style={styles.container}>
        <Pressable
          onPress={close}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={backdropAccessibilityLabel}
          accessibilityHint="Tap to close the bottom sheet"
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
          style={[
            styles.sheet,
            {
              height: adjustedHeight,
              backgroundColor,
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
              transform: [
                { translateY: translateY }
              ],
            },
            containerStyle,
          ]}
          accessible={true}
          accessibilityRole="none"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          importantForAccessibility="yes"
          {...sheetAccessibilityProps}
        >
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            {showHandle && (
            <Pressable
              onPress={close}
              accessible={true}
              accessibilityRole="button"
              style={({ pressed }) => [
                  styles.handle,
                  {
                    backgroundColor: handleColor,
                  opacity: pressed ? 0.6 : 1,
                  }
                ]}
              />
            )}
          </View>
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

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
