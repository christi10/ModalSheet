import { useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { ANIMATION_CONFIG } from '../utils/constants';

interface UseAnimationsOptions {
  translateY: Animated.Value;
  setIsAnimating: (value: boolean) => void;
  onSnapPointChange?: (index: number) => void;
  setCurrentSnapIndex: (index: number) => void;
}

export const useAnimations = ({
  translateY,
  setIsAnimating,
  onSnapPointChange,
  setCurrentSnapIndex,
}: UseAnimationsOptions) => {
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const isImperativelyAnimating = useRef(false);

  const stopCurrentAnimation = useCallback(() => {
    if (currentAnimation.current) {
      currentAnimation.current.stop();
      currentAnimation.current = null;
    }
  }, []);

  const animateToSnapPoint = useCallback(
    (targetIndex: number, getSnapTranslateY: (index: number) => number) => {
      const targetTranslateY = getSnapTranslateY(targetIndex);

      setCurrentSnapIndex(targetIndex);
      onSnapPointChange?.(targetIndex);
      setIsAnimating(true);

      Animated.timing(translateY, {
        toValue: targetTranslateY,
        duration: ANIMATION_CONFIG.snapPointDuration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    },
    [translateY, setCurrentSnapIndex, onSnapPointChange, setIsAnimating]
  );

  const snapToPoint = useCallback(
    (index: number, snapPointsInPixels: number[] | null, getSnapTranslateY: (index: number) => number) => {
      if (!snapPointsInPixels || index < 0 || index >= snapPointsInPixels.length) return;

      const targetTranslateY = getSnapTranslateY(index);

      setCurrentSnapIndex(index);
      onSnapPointChange?.(index);
      setIsAnimating(true);

      Animated.timing(translateY, {
        toValue: targetTranslateY,
        duration: ANIMATION_CONFIG.snapPointDuration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });
    },
    [translateY, setCurrentSnapIndex, onSnapPointChange, setIsAnimating]
  );

  const findTargetSnapIndex = useCallback(
    (
      currentTranslateY: number,
      snapPointsInPixels: number[] | null,
      currentSnapIndex: number,
      dragThreshold: number,
      getSnapTranslateY: (index: number) => number
    ): number | 'close' => {
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
    []
  );

  return {
    currentAnimation,
    isImperativelyAnimating,
    stopCurrentAnimation,
    animateToSnapPoint,
    snapToPoint,
    findTargetSnapIndex,
  };
};