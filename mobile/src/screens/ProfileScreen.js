import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { normalizeRole, ROLE_META, ROLES } from '../constants/roles';
import { colors, radius, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const ProfileScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const { user, role, isDemo, signOut } = useAuth();
  const { clear } = useCart();
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const initial = (user?.name || 'F').charAt(0).toUpperCase();
  const roleMeta = ROLE_META[normalizeRole(role)];

  const handleSignOut = async () => {
    setSignOutVisible(false);
    await clear();
    await signOut();
  };

  const allRows = [
    {
      icon: 'receipt-outline',
      label: 'My orders',
      note: 'Track and review your orders',
      customerOnly: true,
      onPress: () => navigation.navigate('Orders'),
    },
    {
      icon: 'location-outline',
      label: 'Delivery addresses',
      note: 'Manage where we deliver to you',
      customerOnly: true,
      onPress: () => navigation.navigate('Address'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      note: 'Offers, updates and order alerts',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: 'card-outline',
      label: 'Payment methods',
      note: 'Cash, bank transfer and cards',
      customerOnly: true,
      onPress: () => setPaymentVisible(true),
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & support',
      note: 'We are here to help',
      onPress: () => navigation.navigate('Notifications'),
    },
  ];
  const rows =
    normalizeRole(role) === ROLES.CUSTOMER
      ? allRows
      : allRows.filter((row) => !row.customerOnly);

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, scrollContentStyle]}>
        <View style={styles.head}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editIcon}
          >
            <Ionicons name="create-outline" size={19} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[colors.yellow, colors.orange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{user?.name || 'FastaPick customer'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={13} color={colors.white} />
              <Text style={styles.metaText}>{user?.city || 'Ado-Ekiti'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{roleMeta.label}</Text>
              </View>
              {isDemo && (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoText}>Demo mode</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="bag-handle-outline" size={20} color={colors.orange} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={20} color={colors.orange} />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Favourites</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="gift-outline" size={20} color={colors.orange} />
            <Text style={styles.statValue}>₦2.4k</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {rows.map((row, index) => (
            <TouchableOpacity
              key={row.label}
              onPress={row.onPress}
              style={[styles.menuRow, index === rows.length - 1 && styles.menuRowLast]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={row.icon} size={19} color={colors.orange} />
              </View>
              <View style={styles.menuCopy}>
                <Text style={styles.menuLabel}>{row.label}</Text>
                <Text style={styles.menuNote}>{row.note}</Text>
              </View>
              <Ionicons name="chevron-forward" size={19} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.signOut}>
          <Button
            title="Sign out"
            variant="outline"
            icon="log-out-outline"
            onPress={() => setSignOutVisible(true)}
          />
        </View>

        <Text style={styles.version}>FastaPick v1.0.0 · Made for Ekiti</Text>
      </ScrollView>

      <Modal
        visible={signOutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSignOutVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="log-out-outline" size={26} color={colors.orange} />
            </View>
            <Text style={styles.modalTitle}>Sign out?</Text>
            <Text style={styles.modalMessage}>You can sign back in any time.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => setSignOutVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={handleSignOut}
              >
                <Text style={styles.modalConfirmText}>Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={paymentVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaymentVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="card-outline" size={26} color={colors.orange} />
            </View>
            <Text style={styles.modalTitle}>Payment methods</Text>
            <Text style={styles.modalMessage}>
              Cash, bank transfer and card payments are available at checkout.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalConfirm, styles.modalSingle]}
              onPress={() => setPaymentVisible(false)}
            >
              <Text style={styles.modalConfirmText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 18,
  },
  title: {
    fontSize: 27,
    fontWeight: '600',
    color: colors.ink,
  },
  editIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: 20,
    ...shadow.float,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 27,
    fontWeight: '600',
    color: colors.orangeDark,
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  profileEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },
  metaText: {
    fontSize: 11,
    color: colors.white,
    marginLeft: 4,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.white,
  },
  demoBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  demoText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginRight: 8,
    ...shadow.card,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    ...shadow.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.yellowPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuCopy: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  menuNote: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  signOut: {
    marginTop: 20,
  },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.muted,
    marginTop: 24,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(30, 27, 24, 0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 22,
    alignItems: 'center',
    ...shadow.float,
  },
  modalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.yellowPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: colors.ink,
    marginTop: 14,
  },
  modalMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 22,
  },
  modalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancel: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkSoft,
  },
  modalConfirm: {
    backgroundColor: colors.orange,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  modalSingle: {
    marginTop: 22,
    width: '100%',
  },
});

export default ProfileScreen;
