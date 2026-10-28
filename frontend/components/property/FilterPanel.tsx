import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { PROPERTY_TYPES, FURNISHING_OPTIONS } from '../../constants/config';
import { PropertyFilterParams } from '../../types';

interface FilterPanelProps {
  filters: PropertyFilterParams;
  onChange: (filters: PropertyFilterParams) => void;
  onClear: () => void;
  onApply?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onClear,
  onApply,
}) => {
  const handleUpdate = (key: keyof PropertyFilterParams, value: any) => {
    onChange({
      ...filters,
      [key]: value,
      page: 1, // reset to page 1 on filter change
    });
  };

  const bedroomOptions = [
    { label: 'All', value: 0 },
    { label: '1 BHK', value: 1 },
    { label: '2 BHK', value: 2 },
    { label: '3 BHK', value: 3 },
    { label: '4+ BHK', value: 4 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="filter" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.title}>Filters</Text>
        </View>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Location / Search */}
        <View style={styles.section}>
          <Text style={styles.label}>Location / City</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={16} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Chennai, Velachery"
              placeholderTextColor={COLORS.textLight}
              value={filters.city || ''}
              onChangeText={(text) => handleUpdate('city', text)}
            />
          </View>
        </View>

        {/* Listing Type: Rent vs Buy */}
        <View style={styles.section}>
          <Text style={styles.label}>Listing Type</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                filters.listing_type === 'rent' && styles.toggleBtnActive,
              ]}
              onPress={() =>
                handleUpdate('listing_type', filters.listing_type === 'rent' ? undefined : 'rent')
              }
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  filters.listing_type === 'rent' && styles.toggleBtnTextActive,
                ]}
              >
                Rent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                (filters.listing_type === 'buy' || filters.listing_type === 'sale') && styles.toggleBtnActive,
              ]}
              onPress={() =>
                handleUpdate('listing_type', filters.listing_type === 'buy' ? undefined : 'buy')
              }
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  (filters.listing_type === 'buy' || filters.listing_type === 'sale') && styles.toggleBtnTextActive,
                ]}
              >
                Buy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Property Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Property Type</Text>
          {PROPERTY_TYPES.map((type) => {
            const isSelected = filters.property_type === type;
            return (
              <TouchableOpacity
                key={type}
                style={styles.checkboxRow}
                onPress={() => handleUpdate('property_type', isSelected ? undefined : type)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={[styles.checkboxLabel, isSelected && styles.checkboxLabelActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bedrooms */}
        <View style={styles.section}>
          <Text style={styles.label}>Bedrooms (BHK)</Text>
          <View style={styles.pillsRow}>
            {bedroomOptions.map((opt) => {
              const isSelected =
                (!filters.bedrooms && opt.value === 0) || filters.bedrooms === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.pill, isSelected && styles.pillActive]}
                  onPress={() => handleUpdate('bedrooms', opt.value === 0 ? undefined : opt.value)}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Furnishing Status */}
        <View style={styles.section}>
          <Text style={styles.label}>Furnishing Status</Text>
          {FURNISHING_OPTIONS.map((opt) => {
            const isSelected = filters.furnishing_status === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={styles.checkboxRow}
                onPress={() =>
                  handleUpdate('furnishing_status', isSelected ? undefined : opt)
                }
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={[styles.checkboxLabel, isSelected && styles.checkboxLabelActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.label}>Price Range (₹)</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="Min Price"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={filters.min_price ? String(filters.min_price) : ''}
              onChangeText={(text) => handleUpdate('min_price', text ? Number(text) : undefined)}
            />
            <Text style={{ color: COLORS.textMuted }}>–</Text>
            <TextInput
              style={[styles.input, styles.priceInput]}
              placeholder="Max Price"
              placeholderTextColor={COLORS.textLight}
              keyboardType="numeric"
              value={filters.max_price ? String(filters.max_price) : ''}
              onChangeText={(text) => handleUpdate('max_price', text ? Number(text) : undefined)}
            />
          </View>
        </View>

        {/* Apply Button */}
        {onApply && (
          <TouchableOpacity style={styles.applyBtn} onPress={onApply}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    marginBottom: SPACING.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scroll: {
    maxHeight: 700,
  },
  section: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSubtle,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.text,
    outlineStyle: 'none' as any,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  checkboxLabelActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundSubtle,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSubtle,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
