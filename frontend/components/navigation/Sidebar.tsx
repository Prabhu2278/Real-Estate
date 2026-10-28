import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

interface SidebarProps {
  role?: 'customer' | 'owner' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ role = 'customer' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const getCustomerNav = (): NavItem[] => [
    { label: 'Dashboard', path: '/customer/dashboard', icon: 'grid-outline' },
    { label: 'Saved Properties', path: '/customer/favorites', icon: 'heart-outline' },
    { label: 'My Enquiries', path: '/customer/enquiries', icon: 'chatbubble-ellipses-outline' },
    { label: 'Scheduled Visits', path: '/customer/visits', icon: 'calendar-outline' },
    { label: 'Profile', path: '/customer/profile', icon: 'person-outline' },
  ];

  const getOwnerNav = (): NavItem[] => [
    { label: 'Dashboard', path: '/owner/dashboard', icon: 'grid-outline' },
    { label: 'My Properties', path: '/owner/properties', icon: 'home-outline' },
    { label: 'Add Property', path: '/owner/add-property', icon: 'add-circle-outline' },
    { label: 'Enquiries', path: '/owner/enquiries', icon: 'chatbubble-ellipses-outline' },
    { label: 'Visits', path: '/owner/visits', icon: 'calendar-outline' },
    { label: 'Profile', path: '/customer/profile', icon: 'person-outline' },
  ];

  const getAdminNav = (): NavItem[] => [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'grid-outline' },
    { label: 'Manage Users', path: '/admin/users', icon: 'people-outline' },
    { label: 'Properties', path: '/admin/properties', icon: 'business-outline' },
    { label: 'Pending Approvals', path: '/admin/approvals', icon: 'checkmark-circle-outline' },
    { label: 'Reports', path: '/admin/reports', icon: 'bar-chart-outline' },
    { label: 'Profile', path: '/customer/profile', icon: 'person-outline' },
  ];

  const items = role === 'admin' ? getAdminNav() : role === 'owner' ? getOwnerNav() : getCustomerNav();

  const handleLogout = async () => {
    await logout();
    router.push('/' as any);
  };

  return (
    <View style={styles.sidebar}>
      {/* Brand Header */}
      <TouchableOpacity
        style={styles.logoRow}
        onPress={() => router.push('/' as any)}
        activeOpacity={0.8}
      >
        <View style={styles.logoIcon}>
          <Ionicons name="home" size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.logoText}>RealEstate</Text>
      </TouchableOpacity>

      {/* Nav List */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const isActive = pathname === item.path;
          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => router.push(item.path as any)}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={isActive ? '#FFFFFF' : '#9CA3AF'}
                style={styles.menuIcon}
              />
              <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom User & Logout */}
      <View style={styles.footer}>
        {user && (
          <View style={styles.userBadge}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user.full_name?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName} numberOfLines={1}>{user.full_name}</Text>
              <Text style={styles.userRole}>{user.role}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.menuIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#1F2937',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    marginBottom: SPACING.md,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: 4,
  },
  menuItemActive: {
    backgroundColor: COLORS.primary,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  menuTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: SPACING.md,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  userName: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '600',
  },
  userRole: {
    color: '#9CA3AF',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
});
