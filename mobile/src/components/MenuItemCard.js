import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FoodImage from './FoodImage';
import { colors, radius, spacing, shadow } from '../theme/theme';
import { formatNaira } from '../utils/currency';

const MenuItemCard = ({ item, onPress, onAdd, quantity = 0, compact = false }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={onPress}
    style={[styles.card, compact && styles.compact]}
  >
    <View style={styles.copy}>
      {item.popular && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⭐ Popular</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.bottom}>
        <Text style={styles.price}>{formatNaira(item.price)}</Text>
        {item.spiceLevel > 0 && (
          <View style={styles.spice}>
            <Ionicons name="flame" size={13} color={colors.orange} />
            <Text style={styles.spiceText}>Spicy</Text>
          </View>
        )}
      </View>
    </View>

    <View style={styles.imageWrap}>
      <FoodImage uri={item.image} emoji="🍛" style={styles.image} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAdd}
        style={styles.addButton}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        {quantity > 0 ? (
          <View style={styles.qty}>
            <Text style={styles.qtyText}>{quantity}</Text>
          </View>
        ) : (
          <Ionicons name="add" size={22} color={colors.white} />
        )}
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: spacing.md,
    alignItems: 'stretch',
    ...shadow.card,
  },
  compact: {
    marginBottom: 0,
  },
  copy: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.yellowPale,
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.orangeDark,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  description: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.muted,
    marginTop: 4,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.orangeDark,
  },
  spice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  spiceText: {
    fontSize: 10,
    color: colors.orange,
    marginLeft: 2,
  },
  imageWrap: {
    width: 104,
    height: 104,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
  },
  addButton: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  qty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default MenuItemCard;
