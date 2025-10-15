'use client';

import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Farmer {
  id: number;
  userId: number;
  isVerified: boolean;
  verificationLevel: string;
  farmingExperience: number | null;
  totalProjects: number;
  successfulProjects: number;
  creditScore: number | null;
  riskLevel: string;
  monthlyIncome: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  cooperativeMember: boolean;
  onTimeRepaymentRate: number;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    province: string | null;
    commune: string | null;
  };
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [provinceFilter, setProvinceFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadFarmers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, verificationFilter, riskFilter, provinceFilter]);

  const loadFarmers = async () => {
    try {
      setLoading(true);
      setError('');

      const params: Record<string, unknown> = {
        page,
        limit,
      };

      if (search) params.search = search;
      if (verificationFilter) params.verificationLevel = verificationFilter;
      if (riskFilter) params.riskLevel = riskFilter;
      if (provinceFilter) params.province = provinceFilter;

      const response = await apiClient.get('/admin/farmers', { params });
      setFarmers(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 0);
    } catch (err: unknown) {
      console.error('Failed to load farmers:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load farmers');
      setFarmers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getVerificationBadge = (level: string, isVerified: boolean) => {
    if (!isVerified) {
      return 'bg-gray-100 text-gray-800';
    }
    const styles: Record<string, string> = {
      BASIC: 'bg-blue-100 text-blue-800',
      DOCUMENTS: 'bg-yellow-100 text-yellow-800',
      FIELD: 'bg-orange-100 text-orange-800',
      CERTIFIED: 'bg-green-100 text-green-800',
    };
    return styles[level] || 'bg-gray-100 text-gray-800';
  };

  const getRiskBadge = (risk: string) => {
    const styles: Record<string, string> = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      VERY_HIGH: 'bg-red-100 text-red-800',
    };
    return styles[risk] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Nông dân</h1>
        <p className="text-gray-600 mt-2">Quản lý và xác minh hồ sơ nông dân</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm nông dân..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Verification Filter */}
          <div>
            <select
              value={verificationFilter}
              onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tất cả mức xác minh</option>
              <option value="BASIC">Cơ bản</option>
              <option value="DOCUMENTS">Tài liệu</option>
              <option value="FIELD">Xác minh thực địa</option>
              <option value="CERTIFIED">Chứng nhận</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tất cả mức rủi ro</option>
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="VERY_HIGH">Rất cao</option>
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <input
              type="text"
              placeholder="Lọc theo tỉnh..."
              value={provinceFilter}
              onChange={(e) => { setProvinceFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách nông dân...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={loadFarmers}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Thử lại
            </button>
          </div>
        ) : !farmers || farmers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không tìm thấy nông dân</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nông dân</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vị trí</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xác minh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rủi ro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kinh nghiệm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dự án</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {farmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                              {farmer.user.name?.charAt(0).toUpperCase() || farmer.user.email.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{farmer.user.name || 'Chưa có tên'}</div>
                            <div className="text-sm text-gray-500">{farmer.user.email}</div>
                            {farmer.user.phone && (
                              <div className="text-xs text-gray-400">{farmer.user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{farmer.user.province || '-'}</div>
                        {farmer.user.commune && (
                          <div className="text-xs text-gray-500">{farmer.user.commune}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getVerificationBadge(farmer.verificationLevel, farmer.isVerified)}`}>
                            {farmer.verificationLevel}
                          </span>
                          {!farmer.isVerified && (
                            <span className="text-xs text-red-600">Chưa xác minh</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadge(farmer.riskLevel)}`}>
                          {farmer.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {farmer.farmingExperience ? `${farmer.farmingExperience} năm` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {farmer.successfulProjects}/{farmer.totalProjects}
                        </div>
                        <div className="text-xs text-gray-500">
                          {farmer.totalProjects > 0
                            ? `${((farmer.successfulProjects / farmer.totalProjects) * 100).toFixed(0)}% thành công`
                            : 'Chưa có dự án'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/admin/farmers/${farmer.id}`}
                          className="text-green-600 hover:text-green-900 inline-flex items-center gap-1"
                        >
                          <Eye size={18} />
                          <span className="text-sm">Xem</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị {(page - 1) * limit + 1} đến {Math.min(page * limit, total)} của {total} kết quả
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
