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
import { colors, radius } from '../theme/theme';
import { useFormFactor } from '../theme/responsive';

const LoginScreen = ({ navigation }) => {
  const { containerStyle, scrollContentStyle } = useFormFactor();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
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

        <View style={styles.logo}>
          <Ionicons name="flash" size={30} color={colors.orange} />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue your food journey.</Text>

        <View style={styles.form}>
          <Input
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            icon="lock-closed-outline"
            secure
            autoCapitalize="none"
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button title="Sign in" onPress={handleLogin} loading={loading} />
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.social}>
            <Text style={styles.socialText}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.social}>
            <Ionicons name="logo-apple" size={22} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.switchRow}
        >
          <Text style={styles.switchText}>New to FastaPick? </Text>
          <Text style={styles.switchLink}>Create an account</Text>
        </TouchableOpacity>

        <Text style={styles.demoNote}>
          Backend not running? Sign in with any email and a 6+ character password to explore in demo mode.
        </Text>
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
  logo: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.yellowPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 6,
  },
  form: {
    marginTop: 32,
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
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 22,
  },
  forgotText: {
    color: colors.orange,
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 26,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerText: {
    color: colors.muted,
    marginHorizontal: 12,
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  social: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  socialText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
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
  demoNote: {
    marginTop: 30,
    fontSize: 11,
    lineHeight: 17,
    color: colors.muted,
    textAlign: 'center',
  },
});

export default LoginScreen;
