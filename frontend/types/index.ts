export type UserRole = 'customer' | 'owner' | 'admin';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string | null;
}

export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface OwnerSummary {
  id: number;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

export interface Property {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  property_type: 'Apartment' | 'House' | 'Villa' | 'Studio' | 'Commercial' | 'Office Space';
  listing_type: 'rent' | 'buy' | 'sale';
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  furnishing_status: 'Furnished' | 'Semi-furnished' | 'Unfurnished';
  floor_number?: number | null;
  total_floors?: number | null;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number | null;
  longitude?: number | null;
  status: 'pending' | 'active' | 'rejected' | 'inactive';
  availability_status: 'available' | 'rented' | 'sold';
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  images: PropertyImage[];
  amenities: Amenity[];
  owner?: OwnerSummary | null;
  is_favorite?: boolean;
}

export interface PropertyFilterParams {
  search?: string;
  city?: string;
  listing_type?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing_status?: string;
  status?: string;
  sort_by?: 'newest' | 'price_asc' | 'price_desc' | 'bedrooms_desc' | 'oldest';
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Favorite {
  id: number;
  user_id: number;
  property_id: number;
  created_at: string;
  property?: Property;
}

export interface Enquiry {
  id: number;
  user_id: number;
  property_id: number;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  owner_reply?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  property?: Property;
}

export interface PropertyVisit {
  id: number;
  user_id: number;
  property_id: number;
  requested_at: string;
  time_slot: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  customer_message?: string | null;
  owner_response?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  property?: Property;
}

export interface DashboardStats {
  total_users?: number;
  total_properties?: number;
  active_listings?: number;
  pending_approvals?: number;
  total_enquiries?: number;
  upcoming_visits?: number;
  saved_properties?: number;
}
