import apiClient from './client';

export interface DashboardStats {
  users: {
    total: number;
    farmers: number;
    investors: number;
    admins: number;
    newThisMonth: number;
  };
  investments: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    totalAmount: number;
    totalFunded: number;
  };
  farmlands: {
    total: number;
    totalArea: number;
  };
  recentActivities: Array<{
    id: number;
    type: string;
    description: string;
    user: string;
    timestamp: string;
  }>;
}

class StatsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/admin/stats');
    return response.data;
  }
}

export const statsService = new StatsService();
