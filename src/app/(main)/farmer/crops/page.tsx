'use client';

import { useState, useEffect } from 'react';
import { cropsService, Crop } from '@/lib/api/crops';
import { Sprout, MapPin, Calendar, TrendingUp, Edit2, Trash2, Plus, Filter, Eye } from 'lucide-react';
import Link from 'next/link';
import FarmerNav from '@/components/layout/FarmerNav';
import Toast from '@/components/ui/Toast';

export default function CropsManagementPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await cropsService.getCrops();
      setCrops(data);
    } catch (err: any) {
      console.error('Failed to load crops:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách cây trồng');
      setCrops([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa cây trồng "${name}"?`)) {
      return;
    }

    try {
      await cropsService.deleteCrop(id);
      setToastMessage('Xóa cây trồng thành công!');
      setToastType('success');
      setShowToast(true);
      loadCrops();
    } catch (err: any) {
      console.error('Failed to delete crop:', err);
      setToastMessage(err.response?.data?.message || 'Xóa cây trồng thất bại');
      setToastType('error');
      setShowToast(true);
    }
  };

  const getHealthBadge = (status: string) => {
    const styles: Record<string, string> = {
      EXCELLENT: 'bg-green-100 text-green-800',
      GOOD: 'bg-blue-100 text-blue-800',
      FAIR: 'bg-yellow-100 text-yellow-800',
      POOR: 'bg-orange-100 text-orange-800',
      DISEASED: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      EXCELLENT: 'Xuất sắc',
      GOOD: 'Tốt',
      FAIR: 'Trung bình',
      POOR: 'Kém',
      DISEASED: 'Bị bệnh',
    };
    return {
      style: styles[status] || 'bg-gray-100 text-gray-800',
      label: labels[status] || status
    };
  };

  const filteredCrops = crops.filter(crop => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return crop.isActive;
    if (filterStatus === 'inactive') return !crop.isActive;
    return crop.healthStatus === filterStatus;
  });

  const totalCrops = crops.length;
  const activeCrops = crops.filter(c => c.isActive).length;
  const totalArea = crops.reduce((sum, c) => sum + (c.areaPlanted || 0), 0);

  return (
    <>
      <FarmerNav />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-2xl">
                  <Sprout size={40} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Quản lý cây trồng</h1>
                  <p className="text-green-100 mt-2">Theo dõi và quản lý tất cả cây trồng của bạn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Tổng số cây trồng</p>
                  <p className="text-4xl font-bold mt-3 text-gray-900">{totalCrops}</p>
                  <p className="text-green-600 text-xs mt-2">Loại cây</p>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl shadow-lg">
                  <Sprout className="text-white" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Đang hoạt động</p>
                  <p className="text-4xl font-bold mt-3 text-gray-900">{activeCrops}</p>
                  <p className="text-blue-600 text-xs mt-2">Cây trồng</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-2xl shadow-lg">
                  <TrendingUp className="text-white" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Tổng diện tích</p>
                  <p className="text-4xl font-bold mt-3 text-gray-900">{totalArea.toFixed(1)}</p>
                  <p className="text-orange-600 text-xs mt-2">Hecta</p>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg">
                  <MapPin className="text-white" size={28} />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <Filter size={20} />
                <span>Lọc:</span>
              </div>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đang hoạt động
              </button>
              <button
                onClick={() => setFilterStatus('EXCELLENT')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterStatus === 'EXCELLENT'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Xuất sắc
              </button>
              <button
                onClick={() => setFilterStatus('GOOD')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterStatus === 'GOOD'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tốt
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-red-600 mb-6 text-lg">{error}</div>
              <button
                onClick={loadCrops}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : filteredCrops.length === 0 ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-green-300">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sprout className="text-green-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có cây trồng</h3>
              <p className="text-gray-600 mb-6 text-lg">Thêm cây trồng từ trang quản lý đất canh tác</p>
              <Link
                href="/farmer/farmlands"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <MapPin size={20} />
                Đến trang đất canh tác
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCrops.map((crop) => {
                const healthBadge = getHealthBadge(crop.healthStatus || 'GOOD');
                return (
                  <div key={crop.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl">
                            <Sprout className="text-green-600" size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {crop.cropName || crop.cropVariety?.vietnameseName || 'Cây trồng'}
                            </h3>
                            {crop.cropVariety && (
                              <p className="text-sm text-gray-600">
                                {crop.cropVariety.name}
                                {crop.cropVariety.plant && ` - ${crop.cropVariety.plant.vietnameseName}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(crop.id, crop.cropName || 'cây trồng này')}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${healthBadge.style}`}>
                            {healthBadge.label}
                          </span>
                          {!crop.isActive && (
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Không hoạt động
                            </span>
                          )}
                        </div>

                        {crop.areaPlanted && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={16} className="text-green-600" />
                            <span className="font-medium">Diện tích:</span>
                            <span>{crop.areaPlanted} hecta</span>
                          </div>
                        )}

                        {crop.plantedDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} className="text-blue-600" />
                            <span className="font-medium">Ngày trồng:</span>
                            <span>{new Date(crop.plantedDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}

                        {crop.expectedHarvest && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp size={16} className="text-orange-600" />
                            <span className="font-medium">Dự kiến thu hoạch:</span>
                            <span>{new Date(crop.expectedHarvest).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}

                        {crop.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 line-clamp-2">{crop.notes}</p>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/farmer/crops/${crop.id}`}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 font-semibold transition-all"
                      >
                        <Eye size={18} />
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
