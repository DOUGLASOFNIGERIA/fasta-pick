import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FoodImage from '../components/FoodImage';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getLocalOrders } from '../utils/localOrders';
import { colors, radius, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';
import { statusInfo, orderCode } from '../utils/helpers';
import { formatNaira } from '../utils/currency';

const tabs = [
  { key: 'active', label: 'Active' },
  { key: 'past', label: 'Past orders' },
];

const OrdersScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const { isDemo } = useAuth();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('active');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (isDemo) {
        setOrders(await getLocalOrders());
      } else {
        const { data } = await api.get('/orders');
        setOrders(data.orders || []);
        const local = await getLocalOrders();
        if (local.length) setOrders([...local, ...(data.orders || [])]);
      }
    } catch (_) {
      setOrders(await getLocalOrders());
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = orders.filter((order) => {
    const active = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'on_the_way'].includes(
      order.status
    );
    return tab === 'active' ? active : !active;
  });

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Your orders</Text>
        <Text style={styles.subtitle}>Keep tabs on everything you have ordered</Text>
      </View>

      <View style={styles.tabs}>
        {tabs.map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => setTab(item.key)}
            style={[styles.tab, tab === item.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === item.key && styles.tabTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, scrollContentStyle]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {visible.length ? (
          visible.map((order) => {
            const status = statusInfo(order.status);
            const itemSummary = order.items
              .map((item) => `${item.quantity}× ${item.name}`)
              .join(', ');
            const date = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <TouchableOpacity
                key={order._id}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('OrderTracking', { order })}
                style={styles.card}
              >
                <View style={styles.cardTop}>
                  <FoodImage
                    uri={order.restaurant?.image}
                    emoji="🍽️"
                    style={styles.image}
                  />
                  <View style={styles.cardCopy}>
                    <Text style={styles.restaurant} numberOfLines={1}>
                      {order.restaurantName || order.restaurant?.name || 'FastaPick order'}
                    </Text>
                    <Text style={styles.meta}>{date} · #{orderCode(order._id)}</Text>
                  </View>
                  <View style={[styles.status, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.items} numberOfLines={2}>
                  {itemSummary}
                </Text>

                <View style={styles.cardBottom}>
                  <Text style={styles.total}>{formatNaira(order.total)}</Text>
                  <View style={styles.track}>
                    <Text style={styles.trackText}>
                      {tab === 'active' ? 'Track order' : 'View details'}
                    </Text>
                    <Ionicons name="arrow-forward" size={15} color={colors.white} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <EmptyState
            emoji={tab === 'active' ? '🛵' : '🧾'}
            title={tab === 'active' ? 'No active orders' : 'No past orders yet'}
            message={
              tab === 'active'
                ? 'When you place an order, you can follow it here in real time.'
                : 'Your completed orders will show up here.'
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  head: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },
  title: {
    fontSize: 27,
    fontWeight: '600',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.line,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.orangeDark,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 14,
    ...shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
  },
  cardCopy: {
    flex: 1,
    marginLeft: 12,
  },
  restaurant: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  meta: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  status: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    maxWidth: 110,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  items: {
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 19,
    marginTop: 14,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  trackText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    marginRight: 5,
  },
});

export default OrdersScreen;
