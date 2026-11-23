import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { md3 } from '../theme/theme';

const VARIANTS = {
  primary: 'filled',
  orange: 'filled',
  filled: 'filled',
  tonal: 'tonal',
  outline: 'outlined',
  elevated: 'elevated',
  ghost: 'text',
  text: 'text',
};

const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const resolved = VARIANTS[variant] || 'filled';
  const isFilled = resolved === 'filled';
  const isTonal = resolved === 'tonal';
  const isOutlined = resolved === 'outlined';
  const isElevated = resolved === 'elevated';
  const isText = resolved === 'text';

  const labelColor = isFilled
    ? md3.color.onPrimary
    : isTonal
      ? md3.color.onPrimaryContainer
      : md3.color.primary;

  const content = loading ? (
    <ActivityIndicator color={labelColor} size="small" />
  ) : (
    <View style={styles.row}>
      {icon && (
        <Ionicons name={icon} size={18} color={labelColor} style={styles.icon} />
      )}
      <Text style={[styles.label, { color: labelColor }, textStyle]}>{title}</Text>
    </View>
  );

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      android_ripple={{
        color:
          isFilled || isTonal ? labelColor : md3.color.primary,
        borderless: false,
      }}
      hitSlop={{ top: 4, bottom: 4 }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isFilled && styles.filled,
        isTonal && styles.tonal,
        isOutlined && styles.outlined,
        isElevated && styles.elevated,
        isText && styles.text,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 40,
    borderRadius: md3.shape.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  filled: {
    backgroundColor: md3.color.primary,
  },
  tonal: {
    backgroundColor: md3.color.primaryContainer,
  },
  outlined: {
    backgroundColor: md3.color.surface,
    borderWidth: 1,
    borderColor: md3.color.outline,
  },
  elevated: {
    backgroundColor: md3.color.surface,
    ...md3.elevation[1],
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
  },
  disabled: {
    backgroundColor: md3.color.surfaceContainerHighest,
    borderColor: 'transparent',
    ...md3.elevation[0],
  },
  pressed: {
    opacity: 0.86,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: md3.type.labelLarge.fontSize,
    lineHeight: md3.type.labelLarge.lineHeight,
    letterSpacing: md3.type.labelLarge.letterSpacing,
    fontWeight: md3.type.labelLarge.fontWeight,
    textAlign: 'center',
  },
});

export default Button;
