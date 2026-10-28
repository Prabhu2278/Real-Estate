import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Navbar } from '../../components/navigation/Navbar';
import { PropertyGallery } from '../../components/property/PropertyGallery';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatPrice, formatArea } from '../../utils/format';
import { propertyService } from '../../services/property.service';
import { favoritesService } from '../../services/favorites.service';
import { enquiryService } from '../../services/enquiry.service';
import { visitService } from '../../services/visit.service';
import { useAuth } from '../../hooks/useAuth';
import { Property } from '../../types';
import { VISIT_TIME_SLOTS } from '../../constants/config';

export default function PropertyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const propertyId = Number(id);
  const { user, isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Enquiry Modal
  const [enquiryModalOpen, setEnquiryModalOpen] = useState<boolean>(false);
  const [enquiryMessage, setEnquiryMessage] = useState<string>(
    "I'm interested in this property. Is it still available? Can we schedule a visit?"
  );
  const [enquirySubmitting, setEnquirySubmitting] = useState<boolean>(false);
  const [enquirySuccess, setEnquirySuccess] = useState<boolean>(false);

  // Visit Modal
  const [visitModalOpen, setVisitModalOpen] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');
  const [selectedDaysAhead, setSelectedDaysAhead] = useState<number>(2); // 2 days from now
  const [visitMessage, setVisitMessage] = useState<string>('');
  const [visitSubmitting, setVisitSubmitting] = useState<boolean>(false);
  const [visitSuccess, setVisitSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (propertyId) {
      loadPropertyDetail();
    }
  }, [propertyId]);

  const loadPropertyDetail = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getPropertyById(propertyId);
      setProperty(data);
      setIsFavorite(!!data.is_favorite);

      // Load similar
      const similar = await propertyService.getProperties({
        property_type: data.property_type,
        listing_type: data.listing_type,
        page_size: 3,
      });
      setSimilarProperties(similar.items.filter((p) => p.id !== propertyId));
    } catch (e) {
      console.warn('Failed to load property details', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login' as any);
      return;
    }
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      if (nextState) {
        await favoritesService.addFavorite(propertyId);
      } else {
        await favoritesService.removeFavorite(propertyId);
      }
    } catch {
      setIsFavorite(!nextState);
    }
  };

  const handleSendEnquiry = async () => {
    if (!isAuthenticated) {
      setEnquiryModalOpen(false);
      router.push('/login' as any);
      return;
    }
    if (!enquiryMessage.trim()) return;

    try {
      setEnquirySubmitting(true);
      await enquiryService.submitEnquiry(propertyId, enquiryMessage);
      setEnquirySuccess(true);
      setTimeout(() => {
        setEnquirySuccess(false);
        setEnquiryModalOpen(false);
      }, 1500);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to submit enquiry');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleScheduleVisit = async () => {
    if (!isAuthenticated) {
      setVisitModalOpen(false);
      router.push('/login' as any);
      return;
    }

    try {
      setVisitSubmitting(true);
      const visitDate = new Date();
      visitDate.setDate(visitDate.getDate() + selectedDaysAhead);
      
      await visitService.scheduleVisit({
        property_id: propertyId,
        requested_at: visitDate.toISOString(),
        time_slot: selectedSlot,
        customer_message: visitMessage,
      });

      setVisitSuccess(true);
      setTimeout(() => {
        setVisitSuccess(false);
        setVisitModalOpen(false);
      }, 1500);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to schedule visit');
    } finally {
      setVisitSubmitting(false);
    }
  };

  // Helper date choices for visit booking
  const dateOptions = [1, 2, 3, 4, 5, 7].map((days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return {
      days,
      label: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
    };
  });

  if (loading || !property) {
    return (
      <View style={styles.screen}>
        <Navbar />
        <LoadingSpinner message="Loading property information..." />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Navbar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.container, isMobile && { paddingHorizontal: SPACING.sm }]}>
          {/* Breadcrumb / Back Navigation */}
          <View style={styles.breadcrumbRow}>
            <TouchableOpacity onPress={() => router.push('/properties' as any)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
              <Text style={styles.breadcrumbLink}>Back to Properties</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbDivider}>/</Text>
            <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{property.title}</Text>
          </View>

          {/* Two-Column Layout */}
          <View style={[styles.layoutRow, isMobile && { flexDirection: 'column', gap: 16 }]}>
            {/* Left Column: Gallery & Details */}
            <View style={[styles.mainCol, isMobile && { width: '100%', minWidth: '100%' }]}>
              {/* Photo Gallery */}
              <PropertyGallery images={property.images} />

              {/* Title & Price Header */}
              <View style={[styles.detailHeaderCard, isMobile && { padding: SPACING.md }]}>
                <View style={styles.detailTitleRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.typeTag}>
                      <Text style={styles.typeTagText}>
                        {property.property_type} · {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                      </Text>
                    </View>
                    <Text style={[styles.title, isMobile && { fontSize: 20, lineHeight: 26 }]}>{property.title}</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                      <Text style={styles.locationText}>{property.address}, {property.city}, {property.state}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.favBtn} onPress={handleToggleFavorite}>
                    <Ionicons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={22}
                      color={isFavorite ? '#EF4444' : COLORS.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>
                    {formatPrice(Number(property.price), property.listing_type)}
                  </Text>
                </View>

                {/* Key Specs Bar */}
                <View style={styles.specsBar}>
                  {property.bedrooms > 0 && (
                    <View style={styles.specBox}>
                      <Ionicons name="bed-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.specBoxVal}>{property.bedrooms} Bedrooms</Text>
                    </View>
                  )}
                  {property.bathrooms > 0 && (
                    <View style={styles.specBox}>
                      <Ionicons name="water-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.specBoxVal}>{property.bathrooms} Bathrooms</Text>
                    </View>
                  )}
                  {property.area_sqft > 0 && (
                    <View style={styles.specBox}>
                      <Ionicons name="expand-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.specBoxVal}>{formatArea(Number(property.area_sqft))}</Text>
                    </View>
                  )}
                  <View style={styles.specBox}>
                    <Ionicons name="home-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.specBoxVal}>{property.furnishing_status}</Text>
                  </View>
                </View>
              </View>

              {/* Description Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.cardHeading}>Description</Text>
                <Text style={styles.descText}>{property.description}</Text>
              </View>

              {/* Amenities Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.cardHeading}>Amenities</Text>
                <View style={styles.amenitiesWrap}>
                  {property.amenities && property.amenities.length > 0 ? (
                    property.amenities.map((item) => (
                      <View key={item.id} style={styles.amenityPill}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.secondary} style={{ marginRight: 6 }} />
                        <Text style={styles.amenityText}>{item.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.descText}>Standard amenities included.</Text>
                  )}
                </View>
              </View>

              {/* Location Map Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.cardHeading}>Location</Text>
                <View style={styles.mapPlaceholder}>
                  <Ionicons name="map" size={48} color={COLORS.primary} style={{ opacity: 0.8 }} />
                  <Text style={styles.mapTitle}>{property.address}, {property.city}</Text>
                  <Text style={styles.mapSubtitle}>Latitude: {property.latitude || 12.9759}, Longitude: {property.longitude || 80.2212}</Text>
                  <TouchableOpacity
                    style={styles.mapActionBtn}
                    onPress={() => window?.open?.(`https://maps.google.com/?q=${encodeURIComponent(`${property.address}, ${property.city}`)}`, '_blank')}
                  >
                    <Ionicons name="open-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.mapActionText}>View on Google Maps</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Right Column: Contact Owner & Schedule */}
            <View style={[styles.sideCol, isMobile && { width: '100%' }]}>
              {/* Contact Owner Card */}
              <View style={styles.ownerCard}>
                <Text style={styles.cardHeading}>Landlord & Booking</Text>
                <View style={styles.ownerProfileRow}>
                  <View style={styles.ownerAvatar}>
                    <Text style={styles.ownerAvatarText}>
                      {property.owner?.full_name?.charAt(0) || 'R'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.ownerName}>{property.owner?.full_name || 'Rajneesh Kumar'}</Text>
                    <Text style={styles.ownerRole}>Verified Landlord / Owner</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.ownerButtonsRow}>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => Alert.alert('Contact Landlord', `Phone: ${property.owner?.phone || '+91 98765 43210'}`)}
                  >
                    <Ionicons name="call" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.callBtnText}>Call Landlord</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.messageBtn}
                    onPress={() => setEnquiryModalOpen(true)}
                  >
                    <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.text} style={{ marginRight: 6 }} />
                    <Text style={styles.messageBtnText}>Ask Question</Text>
                  </TouchableOpacity>
                </View>

                {/* Primary Schedule Visit Button */}
                <TouchableOpacity
                  style={styles.scheduleVisitBtn}
                  onPress={() => setVisitModalOpen(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.scheduleVisitBtnText}>Book In-Person Tour</Text>
                </TouchableOpacity>
              </View>

              {/* Similar Properties */}
              {similarProperties.length > 0 && (
                <View style={styles.similarCard}>
                  <Text style={styles.cardHeading}>Similar Properties</Text>
                  {similarProperties.map((sim) => (
                    <TouchableOpacity
                      key={sim.id}
                      style={styles.simItem}
                      onPress={() => router.push(`/properties/${sim.id}` as any)}
                    >
                      <Image
                        source={{ uri: sim.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00' }}
                        style={styles.simImage}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.simTitle} numberOfLines={1}>{sim.title}</Text>
                        <Text style={styles.simPrice}>{formatPrice(Number(sim.price), sim.listing_type)}</Text>
                        <Text style={styles.simLoc} numberOfLines={1}>{sim.city}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ENQUIRY MODAL */}
      <Modal
        visible={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        title="Ask Landlord a Question"
      >
        {enquirySuccess ? (
          <View style={styles.modalSuccessWrap}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.secondary} />
            <Text style={styles.modalSuccessTitle}>Question Sent!</Text>
            <Text style={styles.modalSuccessDesc}>
              The landlord has been notified and will reply shortly.
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.modalPropTitle}>{property.title}</Text>
            <Text style={styles.modalPropPrice}>{formatPrice(Number(property.price), property.listing_type)}</Text>
            <Text style={styles.modalLabel}>Your Question</Text>
            <TextInput
              style={styles.modalTextarea}
              multiline
              numberOfLines={4}
              value={enquiryMessage}
              onChangeText={setEnquiryMessage}
              placeholder="Ask about availability, terms, or maintenance charges..."
              placeholderTextColor={COLORS.textLight}
            />
            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleSendEnquiry}
              disabled={enquirySubmitting}
            >
              <Text style={styles.modalSubmitBtnText}>
                {enquirySubmitting ? 'Sending...' : 'Send to Landlord'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>

      {/* SCHEDULE VISIT MODAL */}
      <Modal
        visible={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        title="Book In-Person Home Tour"
      >
        {visitSuccess ? (
          <View style={styles.modalSuccessWrap}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.secondary} />
            <Text style={styles.modalSuccessTitle}>Tour Requested!</Text>
            <Text style={styles.modalSuccessDesc}>
              Your tour request for {selectedSlot} has been sent to the landlord for confirmation.
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.modalPropTitle}>{property.title}</Text>
            <Text style={styles.modalPropPrice}>{formatPrice(Number(property.price), property.listing_type)}</Text>

            {/* Select Date */}
            <Text style={styles.modalLabel}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dateOptions.map((opt) => {
                const isSelected = selectedDaysAhead === opt.days;
                return (
                  <TouchableOpacity
                    key={opt.days}
                    style={[styles.dateChip, isSelected && styles.dateChipActive]}
                    onPress={() => setSelectedDaysAhead(opt.days)}
                  >
                    <Text style={[styles.dateChipText, isSelected && styles.dateChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Select Time Slot */}
            <Text style={styles.modalLabel}>Select Time Slot</Text>
            <View style={styles.slotsGrid}>
              {VISIT_TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotChip, isSelected && styles.slotChipActive]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.slotChipText, isSelected && styles.slotChipTextActive]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Optional Note */}
            <Text style={styles.modalLabel}>Note to Owner (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={visitMessage}
              onChangeText={setVisitMessage}
              placeholder="e.g. Planning to visit with family"
              placeholderTextColor={COLORS.textLight}
            />

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleScheduleVisit}
              disabled={visitSubmitting}
            >
              <Text style={styles.modalSubmitBtnText}>
                {visitSubmitting ? 'Booking Tour...' : 'Confirm Tour Request'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    maxWidth: 1280,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  breadcrumbDivider: {
    color: COLORS.textMuted,
  },
  breadcrumbCurrent: {
    fontSize: 14,
    color: COLORS.textMuted,
    maxWidth: 240,
  },
  layoutRow: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  mainCol: {
    flex: 1,
    minWidth: 0,
  },
  sideCol: {
    width: 360,
  },
  detailHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  detailTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  typeTag: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  typeTagText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSubtle,
  },
  priceRow: {
    marginVertical: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  priceText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  specsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 6,
  },
  specBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specBoxVal: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  descText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  mapPlaceholder: {
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.md,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  mapTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
    textAlign: 'center',
  },
  mapSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  mapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  mapActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  ownerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  ownerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  ownerRole: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  ownerButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  callBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSubtle,
  },
  messageBtnText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  scheduleVisitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginTop: 4,
  },
  scheduleVisitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  similarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  simItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  simImage: {
    width: 68,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: '#F3F4F6',
  },
  simTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  simPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  simLoc: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  modalPropTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalPropPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 10,
  },
  modalTextarea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 10,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: COLORS.backgroundSubtle,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSubtle,
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalSuccessWrap: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalSuccessTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 4,
  },
  modalSuccessDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  dateScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSubtle,
    marginRight: 8,
  },
  dateChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  dateChipTextActive: {
    color: '#FFFFFF',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSubtle,
  },
  slotChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  slotChipTextActive: {
    color: '#FFFFFF',
  },
});
