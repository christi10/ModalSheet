import React from 'react';
import {
  View,
  Modal,
  Animated,
  Pressable,
  ViewStyle,
  Platform,
  ModalProps,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { styles } from '../styles';
import type { ModalSheetAccessibilityProps } from '../types';

interface ModalSheetViewProps extends ModalSheetAccessibilityProps {
  visible: boolean;
  enableDragAndDrop: boolean;
  backgroundColor: string;
  borderRadius: number;
  showHandle: boolean;
  handleColor: string;
  containerStyle?: ViewStyle;
  modalProps?: Partial<ModalProps>;
  children: React.ReactNode;

  // Animated values
  translateY: Animated.Value;
  backdropOpacityAnim: Animated.Value;
  sheetHeight?: number;
  maxHeight: number;

  // Handlers
  onClose: () => void;
  handleTouchStart: (e: any) => void;
  handleTouchMove: (e: any) => void;
  handleTouchEnd: (e: any) => void;
  handleMouseDown?: (e: any) => void;
  handleMouseMove?: (e: any) => void;
  handleMouseUp?: (e: any) => void;
  isMouseDragging: React.MutableRefObject<boolean>;
}

export const ModalSheetView: React.FC<ModalSheetViewProps> = ({
  visible,
  enableDragAndDrop,
  backgroundColor,
  borderRadius,
  showHandle,
  handleColor,
  containerStyle,
  modalProps,
  children,
  translateY,
  backdropOpacityAnim,
  sheetHeight,
  maxHeight,
  onClose,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  isMouseDragging,
  // Accessibility props
  'aria-label': ariaLabel = 'Bottom sheet',
  'aria-describedby': ariaDescribedBy,
  backdropAriaLabel = 'Close bottom sheet',
  sheetAriaProps = {},
}) => {
  // Compute sheet styles
  const sheetStyles = React.useMemo(() => {
    const baseStyles: (ViewStyle | typeof styles.sheet)[] = [
      styles.sheet,
      {
        ...(sheetHeight !== undefined && {
          height: sheetHeight,
        }),
        maxHeight,
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
  }, [sheetHeight, maxHeight, backgroundColor, borderRadius, translateY, containerStyle]);

  const modalContent = (
    <View style={styles.container}>
      <Pressable
        onPress={onClose}
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
              onPress={onClose}
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
      onRequestClose={onClose}
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
};