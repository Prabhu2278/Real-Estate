import api from './api';
import { Property, User } from '../types';

export interface AdminDashboardData {
  stats: {
    total_users: number;
    total_properties: number;
    pending_approvals: number;
    total_enquiries: number;
    total_visits: number;
  };
  recent_users: User[];
  pending_properties: Property[];
  recent_properties: Property[];
}

export const adminService = {
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const res = await api.get<AdminDashboardData>('/admin/dashboard');
    return res.data;
  },

  getAdminUsers: async (role?: string, search?: string): Promise<User[]> => {
    const res = await api.get<User[]>('/admin/users', { params: { role, search } });
    return res.data;
  },

  toggleUserActive: async (userId: number): Promise<User> => {
    const res = await api.patch<User>(`/admin/users/${userId}/toggle-active`);
    return res.data;
  },

  getPendingProperties: async (): Promise<Property[]> => {
    const res = await api.get<Property[]>('/admin/properties/pending');
    return res.data;
  },

  approveProperty: async (propertyId: number): Promise<Property> => {
    const res = await api.patch<Property>(`/admin/properties/${propertyId}/approve`);
    return res.data;
  },

  rejectProperty: async (propertyId: number, reason: string): Promise<Property> => {
    const res = await api.patch<Property>(`/admin/properties/${propertyId}/reject`, { reason });
    return res.data;
  },

  getAllAdminProperties: async (status?: string): Promise<Property[]> => {
    const res = await api.get<Property[]>('/admin/properties', { params: { status } });
    return res.data;
  },
};
