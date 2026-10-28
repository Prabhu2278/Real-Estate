import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Modal } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'owner') return '/owner/dashboard';
    return '/customer/dashboard';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Properties', path: '/properties' },
    { label: 'About', path: '/#about' },
    { label: 'Contact', path: '/#contact' },
  ];

  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      // Anchor link
      router.push('/' as any);
    } else {
      router.push(path as any);
    }
  };

  return (
    <View style={styles.navWrapper}>
      <View style={styles.container}>
        {/* Logo */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => router.push('/' as any)}
          activeOpacity={0.8}
        >
          <View style={styles.logoIcon}>
            <Ionicons name="home" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.logoTitle}>RealEstate</Text>
            <Text style={styles.logoSubtitle}>Find Your Dream Home</Text>
          </View>
        </TouchableOpacity>

        {/* Center Tagline / Links (Desktop) */}
        {!isMobile && (
          <View style={styles.centerNav}>
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <TouchableOpacity
                  key={link.label}
                  style={[styles.navLink, isActive && styles.navLinkActive]}
                  onPress={() => handleNavigate(link.path)}
                >
                  <Text style={[styles.navLinkText, isActive && styles.navLinkTextActive]}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Right Section (Auth / Dashboard) */}
        {!isMobile ? (
          <View style={styles.rightActions}>
            {isAuthenticated && user ? (
              <View style={styles.userMenu}>
                <TouchableOpacity
                  style={styles.dashboardBtn}
                  onPress={() => router.push(getDashboardRoute() as any)}
                >
                  <Ionicons name="grid-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.dashboardBtnText}>
                    {user.role === 'admin' ? 'Admin Portal' : user.role === 'owner' ? 'Owner Portal' : 'My Dashboard'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{user.full_name?.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.userName} numberOfLines={1}>{user.full_name?.split(' ')[0]}</Text>
                </View>

                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={async () => {
                    await logout();
                    router.push('/' as any);
                  }}
                >
                  <Ionicons name="log-out-outline" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={() => router.push('/login' as any)}
                >
                  <Text style={styles.loginBtnText}>Login / Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* Mobile Hamburger Button */
          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={() => setMobileMenuOpen(true)}
          >
            <Ionicons name="menu" size={26} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile Drawer Modal */}
      {isMobile && (
        <Modal
          visible={mobileMenuOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setMobileMenuOpen(false)}
        >
          <View style={styles.mobileOverlay}>
            <View style={styles.mobileDrawer}>
              <View style={styles.mobileHeader}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoIcon}>
                    <Ionicons name="home" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.logoTitle}>RealEstate</Text>
                </View>
                <TouchableOpacity onPress={() => setMobileMenuOpen(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.mobileLinks}>
                {navLinks.map((link) => (
                  <TouchableOpacity
                    key={link.label}
                    style={styles.mobileLinkItem}
                    onPress={() => handleNavigate(link.path)}
                  >
                    <Text style={styles.mobileLinkText}>{link.label}</Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.mobileDivider} />

                {isAuthenticated && user ? (
                  <>
                    <TouchableOpacity
                      style={styles.mobileLinkItem}
                      onPress={() => {
                        setMobileMenuOpen(false);
                        router.push(getDashboardRoute() as any);
                      }}
                    >
                      <Ionicons name="grid-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                      <Text style={[styles.mobileLinkText, { color: COLORS.primary, fontWeight: '600' }]}>
                        Go to Dashboard ({user.role})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.mobileLinkItem}
                      onPress={async () => {
                        setMobileMenuOpen(false);
                        await logout();
                        router.push('/' as any);
                      }}
                    >
                      <Ionicons name="log-out-outline" size={18} color={COLORS.danger} style={{ marginRight: 8 }} />
                      <Text style={[styles.mobileLinkText, { color: COLORS.danger }]}>Logout</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.loginBtn, { marginTop: 12, justifyContent: 'center' }]}
                    onPress={() => {
                      setMobileMenuOpen(false);
                      router.push('/login' as any);
                    }}
                  >
                    <Text style={styles.loginBtnText}>Login / Sign Up</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 50,
    ...SHADOWS.sm,
  },
  container: {
    maxWidth: 1280,
    width: '100%',
    marginHorizontal: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: -2,
  },
  centerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navLink: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navLinkActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  navLinkText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  navLinkTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
  },
  dashboardBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    maxWidth: 90,
  },
  logoutBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
  },
  hamburgerBtn: {
    padding: 6,
  },
  mobileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  mobileDrawer: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    ...SHADOWS.lg,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mobileLinks: {
    paddingTop: SPACING.md,
  },
  mobileLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  mobileLinkText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  mobileDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
});
