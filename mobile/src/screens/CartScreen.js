import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FoodImage from '../components/FoodImage';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { colors, radius, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';
import { formatNaira } from '../utils/currency';

const CartScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const {
    items,
    restaurant,
    itemCount,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    updateQuantity,
  } = useCart();
  const [promo, setPromo] = useState('');
  const [applied, setApplied] = useState(false);
  const discount = applied ? Math.round(subtotal * 0.2) : 0;

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
        <View style={styles.head}>
          <Text style={styles.title}>Your cart</Text>
        </View>
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          message="Add something delicious from one of the kitchens near you."
        />
        <View style={styles.emptyAction}>
          <Button
            title="Browse restaurants"
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Your cart</Text>
        <Text style={styles.subtitle}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'} from {restaurant?.name}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, scrollContentStyle]}
      >
        <View style={styles.restaurantRow}>
          <FoodImage uri={restaurant?.image} emoji="🍽️" style={styles.restaurantImage} />
          <View style={styles.restaurantCopy}>
            <Text style={styles.restaurantName}>{restaurant?.name}</Text>
            <Text style={styles.restaurantMeta}>
              {restaurant?.deliveryMin}-{restaurant?.deliveryMax} min · {restaurant?.city}
            </Text>
          </View>
          <Ionicons name="checkmark-circle" size={20} color={colors.green} />
        </View>

        <View style={styles.itemsCard}>
          {items.map((item) => (
            <View key={item._id} style={styles.itemRow}>
              <FoodImage uri={item.image} emoji="🍛" style={styles.itemImage} />
              <View style={styles.itemCopy}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>{formatNaira(item.price * item.quantity)}</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  onPress={() => updateQuantity(item._id, -1)}
                  style={styles.stepButton}
                >
                  <Ionicons
                    name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                    size={15}
                    color={item.quantity === 1 ? colors.red : colors.orange}
                  />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item._id, 1)}
                  style={styles.stepButton}
                >
                  <Ionicons name="add" size={17} color={colors.orange} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.promoCard}>
          <View style={styles.promoInputWrap}>
            <Ionicons name="ticket-outline" size={18} color={colors.muted} />
            <TextInput
              value={promo}
              onChangeText={setPromo}
              placeholder="Enter promo code"
              placeholderTextColor={colors.muted}
              editable={!applied}
              style={styles.promoInput}
            />
          </View>
          <TouchableOpacity
            onPress={() => setApplied((v) => !v)}
            style={[styles.promoButton, applied && styles.promoButtonApplied]}
          >
            <Text style={[styles.promoButtonText, applied && styles.promoButtonTextApplied]}>
              {applied ? 'Applied' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill details</Text>
          <BillRow label="Subtotal" value={formatNaira(subtotal)} />
          <BillRow label="Delivery fee" value={formatNaira(deliveryFee)} />
          <BillRow label="Service fee" value={formatNaira(serviceFee)} />
          {discount > 0 && (
            <BillRow label="Promo discount" value={`- ${formatNaira(discount)}`} green />
          )}
          <View style={styles.billDivider} />
          <BillRow label="Total" value={formatNaira(total - discount)} bold />
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="restaurant-outline" size={18} color={colors.orange} />
          <Text style={styles.noteText}>
            Your food is prepared fresh after you order. Estimated arrival in{' '}
            {restaurant?.deliveryMin}-{restaurant?.deliveryMax} minutes.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerValue}>{formatNaira(total - discount)}</Text>
        </View>
        <Button
          title="Proceed to checkout"
          icon="arrow-forward"
          onPress={() => navigation.navigate('Checkout', { discount })}
        />
      </View>
    </SafeAreaView>
  );
};

const BillRow = ({ label, value, bold, green }) => (
  <View style={styles.billRow}>
    <Text style={[styles.billLabel, bold && styles.billLabelBold]}>{label}</Text>
    <Text style={[styles.billValue, bold && styles.billValueBold, green && styles.billValueGreen]}>
      {value}
    </Text>
  </View>
);

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
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
    ...shadow.card,
  },
  restaurantImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
  restaurantMeta: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  itemsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    ...shadow.card,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  itemImage: {
    width: 62,
    height: 62,
    borderRadius: radius.sm,
  },
  itemCopy: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.orangeDark,
    marginTop: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellowPale,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
  },
  stepButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    minWidth: 20,
    textAlign: 'center',
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  promoInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 52,
    marginRight: 8,
  },
  promoInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: colors.ink,
  },
  promoButton: {
    paddingHorizontal: 18,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoButtonApplied: {
    backgroundColor: colors.greenPale,
  },
  promoButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  promoButtonTextApplied: {
    color: colors.green,
  },
  billCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 14,
    ...shadow.card,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 14,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  billLabelBold: {
    color: colors.ink,
    fontWeight: '600',
    fontSize: 15,
  },
  billValue: {
    fontSize: 13,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  billValueBold: {
    color: colors.orangeDark,
    fontWeight: '600',
    fontSize: 16,
  },
  billValueGreen: {
    color: colors.green,
  },
  billDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 6,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.yellowPale,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 14,
  },
  noteText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 11,
    lineHeight: 17,
    color: colors.inkSoft,
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
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  footerValue: {
    fontSize: 19,
    fontWeight: '600',
    color: colors.ink,
  },
  emptyAction: {
    paddingHorizontal: 20,
  },
});

export default CartScreen;
