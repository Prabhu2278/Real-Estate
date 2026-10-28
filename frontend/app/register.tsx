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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 860;

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms & Conditions to proceed.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const user = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role,
      });

      if (user.role === 'owner') {
        router.replace('/owner/dashboard' as any);
      } else {
        router.replace('/customer/dashboard' as any);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Navbar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          {/* Split Left Column */}
          {!isMobile && (
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&auto=format&fit=crop&q=80' }}
              style={styles.heroSide}
            >
              <View style={styles.heroOverlay}>
                <View>
                  <Text style={styles.heroSideTitle}>Join RealEstate</Text>
                  <Text style={styles.heroSideSubtitle}>
                    Whether looking for your next home or listing high value properties, our platform makes it seamless.
                  </Text>
                </View>

                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                    <Text style={styles.featureText}>Zero middleman friction</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                    <Text style={styles.featureText}>Verified property visits</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                    <Text style={styles.featureText}>Direct owner messaging</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          )}

          {/* Form Side */}
          <View style={[styles.formSide, isMobile && styles.formSideMobile]}>
            {/* Top Tabs */}
            <View style={styles.tabToggle}>
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => router.push('/login' as any)}
              >
                <Text style={styles.tabBtnText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tabBtn, styles.tabBtnActive]}>
                <Text style={[styles.tabBtnText, styles.tabBtnTextActive]}>Register</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.welcomeTitle}>Create an Account</Text>
            <Text style={styles.welcomeSubtitle}>Get started with your free profile</Text>

            {errorMessage && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Role Choice */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>I am a:</Text>
              <View style={styles.roleToggleRow}>
                <TouchableOpacity
                  style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]}
                  onPress={() => setRole('customer')}
                >
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={role === 'customer' ? COLORS.primary : COLORS.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.roleBtnText, role === 'customer' && styles.roleBtnTextActive]}>
                    Customer / Renter
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleBtn, role === 'owner' && styles.roleBtnActive]}
                  onPress={() => setRole('owner')}
                >
                  <Ionicons
                    name="business-outline"
                    size={16}
                    color={role === 'owner' ? COLORS.primary : COLORS.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.roleBtnText, role === 'owner' && styles.roleBtnTextActive]}>
                    Property Owner
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor={COLORS.textLight}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Email */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address *</Text>
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

            {/* Phone */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password (min 6 chars) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Create password"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat password"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the Terms of Service and Privacy Policy
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Link back to login */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login' as any)}>
                <Text style={styles.switchLink}>Sign In</Text>
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
    padding: SPACING.md,
  },
  cardContainer: {
    flexDirection: 'row',
    maxWidth: 960,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 20,
    ...SHADOWS.lg,
  },
  heroSide: {
    flex: 1,
    minHeight: 650,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.78)',
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
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  formSide: {
    flex: 1.2,
    padding: 36,
    justifyContent: 'center',
  },
  formSideMobile: {
    padding: SPACING.lg,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: 20,
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
    marginBottom: 16,
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
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSubtle,
  },
  roleBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  roleBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSubtle,
    outlineStyle: 'none' as any,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 4,
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
  termsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
