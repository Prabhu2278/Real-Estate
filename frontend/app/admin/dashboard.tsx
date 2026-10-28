import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '../../components/navigation/Sidebar';
import { StatCard } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatPrice } from '../../utils/format';
import { adminService, AdminDashboardData } from '../../services/admin.service';
import { useAuth } from '../../hooks/useAuth';
import { Property } from '../../types';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    if (user && user.role !== 'admin') {
      Alert.alert('Access Denied', 'Administrator access required.');
      router.replace('/' as any);
      return;
    }
    loadAdminData();
  }, [isAuthenticated, user, isLoading]);


  const loadAdminData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAdminDashboard();
      setDashboardData(data);
    } catch (e) {
      console.warn('Failed to load admin dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData?.stats || {
    total_users: 0,
    total_properties: 0,
    pending_approvals: 0,
    total_enquiries: 0,
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="admin" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.header, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
            <View>
              <Text style={styles.title}>Marketplace Command Center</Text>
              <Text style={styles.subtitle}>
                Platform-wide oversight, listing compliance, and user account management.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.reviewPendingBtn}
              onPress={() => router.push('/admin/approvals' as any)}
            >
              <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.reviewPendingBtnText}>
                Verification Queue ({stats.pending_approvals})
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading platform command center..." />
          ) : (
            <>
              {/* Stat Cards Overview */}
              <Text style={styles.sectionHeading}>Platform Governance & Metrics</Text>
              <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
                <StatCard
                  title="Total Accounts"
                  value={stats.total_users}
                  icon="people"
                  color={COLORS.primary}
                />
                <StatCard
                  title="Marketplace Inventory"
                  value={stats.total_properties}
                  icon="business"
                  color={COLORS.secondary}
                />
                <StatCard
                  title="Moderation Queue"
                  value={stats.pending_approvals}
                  icon="time"
                  color={COLORS.accent}
                />
                <StatCard
                  title="Platform Leads"
                  value={stats.total_enquiries}
                  icon="chatbubble-ellipses"
                  color="#6366F1"
                />
              </View>

              {/* Recent Listings Awaiting Review or Newly Added */}
              <View style={styles.cardBox}>
                <View style={styles.cardBoxHeader}>
                  <Text style={styles.cardBoxTitle}>Recent Listings for Moderation</Text>
                  <TouchableOpacity onPress={() => router.push('/admin/approvals' as any)}>
                    <Text style={styles.viewAllText}>Open Verification Queue</Text>
                  </TouchableOpacity>
                </View>

                {dashboardData?.pending_properties.length === 0 && dashboardData?.recent_properties.length === 0 ? (
                  <Text style={styles.emptyText}>No listings to review.</Text>
                ) : (
                  <ScrollView horizontal={isMobile} showsHorizontalScrollIndicator={false}>
                    <View style={[styles.table, isMobile && { minWidth: 540 }]}>
                      <View style={styles.tableHeader}>
                        <Text style={[styles.th, { flex: 2 }]}>Property</Text>
                        <Text style={[styles.th, { flex: 1.5 }]}>Owner</Text>
                        <Text style={[styles.th, { flex: 1 }]}>Status</Text>
                        <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Action</Text>
                      </View>

                      {(dashboardData?.pending_properties.length ? dashboardData.pending_properties : dashboardData?.recent_properties || []).map((prop: Property) => (
                        <View key={prop.id} style={styles.tr}>
                          <View style={{ flex: 2 }}>
                            <Text style={styles.tdTitle}>{prop.title}</Text>
                            <Text style={styles.tdSub}>{prop.city} · {formatPrice(Number(prop.price), prop.listing_type)}</Text>
                          </View>

                          <View style={{ flex: 1.5 }}>
                            <Text style={styles.tdText}>{prop.owner?.full_name || `Owner #${prop.owner_id}`}</Text>
                            <Text style={styles.tdSub}>{prop.owner?.email || ''}</Text>
                          </View>

                          <View style={{ flex: 1 }}>
                            <StatusBadge status={prop.status} size="sm" />
                          </View>

                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <TouchableOpacity
                              style={styles.reviewBtn}
                              onPress={() => router.push('/admin/approvals' as any)}
                            >
                              <Text style={styles.reviewBtnText}>Review</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>

              {/* Recent Registered Users */}
              <View style={[styles.cardBox, { marginTop: 24, marginBottom: 40 }]}>
                <View style={styles.cardBoxHeader}>
                  <Text style={styles.cardBoxTitle}>Recent User Registrations</Text>
                  <TouchableOpacity onPress={() => router.push('/admin/users' as any)}>
                    <Text style={styles.viewAllText}>View All Users</Text>
                  </TouchableOpacity>
                </View>

                {dashboardData?.recent_users.map((u) => (
                  <View key={u.id} style={styles.userRow}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>{u.full_name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{u.full_name}</Text>
                      <Text style={styles.userEmail}>{u.email}</Text>
                    </View>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{u.role}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  reviewPendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  reviewPendingBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: SPACING.lg,
  },
  statsRowMobile: {
    gap: 10,
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    paddingVertical: 12,
  },
  table: {
    gap: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tdTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  tdSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  tdText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  reviewBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
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
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  roleBadge: {
    backgroundColor: COLORS.backgroundSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
});
