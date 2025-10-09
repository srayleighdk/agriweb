import apiClient from './client';

export interface Tinh {
  id: number;
  code: string;
  tenTinh: string;
  oldCode?: string;
  tongDanSo: number;
  tongDienTich?: number;
  kinhTeXaHoi?: string;
  status: string;
  Xa?: Xa[];
}

export interface Xa {
  id: number;
  idTinh: number;
  code: string;
  tenXa: string | null;
  oldCode?: string;
  idKhuVuc?: number;
  danSo: number;
  dienTich?: number;
  kinhTeXaHoi?: string;
  status: string;
  activate: string;
  ten: string; // This is the actual commune name
}

export const tinhService = {
  // Get all provinces
  getAllProvinces: async (): Promise<Tinh[]> => {
    const response = await apiClient.get('/tinh');
    return response.data;
  },

  // Get province by ID with communes
  getProvinceById: async (id: number, includeXa: boolean = false): Promise<Tinh> => {
    const response = await apiClient.get(`/tinh/${id}`, {
      params: { includeXa },
    });
    return response.data;
  },

  // Get all communes in a province
  getCommunesByProvinceId: async (provinceId: number): Promise<Xa[]> => {
    const response = await apiClient.get(`/tinh/${provinceId}/xa`);
    return response.data;
  },

  // Search provinces
  searchProvinces: async (searchTerm: string): Promise<Tinh[]> => {
    const response = await apiClient.get('/tinh/search', {
      params: { q: searchTerm },
    });
    return response.data;
  },
};
