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
} from 'react-native';

export interface ModalSheetRef {
  open: () => void;
  close: () => void;
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
   */
  height?: number;

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
  const translateY = useRef(new Animated.Value(0)).current; // Initialize with 0, will be set properly in useEffect
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;

  // Get screen dimensions
  const screenHeight = Dimensions.get('window').height;

  // Calculate 90% of screen height
  const maxHeight = screenHeight * 0.9;

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

  // Adjust height when keyboard is visible - use 90% of screen height
  const adjustedHeight = React.useMemo(() => {
    if (keyboardHeight > 0) {
      // When keyboard is visible, use 90% of screen height
      return Math.min(maxHeight, screenHeight - keyboardHeight - 50);
    }
    // When keyboard is hidden, use minimum height to cover bottom tabs
    return Math.max(height, minCoverHeight);
  }, [height, keyboardHeight, maxHeight, screenHeight, minCoverHeight]);

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
        // Allow dragging in both directions but with resistance when pulling up
        if (gestureState.dy > 0) {
          // When dragging down, follow the finger directly
          translateY.setValue(gestureState.dy);
        } else {
          // When dragging up, apply resistance (reduce the movement)
          translateY.setValue(gestureState.dy * 0.3);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();

        // Calculate velocity and distance to determine if we should close
        const shouldClose =
          gestureState.vy > 0.5 || // Fast swipe down
          (gestureState.dy > dragThreshold / 2 && gestureState.vy > 0.1) || // Medium swipe down
          gestureState.dy > dragThreshold; // Slow but long swipe down

        if (shouldClose) {
          close();
        } else {
          // Animate back to the open position with spring physics
          Animated.spring(translateY, {
            toValue: modalPosition,
            damping: springDamping,
            stiffness: 500,
            overshootClamping: true,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const open = () => {
    setVisible(true);
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
