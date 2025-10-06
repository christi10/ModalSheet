import React from 'react';
import { Text, TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text'
  );

  const fontSize = {
    default: 16,
    title: 32,
    defaultSemiBold: 16,
    subtitle: 20,
    link: 16,
  }[type];

  const fontWeight = type === 'defaultSemiBold' ? '600' : 'normal';

  return (
    <Text
      style={[
        { color, fontSize, fontWeight },
        style,
      ]}
      {...rest}
    />
  );
}
