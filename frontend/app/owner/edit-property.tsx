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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Navbar } from '../../components/navigation/Navbar';
import { Sidebar } from '../../components/navigation/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { PROPERTY_TYPES, FURNISHING_OPTIONS } from '../../constants/config';
import { propertyService } from '../../services/property.service';
import { useAuth } from '../../hooks/useAuth';
import { Property } from '../../types';
import { getApiErrorMessage } from '../../utils/format';

export default function EditPropertyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const propertyId = Number(id);
  const { isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('Apartment');
  const [listingType, setListingType] = useState<'rent' | 'buy'>('rent');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('2');
  const [bathrooms, setBathrooms] = useState<string>('2');
  const [areaSqft, setAreaSqft] = useState<string>('1000');
  const [furnishingStatus, setFurnishingStatus] = useState<string>('Semi-furnished');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('Chennai');
  const [state, setState] = useState<string>('Tamil Nadu');
  const [postalCode, setPostalCode] = useState<string>('600042');
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('available');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    if (isAuthenticated && propertyId) {
      loadProperty();
    }
  }, [propertyId, isAuthenticated, isLoading]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const prop = await propertyService.getPropertyById(propertyId);
      setTitle(prop.title);
      setPropertyType(prop.property_type);
      setListingType(prop.listing_type as any);
      setPrice(String(prop.price));
      setDescription(prop.description);
      setBedrooms(String(prop.bedrooms));
      setBathrooms(String(prop.bathrooms));
      setAreaSqft(String(prop.area_sqft));
      setFurnishingStatus(prop.furnishing_status);
      setAddress(prop.address);
      setCity(prop.city);
      setState(prop.state);
      setPostalCode(prop.postal_code);
      setAvailabilityStatus(prop.availability_status);
      setImages(prop.images?.map((img) => img.image_url) || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load property details for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim() || !price || !description.trim()) {
      setErrorMessage('Please fill in title, price, and description.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      await propertyService.updateProperty(propertyId, {
        title: title.trim(),
        property_type: propertyType as any,
        listing_type: listingType,
        price: Number(price),
        description: description.trim(),
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 1,
        area_sqft: Number(areaSqft) || 500,
        furnishing_status: furnishingStatus as any,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        availability_status: availabilityStatus as any,
        image_urls: images,
      });

      Alert.alert('Success', 'Property changes saved successfully!', [
        { text: 'OK', onPress: () => router.push('/owner/properties' as any) },
      ]);
    } catch (err: any) {
      setErrorMessage(getApiErrorMessage(err, 'Failed to update property.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <Navbar />
        <LoadingSpinner message="Loading property..." />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="owner" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.header, isMobile && { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Edit Property</Text>
              <Text style={styles.subtitle}>Update pricing, specifications, and images.</Text>
            </View>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {!!errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>
                {typeof errorMessage === 'string' ? errorMessage : getApiErrorMessage(errorMessage)}
              </Text>
            </View>
          )}

          <View style={[styles.card, isMobile && { padding: SPACING.md }]}>
            <Text style={styles.sectionHeading}>Basic Information</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Property Title</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} />
            </View>

            <View style={styles.formGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Listing Type</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, listingType === 'rent' && styles.toggleBtnActive]}
                    onPress={() => setListingType('rent')}
                  >
                    <Text style={[styles.toggleBtnText, listingType === 'rent' && styles.toggleBtnTextActive]}>Rent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, listingType === 'buy' && styles.toggleBtnActive]}
                    onPress={() => setListingType('buy')}
                  >
                    <Text style={[styles.toggleBtnText, listingType === 'buy' && styles.toggleBtnTextActive]}>Buy</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.label}>Price (INR ₹)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Specifications</Text>
            <View style={styles.formGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Bedrooms</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={bedrooms} onChangeText={setBedrooms} />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Bathrooms</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={bathrooms} onChangeText={setBathrooms} />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Area (sq ft)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={areaSqft} onChangeText={setAreaSqft} />
              </View>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Furnishing Status</Text>
                <View style={styles.typeRow}>
                  {FURNISHING_OPTIONS.map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.chip, furnishingStatus === f && styles.chipActive]}
                      onPress={() => setFurnishingStatus(f)}
                    >
                      <Text style={[styles.chipText, furnishingStatus === f && styles.chipTextActive]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.label}>Availability Status</Text>
                <View style={styles.typeRow}>
                  {['available', 'rented', 'sold'].map((av) => (
                    <TouchableOpacity
                      key={av}
                      style={[styles.chip, availabilityStatus === av && styles.chipActive]}
                      onPress={() => setAvailabilityStatus(av)}
                    >
                      <Text style={[styles.chipText, availabilityStatus === av && styles.chipTextActive]}>
                        {av.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Location</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput style={styles.input} value={address} onChangeText={setAddress} />
            </View>
            <View style={styles.formGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>City</Text>
                <TextInput style={styles.input} value={city} onChangeText={setCity} />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>State</Text>
                <TextInput style={styles.input} value={state} onChangeText={setState} />
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Postal Code</Text>
                <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} />
              </View>
            </View>

            <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Photos</Text>
            <View style={styles.addImageRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Add image URL..."
                value={newImageUrl}
                onChangeText={setNewImageUrl}
              />
              <TouchableOpacity style={styles.addImageBtn} onPress={handleAddImage}>
                <Text style={styles.addImageBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.photosGrid}>
              {images.map((url, idx) => (
                <View key={idx} style={styles.photoItem}>
                  <Image source={{ uri: url }} style={styles.photoThumb} />
                  <TouchableOpacity style={styles.removePhotoBtn} onPress={() => handleRemoveImage(idx)}>
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
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
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 40,
    ...SHADOWS.sm,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 14,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  gridItem: {
    flex: 1,
    minWidth: 140,
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
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.backgroundSubtle,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
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
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addImageRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  addImageBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
  },
  addImageBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  photoItem: {
    width: 100,
    height: 75,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
