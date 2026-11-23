import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { md3 } from '../theme/theme';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secure = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  editable = true,
  right,
  error,
}) => {
  const [hidden, setHidden] = useState(secure);
  const [focused, setFocused] = useState(false);
  const float = useRef(new Animated.Value(focused || value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(float, {
      toValue: focused || !!value ? 1 : 0,
      duration: md3.motion.short,
      useNativeDriver: false,
    }).start();
  }, [focused, value, float]);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.field,
          multiline && styles.multilineField,
          focused && styles.focused,
          !!error && styles.errored,
          !editable && styles.readonly,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? md3.color.primary : md3.color.onSurfaceVariant}
            style={styles.icon}
          />
        )}
        {label && (
          <Animated.Text
            style={[
              styles.floatingLabel,
              {
                left: icon ? 46 : 16,
                top: float.interpolate({ inputRange: [0, 1], outputRange: [18, 6] }),
                fontSize: float.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
                color: focused ? md3.color.primary : md3.color.onSurfaceVariant,
              },
            ]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={!label || focused || !!value ? placeholder : undefined}
          placeholderTextColor={md3.color.onSurfaceVariant}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          editable={editable}
          style={[
            styles.input,
            multiline && styles.multiline,
            label && styles.withLabel,
            icon && styles.withIcon,
          ]}
        />
        {secure && (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={md3.color.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
        {right}
      </View>
      {!!error && (
        <Text style={styles.supportingText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderRadius: md3.shape.extraSmall,
    borderWidth: 1,
    borderColor: md3.color.outline,
    backgroundColor: md3.color.surfaceContainerLowest,
    paddingHorizontal: 16,
  },
  multilineField: {
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  focused: {
    borderWidth: 2,
    borderColor: md3.color.primary,
  },
  errored: {
    borderColor: md3.color.error,
  },
  readonly: {
    borderColor: md3.color.outlineVariant,
    backgroundColor: md3.color.surfaceContainerLow,
  },
  icon: {
    marginRight: 12,
  },
  floatingLabel: {
    position: 'absolute',
    backgroundColor: md3.color.surfaceContainerLowest,
    paddingHorizontal: 4,
    fontWeight: '400',
  },
  input: {
    flex: 1,
    fontSize: md3.type.bodyLarge.fontSize,
    lineHeight: md3.type.bodyLarge.lineHeight,
    color: md3.color.onSurface,
    paddingVertical: 0,
  },
  withLabel: {
    paddingTop: 14,
  },
  withIcon: {
    marginLeft: 0,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  supportingText: {
    fontSize: md3.type.bodySmall.fontSize,
    lineHeight: md3.type.bodySmall.lineHeight,
    color: md3.color.error,
    marginTop: 4,
    marginLeft: 16,
  },
});

export default Input;
