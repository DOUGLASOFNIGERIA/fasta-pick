import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, radius, shadow } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const labels = ['Home', 'Work', 'Other'];

const emptyForm = {
  label: 'Home',
  fullAddress: '',
  landmark: '',
  phone: '',
  isDefault: true,
};

const AddressScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const { user, addAddress, updateUser } = useAuth();
  const addresses = user?.addresses || [];
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [form, setForm] = useState({
    ...emptyForm,
    phone: user?.phone || '',
    isDefault: addresses.length === 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setError('');
    if (!form.fullAddress.trim() || !form.phone.trim()) {
      setError('Please enter an address and phone number.');
      return;
    }
    setSaving(true);
    try {
      await addAddress({ ...form, fullAddress: form.fullAddress.trim(), phone: form.phone.trim() });
      setForm({ ...emptyForm, phone: user?.phone || '' });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const makeDefault = (id) => {
    updateUser({
      addresses: addresses.map((address) => ({
        ...address,
        isDefault: address._id === id,
      })),
    });
  };

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={21} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery addresses</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={[styles.scroll, scrollContentStyle]} keyboardShouldPersistTaps="handled">
          {addresses.length ? (
            <View style={styles.list}>
              {addresses.map((address) => (
                <TouchableOpacity
                  key={address._id}
                  onPress={() => makeDefault(address._id)}
                  style={[styles.addressCard, address.isDefault && styles.addressCardActive]}
                >
                  <View style={styles.addressTop}>
                    <View style={styles.addressIcon}>
                      <Ionicons
                        name={address.label === 'Work' ? 'briefcase-outline' : 'home-outline'}
                        size={19}
                        color={address.isDefault ? colors.orange : colors.muted}
                      />
                    </View>
                    <View style={styles.addressCopy}>
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      <Text style={styles.addressText}>{address.fullAddress}</Text>
                      {address.landmark ? (
                        <Text style={styles.landmark}>Near {address.landmark}</Text>
                      ) : null}
                      <Text style={styles.phone}>{address.phone}</Text>
                    </View>
                    <Ionicons
                      name={address.isDefault ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={address.isDefault ? colors.orange : colors.muted}
                    />
                  </View>
                  {address.isDefault && (
                    <Text style={styles.defaultTag}>Default delivery address</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {showForm ? (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Add a new address</Text>
              <Text style={styles.label}>Label</Text>
              <View style={styles.labelRow}>
                {labels.map((label) => (
                  <TouchableOpacity
                    key={label}
                    onPress={() => set('label')(label)}
                    style={[styles.labelChip, form.label === label && styles.labelChipActive]}
                  >
                    <Text
                      style={[styles.labelChipText, form.label === label && styles.labelChipTextActive]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input
                label="Full address"
                value={form.fullAddress}
                onChangeText={set('fullAddress')}
                placeholder="e.g. 12 Oyin Street, Ado-Ekiti"
                icon="location-outline"
              />
              <Input
                label="Landmark (optional)"
                value={form.landmark}
                onChangeText={set('landmark')}
                placeholder="e.g. Odo Ado Junction"
                icon="business-outline"
              />
              <Input
                label="Phone number"
                value={form.phone}
                onChangeText={set('phone')}
                placeholder="0803 000 0000"
                icon="call-outline"
                keyboardType="phone-pad"
              />

              <View style={styles.switchRow}>
                <View style={styles.switchCopy}>
                  <Text style={styles.switchTitle}>Set as default</Text>
                  <Text style={styles.switchNote}>Use this address for future orders</Text>
                </View>
                <Switch
                  value={form.isDefault}
                  onValueChange={set('isDefault')}
                  trackColor={{ false: colors.line, true: colors.orange }}
                  thumbColor={colors.white}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button title="Save address" onPress={save} loading={saving} />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setForm({ ...emptyForm, phone: user?.phone || '' });
                setShowForm(true);
              }}
              style={styles.addButton}
            >
              <Ionicons name="add" size={19} color={colors.orange} />
              <Text style={styles.addButtonText}>Add another address</Text>
            </TouchableOpacity>
          )}

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={colors.orange} />
            <Text style={styles.infoText}>
              Riders use your default address unless you choose another one at checkout.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 21,
    fontWeight: '600',
    color: colors.ink,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  list: {
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  addressCardActive: {
    borderColor: colors.orange,
    backgroundColor: colors.yellowPale,
  },
  addressTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressCopy: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  addressText: {
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 18,
    marginTop: 3,
  },
  landmark: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  phone: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  defaultTag: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.orangeDark,
    marginTop: 12,
    marginLeft: 50,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    ...shadow.card,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  labelChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginRight: 8,
  },
  labelChipActive: {
    backgroundColor: colors.yellowPale,
    borderColor: colors.orange,
  },
  labelChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSoft,
  },
  labelChipTextActive: {
    color: colors.orangeDark,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  switchCopy: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  switchNote: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  error: {
    color: colors.red,
    fontSize: 12,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.orange,
    paddingVertical: 15,
    ...shadow.card,
  },
  addButtonText: {
    color: colors.orangeDark,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.yellowPale,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 18,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkSoft,
  },
});

export default AddressScreen;
