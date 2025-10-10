import { useCallback, useRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

interface UseScrollHandlerOptions {
  enableScrollToExpand: boolean;
  snapPointsInPixels: number[] | null;
  currentSnapIndex: number;
  scrollExpandThreshold: number;
  snapToPoint: (index: number) => void;
  close: () => void;
}

export const useScrollHandler = ({
  enableScrollToExpand,
  snapPointsInPixels,
  currentSnapIndex,
  scrollExpandThreshold,
  snapToPoint,
  close,
}: UseScrollHandlerOptions) => {
  // Scroll tracking for expansion
  const lastScrollY = useRef(0);
  const scrollVelocity = useRef(0);
  const canExpandFromScroll = useRef(true);
  const scrollStartY = useRef(0);
  const isDraggingSheet = useRef(false);

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

  return {
    handleScroll,
    handleScrollBeginDrag,
    handleScrollEndDrag,
  };
};