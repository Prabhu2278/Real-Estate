import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '../../components/navigation/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatDate } from '../../utils/format';
import { visitService } from '../../services/visit.service';
import { useAuth } from '../../hooks/useAuth';
import { PropertyVisit } from '../../types';

export default function OwnerVisitsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [visits, setVisits] = useState<PropertyVisit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Status Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeVisit, setActiveVisit] = useState<PropertyVisit | null>(null);
  const [targetStatus, setTargetStatus] = useState<'confirmed' | 'rejected'>('confirmed');
  const [responseNote, setResponseNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    if (isAuthenticated) {
      loadVisits();
    }
  }, [isAuthenticated, isLoading]);


  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await visitService.getOwnerVisits();
      setVisits(data);
    } catch (e) {
      console.warn('Failed to load owner visits', e);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (visit: PropertyVisit, status: 'confirmed' | 'rejected') => {
    setActiveVisit(visit);
    setTargetStatus(status);
    setResponseNote(
      status === 'confirmed'
        ? 'Confirmed! I will meet you at the property at the scheduled time.'
        : 'Unfortunately this time slot is unavailable. Please pick an alternative date.'
    );
    setModalOpen(true);
  };

  const handleConfirmStatus = async () => {
    if (!activeVisit) return;
    try {
      setSubmitting(true);
      const updated = await visitService.updateVisitStatus(
        activeVisit.id,
        targetStatus,
        responseNote.trim()
      );
      setVisits((prev) =>
        prev.map((v) => (v.id === activeVisit.id ? updated : v))
      );
      setModalOpen(false);
      Alert.alert('Success', `Visit request has been ${targetStatus}.`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to update visit status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="owner" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Walkthrough & Inspection Bookings</Text>
            <Text style={styles.subtitle}>
              Review, confirm, and coordinate scheduled walkthroughs and inspections with prospective tenants.
            </Text>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading inspection bookings..." />
          ) : visits.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="No Inspection Bookings"
              description="No prospective renters or buyers have requested property walkthroughs yet."
            />
          ) : (
            <View style={styles.list}>
              {visits.map((vst) => (
                <View key={vst.id} style={styles.card}>
                  <View style={[styles.cardHeader, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
                    <View>
                      <Text style={styles.propTitle}>
                        {vst.property?.title || `Property ID #${vst.property_id}`}
                      </Text>
                      <Text style={styles.locText}>
                        Lead: {vst.user?.full_name} ({vst.user?.phone || vst.user?.email})
                      </Text>
                    </View>
                    <StatusBadge status={vst.status} />
                  </View>

                  <View style={styles.timePillsRow}>
                    <View style={styles.pill}>
                      <Ionicons name="calendar" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.pillText}>{formatDate(vst.requested_at)}</Text>
                    </View>

                    <View style={styles.pill}>
                      <Ionicons name="time" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.pillText}>{vst.time_slot}</Text>
                    </View>
                  </View>

                  {vst.customer_message && (
                    <View style={styles.msgBox}>
                      <Text style={styles.msgLabel}>Tenant Note:</Text>
                      <Text style={styles.msgText}>"{vst.customer_message}"</Text>
                    </View>
                  )}

                  {vst.owner_response && (
                    <View style={styles.replyBox}>
                      <Text style={styles.replyLabel}>Your Response:</Text>
                      <Text style={styles.replyText}>{vst.owner_response}</Text>
                    </View>
                  )}

                  {/* Action Buttons if Pending */}
                  {vst.status === 'pending' && (
                    <View style={[styles.actionsRow, isMobile && { flexWrap: 'wrap', gap: 8 }]}>
                      <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={() => openActionModal(vst, 'confirmed')}
                      >
                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.confirmBtnText}>Confirm Appointment</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => openActionModal(vst, 'rejected')}
                      >
                        <Ionicons name="close-circle" size={16} color={COLORS.danger} style={{ marginRight: 6 }} />
                        <Text style={styles.rejectBtnText}>Decline Request</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Action Modal */}
      <Modal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={targetStatus === 'confirmed' ? 'Confirm Walkthrough Tour' : 'Decline Tour Request'}
      >
        <Text style={styles.modalSub}>
          Tour requested by {activeVisit?.user?.full_name} for {activeVisit?.time_slot}.
        </Text>

        <Text style={styles.modalLabel}>Message to Renter / Buyer</Text>
        <TextInput
          style={styles.modalInput}
          multiline
          numberOfLines={3}
          value={responseNote}
          onChangeText={setResponseNote}
        />

        <TouchableOpacity
          style={[
            styles.modalActionBtn,
            targetStatus === 'confirmed' ? { backgroundColor: COLORS.secondary } : { backgroundColor: COLORS.danger },
          ]}
          onPress={handleConfirmStatus}
          disabled={submitting}
        >
          <Text style={styles.modalActionBtnText}>
            {submitting ? 'Updating...' : targetStatus === 'confirmed' ? 'Confirm Booking' : 'Decline Visit'}
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
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  propTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  locText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  timePillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  msgBox: {
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 8,
  },
  msgLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  msgText: {
    fontSize: 13,
    color: COLORS.text,
  },
  replyBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  replyText: {
    fontSize: 13,
    color: '#047857',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 10,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  rejectBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
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
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 10,
    fontSize: 14,
    backgroundColor: COLORS.backgroundSubtle,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActionBtn: {
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 16,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
