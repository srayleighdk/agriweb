'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { investmentsService, Investment, InvestorInvestment, InvestmentStatus } from '@/lib/api/investments';
import { Search, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

type InvestmentView = 'farmer' | 'investor';

export default function InvestmentsPage() {
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investorInvestments, setInvestorInvestments] = useState<InvestorInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvestmentStatus | ''>('');
  const [viewType, setViewType] = useState<InvestmentView>('farmer');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadInvestments();
  }, [page, search, statusFilter, viewType]);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      setError('');

      if (viewType === 'farmer') {
        const response = await investmentsService.getInvestments({
          page,
          limit,
          search: search || undefined,
          status: statusFilter || undefined,
        });
        setInvestments(response.data || []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } else {
        const response = await investmentsService.getInvestorInvestments({
          page,
          limit,
          search: search || undefined,
          status: statusFilter || undefined,
        });
        setInvestorInvestments(response.data || []);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 0);
      }
    } catch (err: any) {
      console.error('Failed to load investments:', err);
      console.error('Error response:', err.response);

      let errorMessage = 'Không thể tải danh sách đầu tư';

      if (err.response?.status === 401) {
        errorMessage = 'Chưa đăng nhập. Vui lòng đăng nhập lại.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Không có quyền truy cập. Yêu cầu quyền quản trị.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setInvestments([]);
      setInvestorInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this investment request?')) return;
    
    try {
      await investmentsService.updateInvestmentStatus(id, InvestmentStatus.APPROVED);
      loadInvestments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve investment');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this investment request?')) return;
    
    try {
      await investmentsService.updateInvestmentStatus(id, InvestmentStatus.REJECTED);
      loadInvestments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject investment');
    }
  };

  const getStatusBadge = (status: InvestmentStatus) => {
    const styles = {
      [InvestmentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [InvestmentStatus.APPROVED]: 'bg-blue-100 text-blue-800',
      [InvestmentStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [InvestmentStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
      [InvestmentStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [InvestmentStatus.REJECTED]: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getRiskBadge = (risk: string) => {
    const styles = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      VERY_HIGH: 'bg-red-100 text-red-800',
    };
    return styles[risk as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Đầu tư</h1>
        <p className="text-gray-600 mt-2">Xem xét và quản lý các yêu cầu đầu tư</p>
      </div>

      {/* View Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => { setViewType('farmer'); setPage(1); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                viewType === 'farmer'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Yêu cầu từ Nông dân
            </button>
            <button
              onClick={() => { setViewType('investor'); setPage(1); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                viewType === 'investor'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Đầu tư từ Nhà đầu tư
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={
                  viewType === 'farmer'
                    ? "Tìm kiếm theo tiêu đề hoặc nông dân..."
                    : "Tìm kiếm theo nhà đầu tư..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvestmentStatus | '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value={InvestmentStatus.PENDING}>Chờ xử lý</option>
              <option value={InvestmentStatus.APPROVED}>Đã phê duyệt</option>
              <option value={InvestmentStatus.ACTIVE}>Đang hoạt động</option>
              <option value={InvestmentStatus.COMPLETED}>Hoàn thành</option>
              <option value={InvestmentStatus.REJECTED}>Đã từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách đầu tư...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={loadInvestments}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Thử lại
            </button>
          </div>
        ) : (viewType === 'farmer' && (!investments || investments.length === 0)) ||
           (viewType === 'investor' && (!investorInvestments || investorInvestments.length === 0)) ? (
          <div className="p-8 text-center text-gray-500">Không tìm thấy đầu tư</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {viewType === 'farmer' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nông dân</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền yêu cầu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đã huy động</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rủi ro</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà đầu tư</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dự án</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền đầu tư</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lợi nhuận kỳ vọng</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đầu tư</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {viewType === 'farmer' ? (
                    // Farmer Investment Requests
                    investments.map((investment) => (
                      <tr
                        key={investment.id}
                        onClick={() => router.push(`/admin/investments/${investment.id}`)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{investment.title}</div>
                          <div className="text-sm text-gray-500">{investment.description?.substring(0, 50)}...</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {investment.farmer?.user?.name || 'Chưa rõ'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            ${investment.requestedAmount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            ${investment.currentAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {((investment.currentAmount / investment.requestedAmount) * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(investment.status)}`}>
                            {investment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadge(investment.riskLevel)}`}>
                            {investment.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            {investment.status === InvestmentStatus.PENDING && (
                              <>
                                <button
                                  onClick={() => handleApprove(investment.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Phê duyệt"
                                >
                                  <CheckCircle size={20} />
                                </button>
                                <button
                                  onClick={() => handleReject(investment.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Từ chối"
                                >
                                  <XCircle size={20} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Investor Investments
                    investorInvestments.map((investment) => (
                      <tr
                        key={investment.id}
                        onClick={() => router.push(`/admin/investor-investments/${investment.id}`)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {investment.investor?.user?.name || 'Chưa rõ'}
                          </div>
                          <div className="text-sm text-gray-500">{investment.investor?.user?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {investment.farmerInvestment?.title || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {investment.farmerInvestment?.farmer?.user?.name || 'Chưa rõ'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            ${investment.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {investment.expectedReturn ? `${investment.expectedReturn}%` : 'N/A'}
                          </div>
                          {investment.actualReturn && (
                            <div className="text-xs text-green-600">
                              Thực tế: {investment.actualReturn}%
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(investment.status)}`}>
                            {investment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(investment.investmentDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-xs text-gray-500">Chi tiết →</div>
                        </td>
                      </tr>
                    ))
                  )}
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
