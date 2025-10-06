import React from 'react';
import { View, ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'background';
}

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    type === 'background' ? 'background' : 'background'
  );

  return (
    <View
      style={[
        { backgroundColor },
        style,
      ]}
      {...rest}
    />
  );
}
