import api from './api';
import { Property, PropertyFilterParams, PaginatedResponse } from '../types';

export const propertyService = {
  getProperties: async (params?: PropertyFilterParams): Promise<PaginatedResponse<Property>> => {
    const res = await api.get<PaginatedResponse<Property>>('/properties', { params });
    return res.data;
  },

  getPropertyById: async (id: number): Promise<Property> => {
    const res = await api.get<Property>(`/properties/${id}`);
    return res.data;
  },

  createProperty: async (data: Partial<Property> & { amenity_names?: string[]; image_urls?: string[] }): Promise<Property> => {
    const res = await api.post<Property>('/properties', data);
    return res.data;
  },

  updateProperty: async (id: number, data: Partial<Property> & { amenity_names?: string[]; image_urls?: string[] }): Promise<Property> => {
    const res = await api.patch<Property>(`/properties/${id}`, data);
    return res.data;
  },

  deleteProperty: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/properties/${id}`);
    return res.data;
  },

  uploadImage: async (file: File | Blob): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ url: string; filename: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
