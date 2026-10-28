import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../../types';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatPrice, formatArea } from '../../utils/format';
import { favoritesService } from '../../services/favorites.service';
import { useAuth } from '../../hooks/useAuth';

interface PropertyCardProps {
  property: Property;
  onFavoriteChange?: (propertyId: number, isFav: boolean) => void;
  layout?: 'grid' | 'list';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavoriteChange,
  layout = 'grid',
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const isNarrow = width < 640;
  const [isFavorite, setIsFavorite] = useState<boolean>(!!property.is_favorite);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const primaryImage =
    property.images?.find((img) => img.is_primary)?.image_url ||
    property.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80';

  const handleToggleFavorite = async (e?: any) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login' as any);
      return;
    }

    const nextState = !isFavorite;
    setIsFavorite(nextState);

    try {
      if (nextState) {
        await favoritesService.addFavorite(property.id);
      } else {
        await favoritesService.removeFavorite(property.id);
      }
      onFavoriteChange?.(property.id, nextState);
    } catch {
      // Revert on failure
      setIsFavorite(!nextState);
    }
  };

  // On narrow/mobile screens, list layout automatically falls back to vertical column
  const isList = layout === 'list' && !isNarrow;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isList && styles.cardList,
        isHovered && styles.cardHover,
      ]}
      activeOpacity={0.92}
      onPress={() => router.push(`/properties/${property.id}` as any)}
      // @ts-ignore Web hover props
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, isList && styles.imageContainerList]}>
        <Image
          source={{ uri: primaryImage }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Listing Type Tag */}
        <View style={[styles.tag, property.listing_type === 'rent' ? styles.tagRent : styles.tagSale]}>
          <Text style={styles.tagText}>
            {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
          </Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favBtn}
          onPress={handleToggleFavorite}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* Content Container */}
      <View style={[styles.content, isList && styles.contentList]}>
        {/* Title & Price */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {property.title}
          </Text>
        </View>

        <Text style={styles.price}>
          {formatPrice(Number(property.price), property.listing_type)}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
          <Text style={styles.locationText} numberOfLines={1}>
            {property.city ? `${property.address ? property.address + ', ' : ''}${property.city}` : property.address}
          </Text>
        </View>

        {/* Specs Row */}
        <View style={styles.specsRow}>
          {property.bedrooms > 0 && (
            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.specText}>{property.bedrooms} Bed</Text>
            </View>
          )}

          {property.bathrooms > 0 && (
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.specText}>{property.bathrooms} Bath</Text>
            </View>
          )}

          {property.area_sqft > 0 && (
            <View style={styles.specItem}>
              <Ionicons name="expand-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.specText}>{formatArea(Number(property.area_sqft))}</Text>
            </View>
          )}

          {property.furnishing_status && (
            <View style={styles.furnishingBadge}>
              <Text style={styles.furnishingText}>{property.furnishing_status}</Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => router.push(`/properties/${property.id}` as any)}
          >
            <Text style={styles.detailsBtnText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
    transition: 'all 0.2s ease',
  } as any,
  cardHover: {
    borderColor: '#93C5FD',
    ...SHADOWS.md,
    transform: [{ translateY: -3 }],
  } as any,
  cardList: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  imageContainerList: {
    width: 240,
    height: '100%',
    minHeight: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    ...SHADOWS.sm,
  },
  tagRent: {
    backgroundColor: COLORS.primary,
  },
  tagSale: {
    backgroundColor: COLORS.secondary,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  favBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  contentList: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginBottom: 6,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  furnishingBadge: {
    backgroundColor: COLORS.backgroundSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  furnishingText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
