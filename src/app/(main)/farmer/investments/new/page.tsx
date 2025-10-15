'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import FarmerNav from '@/components/layout/FarmerNav';
import Toast from '@/components/ui/Toast';
import { farmlandsService, Farmland } from '@/lib/api/farmlands';
import { farmerInvestmentsService } from '@/lib/api/farmer-investments';
import { uploadService } from '@/lib/api/upload';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Info,
  Upload,
  X,
} from 'lucide-react';

export default function NewInvestmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [loadingFarmlands, setLoadingFarmlands] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    farmlandId: undefined as number | undefined,
    title: '',
    description: '',
    investmentType: 'CROP_FUNDING' as string,
    requestedAmount: '',
    targetDate: '',
    duration: '',
    expectedReturn: '',
    minimumInvestment: '',
    maximumInvestment: '',
    repaymentTerms: '',
    riskLevel: 'MEDIUM' as string,
    riskFactors: [] as string[],
    collateral: '',
    insurance: '',
    fundingDeadline: '',
  });

  const [newRiskFactor, setNewRiskFactor] = useState('');
  const [collateralImages, setCollateralImages] = useState<File[]>([]);
  const [uploadingImages] = useState(false);

  useEffect(() => {
    loadFarmlands();
  }, []);

  const loadFarmlands = async () => {
    try {
      setLoadingFarmlands(true);
      const data = await farmlandsService.getFarmlands();
      console.log('Farmlands response:', data);
      console.log('Farmlands data:', data.data);
      console.log('Farmlands array length:', data.data?.length);

      // Handle both array and object with data property
      if (Array.isArray(data)) {
        setFarmlands(data);
      } else if (data.data && Array.isArray(data.data)) {
        setFarmlands(data.data);
      } else {
        setFarmlands([]);
      }
    } catch (error) {
      console.error('Failed to load farmlands:', error);
      setToastMessage('Không thể tải danh sách đất canh tác');
      setToastType('error');
      setShowToast(true);
      setFarmlands([]);
    } finally {
      setLoadingFarmlands(false);
    }
  };

  const investmentTypes = [
    { value: 'CROP_FUNDING', label: 'Tài trợ cây trồng', requiresFarmland: true },
    { value: 'LIVESTOCK_FUNDING', label: 'Tài trợ chăn nuôi', requiresFarmland: true },
    { value: 'EQUIPMENT_PURCHASE', label: 'Mua thiết bị', requiresFarmland: false },
    { value: 'INFRASTRUCTURE', label: 'Cơ sở hạ tầng', requiresFarmland: false },
    { value: 'EXPANSION', label: 'Mở rộng sản xuất', requiresFarmland: false },
  ];

  const riskLevels = [
    { value: 'LOW', label: 'Thấp', color: 'text-green-600' },
    { value: 'MEDIUM', label: 'Trung bình', color: 'text-yellow-600' },
    { value: 'HIGH', label: 'Cao', color: 'text-orange-600' },
    { value: 'VERY_HIGH', label: 'Rất cao', color: 'text-red-600' },
  ];

  const steps = [
    { title: 'Thông tin cơ bản', description: 'Thông tin dự án và loại đầu tư' },
    { title: 'Tài chính', description: 'Số tiền và điều kiện đầu tư' },
    { title: 'Rủi ro & Bảo đảm', description: 'Đánh giá rủi ro và tài sản thế chấp' },
    { title: 'Xác nhận', description: 'Kiểm tra và xác nhận thông tin' },
  ];

  const requiresFarmland = () => {
    const type = investmentTypes.find(t => t.value === formData.investmentType);
    return type?.requiresFarmland || false;
  };

  const isStepValid = () => {
    if (currentStep === 0) {
      if (!formData.title || !formData.investmentType) return false;
      if (requiresFarmland() && !formData.farmlandId) return false;
      return true;
    }
    if (currentStep === 1) {
      if (!formData.requestedAmount) return false;
      const amount = parseFloat(formData.requestedAmount);
      if (amount < 1000000) return false;
      if (formData.minimumInvestment && formData.maximumInvestment) {
        if (parseFloat(formData.minimumInvestment) > parseFloat(formData.maximumInvestment)) {
          return false;
        }
      }
      if (formData.maximumInvestment && parseFloat(formData.maximumInvestment) > amount) {
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      // Collateral is required
      if (!formData.collateral) return false;
      // Collateral images are required
      if (collateralImages.length === 0) return false;
      return true;
    }
    return true;
  };

  const addRiskFactor = () => {
    if (newRiskFactor.trim()) {
      setFormData({
        ...formData,
        riskFactors: [...formData.riskFactors, newRiskFactor.trim()],
      });
      setNewRiskFactor('');
    }
  };

  const removeRiskFactor = (index: number) => {
    setFormData({
      ...formData,
      riskFactors: formData.riskFactors.filter((_, i) => i !== index),
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];

    newFiles.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setToastMessage('Chỉ chấp nhận file hình ảnh');
        setToastType('error');
        setShowToast(true);
        return;
      }
      // Check file size (max 2MB to match backend)
      if (file.size > 2 * 1024 * 1024) {
        setToastMessage(`File "${file.name}" quá lớn. Kích thước tối đa là 2MB`);
        setToastType('error');
        setShowToast(true);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setCollateralImages(prev => [...prev, ...validFiles]);
    }
  };

  const removeImage = (index: number) => {
    setCollateralImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadCollateralImages = async (): Promise<string[]> => {
    if (collateralImages.length === 0) return [];

    try {
      const uploadedUrls = await uploadService.uploadMultipleImages(collateralImages);
      const urls = uploadedUrls.map(result => result.url);
      return urls;
    } catch (error) {
      console.error('Failed to upload images:', error);
      throw new Error('Không thể tải lên hình ảnh tài sản thế chấp');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Upload collateral images first
      let imageUrls: string[] = [];
      if (collateralImages.length > 0) {
        try {
          imageUrls = await uploadCollateralImages();
        } catch {
          setToastMessage('Không thể tải lên hình ảnh tài sản thế chấp');
          setToastType('error');
          setShowToast(true);
          setLoading(false);
          return;
        }
      }

      const submitData: {
        title: string;
        description?: string;
        investmentType: string;
        requestedAmount: number;
        farmlandId?: number;
        targetDate?: string;
        duration?: number;
        expectedReturn?: number;
        minimumInvestment?: number;
        maximumInvestment?: number;
        repaymentTerms?: string;
        riskLevel: string;
        riskFactors?: string[];
        collateral?: string;
        insurance?: string;
        fundingDeadline?: string;
        images?: string[];
      } = {
        title: formData.title,
        description: formData.description || undefined,
        investmentType: formData.investmentType,
        requestedAmount: parseFloat(formData.requestedAmount),
        farmlandId: formData.farmlandId || undefined,
        targetDate: formData.targetDate || undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        expectedReturn: formData.expectedReturn ? parseFloat(formData.expectedReturn) : undefined,
        minimumInvestment: formData.minimumInvestment ? parseFloat(formData.minimumInvestment) : undefined,
        maximumInvestment: formData.maximumInvestment ? parseFloat(formData.maximumInvestment) : undefined,
        repaymentTerms: formData.repaymentTerms || undefined,
        riskLevel: formData.riskLevel,
        riskFactors: formData.riskFactors.length > 0 ? formData.riskFactors : undefined,
        collateral: formData.collateral || undefined,
        insurance: formData.insurance || undefined,
        fundingDeadline: formData.fundingDeadline || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      await farmerInvestmentsService.createInvestment(submitData);

      setToastMessage('Tạo dự án thành công! Đang chờ admin phê duyệt.');
      setToastType('success');
      setShowToast(true);

      setTimeout(() => {
        router.push('/farmer/investments');
      }, 2000);
    } catch (error: unknown) {
      console.error('Failed to create investment:', error);
      const err = error as { response?: { data?: { message?: string } } };
      setToastMessage(err.response?.data?.message || 'Tạo dự án thất bại');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (loadingFarmlands) {
    return (
      <>
        <FarmerNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FarmerNav />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/farmer/investments')}
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-4 transition-all"
            >
              <ArrowLeft size={20} />
              Quay lại danh sách
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Tạo dự án đầu tư mới</h1>
            <p className="text-gray-600 mt-2">Tạo dự án kêu gọi đầu tư cho trang trại của bạn</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        index < currentStep
                          ? 'bg-green-600 text-white'
                          : index === currentStep
                          ? 'bg-green-600 text-white ring-4 ring-green-200'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index < currentStep ? <Check size={20} /> : index + 1}
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 transition-all ${
                        index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Step 0: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên dự án <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="VD: Dự án trồng lúa hữu cơ mùa Xuân 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại dự án <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.investmentType}
                    onChange={(e) => setFormData({ ...formData, investmentType: e.target.value, farmlandId: undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {investmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {requiresFarmland() && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chọn đất canh tác <span className="text-red-600">*</span>
                    </label>
                    {farmlands.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="text-sm font-medium text-yellow-900">
                              Bạn chưa có đất canh tác nào
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Vui lòng tạo đất canh tác trước khi tạo dự án loại này
                            </p>
                            <button
                              onClick={() => router.push('/farmer/farmlands/new')}
                              className="mt-2 text-sm font-semibold text-yellow-900 hover:text-yellow-800 underline"
                            >
                              Tạo đất canh tác ngay
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={formData.farmlandId || ''}
                        onChange={(e) => setFormData({ ...formData, farmlandId: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">-- Chọn đất canh tác --</option>
                        {farmlands.map((farmland) => (
                          <option key={farmland.id} value={farmland.id}>
                            {farmland.name} ({farmland.size} hecta)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả dự án
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Mô tả chi tiết về dự án, mục tiêu, kế hoạch thực hiện..."
                  />
                </div>
              </div>
            )}

            {/* Step 1: Financial Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số tiền cần gọi vốn (VNĐ) <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      value={formData.requestedAmount}
                      onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="100000000"
                      min="1000000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tối thiểu: 1,000,000 VNĐ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Đầu tư tối thiểu (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={formData.minimumInvestment}
                      onChange={(e) => setFormData({ ...formData, minimumInvestment: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="5000000"
                      min="100000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Đầu tư tối đa (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={formData.maximumInvestment}
                      onChange={(e) => setFormData({ ...formData, maximumInvestment: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="50000000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lợi nhuận kỳ vọng (%)
                    </label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        value={formData.expectedReturn}
                        onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="15"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Thời gian (tháng)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="12"
                        min="1"
                        max="60"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày hoàn thành dự kiến
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hạn chót gọi vốn
                    </label>
                    <input
                      type="date"
                      value={formData.fundingDeadline}
                      onChange={(e) => setFormData({ ...formData, fundingDeadline: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Điều khoản hoàn trả
                  </label>
                  <textarea
                    value={formData.repaymentTerms}
                    onChange={(e) => setFormData({ ...formData, repaymentTerms: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="VD: Hoàn trả hàng tháng trong 12 tháng với lãi suất 15%/năm"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Risk & Collateral */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mức độ rủi ro
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {riskLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, riskLevel: level.value })}
                        className={`p-3 border-2 rounded-xl font-semibold transition-all ${
                          formData.riskLevel === level.value
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <span className={level.color}>{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Các yếu tố rủi ro
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newRiskFactor}
                      onChange={(e) => setNewRiskFactor(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRiskFactor())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="VD: Phụ thuộc thời tiết"
                    />
                    <button
                      type="button"
                      onClick={addRiskFactor}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold"
                    >
                      Thêm
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.riskFactors.map((factor, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                      >
                        {factor}
                        <button
                          type="button"
                          onClick={() => removeRiskFactor(index)}
                          className="hover:text-red-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tài sản thế chấp <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={formData.collateral}
                    onChange={(e) => setFormData({ ...formData, collateral: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="VD: Sổ đỏ đất nông nghiệp trị giá 200,000,000 VNĐ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hình ảnh tài sản thế chấp <span className="text-red-600">*</span>
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-500 transition-all bg-gray-50 hover:bg-green-50">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="text-gray-400" size={32} />
                            <p className="text-sm font-medium text-gray-700">
                              Nhấp để chọn hình ảnh
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, JPEG (tối đa 2MB mỗi file)
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {collateralImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {collateralImages.map((file, index) => (
                          <div
                            key={index}
                            className="relative group bg-gray-100 rounded-xl p-2 border border-gray-200"
                          >
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Collateral ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {collateralImages.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="text-yellow-600 flex-shrink-0" size={18} />
                          <p className="text-sm text-yellow-800">
                            Vui lòng tải lên ít nhất 1 hình ảnh tài sản thế chấp
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bảo hiểm
                  </label>
                  <textarea
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="VD: Bảo hiểm nông nghiệp bảo vệ mất mùa lên đến 80%"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Lưu ý quan trọng</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Dự án của bạn sẽ được gửi đến admin để phê duyệt. Sau khi được phê duyệt, dự án sẽ xuất
                        hiện trên nền tảng và các nhà đầu tư có thể bắt đầu đầu tư.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="font-bold text-gray-900 mb-4">Thông tin dự án</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Tên dự án:</p>
                      <p className="font-semibold">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Loại dự án:</p>
                      <p className="font-semibold">
                        {investmentTypes.find((t) => t.value === formData.investmentType)?.label}
                      </p>
                    </div>
                    {formData.farmlandId && (
                      <div>
                        <p className="text-gray-600">Đất canh tác:</p>
                        <p className="font-semibold">
                          {farmlands.find((f) => f.id === formData.farmlandId)?.name}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Số tiền cần gọi:</p>
                      <p className="font-semibold text-green-600">
                        {parseFloat(formData.requestedAmount).toLocaleString()} VNĐ
                      </p>
                    </div>
                    {formData.expectedReturn && (
                      <div>
                        <p className="text-gray-600">Lợi nhuận kỳ vọng:</p>
                        <p className="font-semibold">{formData.expectedReturn}%</p>
                      </div>
                    )}
                    {formData.duration && (
                      <div>
                        <p className="text-gray-600">Thời gian:</p>
                        <p className="font-semibold">{formData.duration} tháng</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Mức độ rủi ro:</p>
                      <p className="font-semibold">
                        {riskLevels.find((r) => r.value === formData.riskLevel)?.label}
                      </p>
                    </div>
                  </div>

                  {formData.collateral && (
                    <div className="col-span-2 mt-4 pt-4 border-t border-green-200">
                      <p className="text-gray-600 mb-2">Tài sản thế chấp:</p>
                      <p className="text-sm text-gray-700">{formData.collateral}</p>
                    </div>
                  )}

                  {collateralImages.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-gray-600 mb-3">Hình ảnh tài sản thế chấp ({collateralImages.length} ảnh):</p>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {collateralImages.map((file, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border border-green-200 relative">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`Collateral ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Quay lại
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp tục
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || uploadingImages}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading || uploadingImages ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    {uploadingImages ? 'Đang tải ảnh...' : 'Đang tạo...'}
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Tạo dự án
                  </>
                )}
              </button>
            )}
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
    </>
  );
}
