'use client';

import { useState, useEffect } from 'react';
import { investorService } from '@/lib/api/investor';
import { InvestorInvestment } from '@/lib/api/investments';
import { TrendingUp, Clock, CheckCircle, DollarSign, PieChart, ArrowUpRight, AlertCircle } from 'lucide-react';
import InvestorNav from '@/components/layout/InvestorNav';
import Link from 'next/link';

export default function PortfolioPage() {
  const [investments, setInvestments] = useState<InvestorInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'rejected'>('all');

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await investorService.getPortfolio();
      // Ensure data is always an array
      setInvestments(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Failed to load portfolio:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load portfolio');
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestments = investments.filter((inv) => {
    if (filter === 'pending') return inv.status === 'PENDING';
    if (filter === 'active') return inv.status === 'ACTIVE';
    if (filter === 'completed') return inv.status === 'COMPLETED';
    if (filter === 'rejected') return inv.status === 'REJECTED';
    return true;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'Chờ xử lý',
      ACTIVE: 'Đang hoạt động',
      COMPLETED: 'Đã hoàn thành',
      CANCELLED: 'Đã hủy',
      REJECTED: 'Đã từ chối',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      LOW: 'text-green-600 bg-green-50 border-green-200',
      MEDIUM: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
      VERY_HIGH: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[risk as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getRejectionReason = (investment: InvestorInvestment): string => {
    if (!investment.notes) return '';
    // Extract reason from notes if it starts with "Từ chối: "
    if (investment.notes.startsWith('Từ chối: ')) {
      return investment.notes.substring('Từ chối: '.length);
    }
    return investment.notes;
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  // Calculate actual profit in VND from percentage returns
  const totalReturns = investments.reduce((sum, inv) => {
    if (inv.actualReturn && inv.amount) {
      return sum + (inv.amount * (inv.actualReturn / 100));
    }
    return sum;
  }, 0);
  const pendingCount = investments.filter((inv) => inv.status === 'PENDING').length;
  const activeCount = investments.filter((inv) => inv.status === 'ACTIVE').length;
  const completedCount = investments.filter((inv) => inv.status === 'COMPLETED').length;
  const rejectedCount = investments.filter((inv) => inv.status === 'REJECTED').length;

  return (
    <>
      <InvestorNav />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh mục Đầu tư</h1>
            <p className="text-gray-600">Theo dõi và quản lý các khoản đầu tư của bạn</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <DollarSign className="text-blue-600" size={24} />
                </div>
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <p className="text-sm text-gray-600 mb-1">Tổng đầu tư</p>
              <p className="text-2xl font-bold text-gray-900">
                ₫{totalInvested.toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <ArrowUpRight className="text-green-600" size={20} />
              </div>
              <p className="text-sm text-gray-600 mb-1">Tổng lợi nhuận</p>
              <p className="text-2xl font-bold text-green-600">
                ₫{totalReturns.toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <Clock className="text-indigo-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-100 p-3 rounded-xl">
                  <CheckCircle className="text-gray-600" size={24} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Đã hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tất cả ({investments.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Chờ xử lý ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === 'active'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Đang hoạt động ({activeCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === 'completed'
                    ? 'bg-gray-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hoàn thành ({completedCount})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === 'rejected'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Đã từ chối ({rejectedCount})
              </button>
            </div>

            {/* Investments List */}
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải danh mục...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <div className="text-red-600 mb-4">{error}</div>
                <button
                  onClick={loadPortfolio}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thử lại
                </button>
              </div>
            ) : filteredInvestments.length === 0 ? (
              <div className="py-12 text-center">
                <PieChart className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đầu tư</h3>
                <p className="text-gray-600 mb-4">Bắt đầu đầu tư vào các dự án nông nghiệp ngay hôm nay</p>
                <Link
                  href="/investor/opportunities"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Khám phá cơ hội
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvestments.map((investment) => (
                  <div
                    key={investment.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {investment.farmerInvestment?.title || 'Dự án đầu tư'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {investment.farmerInvestment?.description || 'Không có mô tả'}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(investment.status)}`}>
                            {getStatusLabel(investment.status)}
                          </span>
                          {investment.farmerInvestment?.riskLevel && (
                            <span className={`px-3 py-1 text-xs font-semibold rounded-lg border ${getRiskColor(investment.farmerInvestment.riskLevel)}`}>
                              {investment.farmerInvestment.riskLevel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Số tiền đầu tư</p>
                        <p className="text-lg font-bold text-gray-900">
                          ₫{investment.amount.toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Lợi nhuận kỳ vọng</p>
                        <p className="text-lg font-bold text-blue-600">
                          {investment.expectedReturn ? `${investment.expectedReturn}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Lợi nhuận thực tế</p>
                        <p className={`text-lg font-bold ${investment.actualReturn ? 'text-green-600' : 'text-gray-400'}`}>
                          {investment.actualReturn ? `${investment.actualReturn}%` : 'Chưa có'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Ngày đầu tư</p>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(investment.investmentDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    {/* Rejection Reason Alert */}
                    {investment.status === 'REJECTED' && (
                      <div className="mt-4 pt-4 border-t border-red-100">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <AlertCircle className="text-red-600" size={20} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-red-900 mb-1">
                                Lý do từ chối
                              </h4>
                              <p className="text-sm text-red-700">
                                {getRejectionReason(investment) || 'Quản trị viên đã từ chối đầu tư này nhưng không cung cấp lý do cụ thể.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
