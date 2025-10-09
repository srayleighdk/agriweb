import apiClient from './client';

export interface CropDiary {
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
    name: string;
    farmland?: {
      id: number;
      name: string;
    };
  };
}

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

export interface DiaryStats {
  totalEntries: number;
  activitiesByType: Array<{
    activityType: string;
    count: number;
  }>;
  recentActivities: number;
}

class CropDiaryService {
  async getAll(cropId?: number): Promise<CropDiary[]> {
    const params = cropId ? { cropId } : {};
    const response = await apiClient.get<CropDiary[]>('/crop-diary', { params });
    return response.data;
  }

  async getById(id: number): Promise<CropDiary> {
    const response = await apiClient.get<CropDiary>(`/crop-diary/${id}`);
    return response.data;
  }

  async create(data: CreateCropDiaryDto): Promise<CropDiary> {
    const response = await apiClient.post<CropDiary>('/crop-diary', data);
    return response.data;
  }

  async update(id: number, data: UpdateCropDiaryDto): Promise<CropDiary> {
    const response = await apiClient.patch<CropDiary>(`/crop-diary/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/crop-diary/${id}`);
    return response.data;
  }

  async getStats(cropId?: number): Promise<DiaryStats> {
    const params = cropId ? { cropId } : {};
    const response = await apiClient.get<DiaryStats>('/crop-diary/summary', { params });
    return response.data;
  }
}

export const cropDiaryService = new CropDiaryService();
