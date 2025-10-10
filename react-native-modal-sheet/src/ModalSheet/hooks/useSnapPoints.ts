import { useMemo, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

export const useSnapPoints = (
  snapPoints: (string | number)[] | SharedValue<(string | number)[]> | undefined
) => {
  const screenHeight = Dimensions.get('window').height;

  const snapPointsInPixels = useMemo(() => {
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

  return {
    snapPointsInPixels,
    getSnapTranslateY,
    screenHeight,
  };
};