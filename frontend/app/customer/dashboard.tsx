import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '../../components/navigation/Sidebar';
import { StatCard } from '../../components/dashboard/StatCard';
import { PropertyCard } from '../../components/property/PropertyCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { favoritesService } from '../../services/favorites.service';
import { enquiryService } from '../../services/enquiry.service';
import { visitService } from '../../services/visit.service';
import { useAuth } from '../../hooks/useAuth';
import { Property, Favorite, Enquiry, PropertyVisit } from '../../types';

export default function CustomerDashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [visits, setVisits] = useState<PropertyVisit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, isLoading]);


  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [favs, enqs, vsts] = await Promise.all([
        favoritesService.getFavorites(),
        enquiryService.getMyEnquiries(),
        visitService.getMyVisits(),
      ]);
      setFavorites(favs);
      setEnquiries(enqs);
      setVisits(vsts);
    } catch (e) {
      console.warn('Failed to load customer dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const savedProperties: Property[] = favorites
    .map((f) => f.property)
    .filter((p): p is Property => p !== undefined);

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        {/* Sidebar */}
        <Sidebar role="customer" />

        {/* Main Content Area */}
        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          {/* Top Greeting */}
          <View style={styles.topHeader}>
            <Text style={styles.welcomeTitle}>
              Welcome back, {user?.full_name?.split(' ')[0] || 'Priya'}!
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Here's what's happening with your properties.
            </Text>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading your dashboard data..." />
          ) : (
            <>
              {/* Stat Cards Row */}
              <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
                <StatCard
                  title="Saved Properties"
                  value={favorites.length}
                  icon="heart"
                  color={COLORS.danger}
                />
                <StatCard
                  title="Enquiries"
                  value={enquiries.length}
                  icon="chatbubble-ellipses"
                  color={COLORS.primary}
                />
                <StatCard
                  title="Upcoming Visits"
                  value={visits.filter((v) => v.status !== 'cancelled').length}
                  icon="calendar"
                  color={COLORS.secondary}
                />
              </View>

              {/* Saved Properties Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Saved Properties</Text>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => router.push('/customer/favorites' as any)}
                >
                  <Text style={styles.viewAllText}>View all</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {savedProperties.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>You haven't saved any favorite properties yet.</Text>
                  <TouchableOpacity
                    style={styles.exploreBtn}
                    onPress={() => router.push('/properties' as any)}
                  >
                    <Text style={styles.exploreBtnText}>Browse Properties</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.grid}>
                  {savedProperties.slice(0, 4).map((prop) => (
                    <View
                      key={prop.id}
                      style={[styles.gridCol, isMobile ? styles.gridCol12 : styles.gridCol6]}
                    >
                      <PropertyCard
                        property={prop}
                        onFavoriteChange={() => loadDashboardData()}
                      />
                    </View>
                  ))}
                </View>
              )}

              {/* Recent Enquiries & Upcoming Visits (2-column layout) */}
              <View style={[styles.twoColRow, isMobile && styles.twoColRowMobile]}>
                {/* Recent Enquiries Box */}
                <View style={styles.cardBox}>
                  <View style={styles.cardBoxHeader}>
                    <Text style={styles.cardBoxTitle}>Recent Enquiries</Text>
                    <TouchableOpacity onPress={() => router.push('/customer/enquiries' as any)}>
                      <Text style={styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                  </View>

                  {enquiries.length === 0 ? (
                    <Text style={styles.emptySubText}>No enquiries submitted yet.</Text>
                  ) : (
                    enquiries.slice(0, 3).map((enq) => (
                      <View key={enq.id} style={styles.activityItem}>
                        <View style={styles.activityIcon}>
                          <Ionicons name="mail" size={16} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.activityTitle} numberOfLines={1}>
                            {enq.property?.title || `Property #${enq.property_id}`}
                          </Text>
                          <Text style={styles.activityMsg} numberOfLines={1}>
                            "{enq.message}"
                          </Text>
                          {enq.owner_reply && (
                            <Text style={styles.replyMsg} numberOfLines={1}>
                              Owner reply: {enq.owner_reply}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>

                {/* Upcoming Visits Box */}
                <View style={styles.cardBox}>
                  <View style={styles.cardBoxHeader}>
                    <Text style={styles.cardBoxTitle}>Upcoming Visits</Text>
                    <TouchableOpacity onPress={() => router.push('/customer/visits' as any)}>
                      <Text style={styles.viewAllText}>View all</Text>
                    </TouchableOpacity>
                  </View>

                  {visits.length === 0 ? (
                    <Text style={styles.emptySubText}>No property visits scheduled yet.</Text>
                  ) : (
                    visits.slice(0, 3).map((vst) => (
                      <View key={vst.id} style={styles.activityItem}>
                        <View style={[styles.activityIcon, { backgroundColor: COLORS.secondaryLight }]}>
                          <Ionicons name="calendar" size={16} color={COLORS.secondary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.activityTitle} numberOfLines={1}>
                            {vst.property?.title || `Property #${vst.property_id}`}
                          </Text>
                          <Text style={styles.activityMeta}>
                            Time: {vst.time_slot} · Status: {vst.status}
                          </Text>
                        </View>
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
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: SPACING.xl,
  },
  statsRowMobile: {
    flexDirection: 'column',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridCol: {
    paddingHorizontal: 8,
  },
  gridCol12: {
    width: '100%',
  },
  gridCol6: {
    width: '50%',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  exploreBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    marginBottom: 40,
  },
  twoColRowMobile: {
    flexDirection: 'column',
  },
  cardBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 8,
  },
  cardBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySubText: {
    fontSize: 13,
    color: COLORS.textMuted,
    paddingVertical: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  activityMsg: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  replyMsg: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  activityMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
