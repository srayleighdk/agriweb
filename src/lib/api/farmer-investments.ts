import apiClient from './client';
import { PaginatedResponse } from '@/types';

export enum InvestmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface FarmerInvestment {
  id: number;
  farmerId: number;
  farmlandId: number;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  minInvestment: number;
  maxInvestment: number;
  expectedReturn: number;
  returnPeriod: number;
  startDate: string;
  endDate: string;
  status: InvestmentStatus;
  approvedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  farmland?: any;
  investorInvestments?: any[];
}

export interface CreateFarmerInvestmentDto {
  farmlandId?: number;
  title: string;
  description?: string;
  investmentType: string;
  requestedAmount: number;
  targetDate?: string;
  duration?: number;
  expectedReturn?: number;
  minimumInvestment?: number;
  maximumInvestment?: number;
  repaymentTerms?: string;
  riskLevel?: string;
  riskFactors?: string[];
  collateral?: string;
  insurance?: string;
  fundingDeadline?: string;
  images?: string[];
  documents?: string[];
  businessPlan?: string;
  financialProjection?: string;
}

export interface UpdateFarmerInvestmentDto {
  title?: string;
  description?: string;
  fundingGoal?: number;
  minInvestment?: number;
  maxInvestment?: number;
  expectedReturn?: number;
  returnPeriod?: number;
  startDate?: string;
  endDate?: string;
  status?: InvestmentStatus;
}

export interface InvestmentStats {
  totalInvestments: number;
  activeInvestments: number;
  completedInvestments: number;
  pendingInvestments: number;
  totalFunding: number;
  totalGoal: number;
}

class FarmerInvestmentsService {
  async getMyInvestments(params?: { page?: number; limit?: number; status?: InvestmentStatus }): Promise<FarmerInvestment[]> {
    const response = await apiClient.get<FarmerInvestment[]>('/farmer-investments', { params });
    return response.data;
  }

  async getInvestmentById(id: number): Promise<FarmerInvestment> {
    const response = await apiClient.get<FarmerInvestment>(`/farmer-investments/${id}`);
    return response.data;
  }

  async createInvestment(data: CreateFarmerInvestmentDto): Promise<FarmerInvestment> {
    const response = await apiClient.post<FarmerInvestment>('/farmer-investments', data);
    return response.data;
  }

  async updateInvestment(id: number, data: UpdateFarmerInvestmentDto): Promise<FarmerInvestment> {
    const response = await apiClient.patch<FarmerInvestment>(`/farmer-investments/${id}`, data);
    return response.data;
  }

  async deleteInvestment(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/farmer-investments/${id}`);
    return response.data;
  }

  async getStats(): Promise<InvestmentStats> {
    const response = await apiClient.get<InvestmentStats>('/farmer-investments/stats');
    return response.data;
  }
}

export const farmerInvestmentsService = new FarmerInvestmentsService();
