import apiClient from './client';
import { PaginatedResponse } from '@/types';

export interface Plant {
  id: number;
  vietnameseName: string;
  englishName: string | null;
  scientificName: string | null;
  cropType: 'ANNUAL' | 'PERENNIAL';
  category: string;
  family: string | null;
  expectedLifespan: number | null;
  averageYieldPerSeason: number | null;
  seasonsPerYear: number;
  growingPeriodDays: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlantData {
  vietnameseName: string;
  englishName?: string;
  scientificName?: string;
  cropType: 'ANNUAL' | 'PERENNIAL';
  category: string;
  family?: string;
  expectedLifespan?: number;
  averageYieldPerSeason?: number;
  seasonsPerYear?: number;
  growingPeriodDays?: number;
}

class PlantsService {
  async getPlants(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Plant>> {
    const response = await apiClient.get<PaginatedResponse<Plant>>('/plants', { params });
    return response.data;
  }

  async getPlantById(id: number): Promise<Plant> {
    const response = await apiClient.get<Plant>(`/plants/${id}`);
    return response.data;
  }

  async createPlant(data: CreatePlantData): Promise<Plant> {
    const response = await apiClient.post<Plant>('/plants', data);
    return response.data;
  }

  async updatePlant(id: number, data: Partial<CreatePlantData>): Promise<Plant> {
    const response = await apiClient.patch<Plant>(`/plants/${id}`, data);
    return response.data;
  }

  async deletePlant(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/plants/${id}`);
    return response.data;
  }
}

export const plantsService = new PlantsService();
