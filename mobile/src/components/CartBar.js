import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../context/CartContext';
import { colors, radius, shadow } from '../theme/theme';
import { formatNaira } from '../utils/currency';

const CartBar = ({ onPress, style }) => {
  const { itemCount, total } = useCart();
  if (itemCount === 0) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.wrap, style]}
    >
      <LinearGradient
        colors={[colors.yellow, colors.orange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bar}
      >
        <View style={styles.count}>
          <Text style={styles.countText}>{itemCount}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.label}>View your cart</Text>
          <Text style={styles.total}>{formatNaira(total)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.white} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 84,
    ...shadow.float,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  count: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  countText: {
    color: colors.white,
    fontWeight: '600',
  },
  copy: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
  },
  total: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartBar;
