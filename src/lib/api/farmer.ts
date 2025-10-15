import apiClient from './client';

export interface FarmerProfile {
  id: number;
  userId: number;
  isVerified: boolean;
  verificationLevel: string;
  farmingExperience: number | null;
  totalProjects: number;
  successfulProjects: number;
  creditScore: number | null;
  riskLevel: string;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    province: string | null;
    commune: string | null;
  };
}

export interface FarmerStats {
  farmlands: number;
  crops: number;
  livestock: number;
  investments: {
    total: number;
    active: number;
    completed: number;
    totalFunded: number;
  };
}

class FarmerService {
  /**
   * Get farmer profile
   */
  async getProfile(): Promise<FarmerProfile> {
    const response = await apiClient.get<FarmerProfile>('/auth/profile/farmer');
    return response.data;
  }

  /**
   * Get farmer statistics
   */
  async getStats(): Promise<FarmerStats> {
    const response = await apiClient.get<FarmerStats>('/farmer/stats');
    return response.data;
  }

  /**
   * Update farmer profile
   */
  async updateProfile(data: Partial<FarmerProfile>): Promise<FarmerProfile> {
    const response = await apiClient.put<FarmerProfile>('/auth/profile/farmer', data);
    return response.data;
  }
}

export const farmerService = new FarmerService();
