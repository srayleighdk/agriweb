import apiClient from './client';

export interface Livestock {
  id: number;
  farmlandId: number;
  livestockBreedId: number;
  name?: string;
  count: number;
  dateAcquired?: string;
  healthStatus?: string;
  purchasePrice?: number;
  currentValue?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  livestockBreed?: LivestockBreed;
}

export interface LivestockBreed {
  id: number;
  animalSpeciesId: number;
  breedName: string;
  vietnameseName: string;
  originCountry?: string;
  description?: string;
  characteristics?: string;
  averageWeight?: number;
  initialCostEstimate?: number;
  animalSpecies?: {
    id: number;
    speciesName: string;
    vietnameseName: string;
  };
}

export interface CreateLivestockDto {
  farmlandId: number;
  livestockBreedId: number;
  name?: string;
  count?: number;
  dateAcquired?: string;
  healthStatus?: string;
  purchasePrice?: number;
  currentValue?: number;
  notes?: string;
  isActive?: boolean;
}

export const livestockService = {
  // Get all livestock for authenticated farmer
  getLivestock: async (farmlandId?: number): Promise<Livestock[]> => {
    const params = farmlandId ? { farmlandId } : {};
    const response = await apiClient.get('/livestock', { params });
    return response.data;
  },

  // Get livestock by ID
  getLivestockById: async (id: number): Promise<Livestock> => {
    const response = await apiClient.get(`/livestock/${id}`);
    return response.data;
  },

  // Create new livestock
  createLivestock: async (data: CreateLivestockDto): Promise<Livestock> => {
    const response = await apiClient.post('/livestock', data);
    return response.data;
  },

  // Update livestock
  updateLivestock: async (id: number, data: Partial<CreateLivestockDto>): Promise<Livestock> => {
    const response = await apiClient.patch(`/livestock/${id}`, data);
    return response.data;
  },

  // Delete livestock
  deleteLivestock: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/livestock/${id}`);
    return response.data;
  },
};

export const livestockBreedsService = {
  // Get all livestock breeds
  getAll: async (): Promise<LivestockBreed[]> => {
    const response = await apiClient.get('/livestock-breeds');
    return response.data;
  },

  // Search livestock breeds
  search: async (query: string): Promise<LivestockBreed[]> => {
    const response = await apiClient.get('/livestock-breeds/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Get breeds by species
  getBySpecies: async (speciesId: number): Promise<LivestockBreed[]> => {
    const response = await apiClient.get(`/livestock-breeds/species/${speciesId}`);
    return response.data;
  },

  // Get breed by ID
  getById: async (id: number): Promise<LivestockBreed> => {
    const response = await apiClient.get(`/livestock-breeds/${id}`);
    return response.data;
  },
};
