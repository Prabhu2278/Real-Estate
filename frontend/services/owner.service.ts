import api from './api';
import { Property, Enquiry, PropertyVisit } from '../types';

export interface OwnerDashboardData {
  stats: {
    total_properties: number;
    active_listings: number;
    pending_approvals: number;
    total_enquiries: number;
    upcoming_visits: number;
  };
  recent_properties: Property[];
  recent_enquiries: Enquiry[];
  upcoming_visits: PropertyVisit[];
}

export const ownerService = {
  getOwnerDashboard: async (): Promise<OwnerDashboardData> => {
    const res = await api.get<OwnerDashboardData>('/owner/dashboard');
    return res.data;
  },

  getOwnerProperties: async (status?: string): Promise<Property[]> => {
    const res = await api.get<Property[]>('/owner/properties', { params: { status } });
    return res.data;
  },
};
