import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { colors, radius, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';
import { formatNaira } from '../utils/currency';
import { saveLocalOrder } from '../utils/localOrders';

const payments = [
  { id: 'cash', label: 'Cash on Delivery', icon: 'cash-outline', note: 'Pay when your food arrives' },
  { id: 'transfer', label: 'Bank Transfer', icon: 'bank-outline', note: 'Transfer to our account' },
  { id: 'card', label: 'Debit / Credit Card', icon: 'card-outline', note: 'Secure payment via Paystack' },
];

const CheckoutScreen = ({ navigation, route }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const { user, isDemo } = useAuth();
  const {
    items,
    restaurant,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    clear,
  } = useCart();
  const [payment, setPayment] = useState('cash');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const discount = route?.params?.discount || 0;
  const address = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const placeOrder = async () => {
    if (!restaurant || items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (!address) {
      navigation.navigate('Address');
      return;
    }
    setLoading(true);
    setError('');

    const payload = {
      restaurantId: restaurant._id,
      items: items.map((item) => ({ menuItem: item._id, quantity: item.quantity })),
      deliveryAddress: {
        label: address.label,
        fullAddress: address.fullAddress,
        landmark: address.landmark,
        phone: address.phone,
      },
      paymentMethod: payment,
      note,
    };

    if (!isDemo) {
      try {
        const { data } = await api.post('/orders', payload);
        clear();
        navigation.navigate('OrderTracking', { order: data.order });
        return;
      } catch (err) {
        if (err?.response) {
          setError(err.response.data?.message || 'We could not place your order.');
          setLoading(false);
          return;
        }
      }
    }

    const localOrder = {
      _id: `FP${Date.now().toString().slice(-8)}`,
      restaurantName: restaurant.name,
      restaurant: { name: restaurant.name, image: restaurant.image },
      items,
      subtotal,
      deliveryFee,
      serviceFee,
      discount,
      total: total - discount,
      status: 'pending',
      paymentMethod: payment,
      deliveryAddress: { ...address, note },
      estimatedDelivery: new Date(Date.now() + (restaurant.deliveryMax + 10) * 60000).toISOString(),
      timeline: [{ status: 'pending', note: 'Order placed successfully', at: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };
    await saveLocalOrder(localOrder);
    clear();
    setLoading(false);
    navigation.navigate('OrderTracking', { order: localOrder, demo: true });
  };

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={21} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, scrollContentStyle]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Address')}
          style={styles.card}
        >
          <View style={styles.cardHead}>
            <View style={styles.iconBox}>
              <Ionicons name="location" size={19} color={colors.orange} />
            </View>
            <Text style={styles.cardTitle}>Delivery address</Text>
            <Text style={styles.change}>Change</Text>
          </View>
          {address ? (
            <>
              <Text style={styles.addressLabel}>{address.label}</Text>
              <Text style={styles.addressText}>{address.fullAddress}</Text>
              <Text style={styles.addressMeta}>{address.phone}</Text>
            </>
          ) : (
            <Text style={styles.addressText}>Add a delivery address to continue</Text>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.iconBox}>
              <Ionicons name="time-outline" size={19} color={colors.orange} />
            </View>
            <Text style={styles.cardTitle}>Delivery time</Text>
          </View>
          <View style={styles.timeRow}>
            <View style={[styles.timeChip, styles.timeChipActive]}>
              <Ionicons name="flash" size={14} color={colors.orangeDark} />
              <Text style={styles.timeTextActive}>ASAP ({restaurant?.deliveryMin}-{restaurant?.deliveryMax} min)</Text>
            </View>
            <View style={styles.timeChip}>
              <Text style={styles.timeText}>Schedule later</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.iconBox}>
              <Ionicons name="wallet-outline" size={19} color={colors.orange} />
            </View>
            <Text style={styles.cardTitle}>Payment method</Text>
          </View>
          {payments.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setPayment(option.id)}
              style={[styles.paymentRow, payment === option.id && styles.paymentRowActive]}
            >
              <View style={styles.paymentIcon}>
                <Ionicons
                  name={option.icon}
                  size={19}
                  color={payment === option.id ? colors.orange : colors.muted}
                />
              </View>
              <View style={styles.paymentCopy}>
                <Text style={styles.paymentLabel}>{option.label}</Text>
                <Text style={styles.paymentNote}>{option.note}</Text>
              </View>
              <Ionicons
                name={payment === option.id ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={payment === option.id ? colors.orange : colors.muted}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.iconBox}>
              <Ionicons name="create-outline" size={19} color={colors.orange} />
            </View>
            <Text style={styles.cardTitle}>Delivery note</Text>
          </View>
          <Input
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Gate 2, call on arrival"
            multiline
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.iconBox}>
              <Ionicons name="receipt-outline" size={19} color={colors.orange} />
            </View>
            <Text style={styles.cardTitle}>Order summary</Text>
          </View>
          <Row label={`Items (${items.length})`} value={formatNaira(subtotal)} />
          <Row label="Delivery fee" value={formatNaira(deliveryFee)} />
          <Row label="Service fee" value={formatNaira(serviceFee)} />
          {discount > 0 && (
            <Row label="Promo discount" value={`- ${formatNaira(discount)}`} green />
          )}
          <View style={styles.divider} />
          <Row label="Total" value={formatNaira(total - discount)} bold />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Place order · ${formatNaira(total - discount)}`}
          onPress={placeOrder}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
};

const Row = ({ label, value, bold, green }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.rowValueBold, green && styles.rowValueGreen]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
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
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 130,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 14,
    ...shadow.card,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.yellowPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  change: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '700',
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  addressText: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 3,
    lineHeight: 19,
  },
  addressMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginRight: 8,
  },
  timeChipActive: {
    backgroundColor: colors.yellowPale,
    borderColor: colors.orange,
  },
  timeText: {
    fontSize: 12,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  timeTextActive: {
    fontSize: 12,
    color: colors.orangeDark,
    fontWeight: '600',
    marginLeft: 5,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  paymentRowActive: {
    backgroundColor: colors.yellowPale,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
  },
  paymentIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  paymentCopy: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  paymentNote: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  rowLabelBold: {
    color: colors.ink,
    fontWeight: '600',
    fontSize: 15,
  },
  rowValue: {
    fontSize: 13,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  rowValueBold: {
    color: colors.orangeDark,
    fontWeight: '600',
    fontSize: 16,
  },
  rowValueGreen: {
    color: colors.green,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 6,
  },
  error: {
    color: colors.red,
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
});

export default CheckoutScreen;
