import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PropertyImage } from '../../types';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

interface PropertyGalleryProps {
  images: PropertyImage[];
  fallbackUrl?: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, fallbackUrl }) => {
  const defaultImage =
    images?.[0]?.image_url ||
    fallbackUrl ||
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80';

  const [activeImage, setActiveImage] = useState<string>(defaultImage);

  // If active image is not in list (e.g. initial render with empty then loaded images)
  const displayImage = images.some((img) => img.image_url === activeImage)
    ? activeImage
    : images?.[0]?.image_url || defaultImage;

  return (
    <View style={styles.container}>
      {/* Main Image */}
      <View style={styles.mainImageContainer}>
        <Image
          source={{ uri: displayImage }}
          style={styles.mainImage}
          resizeMode="cover"
        />
      </View>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsRow}
        >
          {images.map((img, idx) => {
            const isSelected = img.image_url === displayImage;
            return (
              <TouchableOpacity
                key={img.id || idx}
                style={[styles.thumbnailWrap, isSelected && styles.thumbnailWrapActive]}
                onPress={() => setActiveImage(img.image_url)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: img.image_url }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  mainImageContainer: {
    width: '100%',
    height: 380,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    ...SHADOWS.md,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingVertical: 4,
  },
  thumbnailWrap: {
    width: 80,
    height: 60,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailWrapActive: {
    borderColor: COLORS.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
