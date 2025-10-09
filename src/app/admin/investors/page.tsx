'use client';

import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface Investor {
  id: number;
  userId: number;
  investorType: string;
  isVerified: boolean;
  riskTolerance: string;
  totalInvested: number;
  activeInvestments: number;
  totalInvestments: number;
  successfulInvestments: number;
  portfolioValue: number;
  averageReturn: number | null;
  totalReturned: number;
  experience: number | null;
  netWorth: number | null;
  annualIncome: number | null;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
    province: string | null;
    commune: string | null;
  };
}

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadInvestors();
  }, [page, search, typeFilter, riskFilter, verifiedFilter]);

  const loadInvestors = async () => {
    try {
      setLoading(true);
      setError('');

      const params: any = {
        page,
        limit,
      };

      if (search) params.search = search;
      if (typeFilter) params.investorType = typeFilter;
      if (riskFilter) params.riskTolerance = riskFilter;
      if (verifiedFilter) params.isVerified = verifiedFilter === 'true';

      const response = await apiClient.get('/admin/investors', { params });
      setInvestors(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 0);
    } catch (err: any) {
      console.error('Failed to load investors:', err);
      setError(err.response?.data?.message || 'Failed to load investors');
      setInvestors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      INDIVIDUAL: 'bg-blue-100 text-blue-800',
      INSTITUTIONAL: 'bg-purple-100 text-purple-800',
      ACCREDITED: 'bg-green-100 text-green-800',
      GOVERNMENT: 'bg-yellow-100 text-yellow-800',
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-gray-900">Quản lý nhà đầu tư</h1>
        <p className="text-gray-600 mt-2">Quản lý hồ sơ và danh mục đầu tư</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm nhà đầu tư..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tất cả loại</option>
              <option value="INDIVIDUAL">Cá nhân</option>
              <option value="INSTITUTIONAL">Tổ chức</option>
              <option value="ACCREDITED">Được chứng nhận</option>
              <option value="GOVERNMENT">Chính phủ</option>
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

          {/* Verified Filter */}
          <div>
            <select
              value={verifiedFilter}
              onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đã xác minh</option>
              <option value="false">Chưa xác minh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải nhà đầu tư...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={loadInvestors}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Thử lại
            </button>
          </div>
        ) : !investors || investors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không tìm thấy nhà đầu tư</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà đầu tư</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rủi ro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đầu tư</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {investors.map((investor) => (
                    <tr key={investor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                              {investor.user.name?.charAt(0).toUpperCase() || investor.user.email.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{investor.user.name || 'Chưa có tên'}</div>
                            <div className="text-sm text-gray-500">{investor.user.email}</div>
                            {investor.user.phone && (
                              <div className="text-xs text-gray-400">{investor.user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(investor.investorType)}`}>
                          {investor.investorType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {investor.isVerified ? (
                          <span className="text-xs text-green-600">✓ Đã xác minh</span>
                        ) : (
                          <span className="text-xs text-gray-400">Chưa xác minh</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadge(investor.riskTolerance)}`}>
                          {investor.riskTolerance}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${investor.portfolioValue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Đã đầu tư: ${investor.totalInvested.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {investor.activeInvestments} đang hoạt động
                        </div>
                        <div className="text-xs text-gray-500">
                          {investor.successfulInvestments}/{investor.totalInvestments} thành công
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/admin/investors/${investor.id}`}
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
