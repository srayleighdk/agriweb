import { apiClient } from './client';

export interface CreateContactDto {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export enum ContactStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  assignedTo?: number;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateContactDto {
  status?: ContactStatus;
  assignedTo?: number;
  response?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data: Contact;
}

export interface ContactListResponse {
  success: boolean;
  data: Contact[];
  total: number;
}

export const contactService = {
  create: async (data: CreateContactDto): Promise<ContactResponse> => {
    const response = await apiClient.post('/contact', data);
    return response.data;
  },

  // Admin methods
  getAll: async (): Promise<ContactListResponse> => {
    const response = await apiClient.get('/contact');
    return response.data;
  },

  getById: async (id: number): Promise<ContactResponse> => {
    const response = await apiClient.get(`/contact/${id}`);
    return response.data;
  },

  update: async (id: number, data: UpdateContactDto): Promise<ContactResponse> => {
    const response = await apiClient.put(`/contact/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/contact/${id}`);
    return response.data;
  },
};
