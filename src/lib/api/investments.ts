import apiClient from './client';
import { PaginatedResponse } from '@/types';

export enum InvestmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export interface Investment {
  id: number;
  farmerId: number;
  title: string;
  description: string;
  requestedAmount: number;
  currentAmount: number;
  status: InvestmentStatus;
  expectedReturn: number | null;
  duration: number | null;
  riskLevel: string;
  createdAt: string;
  approvedAt?: string;
  startDate?: string;
  endDate?: string;
  investmentType?: string;
  farmlandId?: number;
  farmer?: {
    id: number;
    farmingExperience: number | null;
    isVerified: boolean;
    riskLevel: string;
    user: {
      name: string | null;
      email: string;
      phone: string | null;
      province: string | null;
    };
  };
  farmland?: {
    id: number;
    name: string;
    size: number;
    farmlandType: string;
    address: string | null;
  };
}

export interface InvestorInvestment {
  id: number;
  investorId: number;
  farmerInvestmentId: number;
  amount: number;
  investmentDate: string;
  expectedReturn: number | null;
  actualReturn: number | null;
  status: InvestmentStatus;
  returnDate: string | null;
  actualReturnDate: string | null;
  roi: number | null;
  isSuccessful: boolean | null;
  createdAt: string;
  investor?: {
    id: number;
    investorType: string;
    user: {
      name: string | null;
      email: string;
      phone: string | null;
    };
  };
  farmerInvestment?: {
    id: number;
    title: string;
    description: string | null;
    requestedAmount: number;
    farmer: {
      user: {
        name: string | null;
        email: string;
      };
    };
  };
}

export interface GetInvestmentsParams {
  page?: number;
  limit?: number;
  status?: InvestmentStatus;
  search?: string;
}

export interface GetAvailableInvestmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  investmentType?: string;
  riskLevel?: string;
  minAmount?: number;
  maxAmount?: number;
  minReturn?: number;
  maxReturn?: number;
  provinceId?: number;
  communeId?: number;
  maxDuration?: number;
  minFundingProgress?: number;
  maxFundingProgress?: number;
  sortBy?: 'createdAt' | 'requestedAmount' | 'expectedReturn' | 'fundingProgress' | 'fundingDeadline';
  sortOrder?: 'asc' | 'desc';
  riskFactors?: string[];
}

class InvestmentsService {
  /**
   * Get available investments for browsing/investing
   */
  async getInvestments(params: GetAvailableInvestmentsParams = {}): Promise<PaginatedResponse<Investment>> {
    const response = await apiClient.get('/farmer-investments/available', {
      params,
    });
    // The backend returns { data, pagination, filters }, extract just data and pagination
    return {
      data: response.data.data,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      totalPages: response.data.pagination.totalPages,
    };
  }

  /**
   * Get all investments (admin only)
   */
  async getAllInvestmentsAdmin(params: GetInvestmentsParams = {}): Promise<PaginatedResponse<Investment>> {
    const response = await apiClient.get<PaginatedResponse<Investment>>('/farmer-investments/admin/all', {
      params,
    });
    return response.data;
  }

  /**
   * Get investment by ID
   */
  async getInvestmentById(id: number): Promise<Investment> {
    const response = await apiClient.get<Investment>(`/farmer-investments/${id}`);
    return response.data;
  }

  /**
   * Get investment by ID (admin only)
   */
  async getInvestmentByIdAdmin(id: number): Promise<Investment> {
    const response = await apiClient.get<Investment>(`/farmer-investments/admin/${id}`);
    return response.data;
  }

  /**
   * Update investment status (approve/reject) - Admin only
   */
  async updateInvestmentStatus(
    id: number,
    status: InvestmentStatus,
    notes?: string
  ): Promise<Investment> {
    const response = await apiClient.patch<Investment>(
      `/farmer-investments/admin/${id}/status`,
      {
        status,
        notes,
      }
    );
    return response.data;
  }

  /**
   * Get investment statistics
   */
  async getInvestmentStats(): Promise<any> {
    const response = await apiClient.get('/farmer-investments/stats');
    return response.data;
  }

  /**
   * Get all investor investments (admin)
   */
  async getInvestorInvestments(params: GetInvestmentsParams = {}): Promise<PaginatedResponse<InvestorInvestment>> {
    const response = await apiClient.get<PaginatedResponse<InvestorInvestment>>('/admin/investor-investments', {
      params,
    });
    return response.data;
  }

  /**
   * Get investor investment by ID
   */
  async getInvestorInvestmentById(id: number): Promise<InvestorInvestment> {
    const response = await apiClient.get<InvestorInvestment>(`/admin/investor-investments/${id}`);
    return response.data;
  }
}

export const investmentsService = new InvestmentsService();
