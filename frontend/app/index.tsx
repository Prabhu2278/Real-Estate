import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  ImageBackground,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Navbar } from '../components/navigation/Navbar';
import { PropertyCard } from '../components/property/PropertyCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { propertyService } from '../services/property.service';
import { Property } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const scrollViewRef = useRef<any>(null);

  const [listingType, setListingType] = useState<'rent' | 'buy'>('rent');
  const [location, setLocation] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const res = await propertyService.getProperties({ page_size: 6 });
      setFeaturedProperties(res.items.slice(0, 3));
      setRecentProperties(res.items.slice(3, 6));
    } catch (e) {
      console.warn('Failed to load properties for home screen', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params: any = { listing_type: listingType };
    if (location.trim()) params.city = location.trim();
    if (propertyType.trim()) params.property_type = propertyType.trim();

    const queryStr = new URLSearchParams(params).toString();
    router.push(`/properties?${queryStr}` as any);
  };

  const categories = [
    { name: 'Apartment', icon: 'business-outline' as const, count: '120+ Listings' },
    { name: 'Villa', icon: 'home-outline' as const, count: '45+ Listings' },
    { name: 'House', icon: 'storefront-outline' as const, count: '80+ Listings' },
    { name: 'Commercial', icon: 'briefcase-outline' as const, count: '35+ Listings' },
    { name: 'Studio', icon: 'cube-outline' as const, count: '25+ Listings' },
  ];

  const popularLocations = [
    { name: 'Velachery', city: 'Chennai', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80', count: '42 Properties' },
    { name: 'ECR', city: 'Chennai', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop&q=80', count: '28 Properties' },
    { name: 'T. Nagar', city: 'Chennai', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80', count: '35 Properties' },
    { name: 'Anna Nagar', city: 'Chennai', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80', count: '19 Properties' },
  ];

  return (
    <View style={styles.screen}>
      <Navbar />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO SECTION */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80' }}
          style={styles.heroBackground}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Text style={[styles.heroTitle, isMobile && { fontSize: 26, lineHeight: 32 }]}>Find Your Dream Home</Text>
              <Text style={[styles.heroSubtitle, isMobile && { fontSize: 14, lineHeight: 20, marginBottom: 20 }]}>
                Discover the best properties for rent or sale in your favorite locations.
              </Text>

              {/* SEARCH BAR CARD */}
              <View style={styles.searchCard}>
                {/* Rent / Buy Tabs */}
                <View style={styles.tabRow}>
                  <TouchableOpacity
                    style={[styles.tabBtn, listingType === 'rent' && styles.tabBtnActive]}
                    onPress={() => setListingType('rent')}
                  >
                    <Text style={[styles.tabBtnText, listingType === 'rent' && styles.tabBtnTextActive]}>
                      Rent
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabBtn, listingType === 'buy' && styles.tabBtnActive]}
                    onPress={() => setListingType('buy')}
                  >
                    <Text style={[styles.tabBtnText, listingType === 'buy' && styles.tabBtnTextActive]}>
                      Buy
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Filter Inputs Row */}
                <View style={[styles.filterInputsRow, isMobile && styles.filterInputsRowMobile]}>
                  {/* Location */}
                  <View style={[styles.inputBox, isMobile && styles.inputBoxMobile]}>
                    <Text style={styles.inputLabel}>Location</Text>
                    <View style={styles.inputInner}>
                      <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="City or area (e.g. Chennai)"
                        placeholderTextColor={COLORS.textLight}
                        value={location}
                        onChangeText={setLocation}
                      />
                    </View>
                  </View>

                  {/* Property Type */}
                  <View style={[styles.inputBox, isMobile && styles.inputBoxMobile]}>
                    <Text style={styles.inputLabel}>Property Type</Text>
                    <View style={styles.inputInner}>
                      <Ionicons name="home-outline" size={16} color={COLORS.textMuted} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="All Types (Villa, Apt...)"
                        placeholderTextColor={COLORS.textLight}
                        value={propertyType}
                        onChangeText={setPropertyType}
                      />
                    </View>
                  </View>

                  {/* Search Button */}
                  <TouchableOpacity style={[styles.searchBtn, isMobile && styles.searchBtnMobile]} onPress={handleSearch}>
                    <Ionicons name="search" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.searchBtnText}>Search</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* MAIN BODY CONTAINER */}
        <View style={[styles.mainContainer, isMobile && { paddingHorizontal: SPACING.sm, paddingVertical: 24 }]}>
          {/* FEATURED PROPERTIES */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Featured Properties</Text>
              <Text style={styles.sectionSubtitle}>Handpicked premium verified listings</Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => router.push('/properties' as any)}
            >
              <Text style={styles.viewAllText}>View all</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <LoadingSpinner message="Loading properties..." />
          ) : (
            <View style={styles.grid}>
              {featuredProperties.map((prop) => (
                <View key={prop.id} style={[styles.gridCol, isMobile ? styles.gridCol12 : isTablet ? styles.gridCol6 : styles.gridCol4]}>
                  <PropertyCard property={prop} />
                </View>
              ))}
            </View>
          )}

          {/* POPULAR LOCATIONS */}
          <View style={[styles.sectionHeader, { marginTop: 40 }]}>
            <View>
              <Text style={styles.sectionTitle}>Popular Locations</Text>
              <Text style={styles.sectionSubtitle}>Explore neighborhoods in high demand</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {popularLocations.map((loc) => (
              <TouchableOpacity
                key={loc.name}
                style={[styles.gridCol, isMobile ? styles.gridCol12 : isTablet ? styles.gridCol6 : styles.gridCol3]}
                onPress={() => router.push(`/properties?city=${loc.city}&search=${loc.name}` as any)}
                activeOpacity={0.88}
              >
                <ImageBackground source={{ uri: loc.image }} style={styles.locCard} imageStyle={{ borderRadius: RADIUS.lg }}>
                  <View style={styles.locOverlay}>
                    <Text style={styles.locName}>{loc.name}</Text>
                    <Text style={styles.locCount}>{loc.count}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>

          {/* PROPERTY CATEGORIES */}
          <View style={[styles.sectionHeader, { marginTop: 40 }]}>
            <View>
              <Text style={styles.sectionTitle}>Explore by Property Type</Text>
              <Text style={styles.sectionSubtitle}>Find the exact style of home you desire</Text>
            </View>
          </View>

          <View style={styles.categoriesRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                style={[styles.categoryCard, isMobile && { minWidth: 100, padding: SPACING.sm }]}
                onPress={() => router.push(`/properties?property_type=${cat.name}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIconWrap}>
                  <Ionicons name={cat.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* RECENTLY ADDED */}
          {recentProperties.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: 40 }]}>
                <View>
                  <Text style={styles.sectionTitle}>Recently Added</Text>
                  <Text style={styles.sectionSubtitle}>Fresh listings added this week</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => router.push('/properties?sort_by=newest' as any)}
                >
                  <Text style={styles.viewAllText}>View all</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.grid}>
                {recentProperties.map((prop) => (
                  <View key={prop.id} style={[styles.gridCol, isMobile ? styles.gridCol12 : isTablet ? styles.gridCol6 : styles.gridCol4]}>
                    <PropertyCard property={prop} />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* WHY CHOOSE US / BENEFITS */}
          <View style={[styles.benefitsSection, isMobile && { padding: SPACING.md, marginTop: 32 }]}>
            <Text style={styles.benefitsTitle}>Why Choose RealEstate?</Text>
            <Text style={styles.benefitsSubtitle}>
              We connect renters, buyers, and property owners with full transparency and verified listings.
            </Text>

            <View style={[styles.benefitsGrid, isMobile && styles.benefitsGridMobile]}>
              <View style={styles.benefitCard}>
                <View style={[styles.benefitIconWrap, { backgroundColor: COLORS.primaryLight }]}>
                  <Ionicons name="shield-checkmark" size={26} color={COLORS.primary} />
                </View>
                <Text style={styles.benefitCardTitle}>100% Verified Listings</Text>
                <Text style={styles.benefitCardDesc}>
                  Every property is vetted by our administrators with authentic photos and verified ownership.
                </Text>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIconWrap, { backgroundColor: COLORS.secondaryLight }]}>
                  <Ionicons name="calendar" size={26} color={COLORS.secondary} />
                </View>
                <Text style={styles.benefitCardTitle}>Schedule In-Person Visits</Text>
                <Text style={styles.benefitCardDesc}>
                  Pick your preferred date and time slot. Property owners confirm visit requests directly.
                </Text>
              </View>

              <View style={styles.benefitCard}>
                <View style={[styles.benefitIconWrap, { backgroundColor: COLORS.accentLight }]}>
                  <Ionicons name="chatbubbles" size={26} color={COLORS.accent} />
                </View>
                <Text style={styles.benefitCardTitle}>Direct Communication</Text>
                <Text style={styles.benefitCardDesc}>
                  Enquire and chat directly with property owners without hidden middleman fees.
                </Text>
              </View>
            </View>
          </View>

          {/* CONTACT & OFFICE DETAILS SECTION */}
          <View style={[styles.aboutSection, isMobile && { padding: SPACING.md, marginTop: 32 }]}>
            {/* Header Badge & Title */}
            <View style={styles.aboutHeader}>
              <View style={styles.aboutBadge}>
                <Ionicons name="information-circle" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.aboutBadgeText}>CONTACT & SUPPORT</Text>
              </View>
              <Text style={styles.aboutTitle}>Get in Touch with RealEstate</Text>
              <Text style={styles.aboutSubtitle}>
                Have questions about listings, need assistance with property verification, or want to list your space? Reach out through any of our direct channels below.
              </Text>
            </View>

            {/* Platform Stats Row */}
            <View style={[styles.aboutStatsGrid, isMobile && styles.aboutStatsGridMobile]}>
              <View style={styles.aboutStatCard}>
                <View style={[styles.aboutStatIcon, { backgroundColor: COLORS.primaryLight }]}>
                  <Ionicons name="business" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.aboutStatValue}>1,200+</Text>
                <Text style={styles.aboutStatLabel}>Verified Listings</Text>
              </View>

              <View style={styles.aboutStatCard}>
                <View style={[styles.aboutStatIcon, { backgroundColor: COLORS.secondaryLight }]}>
                  <Ionicons name="people" size={22} color={COLORS.secondary} />
                </View>
                <Text style={styles.aboutStatValue}>5,000+</Text>
                <Text style={styles.aboutStatLabel}>Happy Families</Text>
              </View>

              <View style={styles.aboutStatCard}>
                <View style={[styles.aboutStatIcon, { backgroundColor: COLORS.accentLight }]}>
                  <Ionicons name="shield-checkmark" size={22} color={COLORS.accent} />
                </View>
                <Text style={styles.aboutStatValue}>99.2%</Text>
                <Text style={styles.aboutStatLabel}>Verified Accuracy</Text>
              </View>

              <View style={styles.aboutStatCard}>
                <View style={[styles.aboutStatIcon, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name="ribbon" size={22} color="#7C3AED" />
                </View>
                <Text style={styles.aboutStatValue}>10+ Years</Text>
                <Text style={styles.aboutStatLabel}>Market Excellence</Text>
              </View>
            </View>

            {/* About Pillars */}
            <View style={[styles.aboutPillarsRow, isMobile && styles.aboutPillarsRowMobile]}>
              <View style={styles.aboutPillarCard}>
                <Text style={styles.aboutPillarIcon}>🏛️</Text>
                <Text style={styles.aboutPillarTitle}>Verified Ownership</Text>
                <Text style={styles.aboutPillarDesc}>
                  Every property goes through administrator verification to confirm authentic ownership and honest pricing before going live.
                </Text>
              </View>

              <View style={styles.aboutPillarCard}>
                <Text style={styles.aboutPillarIcon}>🤝</Text>
                <Text style={styles.aboutPillarTitle}>Zero Middleman Fees</Text>
                <Text style={styles.aboutPillarDesc}>
                  Inquire and message property owners directly. No inflated broker commissions or surprise closing fees.
                </Text>
              </View>

              <View style={styles.aboutPillarCard}>
                <Text style={styles.aboutPillarIcon}>📅</Text>
                <Text style={styles.aboutPillarTitle}>Guaranteed Site Visits</Text>
                <Text style={styles.aboutPillarDesc}>
                  Book verified inspection slots online. Receive automatic confirmations and direct landlord contact numbers for visits.
                </Text>
              </View>
            </View>

            {/* Contact Details Section */}
            <View style={styles.contactContainer}>
              <View style={styles.contactSectionHeader}>
                <Text style={styles.contactTitle}>Get In Touch With Our Team</Text>
                <Text style={styles.contactSubtitle}>
                  Have questions, need assistance with property verification, or want to list your space? Reach out through any of our direct channels below.
                </Text>
              </View>

              <View style={[styles.contactCardsGrid, isMobile && styles.contactCardsGridMobile]}>
                {/* Office Address */}
                <View style={styles.contactCard}>
                  <View style={[styles.contactCardIconWrap, { backgroundColor: COLORS.primaryLight }]}>
                    <Ionicons name="location-outline" size={22} color={COLORS.primary} />
                  </View>
                  <Text style={styles.contactCardTitle}>Corporate Headquarters</Text>
                  <Text style={styles.contactCardValue}>No. 42, Anna Salai, Guindy</Text>
                  <Text style={styles.contactCardSub}>Chennai, Tamil Nadu 600032, India</Text>
                </View>

                {/* Direct Phone */}
                <TouchableOpacity
                  style={styles.contactCard}
                  onPress={() => Linking.openURL('tel:+919876543210')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.contactCardIconWrap, { backgroundColor: COLORS.secondaryLight }]}>
                    <Ionicons name="call-outline" size={22} color={COLORS.secondary} />
                  </View>
                  <Text style={styles.contactCardTitle}>Phone & WhatsApp</Text>
                  <Text style={[styles.contactCardValue, { color: COLORS.primary }]}>+91 98765 43210</Text>
                  <Text style={styles.contactCardSub}>Toll-Free: 1800 123 4567</Text>
                </TouchableOpacity>

                {/* Email Support */}
                <TouchableOpacity
                  style={styles.contactCard}
                  onPress={() => Linking.openURL('mailto:support@realestate.com')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.contactCardIconWrap, { backgroundColor: COLORS.accentLight }]}>
                    <Ionicons name="mail-outline" size={22} color={COLORS.accent} />
                  </View>
                  <Text style={styles.contactCardTitle}>Email Support</Text>
                  <Text style={[styles.contactCardValue, { color: COLORS.primary }]}>support@realestate.com</Text>
                  <Text style={styles.contactCardSub}>inquiries@realestate.com</Text>
                </TouchableOpacity>

                {/* Operating Hours */}
                <View style={styles.contactCard}>
                  <View style={[styles.contactCardIconWrap, { backgroundColor: '#EDE9FE' }]}>
                    <Ionicons name="time-outline" size={22} color="#7C3AED" />
                  </View>
                  <Text style={styles.contactCardTitle}>Office & Support Hours</Text>
                  <Text style={styles.contactCardValue}>Mon – Sat: 9:00 AM – 7:00 PM</Text>
                  <Text style={styles.contactCardSub}>Sunday: 10:00 AM – 4:00 PM</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={[styles.contactActionRow, isMobile && styles.contactActionRowMobile]}>
                <TouchableOpacity
                  style={styles.contactPrimaryBtn}
                  onPress={() => router.push('/properties' as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="search" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.contactPrimaryBtnText}>Explore Properties</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.contactSecondaryBtn}
                  onPress={() => Linking.openURL('tel:+919876543210')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="call" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.contactSecondaryBtnText}>Call Support Line</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerContainer}>
            <View style={styles.footerBrand}>
              <View style={styles.logoRow}>
                <View style={styles.logoIcon}>
                  <Ionicons name="home" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.footerLogoText}>RealEstate</Text>
              </View>
              <Text style={styles.footerDesc}>
                A modern real estate platform built with React Native (Web), Python (FastAPI), and PostgreSQL.
              </Text>
            </View>

            <View style={styles.footerLinksGroup}>
              <Text style={styles.footerHeading}>Quick Links</Text>
              <TouchableOpacity onPress={() => router.push('/' as any)}>
                <Text style={styles.footerLink}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/properties' as any)}>
                <Text style={styles.footerLink}>Browse Properties</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/properties?listing_type=rent' as any)}>
                <Text style={styles.footerLink}>Rent Properties</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/properties?listing_type=buy' as any)}>
                <Text style={styles.footerLink}>Buy Properties</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerLinksGroup}>
              <Text style={styles.footerHeading}>Account</Text>
              <TouchableOpacity onPress={() => router.push('/login' as any)}>
                <Text style={styles.footerLink}>Customer Login</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/register' as any)}>
                <Text style={styles.footerLink}>Register New Account</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/owner/add-property' as any)}>
                <Text style={styles.footerLink}>List Your Property</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <Text style={styles.copyrightText}>
              © 2026 RealEstate Platform. All rights reserved. Built with React Native & FastAPI.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroBackground: {
    width: '100%',
    minHeight: 460,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    paddingVertical: 50,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    maxWidth: 960,
    width: '100%',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 17,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
    lineHeight: 24,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    width: '100%',
    ...SHADOWS.lg,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSubtle,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  filterInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterInputsRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 8,
    backgroundColor: COLORS.backgroundSubtle,
  },
  inputBoxMobile: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
    outlineStyle: 'none' as any,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  searchBtnMobile: {
    width: '100%',
    marginTop: 6,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  mainContainer: {
    maxWidth: 1280,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: SPACING.md,
    paddingVertical: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridCol: {
    paddingHorizontal: 8,
  },
  gridCol12: {
    width: '100%',
  },
  gridCol6: {
    width: '50%',
  },
  gridCol4: {
    width: '33.333%',
  },
  gridCol3: {
    width: '25%',
  },
  locCard: {
    height: 180,
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  locOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  locName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  locCount: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  categoryCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  categoryIconWrap: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  benefitsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 50,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  benefitsTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  benefitsSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: 36,
  },
  benefitsGrid: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
  },
  benefitsGridMobile: {
    flexDirection: 'column',
  },
  benefitCard: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
    padding: SPACING.md,
  },
  benefitIconWrap: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  benefitCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  benefitCardDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#111827',
    paddingTop: 50,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  footerContainer: {
    maxWidth: 1280,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },
  footerBrand: {
    maxWidth: 360,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  footerLinksGroup: {
    gap: 10,
  },
  footerHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerLink: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footerBottom: {
    maxWidth: 1280,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 20,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  aboutSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 50,
    ...SHADOWS.sm,
  },
  aboutHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  aboutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    marginBottom: 12,
  },
  aboutBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.8,
  },
  aboutTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
    maxWidth: 750,
  },
  aboutSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 720,
  },
  aboutStatsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  aboutStatsGridMobile: {
    flexDirection: 'column',
  },
  aboutStatCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  aboutStatIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  aboutStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  aboutStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  aboutPillarsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  aboutPillarsRowMobile: {
    flexDirection: 'column',
  },
  aboutPillarCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: RADIUS.lg,
    padding: 20,
  },
  aboutPillarIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  aboutPillarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  aboutPillarDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  contactContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 36,
  },
  contactSectionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 620,
    lineHeight: 20,
  },
  contactCardsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  contactCardsGridMobile: {
    flexDirection: 'column',
  },
  contactCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 18,
    alignItems: 'center',
  },
  contactCardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  contactCardValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  contactCardSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  contactActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginTop: 8,
  },
  contactActionRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  contactPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.full,
  },
  contactPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contactSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.full,
  },
  contactSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
