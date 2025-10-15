'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { investmentsService, Investment } from '@/lib/api/investments';
import { investorService } from '@/lib/api/investor';
import InvestorNav from '@/components/layout/InvestorNav';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
  MapPin,
  User,
  Briefcase,
  Clock,
  CheckCircle,
  X,
  Info
} from 'lucide-react';
import Link from 'next/link';
import Toast from '@/components/ui/Toast';

export default function InvestmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const investmentId = parseInt(params.id as string);

  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Investment modal state
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState(''); // For formatted display
  const [investmentNotes, setInvestmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const loadInvestmentDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await investmentsService.getInvestmentById(investmentId);
      setInvestment(data);
    } catch (err: unknown) {
      console.error('Failed to load investment details:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Không thể tải thông tin cơ hội đầu tư');
    } finally {
      setLoading(false);
    }
  }, [investmentId]);

  useEffect(() => {
    loadInvestmentDetail();
  }, [loadInvestmentDetail]);

  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Format with thousand separators (commas)
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Remove all non-digit characters to get the raw number
    const rawValue = inputValue.replace(/\D/g, '');
    // Store raw value for submission
    setInvestmentAmount(rawValue);
    // Format for display
    setDisplayAmount(formatNumberWithCommas(rawValue));
  };

  const handleInvestClick = () => {
    setShowInvestModal(true);
    setInvestmentAmount('');
    setDisplayAmount('');
    setInvestmentNotes('');
    setSubmitError('');
  };

  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investment) return;

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount < 100000) {
      setSubmitError('Số tiền đầu tư tối thiểu là 100,000 VND');
      return;
    }

    const currentAmt = Number(investment.currentAmount) || 0;
    const requestedAmt = Number(investment.requestedAmount) || 0;
    const remaining = requestedAmt - currentAmt;

    if (amount > remaining) {
      setSubmitError(`Dự án chỉ cần thêm ₫${remaining.toLocaleString('vi-VN')}`);
      return;
    }

    try {
      setSubmitting(true);
      await investorService.createInvestment({
        farmerInvestmentId: investment.id,
        amount: amount,
        expectedReturn: investment.expectedReturn || undefined,
        notes: investmentNotes || undefined,
      });
      setShowInvestModal(false);
      setToastMessage('Đầu tư thành công! Chúng tôi sẽ xử lý đầu tư của bạn.');
      setToastType('success');
      setShowToast(true);
      // Delay navigation to show toast
      setTimeout(() => {
        router.push('/investor/portfolio');
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setSubmitError(error.response?.data?.message || 'Không thể tạo đầu tư. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      ACTIVE: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (loading) {
    return (
      <>
        <InvestorNav />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">Đang tải chi tiết cơ hội...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !investment) {
    return (
      <>
        <InvestorNav />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="text-red-600 mb-4 text-lg">{error || 'Không tìm thấy cơ hội đầu tư'}</div>
              <Link
                href="/investor/opportunities"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                <ArrowLeft size={18} />
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentAmount = Number(investment.currentAmount) || 0;
  const requestedAmount = Number(investment.requestedAmount) || 0;
  const fundingProgress = requestedAmount > 0 ? (currentAmount / requestedAmount) * 100 : 0;
  const remainingAmount = requestedAmount - currentAmount;

  return (
    <>
      <InvestorNav />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Link
            href="/investor/opportunities"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
          >
            <ArrowLeft size={20} />
            Quay lại danh sách cơ hội
          </Link>

          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{investment.title}</h1>
                <p className="text-gray-600 text-lg mb-4">{investment.description}</p>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 text-sm font-semibold rounded-lg border ${getStatusColor(investment.status)}`}>
                    {investment.status}
                  </span>
                  <span className={`px-4 py-2 text-sm font-semibold rounded-lg border ${getRiskColor(investment.riskLevel)}`}>
                    Rủi ro: {investment.riskLevel}
                  </span>
                  {investment.investmentType && (
                    <span className="px-4 py-2 text-sm font-semibold rounded-lg border bg-indigo-50 text-indigo-600 border-indigo-200">
                      {investment.investmentType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Tiến độ huy động vốn</span>
                <span className="text-lg font-bold text-blue-600">{fundingProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Mục tiêu</p>
                  <p className="text-lg font-bold text-gray-900">
                    ₫{requestedAmount.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Đã huy động</p>
                  <p className="text-lg font-bold text-green-600">
                    ₫{currentAmount.toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Còn thiếu</p>
                  <p className="text-lg font-bold text-orange-600">
                    ₫{remainingAmount.toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Investment Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Investment Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="text-blue-600" size={24} />
                  Thông tin Đầu tư
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="text-blue-600" size={20} />
                      <p className="text-sm text-gray-600">Lợi nhuận kỳ vọng</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {investment.expectedReturn ? `${investment.expectedReturn}%` : 'Chưa xác định'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="text-green-600" size={20} />
                      <p className="text-sm text-gray-600">Thời gian dự kiến</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {investment.duration ? `${investment.duration} tháng` : 'Chưa xác định'}
                    </p>
                  </div>
                </div>

                {investment.startDate && investment.endDate && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Ngày bắt đầu</p>
                        <p className="font-semibold">{new Date(investment.startDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Ngày kết thúc</p>
                        <p className="font-semibold">{new Date(investment.endDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Farmer Information */}
              {investment.farmer && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="text-blue-600" size={24} />
                    Thông tin Nông dân
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="text-gray-400" size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Họ tên</p>
                        <p className="font-semibold text-gray-900">{investment.farmer.user.name || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="text-gray-400" size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Kinh nghiệm canh tác</p>
                        <p className="font-semibold text-gray-900">
                          {investment.farmer.farmingExperience ? `${investment.farmer.farmingExperience} năm` : 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="text-gray-400" size={18} />
                      <div>
                        <p className="text-xs text-gray-500">Tỉnh/Thành phố</p>
                        <p className="font-semibold text-gray-900">{investment.farmer.user.province || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    {investment.farmer.isVerified && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                        <CheckCircle size={18} />
                        <span className="font-semibold">Đã xác minh</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Farmland Information */}
              {investment.farmland && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={24} />
                    Thông tin Trang trại
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tên trang trại</p>
                      <p className="font-semibold text-gray-900 text-lg">{investment.farmland.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Diện tích</p>
                        <p className="font-semibold text-gray-900">{investment.farmland.size} ha</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Loại hình</p>
                        <p className="font-semibold text-gray-900">{investment.farmland.farmlandType}</p>
                      </div>
                    </div>
                    {investment.farmland.address && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
                        <p className="font-semibold text-gray-900">{investment.farmland.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Investment Action */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Đầu tư ngay</h2>

                {investment.status === 'APPROVED' ? (
                  <>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Số tiền cần</span>
                        <span className="text-lg font-bold text-blue-600">
                          ₫{remainingAmount.toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tối thiểu</span>
                        <span className="text-sm font-semibold text-gray-900">₫100,000</span>
                      </div>
                    </div>

                    <button
                      onClick={handleInvestClick}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <DollarSign size={24} />
                      Đầu tư ngay
                    </button>

                    <div className="mt-4 flex items-start gap-2 text-gray-600 text-sm">
                      <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                      <p>Vui lòng đọc kỹ thông tin và đánh giá rủi ro trước khi đầu tư.</p>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                    <p className="text-gray-600">Cơ hội này hiện không khả dụng để đầu tư.</p>
                    <p className="text-sm text-gray-500 mt-2">Trạng thái: {investment.status}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Xác nhận Đầu tư</h3>
                <button
                  onClick={() => setShowInvestModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-2">{investment.title}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Lợi nhuận kỳ vọng</p>
                    <p className="font-bold text-blue-600">
                      {investment.expectedReturn ? `${investment.expectedReturn}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Thời gian</p>
                    <p className="font-bold text-gray-900">
                      {investment.duration ? `${investment.duration} tháng` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleInvestmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số tiền đầu tư (VND) *
                  </label>
                  <input
                    type="text"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    placeholder="Nhập số tiền (tối thiểu 100,000)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Còn thiếu: ₫{remainingAmount.toLocaleString('vi-VN')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    value={investmentNotes}
                    onChange={(e) => setInvestmentNotes(e.target.value)}
                    placeholder="Thêm ghi chú về đầu tư của bạn..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {submitError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInvestModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác nhận Đầu tư'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
