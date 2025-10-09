import apiClient from './client';

export interface InvestorProfile {
  id: number;
  userId: number;
  investorType: string;
  isVerified: boolean;
  totalInvested: number;
  activeInvestments: number;
  portfolioValue: number;
  totalReturned: number;
  riskTolerance: string;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
}

export interface InvestorStats {
  totalInvested: number;
  activeInvestments: number;
  completedInvestments: number;
  totalReturns: number;
  roi: number;
  portfolioValue: number;
}

class InvestorService {
  /**
   * Get investor profile
   */
  async getProfile(): Promise<InvestorProfile> {
    const response = await apiClient.get<InvestorProfile>('/auth/profile/investor');
    return response.data;
  }

  /**
   * Get investor statistics
   */
  async getStats(): Promise<InvestorStats> {
    const response = await apiClient.get<InvestorStats>('/investor/stats');
    return response.data;
  }

  /**
   * Get investor portfolio
   */
  async getPortfolio(): Promise<any> {
    const response = await apiClient.get('/auth/investor/portfolio');
    return response.data;
  }

  /**
   * Update investor profile
   */
  async updateProfile(data: any): Promise<InvestorProfile> {
    const response = await apiClient.put<InvestorProfile>('/auth/profile/investor', data);
    return response.data;
  }
}

export const investorService = new InvestorService();
