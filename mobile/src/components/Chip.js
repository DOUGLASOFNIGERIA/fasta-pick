import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { md3 } from '../theme/theme';

const Chip = ({
  label,
  onPress,
  selected = false,
  icon,
  variant = 'filter',
  style,
  textStyle,
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{ selected }}
    android_ripple={{ color: md3.color.primary }}
    onPress={onPress}
    style={({ pressed }) => [
      styles.chip,
      selected && styles.selected,
      variant === 'input' && styles.input,
      pressed && styles.pressed,
      style,
    ]}
  >
    {selected && variant === 'filter' ? (
      <Ionicons
        name="check"
        size={16}
        color={md3.color.onSecondaryContainer}
        style={styles.icon}
      />
    ) : null}
    {icon && !selected ? (
      <Ionicons name={icon} size={16} color={md3.color.onSurfaceVariant} style={styles.icon} />
    ) : null}
    <Text
      style={[
        styles.label,
        selected && styles.labelSelected,
        textStyle,
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: md3.shape.small,
    borderWidth: 1,
    borderColor: md3.color.outline,
    backgroundColor: md3.color.surface,
    marginRight: 8,
  },
  selected: {
    backgroundColor: md3.color.secondaryContainer,
    borderColor: 'transparent',
  },
  input: {
    backgroundColor: md3.color.surfaceContainerHighest,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.82,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: md3.type.labelMedium.fontSize,
    lineHeight: md3.type.labelMedium.lineHeight,
    letterSpacing: md3.type.labelMedium.letterSpacing,
    fontWeight: md3.type.labelMedium.fontWeight,
    color: md3.color.onSurfaceVariant,
  },
  labelSelected: {
    color: md3.color.onSecondaryContainer,
  },
});

export default Chip;
