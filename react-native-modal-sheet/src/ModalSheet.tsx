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
  AccessibilityInfo,
  AccessibilityRole,
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
   * Accessibility label for the drag handle
   */
  handleAccessibilityLabel?: string;

  /**
   * Accessibility hint for the drag handle
   */
  handleAccessibilityHint?: string;

  /**
   * Announcement when sheet opens
   */
  openAccessibilityAnnouncement?: string;

  /**
   * Announcement when sheet closes
   */
  closeAccessibilityAnnouncement?: string;

  /**
   * Whether to focus on sheet content when opened (default: true)
   */
  autoFocus?: boolean;

  /**
   * Whether the modal should be announced as a live region
   */
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';

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
  handleAccessibilityLabel = 'Drag to close',
  handleAccessibilityHint = 'Double tap to close, or drag down',
  openAccessibilityAnnouncement = 'Bottom sheet opened',
  closeAccessibilityAnnouncement = 'Bottom sheet closed',
  accessibilityLiveRegion = 'polite',
  sheetAccessibilityProps = {},
}, ref) => {
  const [visible, setVisible] = React.useState(false);
  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > dragThreshold) {
          close();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: springDamping,
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
        toValue: 0,
        damping: springDamping,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (openAccessibilityAnnouncement) {
        AccessibilityInfo.announceForAccessibility(openAccessibilityAnnouncement);
      }
      onOpen?.();
    });
  };

  const close = () => {
    if (closeAccessibilityAnnouncement) {
      AccessibilityInfo.announceForAccessibility(closeAccessibilityAnnouncement);
    }

    Animated.parallel([
      Animated.timing(backdropOpacityAnim, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: height,
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
      translateY.setValue(height);
      backdropOpacityAnim.setValue(0);
    }
  }, [visible, height]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={close}
      statusBarTranslucent
      accessibilityViewIsModal={true}
      {...modalProps}
    >
      <View
        style={styles.container}
        accessibilityLiveRegion={accessibilityLiveRegion}
      >
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
              height,
              backgroundColor,
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
              transform: [{ translateY }],
            },
            containerStyle,
          ]}
          {...panResponder.panHandlers}
          accessible={true}
          accessibilityRole="none"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          importantForAccessibility="yes"
          {...sheetAccessibilityProps}
        >
          {showHandle && (
            <Pressable
              onPress={close}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={handleAccessibilityLabel}
              accessibilityHint={handleAccessibilityHint}
              style={({ pressed }) => [
                styles.handle,
                {
                  backgroundColor: handleColor,
                  opacity: pressed ? 0.6 : 1,
                }
              ]}
            />
          )}
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
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
});

export default ModalSheet;
