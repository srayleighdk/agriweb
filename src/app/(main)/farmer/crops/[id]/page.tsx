'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cropsService, Crop } from '@/lib/api/crops';
import { Sprout, MapPin, Calendar, TrendingUp, Edit2, Trash2, ArrowLeft, Leaf, Sun, Droplet, AlertCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import FarmerNav from '@/components/layout/FarmerNav';
import Toast from '@/components/ui/Toast';
import AddCropDiaryModal from '@/components/farmer/AddCropDiaryModal';

export default function CropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cropId = parseInt(params.id as string);

  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showAddDiaryModal, setShowAddDiaryModal] = useState(false);

  useEffect(() => {
    loadCrop();
  }, [cropId]);

  const loadCrop = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await cropsService.getCropById(cropId);
      setCrop(data);
    } catch (err: any) {
      console.error('Failed to load crop:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin cây trồng');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!crop || !confirm(`Bạn có chắc muốn xóa cây trồng "${crop.cropName || 'này'}"?`)) {
      return;
    }

    try {
      await cropsService.deleteCrop(cropId);
      setToastMessage('Xóa cây trồng thành công!');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => {
        router.push('/farmer/crops');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to delete crop:', err);
      setToastMessage(err.response?.data?.message || 'Xóa cây trồng thất bại');
      setToastType('error');
      setShowToast(true);
    }
  };

  const getHealthBadge = (status: string) => {
    const styles: Record<string, string> = {
      EXCELLENT: 'bg-green-100 text-green-800 border-green-300',
      GOOD: 'bg-blue-100 text-blue-800 border-blue-300',
      FAIR: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      POOR: 'bg-orange-100 text-orange-800 border-orange-300',
      DISEASED: 'bg-red-100 text-red-800 border-red-300',
    };
    const labels: Record<string, string> = {
      EXCELLENT: 'Xuất sắc',
      GOOD: 'Tốt',
      FAIR: 'Trung bình',
      POOR: 'Kém',
      DISEASED: 'Bị bệnh',
    };
    return {
      style: styles[status] || 'bg-gray-100 text-gray-800 border-gray-300',
      label: labels[status] || status
    };
  };

  const calculateDaysUntilHarvest = () => {
    if (!crop?.expectedHarvest) return null;
    const today = new Date();
    const harvestDate = new Date(crop.expectedHarvest);
    const diffTime = harvestDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateDaysSincePlanted = () => {
    if (!crop?.plantedDate) return null;
    const today = new Date();
    const plantedDate = new Date(crop.plantedDate);
    const diffTime = today.getTime() - plantedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <>
        <FarmerNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !crop) {
    return (
      <>
        <FarmerNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-6 text-lg">{error || 'Không tìm thấy cây trồng'}</div>
            <Link
              href="/farmer/crops"
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </>
    );
  }

  const healthBadge = getHealthBadge(crop.healthStatus || 'GOOD');
  const daysUntilHarvest = calculateDaysUntilHarvest();
  const daysSincePlanted = calculateDaysSincePlanted();

  return (
    <>
      <FarmerNav />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link
            href="/farmer/crops"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
          >
            <ArrowLeft size={20} />
            Quay lại danh sách cây trồng
          </Link>

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-2xl">
                  <Sprout size={40} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">
                    {crop.cropName || crop.cropVariety?.vietnameseName || 'Chi tiết cây trồng'}
                  </h1>
                  {crop.cropVariety && (
                    <p className="text-green-100 mt-2">
                      {crop.cropVariety.name}
                      {crop.cropVariety.plant && ` - ${crop.cropVariety.plant.vietnameseName}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddDiaryModal(true)}
                  className="px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 font-semibold transition-all flex items-center gap-2"
                >
                  <BookOpen size={20} />
                  Thêm nhật ký
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-all flex items-center gap-2"
                >
                  <Trash2 size={20} />
                  Xóa
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Leaf className="text-green-600" size={24} />
                  Tình trạng cây trồng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <p className="text-sm text-gray-600 font-semibold mb-2">Tình trạng sức khỏe</p>
                    <span className={`inline-block px-4 py-2 text-sm font-bold rounded-xl border-2 ${healthBadge.style}`}>
                      {healthBadge.label}
                    </span>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border-2 border-blue-200">
                    <p className="text-sm text-gray-600 font-semibold mb-2">Trạng thái hoạt động</p>
                    <span className={`inline-block px-4 py-2 text-sm font-bold rounded-xl border-2 ${
                      crop.isActive
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`}>
                      {crop.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Area & Location */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="text-blue-600" size={24} />
                  Thông tin diện tích
                </h2>
                <div className="space-y-4">
                  {crop.areaPlanted && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                      <span className="text-gray-700 font-semibold">Diện tích trồng</span>
                      <span className="text-2xl font-bold text-blue-600">{crop.areaPlanted} hecta</span>
                    </div>
                  )}
                  {crop.farmland && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Đất canh tác</p>
                      <Link
                        href={`/farmer/farmlands/${crop.farmlandId}`}
                        className="text-lg font-bold text-green-600 hover:text-green-700 hover:underline"
                      >
                        {crop.farmland.name}
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="text-orange-600" size={24} />
                  Thời gian
                </h2>
                <div className="space-y-4">
                  {crop.plantedDate && (
                    <div className="p-4 bg-orange-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-semibold">Ngày gieo trồng</span>
                        <span className="text-lg font-bold text-orange-600">
                          {new Date(crop.plantedDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {daysSincePlanted !== null && (
                        <p className="text-sm text-gray-600">
                          {daysSincePlanted} ngày kể từ khi trồng
                        </p>
                      )}
                    </div>
                  )}
                  {crop.expectedHarvest && (
                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-semibold">Dự kiến thu hoạch</span>
                        <span className="text-lg font-bold text-green-600">
                          {new Date(crop.expectedHarvest).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {daysUntilHarvest !== null && (
                        <p className="text-sm text-gray-600">
                          {daysUntilHarvest > 0
                            ? `Còn ${daysUntilHarvest} ngày`
                            : daysUntilHarvest === 0
                            ? 'Hôm nay!'
                            : `Đã qua ${Math.abs(daysUntilHarvest)} ngày`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {crop.notes && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="text-purple-600" size={24} />
                    Ghi chú
                  </h2>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-gray-700 whitespace-pre-wrap">{crop.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Variety Info */}
              {crop.cropVariety && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin giống</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Tên tiếng Việt</p>
                      <p className="font-bold text-gray-900">{crop.cropVariety.vietnameseName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tên khoa học</p>
                      <p className="font-bold text-gray-900 italic">{crop.cropVariety.name}</p>
                    </div>
                    {crop.cropVariety.plant && (
                      <>
                        <div className="border-t pt-3 mt-3">
                          <p className="text-sm text-gray-600">Loại cây</p>
                          <p className="font-bold text-gray-900">{crop.cropVariety.plant.vietnameseName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tên khoa học (Loài)</p>
                          <p className="font-bold text-gray-900 italic">{crop.cropVariety.plant.scientificName}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-lg p-6 border-2 border-green-300">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">ID:</span>
                    <span className="font-bold text-gray-900">#{crop.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Ngày tạo:</span>
                    <span className="font-bold text-gray-900">
                      {new Date(crop.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Cập nhật:</span>
                    <span className="font-bold text-gray-900">
                      {new Date(crop.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAddDiaryModal && (
        <AddCropDiaryModal
          cropId={cropId}
          onClose={() => setShowAddDiaryModal(false)}
          onSuccess={(message) => {
            loadCrop();
            setToastMessage(message);
            setToastType('success');
            setShowToast(true);
          }}
          onError={(message) => {
            setToastMessage(message);
            setToastType('error');
            setShowToast(true);
          }}
        />
      )}

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
