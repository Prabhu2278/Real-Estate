import api from './api';
import { Favorite } from '../types';

export const favoritesService = {
  getFavorites: async (): Promise<Favorite[]> => {
    const res = await api.get<Favorite[]>('/favorites');
    return res.data;
  },

  addFavorite: async (propertyId: number): Promise<Favorite> => {
    const res = await api.post<Favorite>('/favorites', { property_id: propertyId });
    return res.data;
  },

  removeFavorite: async (propertyId: number): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/favorites/${propertyId}`);
    return res.data;
  },
};
