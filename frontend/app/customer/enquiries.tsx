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
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatDate } from '../../utils/format';
import { enquiryService } from '../../services/enquiry.service';
import { useAuth } from '../../hooks/useAuth';
import { Enquiry } from '../../types';

export default function CustomerEnquiriesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    if (isAuthenticated) {
      loadEnquiries();
    }
  }, [isAuthenticated, isLoading]);


  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const data = await enquiryService.getMyEnquiries();
      setEnquiries(data);
    } catch (e) {
      console.warn('Failed to load enquiries', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="customer" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Landlord Conversations</Text>
            <Text style={styles.subtitle}>
              Track direct messages and questions you have submitted to verified property landlords.
            </Text>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading your conversations..." />
          ) : enquiries.length === 0 ? (
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title="No Conversations Yet"
              description="You haven't contacted any landlords yet. Click 'Ask Landlord a Question' on any property details page to start a conversation."
              actionText="Browse Available Homes"
              onAction={() => router.push('/properties' as any)}
            />
          ) : (
            <View style={styles.list}>
              {enquiries.map((enq) => {
                const prop = enq.property;
                const propImage =
                  prop?.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00';

                return (
                  <View key={enq.id} style={styles.card}>
                    {/* Header Row */}
                    <View style={[styles.cardHeader, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
                      <View style={styles.propRow}>
                        <Image source={{ uri: propImage }} style={styles.thumb} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.propTitle}>
                            {prop?.title || `Property ID #${enq.property_id}`}
                          </Text>
                          <Text style={styles.dateText}>Sent on {formatDate(enq.created_at)}</Text>
                        </View>
                      </View>
                      <StatusBadge status={enq.status} />
                    </View>

                    {/* Customer Message */}
                    <View style={styles.messageBox}>
                      <Text style={styles.messageLabel}>Your Question:</Text>
                      <Text style={styles.messageText}>"{enq.message}"</Text>
                    </View>

                    {/* Owner Reply if available */}
                    {enq.owner_reply ? (
                      <View style={styles.replyBox}>
                        <View style={styles.replyHeader}>
                          <Ionicons name="chatbubbles" size={14} color={COLORS.secondary} style={{ marginRight: 6 }} />
                          <Text style={styles.replyLabel}>Landlord Response:</Text>
                        </View>
                        <Text style={styles.replyText}>{enq.owner_reply}</Text>
                      </View>
                    ) : (
                      <View style={styles.pendingReplyBox}>
                        <Ionicons name="time-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                        <Text style={styles.pendingReplyText}>Awaiting response from landlord</Text>
                      </View>
                    )}

                    {/* Action */}
                    {prop && (
                      <View style={styles.cardFooter}>
                        <TouchableOpacity
                          style={styles.viewPropBtn}
                          onPress={() => router.push(`/properties/${prop.id}` as any)}
                        >
                          <Text style={styles.viewPropBtnText}>View Home Details</Text>
                          <Ionicons name="arrow-forward" size={12} color={COLORS.primary} style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      </View>
                    )}
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
    maxWidth: 1300,
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
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  messageBox: {
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 10,
  },
  messageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  replyBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 10,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  replyText: {
    fontSize: 13,
    color: '#047857',
  },
  pendingReplyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  pendingReplyText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  viewPropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewPropBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
