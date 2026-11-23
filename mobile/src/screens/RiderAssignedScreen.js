import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import StaffOrderCard from '../components/StaffOrderCard';
import EmptyState from '../components/EmptyState';
import api, { getErrorMessage } from '../services/api';
import { colors, radius } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const RiderAssignedScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [sharingId, setSharingId] = useState(null);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/orders/assigned');
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  const stopSharing = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setSharingId(null);
  };

  const shareLocation = async (id) => {
    if (sharingId === id) {
      stopSharing();
      return;
    }

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Location permission is needed to share your position.');
      }

      const sendLocation = async () => {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        await api.post(`/orders/${id}/location`, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      };

      await sendLocation();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(sendLocation, 10000);
      setSharingId(id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const update = async (id, endpoint, message) => {
    setBusyId(id);
    setError('');
    try {
      await api.patch(`/orders/${id}/${endpoint}`);
      if (endpoint === 'deliver' && sharingId === id) stopSharing();
      await load();
      if (message) setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Assigned</Text>
        <Text style={styles.subtitle}>Deliveries you have accepted</Text>
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
          orders.map((order) => {
            const actions = [];
            if (order.status === 'ready_for_pickup') {
              actions.push({
                label: 'Picked up',
                icon: 'bag-handle-outline',
                loading: busyId === order._id,
                onPress: () => update(order._id, 'pickup'),
              });
            }
            if (order.status === 'on_the_way') {
              actions.push({
                label: 'Mark delivered',
                icon: 'checkmark-done-outline',
                loading: busyId === order._id,
                onPress: () => update(order._id, 'deliver'),
              });
            }
            actions.push({
              label: sharingId === order._id ? 'Stop sharing' : 'Share location',
              icon: 'locate-outline',
              variant: 'outline',
              onPress: () => shareLocation(order._id),
            });

            const location = order.riderLocation?.updatedAt
              ? `Last shared ${new Date(order.riderLocation.updatedAt).toLocaleTimeString(
                  'en-NG',
                  { hour: 'numeric', minute: '2-digit' }
                )}`
              : undefined;

            return (
              <StaffOrderCard
                key={order._id}
                order={order}
                actions={actions}
                note={location}
                onPress={() => navigation.navigate('OrderTracking', { order })}
              />
            );
          })
        ) : (
          <EmptyState
            emoji="📦"
            title="No assigned deliveries"
            message="Accept a job from the Available tab and it will appear here."
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

export default RiderAssignedScreen;
