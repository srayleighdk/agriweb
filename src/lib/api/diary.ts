import apiClient from './client';

// ==================== CROP DIARY ====================

export interface CreateCropDiaryDto {
  cropId: number;
  title: string;
  description?: string;
  activityType: string;
  date: string;
  notes?: string;
  imageUrl?: string;
  quantityUsed?: number;
  unit?: string;
  cost?: number;
}

export interface UpdateCropDiaryDto {
  title?: string;
  description?: string;
  activityType?: string;
  date?: string;
  notes?: string;
  imageUrl?: string;
  quantityUsed?: number;
  unit?: string;
  cost?: number;
}

export interface CropDiaryEntry {
  id: number;
  cropId: number;
  title: string;
  description?: string;
  activityType: string;
  date: string;
  notes?: string;
  imageUrl?: string;
  quantityUsed?: number;
  unit?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
  crop?: {
    id: number;
    cropName?: string;
    cropVariety?: {
      id: number;
      name: string;
      vietnameseName: string;
    };
  };
}

export interface CropDiarySummary {
  totalEntries: number;
  activitiesByType: Array<{
    activityType: string;
    count: number;
  }>;
  recentActivities: number;
}

export const cropDiaryService = {
  getAll: async (cropId?: number): Promise<CropDiaryEntry[]> => {
    const url = cropId ? `/crop-diary?cropId=${cropId}` : '/crop-diary';
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: number): Promise<CropDiaryEntry> => {
    const response = await apiClient.get(`/crop-diary/${id}`);
    return response.data;
  },

  create: async (data: CreateCropDiaryDto): Promise<CropDiaryEntry> => {
    const response = await apiClient.post('/crop-diary', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCropDiaryDto): Promise<CropDiaryEntry> => {
    const response = await apiClient.patch(`/crop-diary/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/crop-diary/${id}`);
    return response.data;
  },

  getSummary: async (cropId?: number): Promise<CropDiarySummary> => {
    const url = cropId ? `/crop-diary/summary?cropId=${cropId}` : '/crop-diary/summary';
    const response = await apiClient.get(url);
    return response.data;
  },
};

// ==================== LIVESTOCK DIARY ====================

export interface CreateLivestockDiaryDto {
  livestockId: number;
  title: string;
  description?: string;
  activityType: string;
  date: string;
  notes?: string;
  imageUrl?: string;
  quantityUsed?: number;
  unit?: string;
  cost?: number;
  healthStatus?: string;
}

export interface UpdateLivestockDiaryDto {
  title?: string;
  description?: string;
  activityType?: string;
  date?: string;
  notes?: string;
  imageUrl?: string;
  quantityUsed?: number;
  unit?: string;
  cost?: number;
  healthStatus?: string;
}

export interface LivestockDiaryEntry {
  id: number;
  livestockId: number;
  title: string;
  description?: string;
  activityType: string;
  date: string;
  notes?: string;
  imageUrl?: string;
  quantityUsed?: number;
  unit?: string;
  cost?: number;
  healthStatus?: string;
  createdAt: string;
  updatedAt: string;
  livestock?: {
    id: number;
    name?: string;
    livestockBreed?: {
      id: number;
      breedName: string;
      vietnameseName: string;
    };
  };
}

export interface LivestockDiarySummary {
  totalEntries: number;
  activitiesByType: Array<{
    activityType: string;
    count: number;
  }>;
  healthStatusSummary: Array<{
    healthStatus: string;
    count: number;
  }>;
  recentActivities: number;
}

export const livestockDiaryService = {
  getAll: async (livestockId?: number): Promise<LivestockDiaryEntry[]> => {
    const url = livestockId ? `/livestock-diary?livestockId=${livestockId}` : '/livestock-diary';
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: number): Promise<LivestockDiaryEntry> => {
    const response = await apiClient.get(`/livestock-diary/${id}`);
    return response.data;
  },

  create: async (data: CreateLivestockDiaryDto): Promise<LivestockDiaryEntry> => {
    const response = await apiClient.post('/livestock-diary', data);
    return response.data;
  },

  update: async (id: number, data: UpdateLivestockDiaryDto): Promise<LivestockDiaryEntry> => {
    const response = await apiClient.patch(`/livestock-diary/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/livestock-diary/${id}`);
    return response.data;
  },

  getSummary: async (livestockId?: number): Promise<LivestockDiarySummary> => {
    const url = livestockId ? `/livestock-diary/summary?livestockId=${livestockId}` : '/livestock-diary/summary';
    const response = await apiClient.get(url);
    return response.data;
  },
};

// Activity type constants
export const CROP_ACTIVITY_TYPES = [
  { value: 'planting', label: 'Gieo trồng' },
  { value: 'watering', label: 'Tưới nước' },
  { value: 'fertilizing', label: 'Bón phân' },
  { value: 'pest_control', label: 'Phòng trừ sâu bệnh' },
  { value: 'weeding', label: 'Làm cỏ' },
  { value: 'pruning', label: 'Tỉa cành' },
  { value: 'harvesting', label: 'Thu hoạch' },
  { value: 'other', label: 'Khác' },
];

export const LIVESTOCK_ACTIVITY_TYPES = [
  { value: 'feeding', label: 'Cho ăn' },
  { value: 'health_check', label: 'Kiểm tra sức khỏe' },
  { value: 'vaccination', label: 'Tiêm phòng' },
  { value: 'treatment', label: 'Điều trị' },
  { value: 'breeding', label: 'Phối giống' },
  { value: 'milking', label: 'Vắt sữa' },
  { value: 'cleaning', label: 'Vệ sinh chuồng trại' },
  { value: 'weighing', label: 'Cân đo' },
  { value: 'other', label: 'Khác' },
];
