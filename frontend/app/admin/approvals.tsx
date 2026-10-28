import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '../../components/navigation/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatPrice, formatDate } from '../../utils/format';
import { adminService } from '../../services/admin.service';
import { useAuth } from '../../hooks/useAuth';
import { Property } from '../../types';

export default function AdminApprovalsScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

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
    loadPending();
  }, [isAuthenticated, user, isLoading]);


  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingProperties();
      setPendingProperties(data);
    } catch (e) {
      console.warn('Failed to load pending properties', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (propertyId: number) => {
    try {
      setActionLoading(true);
      await adminService.approveProperty(propertyId);
      setPendingProperties((prev) => prev.filter((p) => p.id !== propertyId));
      Alert.alert('Listing Approved', 'The property is now active and publicly visible.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to approve property');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (property: Property) => {
    setSelectedProperty(property);
    setRejectionReason('Missing high-resolution interior photos and valid property tax verification.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedProperty || !rejectionReason.trim()) return;
    try {
      setActionLoading(true);
      await adminService.rejectProperty(selectedProperty.id, rejectionReason.trim());
      setPendingProperties((prev) => prev.filter((p) => p.id !== selectedProperty.id));
      setRejectModalOpen(false);
      Alert.alert('Listing Rejected', 'The property has been rejected and the owner notified.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to reject property');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="admin" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Property Listing Approvals</Text>
            <Text style={styles.subtitle}>
              Review newly submitted properties before making them publicly searchable on the marketplace.
            </Text>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading pending properties..." />
          ) : pendingProperties.length === 0 ? (
            <EmptyState
              icon="checkmark-done-circle-outline"
              title="All Caught Up!"
              description="There are currently no property submissions awaiting administrator review."
            />
          ) : (
            <View style={styles.list}>
              {pendingProperties.map((prop) => {
                const img =
                  prop.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00';

                return (
                  <View key={prop.id} style={[styles.card, isMobile && { flexDirection: 'column' }]}>
                    <Image source={{ uri: img }} style={[styles.thumb, isMobile && { width: '100%', height: 180 }]} />

                    <View style={styles.contentCol}>
                      <View style={[styles.topRow, isMobile && { flexDirection: 'column', gap: 8 }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.propTitle}>{prop.title}</Text>
                          <Text style={styles.propPrice}>
                            {formatPrice(Number(prop.price), prop.listing_type)}
                          </Text>
                          <Text style={styles.propLoc}>
                            {prop.address}, {prop.city}
                          </Text>
                        </View>

                        <View style={styles.ownerBadge}>
                          <Text style={styles.ownerLabel}>Submitted by:</Text>
                          <Text style={styles.ownerName}>
                            {prop.owner?.full_name || `Owner #${prop.owner_id}`}
                          </Text>
                          <Text style={styles.ownerEmail}>{prop.owner?.email || ''}</Text>
                        </View>
                      </View>

                      <Text style={styles.desc} numberOfLines={2}>
                        {prop.description}
                      </Text>

                      <View style={styles.metaRow}>
                        <Text style={styles.dateText}>Submitted on {formatDate(prop.created_at)}</Text>
                        <Text style={styles.dot}>·</Text>
                        <Text style={styles.metaText}>{prop.property_type}</Text>
                        <Text style={styles.dot}>·</Text>
                        <Text style={styles.metaText}>{prop.bedrooms} BHK</Text>
                        <Text style={styles.dot}>·</Text>
                        <Text style={styles.metaText}>{prop.area_sqft} sq ft</Text>
                      </View>

                      {/* Action Buttons */}
                      <View style={[styles.actionsRow, isMobile && { flexWrap: 'wrap', gap: 8 }]}>
                        <TouchableOpacity
                          style={styles.viewBtn}
                          onPress={() => router.push(`/properties/${prop.id}` as any)}
                        >
                          <Ionicons name="open-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                          <Text style={styles.viewBtnText}>Preview Details</Text>
                        </TouchableOpacity>

                        <View style={{ flex: 1 }} />

                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => handleOpenReject(prop)}
                          disabled={actionLoading}
                        >
                          <Ionicons name="close-circle" size={16} color={COLORS.danger} style={{ marginRight: 4 }} />
                          <Text style={styles.rejectBtnText}>Reject</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.approveBtn}
                          onPress={() => handleApprove(prop.id)}
                          disabled={actionLoading}
                        >
                          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.approveBtnText}>Approve Listing</Text>
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

      {/* Reject Modal */}
      <Modal
        visible={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Property Listing"
      >
        <Text style={styles.modalSub}>
          Provide a clear reason for rejecting "{selectedProperty?.title}". The owner will receive this feedback to make corrections.
        </Text>

        <Text style={styles.modalLabel}>Rejection Reason *</Text>
        <TextInput
          style={styles.modalTextarea}
          multiline
          numberOfLines={4}
          value={rejectionReason}
          onChangeText={setRejectionReason}
          placeholder="State reason for rejection..."
        />

        <TouchableOpacity
          style={styles.modalRejectBtn}
          onPress={handleConfirmReject}
          disabled={actionLoading}
        >
          <Text style={styles.modalRejectBtnText}>
            {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
          </Text>
        </TouchableOpacity>
      </Modal>
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
    width: 160,
    height: 140,
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
  propPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  propLoc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  ownerBadge: {
    backgroundColor: COLORS.backgroundSubtle,
    padding: 8,
    borderRadius: RADIUS.md,
    alignItems: 'flex-end',
  },
  ownerLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  ownerName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  ownerEmail: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  desc: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginVertical: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSubtle,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  approveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  modalTextarea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 10,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: COLORS.backgroundSubtle,
    textAlignVertical: 'top',
  },
  modalRejectBtn: {
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 16,
  },
  modalRejectBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
