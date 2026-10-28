import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '../../components/navigation/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatDate } from '../../utils/format';
import { adminService } from '../../services/admin.service';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types';

export default function AdminUsersScreen() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    if (currentUser && currentUser.role !== 'admin') {
      Alert.alert('Access Denied', 'Administrator access required.');
      router.replace('/' as any);
      return;
    }
    loadUsers();
  }, [isAuthenticated, currentUser, roleFilter, isLoading]);


  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAdminUsers(
        roleFilter === 'all' ? undefined : roleFilter,
        search.trim() || undefined
      );
      setUsers(data);
    } catch (e) {
      console.warn('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      Alert.alert('Error', 'You cannot deactivate your own administrator account.');
      return;
    }

    try {
      const updated = await adminService.toggleUserActive(targetUser.id);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updated : u)));
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to update user status');
    }
  };

  const roleTabs = [
    { label: 'All Roles', value: 'all' },
    { label: 'Home Seekers', value: 'customer' },
    { label: 'Landlords & Owners', value: 'owner' },
    { label: 'Administrators', value: 'admin' },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="admin" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>User Directory & Account Audits</Text>
            <Text style={styles.subtitle}>
              Monitor registered home seekers, verified property landlords, and administrative access.
            </Text>
          </View>

          {/* Search & Filter Bar */}
          <View style={[styles.filterRow, isMobile && { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or email..."
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={loadUsers}
              />
              <TouchableOpacity onPress={loadUsers} style={styles.searchBtn}>
                <Text style={styles.searchBtnText}>Search</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.tabsRow, isMobile && { flexWrap: 'wrap', gap: 6 }]}>
              {roleTabs.map((tab) => {
                const isActive = roleFilter === tab.value;
                return (
                  <TouchableOpacity
                    key={tab.value}
                    style={[styles.tab, isActive && styles.tabActive]}
                    onPress={() => setRoleFilter(tab.value)}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading user records..." />
          ) : (
            <View style={styles.card}>
              <ScrollView horizontal={isMobile} showsHorizontalScrollIndicator={false}>
                <View style={[isMobile && { minWidth: 640 }]}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { flex: 2 }]}>User</Text>
                    <Text style={[styles.th, { flex: 1.5 }]}>Phone</Text>
                    <Text style={[styles.th, { flex: 1 }]}>Role</Text>
                    <Text style={[styles.th, { flex: 1 }]}>Status</Text>
                    <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>Action</Text>
                  </View>

                  {users.map((u) => (
                    <View key={u.id} style={styles.tr}>
                      <View style={[styles.userCol, { flex: 2 }]}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{u.full_name?.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                          <Text style={styles.userName}>{u.full_name}</Text>
                          <Text style={styles.userEmail}>{u.email}</Text>
                          <Text style={styles.joinDate}>Joined {formatDate(u.created_at)}</Text>
                        </View>
                      </View>

                      <View style={{ flex: 1.5 }}>
                        <Text style={styles.phoneText}>{u.phone || '—'}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={[styles.roleTag, u.role === 'admin' ? styles.roleAdmin : u.role === 'owner' ? styles.roleOwner : styles.roleCustomer]}>
                          <Text style={styles.roleTagText}>{u.role}</Text>
                        </View>
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={[styles.statusBadge, u.is_active ? styles.statusActive : styles.statusInactive]}>
                          <Text style={[styles.statusText, u.is_active ? styles.statusTextActive : styles.statusTextInactive]}>
                            {u.is_active ? 'Active' : 'Deactivated'}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flex: 1.2, alignItems: 'flex-end' }}>
                        {u.id !== currentUser?.id && (
                          <TouchableOpacity
                            style={[
                              styles.toggleBtn,
                              u.is_active ? styles.toggleBtnDeact : styles.toggleBtnAct,
                            ]}
                            onPress={() => handleToggleActive(u)}
                          >
                            <Text
                              style={[
                                styles.toggleBtnText,
                                u.is_active ? styles.toggleTextDeact : styles.toggleTextAct,
                              ]}
                            >
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
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
    maxWidth: 1300,
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingLeft: 10,
    minWidth: 260,
  },
  searchInput: {
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.text,
    minWidth: 160,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderTopRightRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 40,
    ...SHADOWS.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  userCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  joinDate: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  phoneText: {
    fontSize: 13,
    color: COLORS.text,
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  roleAdmin: {
    backgroundColor: '#FEE2E2',
  },
  roleOwner: {
    backgroundColor: '#E0E7FF',
  },
  roleCustomer: {
    backgroundColor: '#F3F4F6',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
    color: COLORS.text,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  statusActive: {
    backgroundColor: '#ECFDF5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextInactive: {
    color: '#DC2626',
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  toggleBtnDeact: {
    borderColor: '#FECACA',
    backgroundColor: COLORS.dangerLight,
  },
  toggleBtnAct: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextDeact: {
    color: COLORS.danger,
  },
  toggleTextAct: {
    color: '#059669',
  },
});
