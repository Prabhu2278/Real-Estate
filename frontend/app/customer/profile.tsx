import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '../../components/navigation/Sidebar';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/format';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState<boolean>(false);
  const [profileSuccess, setProfileSuccess] = useState<boolean>(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [changingPassword, setChangingPassword] = useState<boolean>(false);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.replace('/login' as any);
    }
  }, [isLoading, isAuthenticated, user]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }


  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name cannot be empty.');
      return;
    }
    try {
      setUpdatingProfile(true);
      await authService.updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setPasswordError('Please provide both current and new passwords.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordError(null);
      await authService.changePassword(oldPassword, newPassword);
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(getApiErrorMessage(err, 'Failed to change password'));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/' as any);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role={user.role} />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Account Profile & Settings</Text>
            <Text style={styles.subtitle}>
              Manage your personal information, security, and notification preferences.
            </Text>
          </View>

          {/* User Profile Card */}
          <View style={[styles.card, isMobile && { padding: SPACING.md }]}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.full_name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{user.full_name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{user.role.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeading}>Personal Information</Text>

            {profileSuccess && (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} style={{ marginRight: 6 }} />
                <Text style={styles.successText}>Profile successfully updated!</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address (Read-Only)</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={user.email}
                editable={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleUpdateProfile}
              disabled={updatingProfile}
            >
              {updatingProfile ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Profile Changes</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Password Security Card */}
          <View style={[styles.card, { marginTop: 24 }, isMobile && { padding: SPACING.md }]}>
            <Text style={styles.sectionHeading}>Security & Password</Text>

            {passwordSuccess && (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} style={{ marginRight: 6 }} />
                <Text style={styles.successText}>Password successfully changed!</Text>
              </View>
            )}

            {!!passwordError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.danger} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>
                  {typeof passwordError === 'string' ? passwordError : getApiErrorMessage(passwordError)}
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter current password"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password (min 6 characters)</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat new password"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: COLORS.text }]}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Logout Action */}
          <View style={[styles.card, { marginTop: 24, marginBottom: 40 }]}>
            <Text style={styles.sectionHeading}>Session</Text>
            <Text style={styles.logoutDesc}>
              Signing out will end your current active session on this device.
            </Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.logoutBtnText}>Log Out from Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  bodyRow: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    padding: SPACING.lg,
    maxWidth: 800,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: COLORS.backgroundSubtle,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 20,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
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
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    color: COLORS.textMuted,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 14,
  },
  successText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 14,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  logoutDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
