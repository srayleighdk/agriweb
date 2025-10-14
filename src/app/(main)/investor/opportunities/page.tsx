'use client';

import { useState, useEffect } from 'react';
import { investmentsService, Investment } from '@/lib/api/investments';
import { investorService } from '@/lib/api/investor';
import { Search, DollarSign, TrendingUp, MapPin, Calendar, Filter, ArrowUpRight, Leaf, TrendingDown, Target, X } from 'lucide-react';
import InvestorNav from '@/components/layout/InvestorNav';
import Link from 'next/link';
import Toast from '@/components/ui/Toast';

export default function OpportunitiesPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');

  // Investment modal state
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState(''); // For formatted display
  const [investmentNotes, setInvestmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadOpportunities();
  }, [search]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError('');
      // Use available endpoint to get approved investments (status filter not needed, returns approved by default)
      const response = await investmentsService.getInvestments({
        search: search || undefined,
      });
      setInvestments(response.data || []);
    } catch (err: any) {
      console.error('Failed to load opportunities:', err);
      setError(err.response?.data?.message || 'Failed to load opportunities');
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const getFundingProgress = (current: number, requested: number) => {
    return Math.round((current / requested) * 100);
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      LOW: 'text-green-700 bg-green-50 border-green-200',
      MEDIUM: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      HIGH: 'text-orange-700 bg-orange-50 border-orange-200',
      VERY_HIGH: 'text-red-700 bg-red-50 border-red-200',
    };
    return colors[risk as keyof typeof colors] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

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

  const handleInvestClick = (investment: Investment) => {
    setSelectedInvestment(investment);
    setInvestmentAmount('');
    setDisplayAmount('');
    setInvestmentNotes('');
    setSubmitError('');
    setShowInvestModal(true);
  };

  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestment) return;

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount < 100000) {
      setSubmitError('Số tiền đầu tư tối thiểu là 100,000 VND');
      return;
    }

    if (selectedInvestment.minimumInvestment && amount < selectedInvestment.minimumInvestment) {
      setSubmitError(`Số tiền đầu tư tối thiểu cho dự án này là ₫${selectedInvestment.minimumInvestment.toLocaleString('vi-VN')}`);
      return;
    }

    if (selectedInvestment.maximumInvestment && amount > selectedInvestment.maximumInvestment) {
      setSubmitError(`Số tiền đầu tư tối đa cho dự án này là ₫${selectedInvestment.maximumInvestment.toLocaleString('vi-VN')}`);
      return;
    }

    const remainingAmount = selectedInvestment.requestedAmount - selectedInvestment.currentAmount;
    if (amount > remainingAmount) {
      setSubmitError(`Dự án chỉ cần thêm ₫${remainingAmount.toLocaleString('vi-VN')}`);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');

      await investorService.createInvestment({
        farmerInvestmentId: selectedInvestment.id,
        amount: amount,
        expectedReturn: selectedInvestment.expectedReturn || undefined,
        notes: investmentNotes || undefined,
      });

      // Close modal and reload opportunities
      setShowInvestModal(false);
      setSelectedInvestment(null);
      setToastMessage('Đầu tư thành công! Chúng tôi sẽ xử lý đầu tư cho bạn.');
      setToastType('success');
      setShowToast(true);
      loadOpportunities();
    } catch (err: any) {
      console.error('Failed to create investment:', err);
      setSubmitError(err.response?.data?.message || 'Không thể tạo đầu tư. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInvestments = investments.filter((inv) => {
    if (selectedRisk === 'all') return true;
    return inv.riskLevel === selectedRisk;
  });

  return (
    <>
      <InvestorNav />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Leaf size={36} className="text-green-100" />
                  <h1 className="text-4xl font-bold">Cơ hội Đầu tư</h1>
                </div>
                <p className="text-green-100 text-lg">Khám phá các dự án nông nghiệp tiềm năng và bền vững</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <p className="text-green-100 text-sm mb-1">Dự án khả dụng</p>
                  <p className="text-3xl font-bold">{investments.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm dự án..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Risk Filter */}
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400" size={20} />
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="all">Tất cả mức rủi ro</option>
                  <option value="LOW">Thấp</option>
                  <option value="MEDIUM">Trung bình</option>
                  <option value="HIGH">Cao</option>
                  <option value="VERY_HIGH">Rất cao</option>
                </select>
              </div>
            </div>
          </div>

          {/* Investment Cards */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Đang tải cơ hội đầu tư...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-red-600 mb-4 text-lg">{error}</div>
              <button
                onClick={loadOpportunities}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold"
              >
                Thử lại
              </button>
            </div>
          ) : !filteredInvestments || filteredInvestments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Leaf className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy cơ hội đầu tư</h3>
              <p className="text-gray-600">Vui lòng kiểm tra lại sau hoặc thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInvestments.map((investment) => (
                <div key={investment.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden border border-gray-100">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{investment.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{investment.description}</p>
                      </div>
                    </div>

                    {/* Risk & Farmer Info */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getRiskColor(investment.riskLevel)}`}>
                        Rủi ro: {investment.riskLevel}
                      </span>
                      {investment.farmer && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <MapPin size={14} />
                          <span>{investment.farmer.user.name || 'Nông dân'}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-700 font-medium mb-1.5">Số tiền cần</p>
                        <p className="text-lg font-bold text-blue-600 break-words">
                          ₫{investment.requestedAmount.toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <p className="text-xs text-green-700 font-medium mb-1.5">Lợi nhuận KV</p>
                        <p className="text-lg font-bold text-green-600">
                          {investment.expectedReturn ? `${investment.expectedReturn}%` : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Funding Progress */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium">Tiến độ gọi vốn</span>
                        <span className="font-bold text-green-600">
                          {getFundingProgress(investment.currentAmount, investment.requestedAmount)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${getFundingProgress(investment.currentAmount, investment.requestedAmount)}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        ₫{investment.currentAmount.toLocaleString('vi-VN')} đã huy động
                      </p>
                    </div>

                    {/* Duration */}
                    {investment.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-5 bg-gray-50 px-3 py-2 rounded-lg">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="font-medium">{investment.duration} tháng</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href={`/investor/opportunities/${investment.id}`}
                        className="flex-1 px-4 py-3.5 bg-white border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        onClick={() => handleInvestClick(investment)}
                        className="flex-1 px-4 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                      >
                        <TrendingUp size={20} />
                        Đầu tư ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && selectedInvestment && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Đầu tư vào Dự án</h2>
                  <p className="text-green-100 line-clamp-1">{selectedInvestment.title}</p>
                </div>
                <button
                  onClick={() => setShowInvestModal(false)}
                  className="ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleInvestmentSubmit} className="p-6">
              {/* Project Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Số tiền cần</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₫{selectedInvestment.requestedAmount.toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Đã huy động</p>
                    <p className="text-lg font-bold text-green-600">
                      ₫{selectedInvestment.currentAmount.toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Còn lại</p>
                    <p className="text-lg font-bold text-blue-600">
                      ₫{(selectedInvestment.requestedAmount - selectedInvestment.currentAmount).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Lợi nhuận KV</p>
                    <p className="text-lg font-bold text-purple-600">
                      {selectedInvestment.expectedReturn ? `${selectedInvestment.expectedReturn}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedInvestment.minimumInvestment && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Đầu tư tối thiểu: <span className="font-semibold text-gray-900">₫{selectedInvestment.minimumInvestment.toLocaleString('vi-VN')}</span>
                    </p>
                    {selectedInvestment.maximumInvestment && (
                      <p className="text-sm text-gray-600 mt-1">
                        Đầu tư tối đa: <span className="font-semibold text-gray-900">₫{selectedInvestment.maximumInvestment.toLocaleString('vi-VN')}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Investment Amount */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số tiền đầu tư (VND) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  placeholder="Nhập số tiền đầu tư"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tối thiểu: ₫100,000
                </p>
              </div>

              {/* Investment Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ghi chú (Tùy chọn)
                </label>
                <textarea
                  value={investmentNotes}
                  onChange={(e) => setInvestmentNotes(e.target.value)}
                  placeholder="Thêm ghi chú về khoản đầu tư của bạn..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowInvestModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang xử lý...' : 'Xác nhận Đầu tư'}
                </button>
              </div>
            </form>
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
