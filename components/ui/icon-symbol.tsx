import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
}

export function IconSymbol({ name, size = 28, color = '#000' }: IconSymbolProps) {
  // Map common icon names to Ionicons
  const getIconName = (iconName: string) => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      'house.fill': 'home',
      'paperplane.fill': 'paper-plane',
      'square.grid.2x2.fill': 'grid',
      'person.fill': 'person',
      'gear': 'settings',
      'bell.fill': 'notifications',
      'magnifyingglass': 'search',
      'heart.fill': 'heart',
      'star.fill': 'star',
      'bookmark.fill': 'bookmark',
      'ellipsis': 'ellipsis-horizontal',
    };

    return iconMap[iconName] || 'help-circle';
  };

  return <Ionicons name={getIconName(name)} size={size} color={color} />;
}
