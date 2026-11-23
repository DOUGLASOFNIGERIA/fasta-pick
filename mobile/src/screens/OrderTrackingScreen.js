import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import FoodImage from '../components/FoodImage';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors, radius, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';
import { statusInfo, orderCode } from '../utils/helpers';
import { formatNaira } from '../utils/currency';

const steps = [
  { key: 'pending', label: 'Order placed', icon: 'receipt-outline' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
  { key: 'preparing', label: 'Preparing', icon: 'restaurant-outline' },
  { key: 'ready_for_pickup', label: 'Ready for pickup', icon: 'bag-handle-outline' },
  { key: 'on_the_way', label: 'On the way', icon: 'bicycle-outline' },
  { key: 'delivered', label: 'Delivered', icon: 'home-outline' },
];

const OrderTrackingScreen = ({ navigation, route }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const { order: initialOrder, demo } = route.params;
  const { user } = useAuth();
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    if (demo || !initialOrder?._id) return;
    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${initialOrder._id}`);
        if (data.success) setOrder(data.order);
      } catch (_) {}
    };
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [initialOrder, demo]);

  const status = statusInfo(order.status);
  const eta = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleTimeString('en-NG', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Soon';

  const riderName = order.riderName || order.rider?.name;
  const riderPhone = order.riderPhone || order.rider?.phone;
  const riderLocation = order.riderLocation?.updatedAt
    ? `Last shared ${new Date(order.riderLocation.updatedAt).toLocaleTimeString('en-NG', {
        hour: 'numeric',
        minute: '2-digit',
      })}`
    : 'Waiting for location updates...';

  const goMain = () => {
    const screen =
      user?.role === 'rider'
        ? 'Available'
        : ['vendor', 'admin'].includes(user?.role)
        ? 'Kitchen'
        : 'Home';
    navigation.navigate('Main', { screen });
  };

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={21} color={colors.ink} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Track your order</Text>
          <Text style={styles.orderId}>#{orderCode(order._id)}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, scrollContentStyle]}>
        <LinearGradient
          colors={[colors.yellow, colors.orange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusCard}
        >
          <View style={styles.statusTop}>
            <View style={styles.statusIcon}>
              <Ionicons name={order.status === 'delivered' ? 'checkmark' : 'bicycle'} size={28} color={colors.white} />
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusLabel}>Current status</Text>
              <Text style={styles.statusTitle}>{status.label}</Text>
            </View>
          </View>
          <View style={styles.etaBox}>
            <Ionicons name="time-outline" size={16} color={colors.white} />
            <Text style={styles.etaText}>Estimated delivery by {eta}</Text>
          </View>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order progress</Text>
          <View style={styles.timeline}>
            {steps.map((step, index) => {
              const reached = status.step >= index;
              const isLast = index === steps.length - 1;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.stepIconColumn}>
                    <View style={[styles.stepDot, reached && styles.stepDotActive]}>
                      {reached ? (
                        <Ionicons name="checkmark" size={14} color={colors.white} />
                      ) : (
                        <Ionicons name={step.icon} size={14} color={colors.muted} />
                      )}
                    </View>
                    {!isLast && (
                      <View style={[styles.stepLine, reached && styles.stepLineActive]} />
                    )}
                  </View>
                  <View style={styles.stepText}>
                    <Text style={[styles.stepLabel, reached && styles.stepLabelActive]}>
                      {step.label}
                    </Text>
                    {index === status.step && (
                      <Text style={styles.stepNote}>{status.label}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.restaurantRow}>
            <FoodImage
              uri={order.restaurant?.image}
              emoji="🍽️"
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantCopy}>
              <Text style={styles.restaurantName}>
                {order.restaurantName || order.restaurant?.name}
              </Text>
              <Text style={styles.restaurantLabel}>Preparing your order</Text>
            </View>
            <TouchableOpacity style={styles.callButton}>
              <Ionicons name="call-outline" size={18} color={colors.orange} />
            </TouchableOpacity>
          </View>
        </View>

        {riderName ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your rider</Text>
            <View style={styles.riderRow}>
              <View style={styles.riderAvatar}>
                <Text style={styles.riderInitial}>
                  {riderName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.riderCopy}>
                <Text style={styles.riderName}>{riderName}</Text>
                <Text style={styles.riderPhone}>{riderPhone || 'Rider assigned'}</Text>
              </View>
              {riderPhone ? (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => Linking.openURL(`tel:${riderPhone}`)}
                >
                  <Ionicons name="call-outline" size={18} color={colors.orange} />
                </TouchableOpacity>
              ) : null}
            </View>
            {order.status === 'on_the_way' ? (
              <View style={styles.locationRow}>
                <Ionicons name="locate-outline" size={15} color={colors.orange} />
                <Text style={styles.locationText}>{riderLocation}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color={colors.muted} />
            <Text style={styles.detailText}>{order.deliveryAddress?.fullAddress}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={18} color={colors.muted} />
            <Text style={styles.detailText}>{order.deliveryAddress?.phone}</Text>
          </View>
          {order.deliveryAddress?.note ? (
            <View style={styles.detailRow}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.muted} />
              <Text style={styles.detailText}>{order.deliveryAddress.note}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your items</Text>
          {order.items.map((item) => (
            <View key={item._id || item.name} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}×</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                {formatNaira(item.price * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.totalValue}>{formatNaira(order.total)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Ionicons name="wallet-outline" size={14} color={colors.muted} />
            <Text style={styles.paymentText}>
              {order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod}
            </Text>
          </View>
        </View>

        <View style={styles.helpCard}>
          <Ionicons name="help-circle-outline" size={22} color={colors.orange} />
          <View style={styles.helpCopy}>
            <Text style={styles.helpTitle}>Need help with this order?</Text>
            <Text style={styles.helpText}>Our support team is here for you.</Text>
          </View>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.homeAction}>
          <Button
            title="Back to home"
            variant="outline"
            onPress={goMain}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.ink,
  },
  orderId: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statusCard: {
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 16,
    ...shadow.float,
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusCopy: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  statusTitle: {
    fontSize: 21,
    fontWeight: '600',
    color: colors.white,
    marginTop: 2,
  },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  etaText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 14,
    ...shadow.card,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 16,
  },
  timeline: {
    marginLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepIconColumn: {
    alignItems: 'center',
    width: 30,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.orange,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.line,
  },
  stepLineActive: {
    backgroundColor: colors.orange,
  },
  stepText: {
    flex: 1,
    paddingBottom: 20,
    paddingLeft: 10,
  },
  stepLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: colors.ink,
    fontWeight: '600',
  },
  stepNote: {
    fontSize: 11,
    color: colors.orange,
    marginTop: 2,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImage: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
  },
  restaurantCopy: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  restaurantLabel: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  callButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.yellowPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
  },
  riderCopy: {
    flex: 1,
    marginLeft: 12,
  },
  riderName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  riderPhone: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  locationText: {
    fontSize: 11,
    color: colors.inkSoft,
    marginLeft: 7,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: colors.inkSoft,
    lineHeight: 19,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemQty: {
    width: 30,
    fontSize: 13,
    fontWeight: '600',
    color: colors.orange,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: colors.inkSoft,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.orangeDark,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentText: {
    fontSize: 11,
    color: colors.muted,
    marginLeft: 5,
    textTransform: 'capitalize',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellowPale,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 16,
  },
  helpCopy: {
    flex: 1,
    marginLeft: 12,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  helpText: {
    fontSize: 11,
    color: colors.inkSoft,
    marginTop: 2,
  },
  helpButton: {
    backgroundColor: colors.orange,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  helpButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  homeAction: {
    marginBottom: 20,
  },
});

export default OrderTrackingScreen;
