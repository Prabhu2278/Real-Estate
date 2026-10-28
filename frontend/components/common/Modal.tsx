import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal as RNModal,
  TouchableWithoutFeedback,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: number;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  maxWidth = 520,
}) => {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, isMobile && styles.overlayMobile]}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { maxWidth: Math.min(maxWidth, width * 0.94) }]}>
              {/* Header */}
              <View style={[styles.header, isMobile && styles.headerMobile]}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Scrollable Body to prevent viewport overflow */}
              <ScrollView
                style={[styles.scrollBody, { maxHeight: height * 0.78 }]}
                contentContainerStyle={[styles.body, isMobile && styles.bodyMobile]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  overlayMobile: {
    padding: SPACING.xs,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerMobile: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    width: '100%',
  },
  body: {
    padding: SPACING.lg,
  },
  bodyMobile: {
    padding: SPACING.md,
  },
});
