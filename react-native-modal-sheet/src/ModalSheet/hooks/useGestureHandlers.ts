import { useCallback, useRef, useEffect } from 'react';
import { Animated, GestureResponderEvent, Platform, Easing } from 'react-native';

interface UseGestureHandlersOptions {
  translateY: Animated.Value;
  backdropOpacityAnim: Animated.Value;
  isAnimating: boolean;
  snapPointsInPixels: number[] | null;
  currentSnapIndex: number;
  dragThreshold: number;
  screenHeight: number;
  getSnapTranslateY: (index: number) => number;
  onClose?: () => void;
  findTargetSnapIndex: (currentTranslateY: number) => number | 'close';
  animateToSnapPoint: (targetIndex: number) => void;
  close: () => void;
  setVisible: (visible: boolean) => void;
}

export const useGestureHandlers = ({
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
  animateToSnapPoint,
  close,
  setVisible,
}: UseGestureHandlersOptions) => {
  // Touch gesture tracking
  const touchStartY = useRef(0);
  const touchStartTranslateY = useRef(0);
  const isDragging = useRef(false);
  const isMouseDragging = useRef(false);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: GestureResponderEvent) => {
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

        // Only prevent swiping UP when at maximum height
        if (
          currentSnapIndex === snapPointsInPixels.length - 1 &&
          newTranslateY < maxSnapTranslateY
        ) {
          translateY.setValue(maxSnapTranslateY);
          return;
        }
      }

      // For non-snap mode, prevent upward dragging beyond 0
      if (!snapPointsInPixels && newTranslateY < 0) {
        translateY.setValue(0);
        return;
      }

      translateY.setValue(newTranslateY);
    },
    [translateY, snapPointsInPixels, currentSnapIndex, getSnapTranslateY]
  );

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

        animateToSnapPoint(target);
      } else {
        const deltaY = e.nativeEvent.pageY - touchStartY.current;
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
      setVisible,
    ]
  );

  // Handle mouse events for web platform
  const handleMouseDown = useCallback(
    (e: any) => {
      e.preventDefault?.();
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

      if (snapPointsInPixels && snapPointsInPixels.length > 0) {
        const maxSnapTranslateY = getSnapTranslateY(snapPointsInPixels.length - 1);

        if (
          currentSnapIndex === snapPointsInPixels.length - 1 &&
          newTranslateY < maxSnapTranslateY
        ) {
          translateY.setValue(maxSnapTranslateY);
          return;
        }
      }

      if (!snapPointsInPixels && newTranslateY < 0) {
        translateY.setValue(0);
        return;
      }

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

      if (snapPointsInPixels && snapPointsInPixels.length > 0) {
        const target = findTargetSnapIndex(currentTranslateY);

        if (target === 'close') {
          close();
          return;
        }

        animateToSnapPoint(target);
      } else {
        const deltaY = pageY - touchStartY.current;
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
      setVisible,
    ]
  );

  // Add global mouse event listeners for web platform
  useEffect(() => {
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

    return undefined;
  }, [handleMouseUp, handleMouseMove]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isMouseDragging,
  };
};