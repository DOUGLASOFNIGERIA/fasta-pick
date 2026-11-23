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
import { Ionicons } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { cities } from '../data/mock';
import {
  DEFAULT_ROLE,
  REGISTRATION_ROLES,
} from '../constants/roles';
import { colors, radius } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const RegisterScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    city: 'Ado-Ekiti',
    role: DEFAULT_ROLE,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();

  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const handleRegister = async () => {
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in your name, email and password.');
      return;
    }
    if (form.password.length < 6) {
      setError('Your password should be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signUp(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, containerStyle]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={[styles.scroll, scrollContentStyle]} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Good food, fast. Right here in Ekiti.</Text>

        <View style={styles.form}>
          <Input
            label="Full name"
            value={form.name}
            onChangeText={set('name')}
            placeholder="e.g. Tobi Adeyemi"
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
          <Input
            label="Email address"
            value={form.email}
            onChangeText={set('email')}
            placeholder="you@example.com"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            value={form.password}
            onChangeText={set('password')}
            placeholder="At least 6 characters"
            icon="lock-closed-outline"
            secure
            autoCapitalize="none"
          />

          <Text style={styles.label}>Join FastaPick as</Text>
          <View style={styles.roles}>
            {REGISTRATION_ROLES.map((option) => (
              <TouchableOpacity
                key={option.role}
                onPress={() => set('role')(option.role)}
                style={[
                  styles.roleCard,
                  form.role === option.role && styles.roleCardActive,
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={form.role === option.role ? colors.orangeDark : colors.muted}
                />
                <Text
                  style={[
                    styles.roleText,
                    form.role === option.role && styles.roleTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Your city</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cities}>
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={set('city')}
                style={[styles.chip, form.city === city && styles.chipActive]}
              >
                <Text style={[styles.chipText, form.city === city && styles.chipTextActive]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.terms}>
            <Ionicons name="checkbox" size={18} color={colors.orange} />
            <Text style={styles.termsText}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </TouchableOpacity>

          <Button title="Create account" onPress={handleRegister} loading={loading} />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.switchRow}
        >
          <Text style={styles.switchText}>Already have an account? </Text>
          <Text style={styles.switchLink}>Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 56,
    paddingBottom: 36,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 6,
  },
  form: {
    marginTop: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
  },
  roles: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  roleCardActive: {
    backgroundColor: colors.yellowPale,
    borderColor: colors.orange,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    marginTop: 5,
  },
  roleTextActive: {
    color: colors.orangeDark,
  },
  cities: {
    marginBottom: 18,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
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
    color: colors.inkSoft,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.orangeDark,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.redPale,
    padding: 12,
    borderRadius: radius.sm,
    marginBottom: 14,
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  termsText: {
    fontSize: 12,
    color: colors.inkSoft,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 26,
  },
  switchText: {
    color: colors.muted,
    fontSize: 14,
  },
  switchLink: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RegisterScreen;
