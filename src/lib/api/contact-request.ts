import apiClient from './client';

export enum ContactRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum AccessTier {
  FREE = 'FREE',
  PAID = 'PAID',
}

export interface ContactRequest {
  id: number;
  investorId: number;
  farmerInvestmentId: number;
  status: ContactRequestStatus;
  message?: string | null;
  adminNotes?: string | null;
  contactUnlockedAt?: string | null;
  reviewedByAdminId?: number | null;
  createdAt: string;
  updatedAt: string;
  investor?: {
    id: number;
    accessTier?: AccessTier;
    paidUntil?: string | null;
    user: {
      id: number;
      name: string | null;
      email: string;
      phone: string | null;
    };
  };
  farmerInvestment?: {
    id: number;
    title: string;
    status: string;
    requestedAmount: number;
    currentAmount: number;
    investmentType?: string;
    riskLevel?: string;
    images?: string[];
    farmerId: number;
    farmer?: {
      id: number;
      verificationLevel?: string;
      creditScore?: number | null;
      // Mirrors the admin detail select in agridb contact-request.service.ts:
      // id, name, email, phone, province, commune, address.
      user?: {
        id?: number;
        name: string | null;
        email?: string;
        phone?: string | null;
        province?: string | null;
        commune?: string | null;
        address?: string | null;
      };
    };
  };
}

export interface UnlockedFarmerContact {
  contactRequestId: number;
  farmerInvestmentId: number;
  projectTitle: string;
  unlockedAt: string | null;
  farmerContact: {
    name: string | null;
    email: string;
    phone: string | null;
    province: string | null;
    commune: string | null;
    address: string | null;
  };
}

export interface PaginatedContactRequests {
  data: ContactRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ContactRequestService {
  async create(data: {
    farmerInvestmentId: number;
    message?: string;
  }): Promise<ContactRequest> {
    const response = await apiClient.post<ContactRequest>('/contact-requests', data);
    return response.data;
  }

  async getMine(status?: ContactRequestStatus): Promise<ContactRequest[]> {
    const response = await apiClient.get<ContactRequest[]>('/contact-requests/mine', {
      params: status ? { status } : undefined,
    });
    return response.data;
  }

  async getForProject(farmerInvestmentId: number): Promise<ContactRequest | null> {
    const response = await apiClient.get<ContactRequest | null>(
      `/contact-requests/project/${farmerInvestmentId}`,
    );
    return response.data;
  }

  async getUnlockedContact(id: number): Promise<UnlockedFarmerContact> {
    const response = await apiClient.get<UnlockedFarmerContact>(
      `/contact-requests/${id}/contact`,
    );
    return response.data;
  }

  async getAllAdmin(params: {
    page?: number;
    limit?: number;
    status?: ContactRequestStatus;
    search?: string;
  } = {}): Promise<PaginatedContactRequests> {
    const response = await apiClient.get<PaginatedContactRequests>(
      '/contact-requests/admin/all',
      { params },
    );
    return response.data;
  }

  async getByIdAdmin(id: number): Promise<ContactRequest> {
    const response = await apiClient.get<ContactRequest>(
      `/contact-requests/admin/${id}`,
    );
    return response.data;
  }

  async review(
    id: number,
    data: { status: ContactRequestStatus.APPROVED | ContactRequestStatus.REJECTED; adminNotes?: string },
  ): Promise<ContactRequest> {
    const response = await apiClient.patch<ContactRequest>(
      `/contact-requests/admin/${id}`,
      data,
    );
    return response.data;
  }
}

export const contactRequestService = new ContactRequestService();
