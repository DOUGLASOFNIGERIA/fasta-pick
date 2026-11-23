import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StaffOrderCard from '../components/StaffOrderCard';
import EmptyState from '../components/EmptyState';
import api, { getErrorMessage } from '../services/api';
import { colors, radius, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const tabs = [
  { key: 'todo', label: 'To do' },
  { key: 'ready', label: 'Ready / assigned' },
];

const VendorOrdersScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [tab, setTab] = useState('todo');
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [orderData, riderData] = await Promise.all([
        api.get('/orders/incoming'),
        api.get('/auth/riders'),
      ]);
      setOrders(orderData.data.orders || []);
      setRiders(riderData.data.riders || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const updateStatus = async (id, status) => {
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/orders/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const assign = async (id, riderId) => {
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/orders/${id}/assign`, { riderId });
      setAssigningId(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const visible = orders.filter((order) =>
    tab === 'todo'
      ? ['pending', 'confirmed'].includes(order.status)
      : ['preparing', 'ready_for_pickup'].includes(order.status)
  );

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Kitchen</Text>
        <Text style={styles.subtitle}>Accept, prepare and hand off orders</Text>
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

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.red} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, scrollContentStyle]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {visible.length ? (
          visible.map((order) => {
            const actions = [];
            if (order.status === 'pending') {
              actions.push({
                label: 'Accept order',
                icon: 'checkmark-circle-outline',
                loading: busyId === order._id,
                onPress: () => updateStatus(order._id, 'confirmed'),
              });
            }
            if (order.status === 'confirmed') {
              actions.push({
                label: 'Start preparing',
                icon: 'restaurant-outline',
                loading: busyId === order._id,
                onPress: () => updateStatus(order._id, 'preparing'),
              });
            }
            if (order.status === 'preparing') {
              actions.push({
                label: 'Mark ready',
                icon: 'checkmark-done-outline',
                loading: busyId === order._id,
                onPress: () => updateStatus(order._id, 'ready_for_pickup'),
              });
              actions.push({
                label: assigningId === order._id ? 'Close riders' : 'Assign rider',
                icon: 'bicycle-outline',
                variant: 'outline',
                onPress: () =>
                  setAssigningId(assigningId === order._id ? null : order._id),
              });
            }
            if (order.status === 'ready_for_pickup') {
              actions.push({
                label: assigningId === order._id ? 'Close riders' : 'Assign rider',
                icon: 'bicycle-outline',
                loading: busyId === order._id,
                onPress: () =>
                  setAssigningId(assigningId === order._id ? null : order._id),
              });
            }

            return (
              <View key={order._id}>
                <StaffOrderCard
                  order={order}
                  actions={actions}
                  note={
                    order.riderName ? `Assigned rider: ${order.riderName}` : undefined
                  }
                  onPress={() => navigation.navigate('OrderTracking', { order })}
                />
                {assigningId === order._id ? (
                  <View style={styles.riderBox}>
                    <Text style={styles.riderTitle}>Choose a rider</Text>
                    {riders.length ? (
                      riders.map((rider) => (
                        <TouchableOpacity
                          key={rider._id}
                          onPress={() => assign(order._id, rider._id)}
                          disabled={busyId === order._id}
                          style={styles.riderRow}
                        >
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                              {rider.name?.charAt(0)?.toUpperCase() || 'R'}
                            </Text>
                          </View>
                          <View style={styles.riderCopy}>
                            <Text style={styles.riderName}>{rider.name}</Text>
                            <Text style={styles.riderMeta}>
                              {rider.phone || 'No phone'} · {rider.city}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noRiders}>
                        No riders yet. Ask a rider to register with the Rider role.
                      </Text>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })
        ) : (
          <EmptyState
            emoji="🍳"
            title={tab === 'todo' ? 'No new orders' : 'Nothing to hand off'}
            message="Incoming orders will appear here as soon as customers check out."
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
    marginBottom: 12,
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
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.orangeDark,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: colors.redPale,
    padding: 10,
    borderRadius: radius.sm,
    marginBottom: 10,
  },
  errorText: {
    color: colors.red,
    fontSize: 11,
    marginLeft: 8,
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  riderBox: {
    backgroundColor: colors.yellowPale,
    borderRadius: radius.md,
    padding: 14,
    marginTop: -6,
    marginBottom: 14,
  },
  riderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 10,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  riderCopy: {
    flex: 1,
    marginLeft: 10,
  },
  riderName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  riderMeta: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  noRiders: {
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 18,
  },
});

export default VendorOrdersScreen;
