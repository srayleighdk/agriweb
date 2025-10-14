'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FarmerNav from '@/components/layout/FarmerNav';
import { MapPin, ArrowRight, ArrowLeft, Check, Droplet, Zap, AlertCircle } from 'lucide-react';
import { farmlandsService } from '@/lib/api/farmlands';
import { farmerService } from '@/lib/api/farmer';
import { tinhService, Tinh, Xa } from '@/lib/api/tinh';
import Toast from '@/components/ui/Toast';
import dynamic from 'next/dynamic';

const GoogleMapPicker = dynamic(() => import('@/components/maps/GoogleMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
});

export default function NewFarmlandPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startWithMap = searchParams.get('step') === 'map';
  const isOnboarding = searchParams.get('onboarding') === 'true';

  const [currentStep, setCurrentStep] = useState(startWithMap ? 0 : 0);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    farmlandType: 'CROP' as 'CROP' | 'LIVESTOCK' | 'MIX',
    soilType: '',
    address: '',
    province: '',
    commune: '',
    latitude: null as number | null,
    longitude: null as number | null,
    irrigationAccess: false,
    electricityAccess: false,
  });
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [provinces, setProvinces] = useState<Tinh[]>([]);
  const [communes, setCommunes] = useState<Xa[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [streetAddress, setStreetAddress] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Initialize map when component mounts
    setTimeout(() => setMapReady(true), 500);

    // Load provinces
    loadProvinces();
  }, []);

  useEffect(() => {
    // Load communes when province changes
    if (selectedProvinceId) {
      loadCommunes(selectedProvinceId);
    } else {
      setCommunes([]);
      setFormData({ ...formData, commune: '' });
    }
  }, [selectedProvinceId]);

  const loadProvinces = async () => {
    try {
      const data = await tinhService.getAllProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Failed to load provinces:', error);
    }
  };

  const loadCommunes = async (provinceId: number) => {
    try {
      const data = await tinhService.getCommunesByProvinceId(provinceId);
      setCommunes(data);
    } catch (error) {
      console.error('Failed to load communes:', error);
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = parseInt(e.target.value);
    const province = provinces.find(p => p.id === provinceId);

    if (province) {
      setSelectedProvinceId(provinceId);
      setFormData({ ...formData, province: province.tenTinh, commune: '' });
    } else {
      setSelectedProvinceId(null);
      setFormData({ ...formData, province: '', commune: '' });
    }
  };

  const handleCommuneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const communeId = parseInt(e.target.value);
    const commune = communes.find(c => c.id === communeId);

    if (commune) {
      // Build full address: "Street Address, Xa, Tinh"
      const fullAddress = streetAddress
        ? `${streetAddress}, ${commune.ten}, ${formData.province}`
        : `${commune.ten}, ${formData.province}`;
      setFormData({ ...formData, commune: commune.ten, address: fullAddress });
    } else {
      setFormData({ ...formData, commune: '', address: '' });
    }
  };

  const handleStreetAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const street = e.target.value;
    setStreetAddress(street);

    // Update full address if commune and province are selected
    if (formData.commune && formData.province) {
      const fullAddress = street
        ? `${street}, ${formData.commune}, ${formData.province}`
        : `${formData.commune}, ${formData.province}`;
      setFormData({ ...formData, address: fullAddress });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Prepare data for submission
      const submitData: any = {
        name: formData.name,
        size: parseFloat(formData.size),
        farmlandType: formData.farmlandType,
        soilType: formData.soilType || undefined,
        address: formData.address || undefined,
        province: formData.province || undefined,
        commune: formData.commune || undefined,
        irrigationAccess: formData.irrigationAccess,
        electricityAccess: formData.electricityAccess,
      };

      // Convert latitude/longitude to coordinates string
      if (formData.latitude !== null && formData.longitude !== null) {
        submitData.coordinates = `${formData.latitude},${formData.longitude}`;
      }

      await farmlandsService.createFarmland(submitData);

      // Show success notification
      setToastMessage('Tạo đất canh tác thành công!');
      setToastType('success');
      setShowToast(true);

      // Navigate to dashboard if onboarding, otherwise to farmlands page after a brief delay
      setTimeout(() => {
        if (isOnboarding) {
          router.push('/farmer/dashboard');
        } else {
          router.push('/farmer/farmlands');
        }
      }, 1500);
    } catch (error: any) {
      console.error('Failed to create farmland:', error);
      setToastMessage(error.response?.data?.message || 'Tạo đất canh tác thất bại');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Chọn vị trí trên bản đồ',
      description: 'Nhấp vào bản đồ để đánh dấu vị trí trang trại của bạn',
    },
    {
      title: 'Thông tin cơ bản',
      description: 'Nhập thông tin về đất canh tác của bạn',
    },
    {
      title: 'Tiện ích & Xác nhận',
      description: 'Thêm thông tin về nguồn nước, điện và xác nhận',
    },
  ];

  const isStepValid = () => {
    if (currentStep === 0) {
      return formData.latitude !== null && formData.longitude !== null;
    }
    if (currentStep === 1) {
      return formData.name && formData.size && formData.farmlandType;
    }
    return true;
  };

  return (
    <>
      <FarmerNav />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isOnboarding ? '🌱 Chào mừng! Hãy tạo đất canh tác đầu tiên' : 'Thêm đất canh tác mới'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isOnboarding
                ? 'Để bắt đầu, hãy thêm thông tin về đất canh tác của bạn'
                : 'Hoàn thành các bước để thêm đất canh tác của bạn'}
            </p>
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
            {/* Step 0: Map Selection */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-600 p-3 rounded-xl">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Cách chọn vị trí</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                          <span>Nhấp vào bản đồ bên dưới để đánh dấu vị trí trang trại</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                          <span>Bạn có thể di chuyển và phóng to/thu nhỏ bản đồ</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                          <span>Nhấp vào vị trí khác để thay đổi vị trí đánh dấu</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Google Map */}
                <div className="relative h-[600px] rounded-xl border-2 border-green-300 overflow-hidden shadow-lg">
                  <GoogleMapPicker
                    onLocationSelect={handleMapClick}
                    selectedLat={formData.latitude}
                    selectedLng={formData.longitude}
                  />

                  {/* Instruction overlay - only show before first click */}
                  {!formData.latitude && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border-2 border-green-200">
                        <MapPin className="mx-auto text-green-600 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Nhấp vào bản đồ
                        </h3>
                        <p className="text-sm text-gray-600">
                          để đánh dấu vị trí trang trại của bạn
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {formData.latitude && formData.longitude && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-green-900 mb-2">✅ Vị trí đã được chọn</p>
                    <p className="text-xs text-green-700">
                      Tọa độ: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên đất canh tác <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="VD: Vườn rau Minh Tân"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Diện tích (hecta) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="VD: 2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Loại đất <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.farmlandType}
                      onChange={(e) => setFormData({ ...formData, farmlandType: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="CROP">Trồng trọt</option>
                      <option value="LIVESTOCK">Chăn nuôi</option>
                      <option value="MIX">Hỗn hợp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại đất canh tác
                  </label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Chọn loại đất --</option>
                    <option value="ALLUVIAL">Đất phù sa</option>
                    <option value="LATERITE">Đất đỏ bazan</option>
                    <option value="GREY_SOIL">Đất xám</option>
                    <option value="SANDY">Đất cát</option>
                    <option value="ACID_SULFATE_SOIL">Đất phèn</option>
                    <option value="SALINE_SOIL">Đất mặn</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      value={selectedProvinceId || ''}
                      onChange={handleProvinceChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">-- Chọn tỉnh/thành phố --</option>
                      {provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.tenTinh}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Xã/Phường
                    </label>
                    <select
                      value={communes.find(c => c.ten === formData.commune)?.id || ''}
                      onChange={handleCommuneChange}
                      disabled={!selectedProvinceId}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Chọn xã/phường --</option>
                      {communes.map((commune) => (
                        <option key={commune.id} value={commune.id}>
                          {commune.ten}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ chi tiết (Số nhà, đường/thôn/ấp)
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={handleStreetAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="VD: Số 123 Đường ABC, Thôn 5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Nhập địa chỉ cụ thể của bạn</p>
                  </div>

                  {formData.address && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-green-900 mb-2">
                        Địa chỉ đầy đủ
                      </label>
                      <p className="text-sm text-green-800">{formData.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Utilities & Confirmation */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tiện ích hiện có</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.irrigationAccess}
                        onChange={(e) => setFormData({ ...formData, irrigationAccess: e.target.checked })}
                        className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Droplet className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Nguồn nước tưới</p>
                          <p className="text-sm text-gray-600">Có hệ thống tưới tiêu</p>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={formData.electricityAccess}
                        onChange={(e) => setFormData({ ...formData, electricityAccess: e.target.checked })}
                        className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                          <Zap className="text-yellow-600" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Điện lưới</p>
                          <p className="text-sm text-gray-600">Có nguồn điện sử dụng</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="font-bold text-gray-900 mb-4">Xem lại thông tin</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Tên đất:</p>
                      <p className="font-semibold">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Diện tích:</p>
                      <p className="font-semibold">{formData.size} hecta</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Loại đất:</p>
                      <p className="font-semibold">
                        {formData.farmlandType === 'CROP' ? 'Trồng trọt' : formData.farmlandType === 'LIVESTOCK' ? 'Chăn nuôi' : 'Hỗn hợp'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vị trí:</p>
                      <p className="font-semibold text-xs">
                        {formData.latitude?.toFixed(4)}, {formData.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
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
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Hoàn thành
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
