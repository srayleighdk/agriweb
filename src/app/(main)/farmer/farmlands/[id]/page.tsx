'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { farmlandsService, Farmland } from '@/lib/api/farmlands';
import FarmerNav from '@/components/layout/FarmerNav';
import AddCropModal from '@/components/farmer/AddCropModal';
import AddLivestockModal from '@/components/farmer/AddLivestockModal';
import Toast from '@/components/ui/Toast';
import {
  MapPin, ArrowLeft, Edit, Trash2, Sprout, Beef,
  Droplet, Zap, Calendar, Gauge, Map, Plus
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const GoogleMapPicker = dynamic(() => import('@/components/maps/GoogleMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải bản đồ...</p>
      </div>
    </div>
  ),
});

export default function FarmlandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const farmlandId = parseInt(params.id as string);

  const [farmland, setFarmland] = useState<Farmland | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [showAddLivestockModal, setShowAddLivestockModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Parse coordinates if available
  const coordinates = farmland?.coordinates
    ? farmland.coordinates.split(',').map(c => parseFloat(c.trim()))
    : null;
  const latitude = coordinates?.[0] || null;
  const longitude = coordinates?.[1] || null;

  useEffect(() => {
    loadFarmland();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmlandId]);

  const loadFarmland = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await farmlandsService.getFarmlandById(farmlandId);
      setFarmland(data);
    } catch (err) {
      console.error('Failed to load farmland:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Không thể tải thông tin đất canh tác');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!farmland) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa "${farmland.name}"?`)) return;

    try {
      await farmlandsService.deleteFarmland(farmlandId);
      setToastMessage('Đã xóa đất canh tác thành công!');
      setToastType('success');
      setShowToast(true);

      // Navigate after brief delay
      setTimeout(() => {
        router.push('/farmer/farmlands');
      }, 1500);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setToastMessage(error.response?.data?.message || 'Xóa thất bại');
      setToastType('error');
      setShowToast(true);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      CROP: 'Trồng trọt',
      LIVESTOCK: 'Chăn nuôi',
      MIX: 'Hỗn hợp',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getSoilTypeLabel = (type: string) => {
    const labels = {
      ALLUVIAL: 'Đất phù sa',
      LATERITE: 'Đất đỏ bazan',
      GREY_SOIL: 'Đất xám',
      SANDY: 'Đất cát',
      ACID_SULFATE_SOIL: 'Đất phèn',
      SALINE_SOIL: 'Đất mặn',
      OTHER: 'Khác',
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
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

  if (error || !farmland) {
    return (
      <>
        <FarmerNav />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-red-600 mb-6 text-lg">{error || 'Không tìm thấy đất canh tác'}</div>
              <Link
                href="/farmer/farmlands"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all"
              >
                <ArrowLeft size={20} />
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FarmerNav />
      {showAddCropModal && (
        <AddCropModal
          farmlandId={farmlandId}
          onClose={() => setShowAddCropModal(false)}
          onSuccess={loadFarmland}
        />
      )}
      {showAddLivestockModal && (
        <AddLivestockModal
          farmlandId={farmlandId}
          onClose={() => setShowAddLivestockModal(false)}
          onSuccess={loadFarmland}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/farmer/farmlands"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-4 transition-all"
            >
              <ArrowLeft size={20} />
              Quay lại danh sách
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{farmland.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Gauge size={18} />
                    {farmland.size} hecta
                  </span>
                  <span>•</span>
                  <span>{getTypeLabel(farmland.farmlandType)}</span>
                  {farmland.createdAt && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={18} />
                        {new Date(farmland.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/farmer/farmlands/${farmlandId}/edit`}
                  className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-xl hover:bg-green-50 font-semibold transition-all flex items-center gap-2"
                >
                  <Edit size={18} />
                  Chỉnh sửa
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 font-semibold transition-all flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Xóa
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map */}
              {latitude && longitude && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Map className="text-green-600" size={24} />
                    Vị trí trên bản đồ
                  </h2>
                  <div className="h-[400px] rounded-xl overflow-hidden border-2 border-green-200">
                    <GoogleMapPicker
                      onLocationSelect={() => {}}
                      selectedLat={latitude}
                      selectedLng={longitude}
                    />
                  </div>
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-900">
                      <span className="font-semibold">Tọa độ:</span> {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cơ bản</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Diện tích</p>
                    <p className="text-lg font-semibold text-gray-900">{farmland.size} hecta</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Loại hình</p>
                    <p className="text-lg font-semibold text-gray-900">{getTypeLabel(farmland.farmlandType)}</p>
                  </div>
                  {farmland.soilType && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Loại đất</p>
                      <p className="text-lg font-semibold text-gray-900">{getSoilTypeLabel(farmland.soilType)}</p>
                    </div>
                  )}
                  {farmland.landUseCertificateNo && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Số sổ đỏ</p>
                      <p className="text-lg font-semibold text-gray-900">{farmland.landUseCertificateNo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              {(farmland.address || farmland.province || farmland.commune) && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="text-green-600" size={24} />
                    Địa chỉ
                  </h2>
                  <div className="space-y-3">
                    {farmland.address && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Địa chỉ đầy đủ</p>
                        <p className="text-lg text-gray-900">{farmland.address}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {farmland.province && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Tỉnh/Thành phố</p>
                          <p className="text-base font-medium text-gray-900">{farmland.province}</p>
                        </div>
                      )}
                      {farmland.commune && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Xã/Phường</p>
                          <p className="text-base font-medium text-gray-900">{farmland.commune}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Infrastructure */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cơ sở hạ tầng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border-2 ${farmland.irrigationAccess ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <Droplet className={farmland.irrigationAccess ? 'text-blue-600' : 'text-gray-400'} size={24} />
                      <div>
                        <p className="font-semibold text-gray-900">Nguồn nước tưới</p>
                        <p className={`text-sm ${farmland.irrigationAccess ? 'text-blue-600' : 'text-gray-500'}`}>
                          {farmland.irrigationAccess ? 'Có sẵn' : 'Không có'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl border-2 ${farmland.electricityAccess ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <Zap className={farmland.electricityAccess ? 'text-yellow-600' : 'text-gray-400'} size={24} />
                      <div>
                        <p className="font-semibold text-gray-900">Điện lưới</p>
                        <p className={`text-sm ${farmland.electricityAccess ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {farmland.electricityAccess ? 'Có sẵn' : 'Không có'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Thống kê</h2>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Sprout className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cây trồng</p>
                          <p className="text-2xl font-bold text-gray-900">{farmland.crops?.length || 0}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAddCropModal(true)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <Beef className="text-orange-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Vật nuôi</p>
                          <p className="text-2xl font-bold text-gray-900">{farmland.livestock?.length || 0}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAddLivestockModal(true)}
                        className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Hành động</h2>
                <div className="space-y-3">
                  <Link
                    href="/farmer/crops"
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Sprout size={18} />
                    Quản lý cây trồng
                  </Link>
                  <Link
                    href="/farmer/livestock"
                    className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Beef size={18} />
                    Quản lý vật nuôi
                  </Link>
                </div>
              </div>
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
    </>
  );
}
