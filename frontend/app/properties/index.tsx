import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Navbar } from '../../components/navigation/Navbar';
import { PropertyCard } from '../../components/property/PropertyCard';
import { FilterPanel } from '../../components/property/FilterPanel';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { propertyService } from '../../services/property.service';
import { Property, PropertyFilterParams } from '../../types';

export default function PropertyListingScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  const [filters, setFilters] = useState<PropertyFilterParams>({
    city: (searchParams.city as string) || undefined,
    listing_type: (searchParams.listing_type as string) || undefined,
    property_type: (searchParams.property_type as string) || undefined,
    search: (searchParams.search as string) || undefined,
    sort_by: 'newest',
    page: 1,
    page_size: 12,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await propertyService.getProperties(filters);
      setProperties(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (e) {
      console.warn('Failed to fetch properties', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      page_size: 12,
      sort_by: 'newest',
    });
  };

  return (
    <View style={styles.screen}>
      <Navbar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.container, isMobile && { paddingHorizontal: SPACING.sm, paddingTop: SPACING.md }]}>
          {/* Header Row */}
          <View style={[styles.pageHeader, isMobile && { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pageTitle, isMobile && { fontSize: 22 }]}>Properties for Rent & Sale</Text>
              <Text style={styles.pageSubtitle}>
                {loading ? 'Searching properties...' : `Showing ${total} properties available`}
              </Text>
            </View>

            {/* Mobile Filter Button */}
            {isMobile && (
              <TouchableOpacity
                style={styles.mobileFilterBtn}
                onPress={() => setMobileFilterOpen(true)}
              >
                <Ionicons name="filter" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.mobileFilterBtnText}>Filters</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Main Layout: Left Filter Sidebar + Right Results */}
          <View style={styles.layoutRow}>
            {/* Desktop Filter Panel */}
            {!isMobile && (
              <View style={styles.sidebarCol}>
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  onClear={handleClearFilters}
                />
              </View>
            )}

            {/* Results Column */}
            <View style={styles.resultsCol}>
              {/* Top Control Bar: Search Input, Sorting, Grid/List Toggle */}
              <View style={[styles.controlBar, isMobile && { padding: SPACING.sm, gap: 8 }]}>
                <View style={[styles.searchBar, isMobile && { width: '100%', minWidth: '100%' }]}>
                  <Ionicons name="search" size={16} color={COLORS.textMuted} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by area, title or landmark..."
                    placeholderTextColor={COLORS.textLight}
                    value={filters.search || ''}
                    onChangeText={(text) =>
                      setFilters((prev) => ({ ...prev, search: text || undefined, page: 1 }))
                    }
                  />
                  {filters.search ? (
                    <TouchableOpacity
                      onPress={() => setFilters((prev) => ({ ...prev, search: undefined, page: 1 }))}
                    >
                      <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Right controls: Sorting & View toggle */}
                <View style={[styles.rightControls, isMobile && { width: '100%', justifyContent: 'space-between' }]}>
                  <View style={styles.sortSelector}>
                    <Text style={styles.sortLabel}>Sort by:</Text>
                    <TouchableOpacity
                      style={styles.sortPill}
                      onPress={() => {
                        const nextSort =
                          filters.sort_by === 'newest'
                            ? 'price_asc'
                            : filters.sort_by === 'price_asc'
                            ? 'price_desc'
                            : 'newest';
                        setFilters((prev) => ({ ...prev, sort_by: nextSort }));
                      }}
                    >
                      <Text style={styles.sortPillText}>
                        {filters.sort_by === 'price_asc'
                          ? 'Price: Low to High'
                          : filters.sort_by === 'price_desc'
                          ? 'Price: High to Low'
                          : 'Newest'}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color={COLORS.text} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>

                  {/* Grid / List View Toggles */}
                  {!isMobile && (
                    <View style={styles.viewToggleGroup}>
                      <TouchableOpacity
                        style={[styles.viewToggleBtn, viewLayout === 'grid' && styles.viewToggleBtnActive]}
                        onPress={() => setViewLayout('grid')}
                      >
                        <Ionicons
                          name="grid-outline"
                          size={18}
                          color={viewLayout === 'grid' ? COLORS.primary : COLORS.textMuted}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.viewToggleBtn, viewLayout === 'list' && styles.viewToggleBtnActive]}
                        onPress={() => setViewLayout('list')}
                      >
                        <Ionicons
                          name="list-outline"
                          size={18}
                          color={viewLayout === 'list' ? COLORS.primary : COLORS.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Property Cards Content */}
              {loading ? (
                <LoadingSpinner message="Loading properties..." />
              ) : properties.length === 0 ? (
                <EmptyState
                  title="No Properties Found"
                  description="We couldn't find any properties matching your current search and filter criteria. Try adjusting or clearing your filters."
                  actionText="Clear All Filters"
                  onAction={handleClearFilters}
                />
              ) : (
                <View style={viewLayout === 'grid' ? styles.gridWrap : styles.listWrap}>
                  {properties.map((prop) => (
                    <View
                      key={prop.id}
                      style={
                        viewLayout === 'grid'
                          ? [styles.gridItem, isMobile ? styles.gridItemMobile : styles.gridItemDesktop]
                          : styles.listItem
                      }
                    >
                      <PropertyCard
                        property={prop}
                        layout={viewLayout}
                        onFavoriteChange={(id, isFav) => {
                          setProperties((prev) =>
                            prev.map((p) => (p.id === id ? { ...p, is_favorite: isFav } : p))
                          );
                        }}
                      />
                    </View>
                  ))}
                </View>
              )}

              {/* Pagination Row */}
              {totalPages > 1 && (
                <View style={styles.paginationRow}>
                  <TouchableOpacity
                    style={[styles.pageBtn, (filters.page || 1) <= 1 && styles.pageBtnDisabled]}
                    disabled={(filters.page || 1) <= 1}
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))
                    }
                  >
                    <Ionicons name="chevron-back" size={16} color={COLORS.text} />
                    <Text style={styles.pageBtnText}>Previous</Text>
                  </TouchableOpacity>

                  <Text style={styles.pageInfoText}>
                    Page {filters.page || 1} of {totalPages}
                  </Text>

                  <TouchableOpacity
                    style={[styles.pageBtn, (filters.page || 1) >= totalPages && styles.pageBtnDisabled]}
                    disabled={(filters.page || 1) >= totalPages}
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))
                    }
                  >
                    <Text style={styles.pageBtnText}>Next</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Mobile Filters Modal */}
      {isMobile && (
        <Modal
          visible={mobileFilterOpen}
          animationType="slide"
          onRequestClose={() => setMobileFilterOpen(false)}
        >
          <View style={styles.mobileModalContainer}>
            <View style={styles.mobileModalHeader}>
              <Text style={styles.mobileModalTitle}>Filter Properties</Text>
              <TouchableOpacity onPress={() => setMobileFilterOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.mobileModalBody}>
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onClear={handleClearFilters}
                onApply={() => setMobileFilterOpen(false)}
              />
            </ScrollView>
          </View>
        </Modal>
      )}
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
    paddingTop: SPACING.lg,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  mobileFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  mobileFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  layoutRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  sidebarCol: {
    width: 290,
  },
  resultsCol: {
    flex: 1,
  },
  controlBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  searchBar: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    outlineStyle: 'none' as any,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  viewToggleBtn: {
    padding: 6,
    backgroundColor: COLORS.backgroundSubtle,
  },
  viewToggleBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    paddingHorizontal: 8,
  },
  gridItemDesktop: {
    width: '50%',
  },
  gridItemMobile: {
    width: '100%',
  },
  listWrap: {
    gap: 12,
  },
  listItem: {
    width: '100%',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
    paddingVertical: 16,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  pageInfoText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  mobileModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
  },
  mobileModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mobileModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  mobileModalBody: {
    padding: SPACING.md,
  },
});
