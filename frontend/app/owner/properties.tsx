import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '../../components/navigation/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatPrice, formatDate } from '../../utils/format';
import { ownerService } from '../../services/owner.service';
import { propertyService } from '../../services/property.service';
import { useAuth } from '../../hooks/useAuth';
import { Property } from '../../types';

export default function OwnerPropertiesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [properties, setProperties] = useState<Property[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    if (isAuthenticated) {
      loadProperties();
    }
  }, [isAuthenticated, isLoading, statusFilter]);


  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await ownerService.getOwnerProperties(statusFilter === 'all' ? undefined : statusFilter);
      setProperties(data);
    } catch (e) {
      console.warn('Failed to load owner properties', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (prop: Property) => {
    const nextStatus = prop.availability_status === 'available' ? 'rented' : 'available';
    try {
      await propertyService.updateProperty(prop.id, { availability_status: nextStatus });
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, availability_status: nextStatus } : p))
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to update property status');
    }
  };

  const handleDeleteProperty = (propertyId: number) => {
    Alert.alert(
      'Delete Property',
      'Are you sure you want to permanently delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.deleteProperty(propertyId);
              setProperties((prev) => prev.filter((p) => p.id !== propertyId));
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.detail || 'Failed to delete property');
            }
          },
        },
      ]
    );
  };

  const filterTabs = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending Review', value: 'pending' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.bodyRow}>
        {!isMobile && <Sidebar role="owner" />}

        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>My Listed Properties</Text>
              <Text style={styles.subtitle}>
                Manage your active real estate listings, approvals, and availability.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push('/owner/add-property' as any)}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.addBtnText}>Add Property</Text>
            </TouchableOpacity>
          </View>

          {/* Status Filter Tabs */}
          <View style={styles.tabsRow}>
            {filterTabs.map((tab) => {
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
            <LoadingSpinner message="Loading your properties..." />
          ) : properties.length === 0 ? (
            <EmptyState
              icon="business-outline"
              title="No Properties Found"
              description="You do not have any properties matching this filter. Submit a new property listing to begin."
              actionText="Add New Property"
              onAction={() => router.push('/owner/add-property' as any)}
            />
          ) : (
            <View style={styles.list}>
              {properties.map((prop) => {
                const img =
                  prop.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00';
                return (
                  <View key={prop.id} style={styles.card}>
                    <Image source={{ uri: img }} style={styles.thumb} />

                    <View style={styles.contentCol}>
                      <View style={styles.topRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.propTitle}>{prop.title}</Text>
                          <Text style={styles.price}>
                            {formatPrice(Number(prop.price), prop.listing_type)}
                          </Text>
                          <Text style={styles.locText}>
                            {prop.address ? `${prop.address}, ` : ''}{prop.city}
                          </Text>
                        </View>

                        <View style={styles.badgeColumn}>
                          <StatusBadge status={prop.status} />
                          <View style={[styles.availBadge, prop.availability_status === 'available' ? styles.availGreen : styles.availGray]}>
                            <Text style={styles.availText}>{prop.availability_status}</Text>
                          </View>
                        </View>
                      </View>

                      {prop.rejection_reason && (
                        <View style={styles.rejectNotice}>
                          <Ionicons name="alert-circle" size={14} color={COLORS.danger} style={{ marginRight: 4 }} />
                          <Text style={styles.rejectNoticeText}>
                            Rejection note: {prop.rejection_reason}
                          </Text>
                        </View>
                      )}

                      <View style={styles.metaRow}>
                        <Text style={styles.dateText}>Created {formatDate(prop.created_at)}</Text>
                        <Text style={styles.dot}>·</Text>
                        <Text style={styles.metaText}>{prop.property_type}</Text>
                        <Text style={styles.dot}>·</Text>
                        <Text style={styles.metaText}>{prop.bedrooms} BHK</Text>
                      </View>

                      {/* Action Buttons Row */}
                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.actionBtnOutline}
                          onPress={() => router.push(`/properties/${prop.id}` as any)}
                        >
                          <Ionicons name="eye-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                          <Text style={styles.actionBtnOutlineText}>View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionBtnOutline}
                          onPress={() => router.push(`/owner/edit-property?id=${prop.id}` as any)}
                        >
                          <Ionicons name="create-outline" size={14} color={COLORS.text} style={{ marginRight: 4 }} />
                          <Text style={[styles.actionBtnOutlineText, { color: COLORS.text }]}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionBtnOutline}
                          onPress={() => handleToggleAvailability(prop)}
                        >
                          <Ionicons name="swap-horizontal-outline" size={14} color={COLORS.secondary} style={{ marginRight: 4 }} />
                          <Text style={[styles.actionBtnOutlineText, { color: COLORS.secondary }]}>
                            {prop.availability_status === 'available' ? 'Mark Rented/Sold' : 'Mark Available'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDeleteProperty(prop.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
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
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 16,
    ...SHADOWS.sm,
  },
  thumb: {
    width: 140,
    height: 120,
    borderRadius: RADIUS.md,
    backgroundColor: '#F3F4F6',
  },
  contentCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  locText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badgeColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  availBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  availGreen: {
    backgroundColor: '#ECFDF5',
  },
  availGray: {
    backgroundColor: '#F3F4F6',
  },
  availText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  rejectNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: 6,
    borderRadius: RADIUS.sm,
    marginTop: 6,
  },
  rejectNoticeText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  dot: {
    color: COLORS.textMuted,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundSubtle,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 'auto',
  },
});
