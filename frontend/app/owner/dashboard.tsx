import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '../../components/navigation/Sidebar';
import { StatCard } from '../../components/dashboard/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatPrice } from '../../utils/format';
import { ownerService, OwnerDashboardData } from '../../services/owner.service';
import { useAuth } from '../../hooks/useAuth';

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [dashboardData, setDashboardData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    if (isAuthenticated) {
      loadOwnerData();
    }
  }, [isAuthenticated, isLoading]);


  const loadOwnerData = async () => {
    try {
      setLoading(true);
      const data = await ownerService.getOwnerDashboard();
      setDashboardData(data);
    } catch (e) {
      console.warn('Failed to load owner dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData?.stats || {
    total_properties: 0,
    active_listings: 0,
    pending_approvals: 0,
    total_enquiries: 0,
    upcoming_visits: 0,
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="owner" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={[styles.topHeader, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
            <View>
              <Text style={styles.welcomeTitle}>
                Welcome back, {user?.full_name?.split(' ')[0] || 'Landlord'}!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Rental portfolio overview, tenant lead inquiries, and scheduled inspections.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addPropertyBtn}
              onPress={() => router.push('/owner/add-property' as any)}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addPropertyBtnText}>+ List New Space</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading landlord portfolio metrics..." />
          ) : (
            <>
              {/* 5 Summary Stat Cards */}
              <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
                <StatCard
                  title="Portfolio Size"
                  value={stats.total_properties}
                  icon="business"
                  color={COLORS.primary}
                />
                <StatCard
                  title="Live on Market"
                  value={stats.active_listings}
                  icon="checkmark-circle"
                  color={COLORS.secondary}
                />
                <StatCard
                  title="In Verification"
                  value={stats.pending_approvals}
                  icon="time"
                  color={COLORS.accent}
                />
                <StatCard
                  title="Tenant Leads"
                  value={stats.total_enquiries}
                  icon="chatbubble-ellipses"
                  color="#6366F1"
                />
                <StatCard
                  title="Inspection Bookings"
                  value={stats.upcoming_visits}
                  icon="calendar"
                  color="#EC4899"
                />
              </View>

              {/* Recent Properties Section */}
              <View style={styles.cardBox}>
                <View style={styles.cardBoxHeader}>
                  <Text style={styles.cardBoxTitle}>Property Portfolio</Text>
                  <TouchableOpacity onPress={() => router.push('/owner/properties' as any)}>
                    <Text style={styles.viewAllText}>View All Portfolio</Text>
                  </TouchableOpacity>
                </View>

                {dashboardData?.recent_properties.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>You haven't added any properties to your portfolio yet.</Text>
                  </View>
                ) : (
                  <View style={styles.propertiesTable}>
                    {dashboardData?.recent_properties.map((prop) => {
                      const img =
                        prop.images?.[0]?.image_url ||
                        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00';
                      return (
                        <View key={prop.id} style={styles.tableRow}>
                          <Image source={{ uri: img }} style={styles.tableThumb} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.propName}>{prop.title}</Text>
                            <Text style={styles.propMeta}>
                              {formatPrice(Number(prop.price), prop.listing_type)} · {prop.city}
                            </Text>
                          </View>
                          <StatusBadge status={prop.status} />
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => router.push(`/properties/${prop.id}` as any)}
                          >
                            <Ionicons name="eye-outline" size={16} color={COLORS.primary} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Two Column Section: Recent Enquiries & Upcoming Visits */}
              <View style={[styles.twoColRow, isMobile && styles.twoColRowMobile]}>
                {/* Recent Inquiries */}
                <View style={styles.cardBox}>
                  <View style={styles.cardBoxHeader}>
                    <Text style={styles.cardBoxTitle}>Tenant & Buyer Leads</Text>
                    <TouchableOpacity onPress={() => router.push('/owner/enquiries' as any)}>
                      <Text style={styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                  </View>

                  {dashboardData?.recent_enquiries.length === 0 ? (
                    <Text style={styles.emptySubText}>No tenant leads received yet.</Text>
                  ) : (
                    dashboardData?.recent_enquiries.map((enq) => (
                      <View key={enq.id} style={styles.enquiryItem}>
                        <View style={styles.enquiryAvatar}>
                          <Text style={styles.enquiryAvatarText}>
                            {enq.user?.full_name?.charAt(0) || 'L'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.enquiryUser}>{enq.user?.full_name || 'Prospective Tenant'}</Text>
                          <Text style={styles.enquiryMsg} numberOfLines={1}>
                            "{enq.message}"
                          </Text>
                          <Text style={styles.enquiryProp}>For: {enq.property?.title}</Text>
                        </View>
                        <StatusBadge status={enq.status} size="sm" />
                      </View>
                    ))
                  )}
                </View>

                {/* Upcoming Visits */}
                <View style={styles.cardBox}>
                  <View style={styles.cardBoxHeader}>
                    <Text style={styles.cardBoxTitle}>Inspection Bookings</Text>
                    <TouchableOpacity onPress={() => router.push('/owner/visits' as any)}>
                      <Text style={styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                  </View>

                  {dashboardData?.upcoming_visits.length === 0 ? (
                    <Text style={styles.emptySubText}>No upcoming walkthrough bookings.</Text>
                  ) : (
                    dashboardData?.upcoming_visits.map((vst) => (
                      <View key={vst.id} style={styles.enquiryItem}>
                        <View style={[styles.enquiryAvatar, { backgroundColor: COLORS.secondaryLight }]}>
                          <Ionicons name="calendar" size={16} color={COLORS.secondary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.enquiryUser}>{vst.user?.full_name || 'Prospective Tenant'}</Text>
                          <Text style={styles.enquiryProp}>Slot: {vst.time_slot}</Text>
                          <Text style={styles.enquiryProp}>Property: {vst.property?.title}</Text>
                        </View>
                        <StatusBadge status={vst.status} size="sm" />
                      </View>
                    ))
                  )}
                </View>
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
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  addPropertyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  addPropertyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  statsRowMobile: {
    flexDirection: 'column',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
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
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.textMuted,
    paddingVertical: 16,
  },
  propertiesTable: {
    gap: 12,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tableThumb: {
    width: 56,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F3F4F6',
  },
  propName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  propMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionBtn: {
    padding: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundSubtle,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  twoColRowMobile: {
    flexDirection: 'column',
  },
  enquiryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  enquiryAvatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enquiryAvatarText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  enquiryUser: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  enquiryMsg: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  enquiryProp: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 2,
  },
});
