import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import RestaurantCard from '../components/RestaurantCard';
import EmptyState from '../components/EmptyState';
import CartBar from '../components/CartBar';
import api from '../services/api';
import { restaurants as mockRestaurants, categories } from '../data/mock';
import { colors, radius } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const sorts = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'fastest', label: 'Fastest' },
  { key: 'rating', label: 'Top rated' },
];

const ExploreScreen = ({ navigation, route }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const initialCategory = route?.params?.category || 'All';
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('recommended');
  const [restaurants, setRestaurants] = useState(mockRestaurants);

  useEffect(() => {
    const load = async () => {
      try {
        const params = [];
        if (query) params.push(`search=${encodeURIComponent(query)}`);
        if (category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
        if (sort !== 'recommended') params.push(`sort=${sort}`);
        const queryString = params.length ? `?${params.join('&')}` : '';
        const { data } = await api.get(`/restaurants${queryString}`);
        if (data.success) setRestaurants(data.restaurants);
      } catch (_) {}
    };
    load();
  }, [query, category, sort]);

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

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover great food across Ekiti</Text>
        <View style={styles.search}>
          <Ionicons name="search" size={19} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search restaurants or dishes"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            onPress={() => setCategory(cat.label)}
            style={[styles.chip, category === cat.label && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === cat.label && styles.chipTextActive]}>
              {cat.emoji}  {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.results}>{filtered.length} places</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sorts.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setSort(option.key)}
              style={[styles.sortChip, sort === option.key && styles.sortChipActive]}
            >
              <Text
                style={[styles.sortText, sort === option.key && styles.sortTextActive]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, scrollContentStyle]}
      >
        {filtered.length ? (
          filtered.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              variant="list"
              onPress={() =>
                navigation.navigate('Restaurant', { id: restaurant._id, restaurant })
              }
            />
          ))
        ) : (
          <EmptyState
            emoji="🔍"
            title="Nothing matched that search"
            message="Try another dish, cuisine or city."
          />
        )}
      </ScrollView>

      <CartBar onPress={() => navigation.navigate('Cart')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  head: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 52,
    marginTop: 18,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    marginLeft: 12,
  },
  chips: {
    paddingHorizontal: 20,
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
    color: colors.inkSoft,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 4,
  },
  results: {
    fontSize: 12,
    color: colors.muted,
    marginRight: 12,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginRight: 6,
  },
  sortChipActive: {
    backgroundColor: colors.ink,
  },
  sortText: {
    fontSize: 11,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  sortTextActive: {
    color: colors.white,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
});

export default ExploreScreen;
