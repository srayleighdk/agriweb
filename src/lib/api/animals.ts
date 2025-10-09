import apiClient from './client';
import { PaginatedResponse } from '@/types';

export interface AnimalSpecies {
  id: number;
  vietnameseName: string;
  englishName: string | null;
  scientificName: string | null;
  category: string;
  subcategory: string | null;
  averageLifespan: number | null;
  maturityAge: number | null;
  averageAdultWeight: number | null;
  primaryPurpose: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnimalData {
  vietnameseName: string;
  englishName?: string;
  scientificName?: string;
  category: string;
  subcategory?: string;
  averageLifespan?: number;
  maturityAge?: number;
  averageAdultWeight?: number;
  primaryPurpose?: string[];
}

class AnimalsService {
  async getAnimals(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<AnimalSpecies>> {
    const response = await apiClient.get<PaginatedResponse<AnimalSpecies>>('/animal-species', { params });
    return response.data;
  }

  async getAnimalById(id: number): Promise<AnimalSpecies> {
    const response = await apiClient.get<AnimalSpecies>(`/animal-species/${id}`);
    return response.data;
  }

  async createAnimal(data: CreateAnimalData): Promise<AnimalSpecies> {
    const response = await apiClient.post<AnimalSpecies>('/animal-species', data);
    return response.data;
  }

  async updateAnimal(id: number, data: Partial<CreateAnimalData>): Promise<AnimalSpecies> {
    const response = await apiClient.patch<AnimalSpecies>(`/animal-species/${id}`, data);
    return response.data;
  }

  async deleteAnimal(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/animal-species/${id}`);
    return response.data;
  }
}

export const animalsService = new AnimalsService();
