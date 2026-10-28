import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  TextInput,
  Alert,
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
import { enquiryService } from '../../services/enquiry.service';
import { useAuth } from '../../hooks/useAuth';
import { Enquiry } from '../../types';

export default function OwnerEnquiriesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Reply Modal
  const [replyModalOpen, setReplyModalOpen] = useState<boolean>(false);
  const [activeEnquiry, setActiveEnquiry] = useState<Enquiry | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replying, setReplying] = useState<boolean>(false);

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
      const data = await enquiryService.getOwnerEnquiries();
      setEnquiries(data);
    } catch (e) {
      console.warn('Failed to load owner enquiries', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReply = (enquiry: Enquiry) => {
    setActiveEnquiry(enquiry);
    setReplyText(enquiry.owner_reply || '');
    setReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!activeEnquiry || !replyText.trim()) return;
    try {
      setReplying(true);
      const updated = await enquiryService.replyEnquiry(activeEnquiry.id, replyText.trim());
      setEnquiries((prev) =>
        prev.map((e) => (e.id === activeEnquiry.id ? updated : e))
      );
      setReplyModalOpen(false);
      Alert.alert('Success', 'Your reply has been sent to the customer.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="owner" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Property Enquiries Inbox</Text>
            <Text style={styles.subtitle}>
              Review inquiries from prospective tenants and buyers for your listings.
            </Text>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading customer enquiries..." />
          ) : enquiries.length === 0 ? (
            <EmptyState
              icon="mail-outline"
              title="No Inquiries Yet"
              description="You have not received any customer enquiries for your properties yet."
            />
          ) : (
            <View style={styles.list}>
              {enquiries.map((enq) => (
                <View key={enq.id} style={styles.card}>
                  <View style={[styles.cardHeader, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 8 }]}>
                    <View>
                      <Text style={styles.propTitle}>
                        Property: {enq.property?.title || `#${enq.property_id}`}
                      </Text>
                      <Text style={styles.senderText}>
                        From: {enq.user?.full_name} ({enq.user?.email}) · {formatDate(enq.created_at)}
                      </Text>
                    </View>
                    <StatusBadge status={enq.status} />
                  </View>

                  <View style={styles.messageBox}>
                    <Text style={styles.msgLabel}>Customer Message:</Text>
                    <Text style={styles.msgText}>"{enq.message}"</Text>
                  </View>

                  {enq.owner_reply && (
                    <View style={styles.replyBox}>
                      <Text style={styles.replyLabel}>Your Response:</Text>
                      <Text style={styles.replyText}>{enq.owner_reply}</Text>
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.replyBtn}
                      onPress={() => handleOpenReply(enq)}
                    >
                      <Ionicons name="arrow-undo-outline" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.replyBtnText}>
                        {enq.owner_reply ? 'Edit Reply' : 'Send Reply'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Reply Modal */}
      <Modal
        visible={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        title="Reply to Customer Enquiry"
      >
        <Text style={styles.modalSub}>
          Replying to {activeEnquiry?.user?.full_name} regarding "{activeEnquiry?.property?.title}"
        </Text>
        <TextInput
          style={styles.modalTextarea}
          multiline
          numberOfLines={4}
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Type your response here..."
        />
        <TouchableOpacity
          style={styles.modalSubmitBtn}
          onPress={handleSendReply}
          disabled={replying}
        >
          <Text style={styles.modalSubmitBtnText}>
            {replying ? 'Sending...' : 'Send Response'}
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
  senderText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  messageBox: {
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
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: '#047857',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
    marginTop: 4,
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
  },
  replyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 12,
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
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 16,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
