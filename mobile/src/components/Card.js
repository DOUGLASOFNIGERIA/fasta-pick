import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { md3 } from '../theme/theme';

const Card = ({ children, onPress, variant = 'elevated', style }) => {
  if (onPress) {
    return (
      <Pressable
        android_ripple={{ color: md3.color.primary, borderless: false }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          styles[variant],
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: md3.shape.large,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: md3.color.surfaceContainerLow,
    ...md3.elevation[1],
  },
  filled: {
    backgroundColor: md3.color.surfaceContainerHighest,
  },
  outlined: {
    backgroundColor: md3.color.surface,
    borderWidth: 1,
    borderColor: md3.color.outlineVariant,
  },
  pressed: {
    opacity: 0.9,
  },
});

export default Card;
