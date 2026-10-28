import api from './api';
import { Enquiry } from '../types';

export const enquiryService = {
  submitEnquiry: async (propertyId: number, message: string): Promise<Enquiry> => {
    const res = await api.post<Enquiry>('/enquiries', { property_id: propertyId, message });
    return res.data;
  },

  getMyEnquiries: async (): Promise<Enquiry[]> => {
    const res = await api.get<Enquiry[]>('/enquiries/my');
    return res.data;
  },

  getOwnerEnquiries: async (): Promise<Enquiry[]> => {
    const res = await api.get<Enquiry[]>('/enquiries/owner');
    return res.data;
  },

  replyEnquiry: async (enquiryId: number, reply: string, status: string = 'replied'): Promise<Enquiry> => {
    const res = await api.patch<Enquiry>(`/enquiries/${enquiryId}`, { reply, status });
    return res.data;
  },
};
