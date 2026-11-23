import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import RestaurantCard from '../components/RestaurantCard';
import SectionHeader from '../components/SectionHeader';
import CartBar from '../components/CartBar';
import EmptyState from '../components/EmptyState';
import FoodImage from '../components/FoodImage';
import api from '../services/api';
import {
  restaurants as mockRestaurants,
  popularItems as mockPopular,
  categories,
} from '../data/mock';
import { colors, radius, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';
import { greeting, firstName } from '../utils/helpers';
import { formatNaira } from '../utils/currency';

const HomeScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle, gutter, popularCardWidth } = useFormFactor();
  const { user } = useAuth();
  const { addItem, restaurant: cartRestaurant, itemCount } = useCart();
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [popular, setPopular] = useState(mockPopular);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/restaurants');
      if (data.success && data.restaurants?.length) setRestaurants(data.restaurants);
    } catch (_) {}
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = restaurants.filter((r) => {
    const matchesQuery =
      !query ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      (r.cuisines || []).some((c) => c.toLowerCase().includes(query.toLowerCase()));
    const matchesCategory =
      category === 'All' ||
      (r.categories || []).includes(category) ||
      (r.cuisines || []).includes(category);
    return matchesQuery && matchesCategory;
  });

  const openRestaurant = (restaurant) =>
    navigation.navigate('Restaurant', { id: restaurant._id, restaurant });

  const addPopular = (item) => {
    const restaurant =
      restaurants.find((r) => r._id === item.restaurant) || mockRestaurants[0];
    addItem(item, restaurant);
  };

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, scrollContentStyle]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>{firstName(user?.name)} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.bell}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={21} color={colors.ink} />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.location}
          onPress={() => navigation.navigate('Address')}
        >
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={18} color={colors.orange} />
          </View>
          <View style={styles.locationCopy}>
            <Text style={styles.locationLabel}>Deliver to</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {user?.addresses?.find((a) => a.isDefault)?.fullAddress ||
                user?.city ||
                'Ado-Ekiti, Ekiti State'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={colors.muted} />
        </TouchableOpacity>

        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Ionicons name="search" size={19} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search for food or restaurants"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => navigation.navigate('Explore')}
          >
            <Ionicons name="options-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Explore', { category: 'Rice' })}
          style={styles.promoWrap}
        >
          <LinearGradient
            colors={[colors.orange, colors.orangeDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promo}
          >
            <View style={styles.promoCopy}>
              <View style={styles.promoTag}>
                <Text style={styles.promoTagText}>LIMITED OFFER</Text>
              </View>
              <Text style={styles.promoTitle}>20% off your{'\n'}first order</Text>
              <Text style={styles.promoSub}>Use code FASTAFIRST at checkout</Text>
            </View>
            <View style={styles.promoArt}>
              <Text style={styles.promoEmoji}>🍔</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.categoriesWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                onPress={() => setCategory(cat.label)}
                style={[styles.category, category === cat.label && styles.categoryActive]}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.label && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <SectionHeader
          title="Fastest near you"
          subtitle="Hot meals from kitchens around Ekiti"
          action="See all"
          onAction={() => navigation.navigate('Explore')}
        />

        {filtered.length ? (
          <View style={styles.grid}>
            {filtered.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
                onPress={() => openRestaurant(restaurant)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            emoji="🔍"
            title="No restaurants found"
            message="Try a different search or category."
          />
        )}

        <SectionHeader title="Popular right now" subtitle="What Ekiti is loving today" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.popularRow, { marginHorizontal: -gutter, paddingHorizontal: gutter }]}
        >
          {popular.map((item) => (
            <TouchableOpacity
              key={item._id}
              activeOpacity={0.9}
              onPress={() => {
                const restaurant =
                  restaurants.find((r) => r._id === item.restaurant) || mockRestaurants[0];
                openRestaurant(restaurant);
              }}
              style={[styles.popularCard, { width: popularCardWidth }]}
            >
              <FoodImage
                uri={item.image}
                emoji="🍛"
                style={[styles.popularImage, { width: popularCardWidth }]}
              >
                <TouchableOpacity
                  style={styles.popularAdd}
                  onPress={() => addPopular(item)}
                >
                  <Ionicons
                    name={cartRestaurant && cartRestaurant._id === item.restaurant && itemCount
                      ? 'checkmark'
                      : 'add'}
                    size={16}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </FoodImage>
              <Text style={styles.popularName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.popularPrice}>{formatNaira(item.price)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Made with ❤️ for Ekiti</Text>
          <Text style={styles.footerText}>FastaPick · Good food, fast.</Text>
        </View>
      </ScrollView>

      <CartBar onPress={() => navigation.navigate('Cart')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 18,
  },
  greeting: {
    fontSize: 13,
    color: colors.muted,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
    marginTop: 2,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.orange,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
    ...shadow.card,
  },
  locationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.yellowPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationCopy: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    color: colors.muted,
  },
  locationValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 54,
    marginRight: 10,
    ...shadow.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    marginLeft: 12,
  },
  filterButton: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.float,
  },
  promo: {
    minHeight: 152,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  promoCopy: {
    flex: 1,
  },
  promoTag: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginBottom: 10,
  },
  promoTagText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.6,
  },
  promoTitle: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '600',
    color: colors.white,
  },
  promoSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  promoArt: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  promoEmoji: {
    fontSize: 44,
  },
  categoriesWrap: {
    marginTop: 22,
  },
  category: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 76,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginRight: 10,
  },
  categoryActive: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inkSoft,
    marginTop: 5,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: colors.ink,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  popularRow: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  popularCard: {
    width: 140,
    marginRight: 12,
  },
  popularImage: {
    width: 140,
    height: 116,
    borderRadius: radius.md,
  },
  popularAdd: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  popularName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 8,
  },
  popularPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.orangeDark,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkSoft,
  },
  footerText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
});

export default HomeScreen;
