import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from 'react';
import { Animated, Easing } from 'react-native';

// Types
import type { ModalSheetRef, ModalSheetProps } from './types';

// Hooks
import {
  useKeyboardHandler,
  useSnapPoints,
  useGestureHandlers,
  useScrollHandler,
  useAnimations,
} from './hooks';

// Components
import { ModalSheetView } from './components/ModalSheetView';

// Utils
import { DEFAULT_VALUES, ANIMATION_CONFIG } from './utils/constants';
import { getDefaultMaxHeight, calculateSheetHeight } from './utils/helpers';

const ModalSheet = forwardRef<ModalSheetRef, ModalSheetProps>(
  (
    {
      children,
      enableDragAndDrop = DEFAULT_VALUES.enableDragAndDrop,
      avoidKeyboard = DEFAULT_VALUES.avoidKeyboard,
      keyboardOffset = DEFAULT_VALUES.keyboardOffset,
      height,
      maxHeight,
      minHeight: _minHeight = DEFAULT_VALUES.minHeight,
      snapPoints,
      initialSnapIndex = DEFAULT_VALUES.initialSnapIndex,
      enableScrollToExpand = DEFAULT_VALUES.enableScrollToExpand,
      scrollExpandThreshold = DEFAULT_VALUES.scrollExpandThreshold,
      onSnapPointChange,
      onClose,
      onOpen,
      backgroundColor = DEFAULT_VALUES.backgroundColor,
      borderRadius = DEFAULT_VALUES.borderRadius,
      showHandle = DEFAULT_VALUES.showHandle,
      handleColor = DEFAULT_VALUES.handleColor,
      backdropOpacity = DEFAULT_VALUES.backdropOpacity,
      dragThreshold = DEFAULT_VALUES.dragThreshold,
      animationDuration = DEFAULT_VALUES.animationDuration,
      containerStyle,
      modalProps,
      // Accessibility props
      'aria-label': ariaLabel = DEFAULT_VALUES.ariaLabel,
      'aria-describedby': ariaDescribedBy,
      backdropAriaLabel = DEFAULT_VALUES.backdropAriaLabel,
      sheetAriaProps = {},
    },
    ref
  ) => {
    // State
    const [visible, setVisible] = useState(false);
    const visibleRef = useRef(visible);
    const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnapIndex);
    const [isAnimating, setIsAnimating] = useState(false);
    const [_measuredContentHeight, setMeasuredContentHeight] = useState(0);
    const hasMeasured = useRef(false);

    // Animated values
    const translateY = useRef(new Animated.Value(0)).current;
    const backdropOpacityAnim = useRef(new Animated.Value(0)).current;

    // Keep visibleRef in sync with visible state
    useEffect(() => {
      visibleRef.current = visible;
    }, [visible]);

    // Calculate effective max height
    const defaultMaxHeight = getDefaultMaxHeight();
    const effectiveMaxHeight = maxHeight ?? defaultMaxHeight;

    // Use custom hooks
    const keyboardHeight = useKeyboardHandler({ avoidKeyboard, keyboardOffset });
    const { snapPointsInPixels, getSnapTranslateY, screenHeight } = useSnapPoints(snapPoints);

    // Calculate final height for the modal
    const calculatedHeight = calculateSheetHeight(height, snapPointsInPixels);

    // Use animations hook
    const {
      currentAnimation,
      isImperativelyAnimating,
      stopCurrentAnimation,
      animateToSnapPoint,
      snapToPoint: snapToPointFromHook,
      findTargetSnapIndex: findTargetSnapIndexFromHook,
    } = useAnimations({
      translateY,
      setIsAnimating,
      onSnapPointChange,
      setCurrentSnapIndex,
    });

    // Wrapper functions to pass the right parameters
    const findTargetSnapIndex = useCallback(
      (currentTranslateY: number) => {
        return findTargetSnapIndexFromHook(
          currentTranslateY,
          snapPointsInPixels,
          currentSnapIndex,
          dragThreshold,
          getSnapTranslateY
        );
      },
      [findTargetSnapIndexFromHook, snapPointsInPixels, currentSnapIndex, dragThreshold, getSnapTranslateY]
    );

    const animateToSnapPointWrapper = useCallback(
      (targetIndex: number) => {
        if (!snapPointsInPixels) return;
        animateToSnapPoint(targetIndex, getSnapTranslateY);
      },
      [animateToSnapPoint, snapPointsInPixels, getSnapTranslateY]
    );

    const snapToPoint = useCallback(
      (index: number) => {
        snapToPointFromHook(index, snapPointsInPixels, getSnapTranslateY);
      },
      [snapToPointFromHook, snapPointsInPixels, getSnapTranslateY]
    );

    // Animate sheet position when keyboard appears/disappears
    useEffect(() => {
      if (!avoidKeyboard || !visible) return;

      Animated.timing(translateY, {
        toValue: snapPointsInPixels
          ? getSnapTranslateY(currentSnapIndex) - keyboardHeight
          : -keyboardHeight,
        duration: ANIMATION_CONFIG.keyboardAnimationDuration,
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

    // Open function
    const open = useCallback(() => {
      if (isImperativelyAnimating.current || visibleRef.current) {
        return;
      }

      stopCurrentAnimation();

      isImperativelyAnimating.current = true;
      setVisible(true);

      const initialTranslateY = snapPointsInPixels
        ? getSnapTranslateY(initialSnapIndex)
        : screenHeight;
      translateY.setValue(initialTranslateY);

      currentAnimation.current = Animated.parallel([
        Animated.timing(backdropOpacityAnim, {
          toValue: backdropOpacity,
          duration: animationDuration,
          useNativeDriver: true,
        }),
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
      stopCurrentAnimation,
      currentAnimation,
      isImperativelyAnimating,
    ]);

    // Close function
    const close = useCallback(() => {
      if (!visibleRef.current) {
        return;
      }

      stopCurrentAnimation();
      isImperativelyAnimating.current = true;

      currentAnimation.current = Animated.parallel([
        Animated.timing(backdropOpacityAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: screenHeight + 100,
          duration: animationDuration * 0.8,
          useNativeDriver: true,
        }),
      ]);

      currentAnimation.current.start(() => {
        currentAnimation.current = null;
        isImperativelyAnimating.current = false;

        setTimeout(() => {
          setVisible(false);
          onClose?.();
        }, 0);
      });
    }, [
      animationDuration,
      screenHeight,
      onClose,
      translateY,
      backdropOpacityAnim,
      stopCurrentAnimation,
      currentAnimation,
      isImperativelyAnimating,
    ]);

    // Use gesture handlers hook
    const {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      isMouseDragging,
    } = useGestureHandlers({
      translateY,
      backdropOpacityAnim,
      isAnimating,
      snapPointsInPixels,
      currentSnapIndex,
      dragThreshold,
      screenHeight,
      getSnapTranslateY,
      onClose,
      findTargetSnapIndex,
      animateToSnapPoint: animateToSnapPointWrapper,
      close,
      setVisible,
    });

    // Use scroll handler hook
    const { handleScroll, handleScrollBeginDrag, handleScrollEndDrag } = useScrollHandler({
      enableScrollToExpand,
      snapPointsInPixels,
      currentSnapIndex,
      scrollExpandThreshold,
      snapToPoint,
      close,
    });

    // Reset values when sheet closes
    useEffect(() => {
      if (!visible) {
        translateY.setValue(screenHeight + 100);
        backdropOpacityAnim.setValue(0);
        hasMeasured.current = false;
        setMeasuredContentHeight(0);
      }
    }, [visible, screenHeight, translateY, backdropOpacityAnim]);

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

    return (
      <ModalSheetView
        visible={visible}
        enableDragAndDrop={enableDragAndDrop}
        backgroundColor={backgroundColor}
        borderRadius={borderRadius}
        showHandle={showHandle}
        handleColor={handleColor}
        containerStyle={containerStyle}
        modalProps={modalProps}
        translateY={translateY}
        backdropOpacityAnim={backdropOpacityAnim}
        sheetHeight={calculatedHeight}
        maxHeight={effectiveMaxHeight}
        onClose={close}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        isMouseDragging={isMouseDragging}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        backdropAriaLabel={backdropAriaLabel}
        sheetAriaProps={sheetAriaProps}
      >
        {children}
      </ModalSheetView>
    );
  }
);

export default ModalSheet;
export type { ModalSheetRef, ModalSheetProps } from './types';