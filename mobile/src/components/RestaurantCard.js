import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FoodImage from './FoodImage';
import { colors, radius, spacing, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';
import { formatNaira } from '../utils/currency';

const RestaurantCard = ({ restaurant, onPress, variant = 'grid' }) => {
  const isList = variant === 'list';
  const { gridCardWidth } = useFormFactor();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, isList && styles.cardList, !isList && { width: gridCardWidth }]}
    >
      <FoodImage
        uri={restaurant.image}
        emoji="🍲"
        style={[styles.image, isList && styles.imageList]}
      >
        {restaurant.promo ? (
          <View style={styles.promo}>
            <Text style={styles.promoText} numberOfLines={1}>
              {restaurant.promo}
            </Text>
          </View>
        ) : null}
        {!restaurant.isOpen && (
          <View style={styles.closed}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
      </FoodImage>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, isList && styles.nameList]} numberOfLines={1}>
            {restaurant.name}
          </Text>
          {isList && (
            <View style={styles.ratingSmall}>
              <Ionicons name="star" size={12} color={colors.yellow} />
              <Text style={styles.ratingSmallText}>{restaurant.rating}</Text>
            </View>
          )}
        </View>

        <Text style={styles.cuisines} numberOfLines={1}>
          {(restaurant.cuisines || []).slice(0, 3).join(' · ')}
        </Text>

        {!isList && (
          <View style={styles.ratingRow}>
            <View style={styles.rating}>
              <Ionicons name="star" size={13} color={colors.yellow} />
              <Text style={styles.ratingText}>{restaurant.rating}</Text>
              <Text style={styles.reviews}>({restaurant.reviewCount})</Text>
            </View>
            <View style={styles.dot} />
            <Text style={styles.meta}>{restaurant.deliveryMin}-{restaurant.deliveryMax} min</Text>
          </View>
        )}

        <View style={styles.footRow}>
          <View style={styles.fee}>
            <Ionicons name="bicycle-outline" size={14} color={colors.orange} />
            <Text style={styles.feeText}>{formatNaira(restaurant.deliveryFee)}</Text>
          </View>
          {isList && (
            <Text style={styles.meta}>{restaurant.deliveryMin}-{restaurant.deliveryMax} min</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  cardList: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: spacing.md,
  },
  image: {
    height: 128,
    width: '100%',
  },
  imageList: {
    width: 116,
    height: undefined,
    alignSelf: 'stretch',
  },
  promo: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    maxWidth: '90%',
  },
  promoText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  closed: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    color: colors.white,
    fontWeight: '700',
  },
  body: {
    padding: 12,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    flex: 1,
  },
  nameList: {
    fontSize: 15,
  },
  cuisines: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginLeft: 3,
  },
  reviews: {
    fontSize: 10,
    color: colors.muted,
    marginLeft: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.muted,
    marginHorizontal: 6,
  },
  meta: {
    fontSize: 11,
    color: colors.inkSoft,
  },
  ratingSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellowPale,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  ratingSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
    marginLeft: 2,
  },
  footRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  fee: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkSoft,
    marginLeft: 3,
  },
});

export default RestaurantCard;
