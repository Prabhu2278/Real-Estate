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
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { formatPrice } from '../../utils/format';
import { favoritesService } from '../../services/favorites.service';
import { useAuth } from '../../hooks/useAuth';
import { Favorite } from '../../types';

export default function CustomerFavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated, isLoading]);


  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoritesService.getFavorites();
      setFavorites(data);
    } catch (e) {
      console.warn('Failed to load favorites', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: number) => {
    // Optimistic UI update
    setFavorites((prev) => prev.filter((f) => f.property_id !== propertyId));
    try {
      await favoritesService.removeFavorite(propertyId);
    } catch {
      // Refresh on failure
      loadFavorites();
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.bodyRow, isMobile && { flexDirection: 'column' }]}>
        <Sidebar role="customer" />

        <ScrollView style={[styles.mainContent, isMobile && { padding: SPACING.sm }]} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>My Shortlisted Homes</Text>
              <Text style={styles.subtitle}>
                Homes you have bookmarked for comparison and booking walkthrough tours.
              </Text>
            </View>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading your shortlisted homes..." />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon="heart-outline"
              title="No Shortlisted Homes"
              description="You haven't bookmarked any homes yet. Tap the heart icon on any listing to save it here for easy review."
              actionText="Explore Homes"
              onAction={() => router.push('/properties' as any)}
            />
          ) : (
            <View style={styles.list}>
              {favorites.map((fav) => {
                const prop = fav.property;
                if (!prop) return null;
                const primaryImage =
                  prop.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00';

                return (
                  <View key={fav.id} style={[styles.itemCard, isMobile && { flexDirection: 'column' }]}>
                    <Image source={{ uri: primaryImage }} style={[styles.image, isMobile && { width: '100%', height: 160 }]} />

                    <View style={styles.infoCol}>
                      <View style={styles.titleRow}>
                        <Text style={styles.propTitle}>{prop.title}</Text>
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => handleRemoveFavorite(prop.id)}
                        >
                          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.price}>
                        {formatPrice(Number(prop.price), prop.listing_type)}
                      </Text>

                      <View style={styles.locRow}>
                        <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                        <Text style={styles.locText}>
                          {prop.address ? `${prop.address}, ` : ''}{prop.city}
                        </Text>
                      </View>

                      <View style={styles.specsRow}>
                        {prop.bedrooms > 0 && <Text style={styles.specBadge}>{prop.bedrooms} Bed</Text>}
                        {prop.bathrooms > 0 && <Text style={styles.specBadge}>{prop.bathrooms} Bath</Text>}
                        <Text style={styles.specBadge}>{prop.furnishing_status}</Text>
                      </View>

                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.detailsBtn}
                          onPress={() => router.push(`/properties/${prop.id}` as any)}
                        >
                          <Text style={styles.detailsBtnText}>View Details</Text>
                          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      </View>
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
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 16,
    ...SHADOWS.sm,
  },
  image: {
    width: 140,
    height: 110,
    borderRadius: RADIUS.md,
    backgroundColor: '#F3F4F6',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  removeBtn: {
    padding: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  specBadge: {
    fontSize: 11,
    color: COLORS.textMuted,
    backgroundColor: COLORS.backgroundSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
