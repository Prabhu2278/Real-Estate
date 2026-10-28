import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Navbar } from '../components/navigation/Navbar';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../utils/format';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 860;

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (overrideEmail?: string, overridePass?: string) => {
    const loginEmail = overrideEmail || email;
    const loginPass = overridePass || password;

    if (!loginEmail.trim() || !loginPass) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const user = await login({ email: loginEmail.trim(), password: loginPass });
      
      // Role-based redirection
      if (user.role === 'admin') {
        router.replace('/admin/dashboard' as any);
      } else if (user.role === 'owner') {
        router.replace('/owner/dashboard' as any);
      } else {
        router.replace('/customer/dashboard' as any);
      }
    } catch (err: any) {
      setErrorMessage(getApiErrorMessage(err, 'Invalid email or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo credentials
  const fillDemo = (role: 'customer' | 'owner' | 'admin') => {
    if (role === 'customer') {
      setEmail('priya@example.com');
      setPassword('customer123');
      handleLogin('priya@example.com', 'customer123');
    } else if (role === 'owner') {
      setEmail('ramesh@example.com');
      setPassword('owner123');
      handleLogin('ramesh@example.com', 'owner123');
    } else {
      setEmail('admin@realestate.com');
      setPassword('admin123');
      handleLogin('admin@realestate.com', 'admin123');
    }
  };

  return (
    <View style={styles.screen}>
      <Navbar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          {/* Split Left Column (Showcase Graphic) */}
          {!isMobile && (
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&auto=format&fit=crop&q=80' }}
              style={styles.heroSide}
            >
              <View style={styles.heroOverlay}>
                <View>
                  <Text style={styles.heroSideTitle}>Your Next Home Awaits</Text>
                  <Text style={styles.heroSideSubtitle}>
                    Join thousands of happy homeowners and renters finding dream properties every day.
                  </Text>
                </View>

                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Ionicons name="search" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.featureText}>Find the best properties</Text>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Ionicons name="heart" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.featureText}>Save your favorites</Text>
                  </View>

                  <View style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Ionicons name="notifications" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.featureText}>Get instant notifications</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          )}

          {/* Form Side */}
          <View style={[styles.formSide, isMobile && styles.formSideMobile]}>
            {/* Top Tabs: Login / Register */}
            <View style={styles.tabToggle}>
              <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]}>
                <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => router.push('/register' as any)}
              >
                <Text style={styles.tabBtnText}>Register</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>

            {!!errorMessage && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>
                  {typeof errorMessage === 'string' ? errorMessage : getApiErrorMessage(errorMessage)}
                </Text>
              </View>
            )}

            {/* Email Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email address *</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Field */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => alert('Password reset is sent to registered email.')}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => handleLogin()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Logins Box */}
            <View style={styles.demoBox}>
              <Text style={styles.demoHeading}>⚡ Quick Demo Sign In:</Text>
              <View style={styles.demoBtnsRow}>
                <TouchableOpacity style={styles.demoPill} onPress={() => fillDemo('customer')}>
                  <Text style={styles.demoPillText}>Customer (Priya)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.demoPill} onPress={() => fillDemo('owner')}>
                  <Text style={styles.demoPillText}>Owner (Ramesh)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.demoPill} onPress={() => fillDemo('admin')}>
                  <Text style={styles.demoPillText}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Footer Link */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/register' as any)}>
                <Text style={styles.switchLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  cardContainer: {
    flexDirection: 'row',
    maxWidth: 920,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  heroSide: {
    flex: 1,
    minHeight: 580,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    padding: 40,
    justifyContent: 'space-between',
  },
  heroSideTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  heroSideSubtitle: {
    fontSize: 15,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  formSide: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
  },
  formSideMobile: {
    padding: SPACING.md,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 20,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSubtle,
    outlineStyle: 'none' as any,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSubtle,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    outlineStyle: 'none' as any,
  },
  eyeBtn: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  demoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 20,
  },
  demoHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  demoBtnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  demoPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  demoPillText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
