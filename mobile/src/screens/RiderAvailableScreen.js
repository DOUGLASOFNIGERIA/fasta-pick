import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import StaffOrderCard from '../components/StaffOrderCard';
import EmptyState from '../components/EmptyState';
import api, { getErrorMessage } from '../services/api';
import { colors, radius } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const RiderAvailableScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/orders/available');
      setOrders(data.orders || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const accept = async (id) => {
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/orders/${id}/accept`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Available jobs</Text>
        <Text style={styles.subtitle}>Ready-for-pickup orders near you</Text>
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
        {orders.length ? (
          orders.map((order) => (
            <StaffOrderCard
              key={order._id}
              order={order}
              note={`Pickup: ${order.restaurantName || order.restaurant?.name}`}
              actions={[
                {
                  label: 'Accept delivery',
                  icon: 'checkmark-circle-outline',
                  loading: busyId === order._id,
                  onPress: () => accept(order._id),
                },
              ]}
              onPress={() => navigation.navigate('OrderTracking', { order })}
            />
          ))
        ) : (
          <EmptyState
            emoji="🛵"
            title="No jobs right now"
            message="Pull to refresh. New ready orders will show up here automatically."
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
});

export default RiderAvailableScreen;
