import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import session from '../lib/session';
import { STORAGE_KEYS, scopedKey, storage } from '../lib/storage';
import { colors, radius, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const notifications = [
  {
    id: '1',
    icon: 'gift-outline',
    tone: 'yellow',
    title: '20% off your first order',
    body: 'Use code FASTAFIRST at checkout and enjoy a discount on your first meal.',
    time: '2 min ago',
    unread: true,
  },
  {
    id: '2',
    icon: 'bicycle-outline',
    tone: 'orange',
    title: 'Your rider is on the way',
    body: 'Chidi has picked up your order from Ado Buka Kitchen. Estimated arrival in 12 minutes.',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: '3',
    icon: 'restaurant-outline',
    tone: 'green',
    title: 'New kitchens in Ado-Ekiti',
    body: 'Spice Route Ekiti and Sweet Tooth Ekiti are now delivering on FastaPick.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: '4',
    icon: 'wallet-outline',
    tone: 'blue',
    title: 'Payment received',
    body: 'We received your transfer of ₦4,500 for order #FP284913.',
    time: '2 days ago',
    unread: false,
  },
];

const toneStyles = {
  yellow: { bg: colors.yellowPale, color: colors.orangeDark },
  orange: { bg: colors.orangePale, color: colors.orangeDark },
  green: { bg: colors.greenPale, color: colors.green },
  blue: { bg: '#E6EFFD', color: '#2563EB' },
};

const NotificationsScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const storageKey = scopedKey(STORAGE_KEYS.NOTIFICATIONS, session.accountId());
  const [read, setRead] = useState([]);

  useEffect(() => {
    let active = true;
    storage.getJSON(storageKey, []).then((stored) => {
      if (active) setRead(stored || []);
    });
    return () => {
      active = false;
    };
  }, [storageKey]);

  const markRead = async (id) => {
    const next = [...new Set([...read, id])];
    setRead(next);
    await storage.setJSON(storageKey, next);
  };

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={21} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headCopy}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>News and updates from FastaPick</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, scrollContentStyle]} showsVerticalScrollIndicator={false}>
        {notifications.map((item) => {
          const tone = toneStyles[item.tone];
          const isUnread = item.unread && !read.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => markRead(item.id)}
              style={styles.card}
            >
              <View style={[styles.icon, { backgroundColor: tone.bg }]}>
                <Ionicons name={item.icon} size={20} color={tone.color} />
              </View>
              <View style={styles.copy}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {isUnread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.footer}>
          <Ionicons name="checkmark-done-outline" size={18} color={colors.muted} />
          <Text style={styles.footerText}>You are all caught up</Text>
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
  headCopy: {
    flex: 1,
  },
  title: {
    fontSize: 21,
    fontWeight: '600',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    ...shadow.card,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  copy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
    marginLeft: 8,
  },
  body: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.inkSoft,
    marginTop: 6,
  },
  time: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.muted,
    marginLeft: 7,
  },
});

export default NotificationsScreen;
