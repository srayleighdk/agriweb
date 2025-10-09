import { apiClient } from './client';

export interface ContactInformation {
  id: number;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  fax?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  workingHours?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateContactInformationDto {
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  fax?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  workingHours?: string;
  description?: string;
}

export const contactInformationService = {
  get: async (): Promise<ContactInformation> => {
    const response = await apiClient.get('/contact-information');
    return response.data;
  },

  update: async (data: UpdateContactInformationDto) => {
    const response = await apiClient.put('/contact-information', data);
    return response.data;
  },
};
