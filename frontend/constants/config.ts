import { Platform } from 'react-native';

const getBaseApiUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // If running on web in browser
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:8000/api`;
  }
  return 'http://127.0.0.1:8000/api';
};

export const API_URL = getBaseApiUrl();

export const DEFAULT_PAGE_SIZE = 12;

export const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Villa',
  'Studio',
  'Commercial',
  'Office Space',
] as const;

export const FURNISHING_OPTIONS = [
  'Furnished',
  'Semi-furnished',
  'Unfurnished',
] as const;

export const BEDROOM_OPTIONS = [
  { label: 'All BHK', value: 0 },
  { label: '1 BHK', value: 1 },
  { label: '2 BHK', value: 2 },
  { label: '3 BHK', value: 3 },
  { label: '4+ BHK', value: 4 },
];

export const VISIT_TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
];
