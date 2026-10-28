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
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatPrice } from '../../utils/format';
import { adminService } from '../../services/admin.service';
import { useAuth } from '../../hooks/useAuth';
import { Property } from '../../types';

export default function AdminPropertiesScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [properties, setProperties] = useState<Property[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/login' as any);
      return;
    }
    loadProperties();
  }, [isAuthenticated, user, statusFilter, isLoading]);


  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllAdminProperties(
        statusFilter === 'all' ? undefined : statusFilter
      );
      setProperties(data);
    } catch (e) {
      console.warn('Failed to load properties', e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { label: 'All Units', value: 'all' },
    { label: 'Live on Market', value: 'active' },
    { label: 'In Verification', value: 'pending' },
    { label: 'Action Required', value: 'rejected' },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="admin" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Global Marketplace Inventory</Text>
            <Text style={styles.subtitle}>
              Global overview and moderation directory of every property listing submitted on the platform.
            </Text>
          </View>

          {/* Filter Tabs */}
          <View style={[styles.tabsRow, isMobile && { flexWrap: 'wrap', gap: 6 }]}>
            {tabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <TouchableOpacity
                  key={tab.value}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setStatusFilter(tab.value)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {loading ? (
            <LoadingSpinner message="Loading properties..." />
          ) : (
            <View style={styles.card}>
              <ScrollView horizontal={isMobile} showsHorizontalScrollIndicator={false}>
                <View style={[styles.table, isMobile && { minWidth: 620 }]}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { flex: 2 }]}>Property</Text>
                    <Text style={[styles.th, { flex: 1.5 }]}>Location / City</Text>
                    <Text style={[styles.th, { flex: 1 }]}>Type</Text>
                    <Text style={[styles.th, { flex: 1 }]}>Status</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Action</Text>
                  </View>

                  {properties.map((prop) => {
                    const img =
                      prop.images?.[0]?.image_url ||
                      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00';
                    return (
                      <View key={prop.id} style={styles.tr}>
                        <View style={[styles.propCol, { flex: 2 }]}>
                          <Image source={{ uri: img }} style={styles.thumb} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.propTitle} numberOfLines={1}>{prop.title}</Text>
                            <Text style={styles.propPrice}>
                              {formatPrice(Number(prop.price), prop.listing_type)}
                            </Text>
                          </View>
                        </View>

                        <View style={{ flex: 1.5 }}>
                          <Text style={styles.tdText}>{prop.address}</Text>
                          <Text style={styles.tdSub}>{prop.city}</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.tdText}>{prop.property_type}</Text>
                          <Text style={styles.tdSub}>{prop.bedrooms} BHK</Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <StatusBadge status={prop.status} size="sm" />
                        </View>

                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => router.push(`/properties/${prop.id}` as any)}
                          >
                            <Text style={styles.actionBtnText}>View</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
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
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
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
  table: {
    gap: 4,
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  propCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumb: {
    width: 48,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F3F4F6',
  },
  propTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  propPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tdText: {
    fontSize: 13,
    color: COLORS.text,
  },
  tdSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundSubtle,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
