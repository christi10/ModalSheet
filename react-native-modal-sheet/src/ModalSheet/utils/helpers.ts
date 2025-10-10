import { Dimensions } from 'react-native';

export const getScreenHeight = () => Dimensions.get('window').height;

export const getDefaultMaxHeight = () => getScreenHeight() * 0.9;

export const calculateSheetHeight = (
  height: number | undefined,
  snapPointsInPixels: number[] | null
): number | undefined => {
  // If using snap points, always use the LARGEST snap point as container height
  if (snapPointsInPixels && snapPointsInPixels.length > 0) {
    return snapPointsInPixels[snapPointsInPixels.length - 1];
  }

  // If height is explicitly provided, use it
  if (height !== undefined) {
    return height;
  }

  // Otherwise use 'auto' by not setting a fixed height
  return undefined;
};