import apiClient from './client';
import { PaginatedResponse } from '@/types';

export interface Farmland {
  id: number;
  farmerId: number;
  name: string;
  size: number;
  soilType: string | null;
  address: string | null;
  province: string | null;
  commune: string | null;
  farmlandType: 'CROP' | 'LIVESTOCK' | 'MIX';
  irrigationAccess: boolean;
  electricityAccess: boolean;
  landUseCertificateNo: string | null;
  createdAt: string;
  updatedAt: string;
  crops?: any[];
  livestock?: any[];
}

export interface CreateFarmlandData {
  name: string;
  size: number;
  soilType?: string;
  address?: string;
  province?: string;
  commune?: string;
  farmlandType: 'CROP' | 'LIVESTOCK' | 'MIX';
  irrigationAccess?: boolean;
  electricityAccess?: boolean;
  landUseCertificateNo?: string;
}

class FarmlandsService {
  async getFarmlands(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Farmland>> {
    const response = await apiClient.get<PaginatedResponse<Farmland>>('/farmlands', { params });
    return response.data;
  }

  async getFarmlandById(id: number): Promise<Farmland> {
    const response = await apiClient.get<Farmland>(`/farmlands/${id}`);
    return response.data;
  }

  async createFarmland(data: CreateFarmlandData): Promise<Farmland> {
    const response = await apiClient.post<Farmland>('/farmlands', data);
    return response.data;
  }

  async updateFarmland(id: number, data: Partial<CreateFarmlandData>): Promise<Farmland> {
    const response = await apiClient.patch<Farmland>(`/farmlands/${id}`, data);
    return response.data;
  }

  async deleteFarmland(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/farmlands/${id}`);
    return response.data;
  }
}

export const farmlandsService = new FarmlandsService();
