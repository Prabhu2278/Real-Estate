import api from './api';
import { PropertyVisit } from '../types';

export interface ScheduleVisitParams {
  property_id: number;
  requested_at: string; // ISO date string
  time_slot: string;
  customer_message?: string;
}

export const visitService = {
  scheduleVisit: async (params: ScheduleVisitParams): Promise<PropertyVisit> => {
    const res = await api.post<PropertyVisit>('/visits', params);
    return res.data;
  },

  getMyVisits: async (): Promise<PropertyVisit[]> => {
    const res = await api.get<PropertyVisit[]>('/visits/my');
    return res.data;
  },

  getOwnerVisits: async (): Promise<PropertyVisit[]> => {
    const res = await api.get<PropertyVisit[]>('/visits/owner');
    return res.data;
  },

  updateVisitStatus: async (visitId: number, status: string, ownerResponse?: string): Promise<PropertyVisit> => {
    const res = await api.patch<PropertyVisit>(`/visits/${visitId}`, {
      status,
      owner_response: ownerResponse,
    });
    return res.data;
  },

  cancelVisit: async (visitId: number): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/visits/${visitId}`);
    return res.data;
  },
};
