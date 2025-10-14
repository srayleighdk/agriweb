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
   * Get investor statistics (calculated from actual investments)
   */
  async getStats(): Promise<InvestorStats> {
    // Get actual portfolio data instead of cached stats
    const portfolioData = await this.getPortfolioSummary();

    return {
      totalInvested: portfolioData.totalInvested || 0,
      activeInvestments: portfolioData.activeInvestments || 0,
      completedInvestments: portfolioData.completedInvestments || 0,
      totalReturns: portfolioData.totalReturned || 0,
      roi: portfolioData.averageROI || 0,
      portfolioValue: portfolioData.portfolioValue || 0,
    };
  }

  /**
   * Get investor portfolio (list of investments)
   */
  async getPortfolio(): Promise<any[]> {
    const response = await apiClient.get('/investor-investments');
    return response.data;
  }

  /**
   * Get portfolio summary statistics
   */
  async getPortfolioSummary(): Promise<any> {
    const response = await apiClient.get('/investor-investments/portfolio');
    return response.data;
  }

  /**
   * Update investor profile
   */
  async updateProfile(data: any): Promise<InvestorProfile> {
    const response = await apiClient.put<InvestorProfile>('/auth/profile/investor', data);
    return response.data;
  }

  /**
   * Create a new investment
   */
  async createInvestment(data: {
    farmerInvestmentId: number;
    amount: number;
    expectedReturn?: number;
    returnDate?: string;
    notes?: string;
    contractDocument?: string;
  }): Promise<any> {
    const response = await apiClient.post('/investor-investments', data);
    return response.data;
  }
}

export const investorService = new InvestorService();
