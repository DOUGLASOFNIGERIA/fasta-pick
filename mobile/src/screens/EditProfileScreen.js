import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { cities } from '../data/mock';
import { colors, radius } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const EditProfileScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || 'Ado-Ekiti',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setError('');
    if (!form.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setSaving(true);
    try {
      await updateUser({ ...form, name: form.name.trim() });
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, containerStyle]} edges={['top']}>
      <View style={styles.head}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={21} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit profile</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={[styles.scroll, scrollContentStyle]} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(form.name || 'F').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.avatarName}>{user?.name}</Text>
              <Text style={styles.avatarEmail}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Input
              label="Full name"
              value={form.name}
              onChangeText={set('name')}
              placeholder="Your name"
              icon="person-outline"
            />
            <Input
              label="Phone number"
              value={form.phone}
              onChangeText={set('phone')}
              placeholder="0803 000 0000"
              icon="call-outline"
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>Your city</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cities}>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => set('city')(city)}
                  style={[styles.chip, form.city === city && styles.chipActive]}
                >
                  <Text style={[styles.chipText, form.city === city && styles.chipTextActive]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Save changes" onPress={save} loading={saving} />
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
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 16,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.ink,
  },
  avatarName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  avatarEmail: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
  },
  cities: {
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.yellowPale,
    borderColor: colors.orange,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSoft,
  },
  chipTextActive: {
    color: colors.orangeDark,
  },
  error: {
    color: colors.red,
    fontSize: 12,
    marginBottom: 12,
  },
});

export default EditProfileScreen;
