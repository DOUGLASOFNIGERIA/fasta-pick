import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FoodImage from '../components/FoodImage';
import MenuItemCard from '../components/MenuItemCard';
import CartBar from '../components/CartBar';
import api from '../services/api';
import { getRestaurant, getMenuForRestaurant } from '../data/mock';
import { useCart } from '../context/CartContext';
import { colors, radius, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';
import { formatNaira } from '../utils/currency';

const RestaurantScreen = ({ navigation, route }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const { id, restaurant: initial } = route.params;
  const [restaurant, setRestaurant] = useState(initial || getRestaurant(id));
  const [menu, setMenu] = useState(
    initial?.menu || getMenuForRestaurant(id)
  );
  const [activeCategory, setActiveCategory] = useState('All');
  const { items, addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/restaurants/${id}`);
        if (data.success && data.restaurant) {
          setRestaurant(data.restaurant);
          setMenu(data.restaurant.menu || []);
        }
      } catch (_) {}
    };
    if (!initial) load();
  }, [id, initial]);

  const categories = useMemo(
    () => ['All', ...new Set(menu.map((item) => item.category))],
    [menu]
  );

  const visibleMenu = menu.filter(
    (item) => activeCategory === 'All' || item.category === activeCategory
  );

  const quantityOf = (itemId) =>
    items.find((i) => i._id === itemId)?.quantity || 0;

  const handleAdd = (item) => addItem(item, restaurant);

  const share = async () => {
    try {
      await Share.share({
        message: `Check out ${restaurant?.name} on FastaPick — good food, fast, right here in Ekiti!`,
      });
    } catch (_) {}
  };

  if (!restaurant) {
    return (
      <SafeAreaView style={[styles.flex, containerStyle]}>
        <View style={styles.missing}>
          <Text style={styles.missingText}>Restaurant not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, scrollContentStyle]}
      >
        <View style={styles.heroWrap}>
          <FoodImage uri={restaurant.coverImage || restaurant.image} emoji="🍽️" style={styles.hero} />
          <TouchableOpacity style={styles.roundButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={21} color={colors.ink} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roundButton, styles.shareButton]}
            onPress={share}
          >
            <Ionicons name="share-outline" size={20} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          {restaurant.promo ? (
            <View style={styles.promoBar}>
              <Ionicons name="gift-outline" size={15} color={colors.orangeDark} />
              <Text style={styles.promoBarText}>{restaurant.promo}</Text>
            </View>
          ) : null}

          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.cuisines}>
            {(restaurant.cuisines || []).join(' · ')}
          </Text>
          <Text style={styles.description}>{restaurant.description}</Text>

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Ionicons name="star" size={16} color={colors.yellow} />
              <Text style={styles.statValue}>{restaurant.rating}</Text>
              <Text style={styles.statLabel}>({restaurant.reviewCount})</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={16} color={colors.orange} />
              <Text style={styles.statValue}>
                {restaurant.deliveryMin}-{restaurant.deliveryMax} min
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Ionicons name="bicycle-outline" size={16} color={colors.orange} />
              <Text style={styles.statValue}>
                {formatNaira(restaurant.deliveryFee)}
              </Text>
            </View>
          </View>

          <View style={styles.minRow}>
            <Ionicons name="information-circle-outline" size={14} color={colors.muted} />
            <Text style={styles.minText}>
              Minimum order {formatNaira(restaurant.minimumOrder)} · {restaurant.city}
            </Text>
          </View>
        </View>

        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Menu</Text>
          <Text style={styles.menuCount}>{menu.length} items</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.menuList}>
          {visibleMenu.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              quantity={quantityOf(item._id)}
              onAdd={() => handleAdd(item)}
            />
          ))}
        </View>
      </ScrollView>

      <CartBar onPress={() => navigation.navigate('Cart')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 140 },
  heroWrap: {
    height: 240,
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  roundButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  shareButton: {
    left: undefined,
    right: 20,
  },
  infoCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: -42,
    borderRadius: radius.lg,
    padding: 18,
    ...shadow.card,
  },
  promoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellowPale,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  promoBarText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.orangeDark,
    marginLeft: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
  },
  cuisines: {
    fontSize: 12,
    color: colors.orange,
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    marginTop: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginLeft: 5,
  },
  statLabel: {
    fontSize: 10,
    color: colors.muted,
    marginLeft: 2,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.line,
  },
  minRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  minText: {
    fontSize: 11,
    color: colors.muted,
    marginLeft: 5,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
  },
  menuCount: {
    fontSize: 12,
    color: colors.muted,
  },
  chips: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 76,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.inkSoft,
  },
  chipTextActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  menuList: {
    paddingHorizontal: 20,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    color: colors.muted,
  },
});

export default RestaurantScreen;
