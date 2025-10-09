import apiClient from './client';

export interface Crop {
  id: number;
  farmlandId: number;
  cropVarietyId: number;
  cropName?: string;
  areaPlanted?: number;
  plantedDate?: string;
  expectedHarvest?: string;
  healthStatus?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cropVariety?: CropVariety;
}

export interface CropVariety {
  id: number;
  plantId: number;
  name: string;
  vietnameseName: string;
  description?: string;
  characteristics?: string;
  plant?: {
    id: number;
    name: string;
    vietnameseName: string;
  };
}

export interface CreateCropDto {
  farmlandId: number;
  cropVarietyId: number;
  cropName?: string;
  areaPlanted?: number;
  plantedDate?: string;
  expectedHarvest?: string;
  healthStatus?: string;
  notes?: string;
  isActive?: boolean;
}

export const cropsService = {
  // Get all crops for authenticated farmer
  getCrops: async (farmlandId?: number): Promise<Crop[]> => {
    const params = farmlandId ? { farmlandId } : {};
    const response = await apiClient.get('/crops', { params });
    return response.data;
  },

  // Get crop by ID
  getCropById: async (id: number): Promise<Crop> => {
    const response = await apiClient.get(`/crops/${id}`);
    return response.data;
  },

  // Create new crop
  createCrop: async (data: CreateCropDto): Promise<Crop> => {
    const response = await apiClient.post('/crops', data);
    return response.data;
  },

  // Update crop
  updateCrop: async (id: number, data: Partial<CreateCropDto>): Promise<Crop> => {
    const response = await apiClient.patch(`/crops/${id}`, data);
    return response.data;
  },

  // Delete crop
  deleteCrop: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/crops/${id}`);
    return response.data;
  },
};

export const cropVarietiesService = {
  // Get all crop varieties
  getAll: async (): Promise<CropVariety[]> => {
    const response = await apiClient.get('/crop-varieties');
    return response.data;
  },

  // Search crop varieties
  search: async (query: string): Promise<CropVariety[]> => {
    const response = await apiClient.get('/crop-varieties/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Get varieties by plant
  getByPlant: async (plantId: number): Promise<CropVariety[]> => {
    const response = await apiClient.get(`/crop-varieties/plant/${plantId}`);
    return response.data;
  },

  // Get variety by ID
  getById: async (id: number): Promise<CropVariety> => {
    const response = await apiClient.get(`/crop-varieties/${id}`);
    return response.data;
  },
};
