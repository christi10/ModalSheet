import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

interface UseKeyboardHandlerOptions {
  avoidKeyboard: boolean;
  keyboardOffset: number;
}

export const useKeyboardHandler = ({ avoidKeyboard, keyboardOffset }: UseKeyboardHandlerOptions) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!avoidKeyboard) return;

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: any) => {
        setKeyboardHeight(e.endCoordinates.height + keyboardOffset);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, [avoidKeyboard, keyboardOffset]);

  return keyboardHeight;
};