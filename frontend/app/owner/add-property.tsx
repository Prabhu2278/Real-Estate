import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Sidebar } from '../../components/navigation/Sidebar';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { PROPERTY_TYPES, FURNISHING_OPTIONS } from '../../constants/config';
import { propertyService } from '../../services/property.service';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/format';

export default function AddPropertyScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login' as any);
    }
  }, [isAuthenticated, isLoading]);

  // Step: 1 | 2 | 3 | 4
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('Apartment');
  const [listingType, setListingType] = useState<'rent' | 'buy'>('rent');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [bedrooms, setBedrooms] = useState<string>('2');
  const [bathrooms, setBathrooms] = useState<string>('2');
  const [areaSqft, setAreaSqft] = useState<string>('1100');
  const [furnishingStatus, setFurnishingStatus] = useState<string>('Semi-furnished');
  const [floorNumber, setFloorNumber] = useState<string>('2');
  const [totalFloors, setTotalFloors] = useState<string>('6');

  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('Chennai');
  const [state, setState] = useState<string>('Tamil Nadu');
  const [postalCode, setPostalCode] = useState<string>('600042');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Parking',
    'Security',
    'Lift',
    'Power Backup',
  ]);

  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80',
  ]);

  const allAmenities = [
    'Parking',
    'Lift',
    'Security',
    'Gym',
    'Swimming Pool',
    'Power Backup',
    'Garden',
    'Wi-Fi',
    'Clubhouse',
    'Water Supply',
  ];

  const handleToggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setImages([...images, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!title.trim() || !price || !description.trim()) {
        setErrorMessage('Please fill in title, price, and description.');
        return;
      }
    } else if (currentStep === 2) {
      if (!areaSqft) {
        setErrorMessage('Please specify property area.');
        return;
      }
    } else if (currentStep === 3) {
      if (!address.trim() || !city.trim()) {
        setErrorMessage('Please provide property address and city.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      setErrorMessage('Please add at least one property photograph.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await propertyService.createProperty({
        title: title.trim(),
        description: description.trim(),
        property_type: propertyType as any,
        listing_type: listingType,
        price: Number(price),
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 1,
        area_sqft: Number(areaSqft),
        furnishing_status: furnishingStatus as any,
        floor_number: Number(floorNumber) || undefined,
        total_floors: Number(totalFloors) || undefined,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        amenity_names: selectedAmenities,
        image_urls: images,
      });

      Alert.alert(
        'Success',
        'Your property has been submitted! It is currently pending review and will be publicly active once approved by an administrator.',
        [
          {
            text: 'View My Properties',
            onPress: () => router.replace('/owner/properties' as any),
          },
        ]
      );
    } catch (err: any) {
      setErrorMessage(getApiErrorMessage(err, 'Failed to submit property.'));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Location' },
    { num: 4, label: 'Photos' },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="owner" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New Property</Text>
            <Text style={styles.subtitle}>
              List your residential or commercial property on RealEstate platform.
            </Text>
          </View>

          {/* Stepper Wizard Bar */}
          <View style={[styles.stepperWrap, isMobile && { padding: SPACING.sm }]}>
            {steps.map((st, i) => {
              const isPast = currentStep > st.num;
              const isCurrent = currentStep === st.num;
              return (
                <React.Fragment key={st.num}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        isCurrent && styles.stepCircleCurrent,
                        isPast && styles.stepCirclePast,
                      ]}
                    >
                      {isPast ? (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      ) : (
                        <Text
                          style={[
                            styles.stepNum,
                            isCurrent && styles.stepNumCurrent,
                            isPast && styles.stepNumPast,
                          ]}
                        >
                          {st.num}
                        </Text>
                      )}
                    </View>
                    {!isMobile && (
                      <Text
                        style={[
                          styles.stepLabel,
                          (isCurrent || isPast) && styles.stepLabelActive,
                        ]}
                      >
                        {st.label}
                      </Text>
                    )}
                  </View>
                  {i < steps.length - 1 && (
                    <View
                      style={[styles.stepLine, currentStep > st.num && styles.stepLinePast]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
          {isMobile && (
            <Text style={{ textAlign: 'center', fontSize: 13, fontWeight: '600', color: COLORS.primary, marginBottom: 16 }}>
              Step {currentStep} of 4: {steps[currentStep - 1].label}
            </Text>
          )}

          {/* Error Message */}
          {!!errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>
                {typeof errorMessage === 'string' ? errorMessage : getApiErrorMessage(errorMessage)}
              </Text>
            </View>
          )}

          {/* STEP 1: BASIC INFO */}
          {currentStep === 1 && (
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Basic Information</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Property Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Spacious 2 BHK Luxury Apartment"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Property Type</Text>
                <View style={styles.typeRow}>
                  {PROPERTY_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.chip, propertyType === t && styles.chipActive]}
                      onPress={() => setPropertyType(t)}
                    >
                      <Text style={[styles.chipText, propertyType === t && styles.chipTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Listing Type</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, listingType === 'rent' && styles.toggleBtnActive]}
                    onPress={() => setListingType('rent')}
                  >
                    <Text style={[styles.toggleBtnText, listingType === 'rent' && styles.toggleBtnTextActive]}>
                      For Rent
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, listingType === 'buy' && styles.toggleBtnActive]}
                    onPress={() => setListingType('buy')}
                  >
                    <Text style={[styles.toggleBtnText, listingType === 'buy' && styles.toggleBtnTextActive]}>
                      For Sale / Buy
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Price (INR ₹) * {listingType === 'rent' ? '/ month' : ''}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 18000"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your property, highlights, neighborhood perks..."
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>
          )}

          {/* STEP 2: PROPERTY DETAILS */}
          {currentStep === 2 && (
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Property Details & Dimensions</Text>

              <View style={styles.formGrid}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Bedrooms</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2"
                    keyboardType="numeric"
                    value={bedrooms}
                    onChangeText={setBedrooms}
                  />
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Bathrooms</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2"
                    keyboardType="numeric"
                    value={bathrooms}
                    onChangeText={setBathrooms}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Carpet Area (sq ft) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 1050"
                  keyboardType="numeric"
                  value={areaSqft}
                  onChangeText={setAreaSqft}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Furnishing Status</Text>
                <View style={styles.typeRow}>
                  {FURNISHING_OPTIONS.map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.chip, furnishingStatus === f && styles.chipActive]}
                      onPress={() => setFurnishingStatus(f)}
                    >
                      <Text style={[styles.chipText, furnishingStatus === f && styles.chipTextActive]}>
                        {f}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Floor Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 3"
                    keyboardType="numeric"
                    value={floorNumber}
                    onChangeText={setFloorNumber}
                  />
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Total Floors</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 8"
                    keyboardType="numeric"
                    value={totalFloors}
                    onChangeText={setTotalFloors}
                  />
                </View>
              </View>
            </View>
          )}

          {/* STEP 3: LOCATION & AMENITIES */}
          {currentStep === 3 && (
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Location Details</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Street Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 14 Gandhi Road, Velachery"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View style={styles.formGrid}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Chennai"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>State *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tamil Nadu"
                    value={state}
                    onChangeText={setState}
                  />
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="600042"
                    keyboardType="numeric"
                    value={postalCode}
                    onChangeText={setPostalCode}
                  />
                </View>
              </View>

              <Text style={[styles.sectionHeading, { marginTop: 20 }]}>Select Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {allAmenities.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <TouchableOpacity
                      key={amenity}
                      style={[styles.amenityBox, isChecked && styles.amenityBoxChecked]}
                      onPress={() => handleToggleAmenity(amenity)}
                    >
                      <Ionicons
                        name={isChecked ? 'checkbox' : 'square-outline'}
                        size={18}
                        color={isChecked ? COLORS.primary : COLORS.textMuted}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.amenityLabel, isChecked && styles.amenityLabelChecked]}>
                        {amenity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* STEP 4: PHOTOS & SUBMISSION */}
          {currentStep === 4 && (
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Property Photographs</Text>
              <Text style={styles.subtext}>
                Upload authentic, clear photos of the property. The first photo will be used as the primary display image.
              </Text>

              {/* Add Image URL Row */}
              <View style={styles.addImageRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Paste image URL (https://...)"
                  value={imageUrlInput}
                  onChangeText={setImageUrlInput}
                />
                <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
                  <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.addImageBtnText}>Add Photo</Text>
                </TouchableOpacity>
              </View>

              {/* Photos Preview Grid */}
              <View style={styles.photosGrid}>
                {images.map((url, idx) => (
                  <View key={idx} style={styles.photoItem}>
                    <Image source={{ uri: url }} style={styles.photoThumb} />
                    {idx === 0 && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => handleRemoveImage(idx)}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Footer Controls: Back & Next / Submit */}
          <View style={styles.footerControls}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.prevBtn} onPress={handlePrev}>
                <Ionicons name="arrow-back" size={16} color={COLORS.text} style={{ marginRight: 4 }} />
                <Text style={styles.prevBtnText}>Previous</Text>
              </TouchableOpacity>
            )}

            <View style={{ flex: 1 }} />

            {currentStep < 4 ? (
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextBtnText}>Next Step</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: COLORS.secondary }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.nextBtnText}>Submit Property for Review</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
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
    maxWidth: 900,
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
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSubtle,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCurrent: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepCirclePast: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  stepNumCurrent: {
    color: '#FFFFFF',
  },
  stepNumPast: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  stepLabelActive: {
    fontWeight: '700',
    color: COLORS.text,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  stepLinePast: {
    backgroundColor: COLORS.secondary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  subtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSubtle,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSubtle,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSubtle,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
    minWidth: 120,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSubtle,
    minWidth: 140,
  },
  amenityBoxChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  amenityLabel: {
    fontSize: 13,
    color: COLORS.text,
  },
  amenityLabelChecked: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  addImageRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
  },
  addImageBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    width: 130,
    height: 95,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  prevBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
