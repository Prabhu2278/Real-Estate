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
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatDate } from '../../utils/format';
import { visitService } from '../../services/visit.service';
import { useAuth } from '../../hooks/useAuth';
import { PropertyVisit } from '../../types';

export default function CustomerVisitsScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [visits, setVisits] = useState<PropertyVisit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
      const data = await visitService.getMyVisits();
      setVisits(data);
    } catch (e) {
      console.warn('Failed to load visits', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVisit = (visitId: number) => {
    Alert.alert(
      'Cancel Visit',
      'Are you sure you want to cancel this scheduled property visit?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await visitService.updateVisitStatus(visitId, 'cancelled');
              setVisits((prev) =>
                prev.map((v) => (v.id === visitId ? { ...v, status: 'cancelled' } : v))
              );
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.detail || 'Could not cancel visit');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.bodyRow}>
        {!isMobile && <Sidebar role="customer" />}

        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Scheduled Property Visits</Text>
            <Text style={styles.subtitle}>
              Manage and track your in-person property walkthroughs and inspections.
            </Text>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading your scheduled visits..." />
          ) : visits.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="No Scheduled Visits"
              description="You have not requested any property visits yet. Go to any property details page and tap 'Schedule Visit' to book an inspection."
              actionText="Browse Properties"
              onAction={() => router.push('/properties' as any)}
            />
          ) : (
            <View style={styles.list}>
              {visits.map((vst) => {
                const prop = vst.property;
                const propImage =
                  prop?.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00';

                return (
                  <View key={vst.id} style={styles.card}>
                    {/* Top Row: Date, Slot, Status */}
                    <View style={styles.cardHeader}>
                      <View style={styles.propRow}>
                        <Image source={{ uri: propImage }} style={styles.thumb} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.propTitle}>
                            {prop?.title || `Property ID #${vst.property_id}`}
                          </Text>
                          <Text style={styles.locText}>
                            {prop?.address}, {prop?.city}
                          </Text>
                        </View>
                      </View>
                      <StatusBadge status={vst.status} />
                    </View>

                    {/* Schedule Time Badge */}
                    <View style={styles.timeBadgeRow}>
                      <View style={styles.timePill}>
                        <Ionicons name="calendar" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.timePillText}>{formatDate(vst.requested_at)}</Text>
                      </View>

                      <View style={styles.timePill}>
                        <Ionicons name="time" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.timePillText}>{vst.time_slot}</Text>
                      </View>
                    </View>

                    {/* Customer Message */}
                    {vst.customer_message && (
                      <View style={styles.noteBox}>
                        <Text style={styles.noteLabel}>Your Note:</Text>
                        <Text style={styles.noteText}>{vst.customer_message}</Text>
                      </View>
                    )}

                    {/* Owner Response */}
                    {vst.owner_response && (
                      <View style={styles.responseBox}>
                        <Text style={styles.responseLabel}>Owner Response:</Text>
                        <Text style={styles.responseText}>{vst.owner_response}</Text>
                      </View>
                    )}

                    {/* Footer Actions */}
                    <View style={styles.cardFooter}>
                      {prop && (
                        <TouchableOpacity
                          style={styles.viewPropBtn}
                          onPress={() => router.push(`/properties/${prop.id}` as any)}
                        >
                          <Text style={styles.viewPropBtnText}>View Property</Text>
                          <Ionicons name="arrow-forward" size={12} color={COLORS.primary} style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      )}

                      {vst.status !== 'cancelled' && vst.status !== 'completed' && (
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => handleCancelVisit(vst.id)}
                        >
                          <Ionicons name="close-circle-outline" size={14} color={COLORS.danger} style={{ marginRight: 4 }} />
                          <Text style={styles.cancelBtnText}>Cancel Visit</Text>
                        </TouchableOpacity>
                      )}
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
    marginBottom: 12,
  },
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  thumb: {
    width: 60,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: '#F3F4F6',
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
  timeBadgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  timePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  noteBox: {
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: RADIUS.md,
    padding: 8,
    marginBottom: 8,
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  noteText: {
    fontSize: 13,
    color: COLORS.text,
  },
  responseBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  responseText: {
    fontSize: 13,
    color: '#047857',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
    marginTop: 4,
  },
  viewPropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewPropBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.danger,
  },
});
