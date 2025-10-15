'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar, User, MapPin,
  CheckCircle, XCircle, Clock, FileText, Target, BarChart3
} from 'lucide-react';
import { investmentsService, Investment, InvestmentStatus } from '@/lib/api/investments';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function InvestmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const investmentId = params.id as string;

  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => { },
  });

  useEffect(() => {
    loadInvestment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investmentId]);

  const loadInvestment = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await investmentsService.getInvestmentById(parseInt(investmentId));
      setInvestment(data);
    } catch (err: unknown) {
      console.error('Failed to load investment:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Không thể tải thông tin đầu tư');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: InvestmentStatus) => {
    const statusNames: Record<InvestmentStatus, string> = {
      [InvestmentStatus.PENDING]: 'Chờ xử lý',
      [InvestmentStatus.APPROVED]: 'Phê duyệt',
      [InvestmentStatus.REJECTED]: 'Từ chối',
      [InvestmentStatus.ACTIVE]: 'Kích hoạt',
      [InvestmentStatus.COMPLETED]: 'Hoàn thành',
      [InvestmentStatus.CANCELLED]: 'Hủy bỏ',
    };

    const statusDescriptions: Record<InvestmentStatus, string> = {
      [InvestmentStatus.PENDING]: 'Bạn có chắc chắn muốn đặt lại trạng thái chờ xử lý không?',
      [InvestmentStatus.APPROVED]: 'Bạn có chắc chắn muốn phê duyệt đầu tư này không?',
      [InvestmentStatus.REJECTED]: 'Bạn có chắc chắn muốn từ chối đầu tư này không? Hành động này không thể hoàn tác.',
      [InvestmentStatus.ACTIVE]: 'Bạn có chắc chắn muốn kích hoạt đầu tư này không?',
      [InvestmentStatus.COMPLETED]: 'Bạn có chắc chắn muốn đánh dấu đầu tư này là hoàn thành không?',
      [InvestmentStatus.CANCELLED]: 'Bạn có chắc chắn muốn hủy bỏ đầu tư này không?',
    };

    const variants: Record<InvestmentStatus, 'danger' | 'warning' | 'info'> = {
      [InvestmentStatus.PENDING]: 'info',
      [InvestmentStatus.APPROVED]: 'info',
      [InvestmentStatus.REJECTED]: 'danger',
      [InvestmentStatus.ACTIVE]: 'info',
      [InvestmentStatus.COMPLETED]: 'info',
      [InvestmentStatus.CANCELLED]: 'danger',
    };

    setConfirmDialog({
      open: true,
      title: statusNames[status] || 'Thay đổi trạng thái',
      description: statusDescriptions[status] || 'Bạn có chắc chắn muốn thực hiện hành động này không?',
      variant: variants[status] || 'info',
      onConfirm: async () => {
        try {
          setUpdating(true);
          await investmentsService.updateInvestmentStatus(parseInt(investmentId), status);
          await loadInvestment();
          setToastMessage(`Đã ${statusNames[status]?.toLowerCase()} thành công`);
          setToastType('success');
          setShowToast(true);
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          setToastMessage(error.response?.data?.message || 'Không thể cập nhật trạng thái');
          setToastType('error');
          setShowToast(true);
        } finally {
          setUpdating(false);
        }
      },
    });
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

  const getRiskBadge = (risk: string) => {
    const styles = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      VERY_HIGH: 'bg-red-100 text-red-800',
    };
    return styles[risk as keyof typeof styles] || 'bg-gray-100 text-gray-800';
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

  const getRiskLabel = (risk: string) => {
    const labels = {
      LOW: 'Thấp',
      MEDIUM: 'Trung bình',
      HIGH: 'Cao',
      VERY_HIGH: 'Rất cao',
    };
    return labels[risk as keyof typeof labels] || risk;
  };

  const fundingProgress = (investment.currentAmount / investment.requestedAmount) * 100;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/investments')}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2"
        >
          ← Quay lại danh sách đầu tư
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{investment.title}</h1>
            <p className="text-gray-600 mt-2">ID: #{investment.id}</p>
          </div>
          <div className="flex gap-2">
            {investment.status === InvestmentStatus.PENDING && (
              <>
                <button
                  onClick={() => handleStatusChange(InvestmentStatus.APPROVED)}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Phê duyệt
                </button>
                <button
                  onClick={() => handleStatusChange(InvestmentStatus.REJECTED)}
                  disabled={updating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Từ chối
                </button>
              </>
            )}
            {investment.status === InvestmentStatus.APPROVED && (
              <button
                onClick={() => handleStatusChange(InvestmentStatus.ACTIVE)}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Kích hoạt
              </button>
            )}
            {investment.status === InvestmentStatus.ACTIVE && (
              <button
                onClick={() => handleStatusChange(InvestmentStatus.COMPLETED)}
                disabled={updating}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Hoàn thành
              </button>
            )}
          </div>
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
          <div className="text-sm text-gray-500">Mức độ rủi ro</div>
          <div className="mt-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRiskBadge(investment.riskLevel)}`}>
              {getRiskLabel(investment.riskLevel)}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Số tiền yêu cầu</div>
          <div className="text-xl font-bold mt-1">₫{investment.requestedAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Đã huy động</div>
          <div className="text-xl font-bold mt-1">₫{investment.currentAmount.toLocaleString()}</div>
          <div className="text-xs text-gray-600 mt-1">{fundingProgress.toFixed(1)}%</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Investment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} />
              Mô tả dự án
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{investment.description || 'Không có mô tả'}</p>
          </div>

          {/* Funding Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target size={20} />
              Tiến độ huy động vốn
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Tiến độ</span>
                  <span className="text-sm font-semibold">{fundingProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-500">Mục tiêu</div>
                  <div className="text-lg font-bold text-gray-900">
                    ₫{investment.requestedAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Đã huy động</div>
                  <div className="text-lg font-bold text-green-600">
                    ₫{investment.currentAmount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Thông tin chi tiết
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại đầu tư</label>
                <div className="text-gray-900">{investment.investmentType}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn (tháng)</label>
                <div className="text-gray-900">{investment.duration || 'Chưa xác định'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lợi nhuận kỳ vọng (%)</label>
                <div className="text-gray-900">{investment.expectedReturn || 'Chưa xác định'}%</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                <div className="text-gray-900">
                  {investment.startDate ? new Date(investment.startDate).toLocaleDateString('vi-VN') : 'Chưa bắt đầu'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                <div className="text-gray-900">
                  {investment.endDate ? new Date(investment.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                <div className="text-gray-900">
                  {new Date(investment.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          </div>

          {/* Farmland Info */}
          {investment.farmland && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Thông tin vùng đất
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên vùng đất</label>
                  <div className="text-gray-900">{investment.farmland.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích</label>
                    <div className="text-gray-900">{investment.farmland.size} héc-ta</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại đất</label>
                    <div className="text-gray-900">{investment.farmland.farmlandType}</div>
                  </div>
                </div>
                {investment.farmland.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <div className="text-gray-900">{investment.farmland.address}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Farmer Info */}
        <div className="space-y-6">
          {/* Farmer Info */}
          {investment.farmer && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} />
                Thông tin nông dân
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
                    {investment.farmer.user?.name?.charAt(0).toUpperCase() || 'N'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {investment.farmer.user?.name || 'Chưa có tên'}
                    </div>
                    <div className="text-sm text-gray-500">{investment.farmer.user?.email}</div>
                  </div>
                </div>
                {investment.farmer.user?.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <div className="text-gray-900">{investment.farmer.user.phone}</div>
                  </div>
                )}
                {investment.farmer.user?.province && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                    <div className="text-gray-900">{investment.farmer.user.province}</div>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
                  <div className="text-gray-900">
                    {investment.farmer.farmingExperience ? `${investment.farmer.farmingExperience} năm` : 'Chưa xác định'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái xác minh</label>
                  <div>
                    {investment.farmer.isVerified ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle size={16} />
                        Đã xác minh
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock size={16} />
                        Chưa xác minh
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ rủi ro</label>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRiskBadge(investment.farmer.riskLevel)}`}>
                    {getRiskLabel(investment.farmer.riskLevel)}
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
                  <div className="text-sm font-medium text-gray-900">Tạo yêu cầu đầu tư</div>
                  <div className="text-xs text-gray-500">
                    {new Date(investment.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
              {investment.approvedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Phê duyệt</div>
                    <div className="text-xs text-gray-500">
                      {new Date(investment.approvedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              )}
              {investment.startDate && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Bắt đầu</div>
                    <div className="text-xs text-gray-500">
                      {new Date(investment.startDate).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
