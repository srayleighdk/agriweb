'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DollarSign, TrendingUp, Calendar, User, FileText, ArrowLeft, Users, Target, CheckCircle, XCircle
} from 'lucide-react';
import { investmentsService, InvestorInvestment, InvestmentStatus } from '@/lib/api/investments';
import apiClient from '@/lib/api/client';

export default function InvestorInvestmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const investmentId = params.id as string;

  const [investment, setInvestment] = useState<InvestorInvestment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadInvestment();
  }, [investmentId]);

  const loadInvestment = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await investmentsService.getInvestorInvestmentById(parseInt(investmentId));
      setInvestment(data);
    } catch (err: any) {
      console.error('Failed to load investment:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin đầu tư');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Bạn có chắc chắn muốn phê duyệt đầu tư này?')) return;

    try {
      setProcessing(true);
      await apiClient.patch(`/admin/investor-investments/${investmentId}/approve`);
      alert('Đã phê duyệt đầu tư thành công!');
      await loadInvestment();
    } catch (err: any) {
      console.error('Failed to approve:', err);
      alert(err.response?.data?.message || 'Không thể phê duyệt đầu tư');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Nhập lý do từ chối (tùy chọn):');
    if (reason === null) return; // User cancelled

    try {
      setProcessing(true);
      await apiClient.patch(`/admin/investor-investments/${investmentId}/reject`, { reason });
      alert('Đã từ chối đầu tư');
      await loadInvestment();
    } catch (err: any) {
      console.error('Failed to reject:', err);
      alert(err.response?.data?.message || 'Không thể từ chối đầu tư');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đầu tư...</p>
        </div>
      </div>
    );
  }

  if (error || !investment) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || 'Không tìm thấy đầu tư'}</p>
          <button
            onClick={() => router.push('/admin/investments')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Quay lại danh sách đầu tư
          </button>
        </div>
      </div>
    );
  }

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

  const getStatusLabel = (status: InvestmentStatus) => {
    const labels = {
      [InvestmentStatus.PENDING]: 'Chờ xử lý',
      [InvestmentStatus.APPROVED]: 'Đã phê duyệt',
      [InvestmentStatus.ACTIVE]: 'Đang hoạt động',
      [InvestmentStatus.COMPLETED]: 'Hoàn thành',
      [InvestmentStatus.CANCELLED]: 'Đã hủy',
      [InvestmentStatus.REJECTED]: 'Đã từ chối',
    };
    return labels[status] || status;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/investments')}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách đầu tư
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết Đầu tư</h1>
            <p className="text-gray-600 mt-2">ID: #{investment.id}</p>
          </div>
          {investment.status === InvestmentStatus.PENDING && (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Phê duyệt
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <XCircle size={18} />
                Từ chối
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Trạng thái</div>
          <div className="mt-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(investment.status)}`}>
              {getStatusLabel(investment.status)}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Số tiền đầu tư</div>
          <div className="text-xl font-bold mt-1">${investment.amount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Lợi nhuận kỳ vọng</div>
          <div className="text-xl font-bold mt-1 text-green-600">
            {investment.expectedReturn ? `${investment.expectedReturn}%` : 'N/A'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">ROI</div>
          <div className="text-xl font-bold mt-1 text-blue-600">
            {investment.roi ? `${investment.roi.toFixed(2)}%` : 'N/A'}
          </div>
          {investment.actualReturn && (
            <div className="text-xs text-gray-600 mt-1">Thực tế: {investment.actualReturn}%</div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target size={20} />
              Thông tin Dự án
            </h2>
            {investment.farmerInvestment ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dự án</label>
                  <div className="text-gray-900 text-lg font-semibold">
                    {investment.farmerInvestment.title}
                  </div>
                </div>
                {investment.farmerInvestment.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <div className="text-gray-900">{investment.farmerInvestment.description}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu vốn</label>
                    <div className="text-gray-900">
                      ${investment.farmerInvestment.requestedAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nông dân</label>
                    <div className="text-gray-900">
                      {investment.farmerInvestment.farmer?.user?.name || 'Chưa rõ'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Không có thông tin dự án</p>
            )}
          </div>

          {/* Investment Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} />
              Chi tiết Đầu tư
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền đầu tư</label>
                <div className="text-gray-900">${investment.amount.toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đầu tư</label>
                <div className="text-gray-900">
                  {new Date(investment.investmentDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lợi nhuận kỳ vọng</label>
                <div className="text-gray-900">
                  {investment.expectedReturn ? `${investment.expectedReturn}%` : 'Chưa xác định'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lợi nhuận thực tế</label>
                <div className="text-gray-900">
                  {investment.actualReturn ? `${investment.actualReturn}%` : 'Chưa có'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày trả lợi nhuận dự kiến</label>
                <div className="text-gray-900">
                  {investment.returnDate
                    ? new Date(investment.returnDate).toLocaleDateString('vi-VN')
                    : 'Chưa xác định'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày trả thực tế</label>
                <div className="text-gray-900">
                  {investment.actualReturnDate
                    ? new Date(investment.actualReturnDate).toLocaleDateString('vi-VN')
                    : 'Chưa trả'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ROI</label>
                <div className="text-gray-900">
                  {investment.roi ? `${investment.roi.toFixed(2)}%` : 'Chưa tính'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kết quả</label>
                <div className="text-gray-900">
                  {investment.isSuccessful === null ? (
                    <span className="text-gray-500">Đang đầu tư</span>
                  ) : investment.isSuccessful ? (
                    <span className="text-green-600">✓ Thành công</span>
                  ) : (
                    <span className="text-red-600">✗ Thất bại</span>
                  )}
                </div>
              </div>
            </div>
            {investment.notes && (
              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <div className="text-gray-900">{investment.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Investor Info */}
        <div className="space-y-6">
          {/* Investor Info */}
          {investment.investor && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} />
                Thông tin Nhà đầu tư
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {investment.investor.user?.name?.charAt(0).toUpperCase() || 'I'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {investment.investor.user?.name || 'Chưa có tên'}
                    </div>
                    <div className="text-sm text-gray-500">{investment.investor.user?.email}</div>
                  </div>
                </div>
                {investment.investor.user?.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <div className="text-gray-900">{investment.investor.user.phone}</div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại nhà đầu tư</label>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {investment.investor.investorType}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Lịch sử
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Thực hiện đầu tư</div>
                  <div className="text-xs text-gray-500">
                    {new Date(investment.investmentDate).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
              {investment.actualReturnDate && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Nhận lợi nhuận</div>
                    <div className="text-xs text-gray-500">
                      {new Date(investment.actualReturnDate).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Cập nhật cuối</div>
                  <div className="text-xs text-gray-500">
                    {new Date(investment.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
