import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
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
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const handleNavigate = (path: string) => {
    setDrawerOpen(false);
    router.push(path as any);
  };

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logout();
    router.push('/' as any);
  };

  // Render navigation links list
  const renderNavList = () => (
    <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <TouchableOpacity
            key={item.path}
            style={[styles.menuItem, isActive && styles.menuItemActive]}
            onPress={() => handleNavigate(item.path)}
            activeOpacity={0.8}
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
  );

  // Render user info + logout
  const renderFooter = () => (
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

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.menuIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  // MOBILE VIEW: Sticky top navigation bar + slide-over drawer modal
  if (isMobile) {
    return (
      <View style={styles.mobileBar}>
        <TouchableOpacity
          style={styles.mobileLogoRow}
          onPress={() => router.push('/' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.logoIcon}>
            <Ionicons name="home" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>RealEstate</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>{role.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Drawer Modal */}
        <Modal
          visible={drawerOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setDrawerOpen(false)}
        >
          <View style={styles.drawerOverlay}>
            <TouchableOpacity
              style={styles.backdropTouch}
              activeOpacity={1}
              onPress={() => setDrawerOpen(false)}
            />
            <View style={[styles.drawerContent, { width: Math.min(300, width * 0.85) }]}>
              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <TouchableOpacity
                  style={styles.logoRow}
                  onPress={() => handleNavigate('/')}
                  activeOpacity={0.8}
                >
                  <View style={styles.logoIcon}>
                    <Ionicons name="home" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.logoText}>RealEstate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDrawerOpen(false)}
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Navigation Items */}
              {renderNavList()}

              {/* Drawer Footer */}
              {renderFooter()}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // DESKTOP VIEW: Left fixed sidebar (250px)
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
      {renderNavList()}

      {/* Bottom User & Logout */}
      {renderFooter()}
    </View>
  );
};

const styles = StyleSheet.create({
  // Desktop Sidebar
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
  // Mobile Top Bar
  mobileBar: {
    width: '100%',
    height: 56,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    zIndex: 40,
    ...SHADOWS.sm,
  },
  mobileLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolePill: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#374151',
    marginLeft: 4,
  },
  rolePillText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  hamburgerBtn: {
    padding: 6,
  },
  // Mobile Drawer
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdropTouch: {
    flex: 1,
  },
  drawerContent: {
    backgroundColor: '#111827',
    height: '100%',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'space-between',
    ...SHADOWS.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  closeBtn: {
    padding: 6,
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
