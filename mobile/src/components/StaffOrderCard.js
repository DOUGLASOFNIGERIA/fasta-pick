import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { colors, radius, shadow } from '../theme/theme';
import { orderCode, statusInfo, titleCase } from '../utils/helpers';
import { formatNaira } from '../utils/currency';

const StaffOrderCard = ({ order, onPress, actions = [], note }) => {
  const status = statusInfo(order.status);
  const items = order.items
    .map((item) => `${item.quantity}× ${item.name}`)
    .join(', ');

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View style={styles.top}>
          <View style={styles.iconBox}>
            <Ionicons name="receipt-outline" size={22} color={colors.orange} />
          </View>
          <View style={styles.headCopy}>
            <Text style={styles.restaurant}>
              {order.restaurantName || order.restaurant?.name || 'FastaPick order'}
            </Text>
            <Text style={styles.meta}>
              #{orderCode(order._id)} · {order.user?.name || 'Customer'}
            </Text>
          </View>
          <View style={[styles.status, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <Text style={styles.items} numberOfLines={2}>
          {items}
        </Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={colors.muted} />
          <Text style={styles.infoText} numberOfLines={1}>
            {order.deliveryAddress?.fullAddress}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={14} color={colors.muted} />
          <Text style={styles.infoText}>{order.deliveryAddress?.phone}</Text>
        </View>

        <View style={styles.bottom}>
          <View>
            <Text style={styles.total}>{formatNaira(order.total)}</Text>
            <Text style={styles.payment}>
              {titleCase(order.paymentMethod || 'cash')}
            </Text>
          </View>
          <View style={styles.track}>
            <Text style={styles.trackText}>Details</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.white} />
          </View>
        </View>
      </TouchableOpacity>

      {note ? <Text style={styles.note}>{note}</Text> : null}

      {actions.length ? (
        <View style={styles.actions}>
          {actions.map((action) => (
            <Button
              key={action.label}
              title={action.label}
              icon={action.icon}
              variant={action.variant || 'primary'}
              loading={action.loading}
              disabled={action.disabled}
              onPress={action.onPress}
              style={styles.actionButton}
              textStyle={styles.actionText}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 14,
    ...shadow.card,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.yellowPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headCopy: {
    flex: 1,
    marginLeft: 10,
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
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    maxWidth: 105,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 11,
    color: colors.muted,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  payment: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trackText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    marginRight: 4,
  },
  note: {
    fontSize: 11,
    color: colors.orangeDark,
    backgroundColor: colors.yellowPale,
    padding: 9,
    borderRadius: radius.sm,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  actionButton: {
    minHeight: 42,
    flexGrow: 1,
    flexBasis: 120,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StaffOrderCard;
