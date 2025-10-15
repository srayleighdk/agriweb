'use client';

import { useState, useEffect } from 'react';
import { livestockService, Livestock } from '@/lib/api/livestock';
import { Beef, MapPin, Calendar, TrendingUp, Trash2, Filter, DollarSign, Eye } from 'lucide-react';
import Link from 'next/link';
import FarmerNav from '@/components/layout/FarmerNav';
import Toast from '@/components/ui/Toast';

export default function LivestockManagementPage() {
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadLivestock();
  }, []);

  const loadLivestock = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await livestockService.getLivestock();
      setLivestock(data);
    } catch (err: unknown) {
      console.error('Failed to load livestock:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Không thể tải danh sách vật nuôi');
      setLivestock([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa vật nuôi "${name}"?`)) {
      return;
    }

    try {
      await livestockService.deleteLivestock(id);
      setToastMessage('Xóa vật nuôi thành công!');
      setToastType('success');
      setShowToast(true);
      loadLivestock();
    } catch (err: unknown) {
      console.error('Failed to delete livestock:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setToastMessage(error.response?.data?.message || 'Xóa vật nuôi thất bại');
      setToastType('error');
      setShowToast(true);
    }
  };

  const getHealthBadge = (status: string) => {
    const styles: Record<string, string> = {
      HEALTHY: 'bg-green-100 text-green-800',
      SICK: 'bg-red-100 text-red-800',
      RECOVERING: 'bg-yellow-100 text-yellow-800',
    };
    const labels: Record<string, string> = {
      HEALTHY: 'Khỏe mạnh',
      SICK: 'Bị bệnh',
      RECOVERING: 'Đang hồi phục',
    };
    return {
      style: styles[status] || 'bg-gray-100 text-gray-800',
      label: labels[status] || status
    };
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const filteredLivestock = livestock.filter(item => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return item.isActive;
    if (filterStatus === 'inactive') return !item.isActive;
    return item.healthStatus === filterStatus;
  });

  const totalLivestock = livestock.length;
  const activeLivestock = livestock.filter(l => l.isActive).length;
  const totalCount = livestock.reduce((sum, l) => sum + l.count, 0);
  const totalValue = livestock.reduce((sum, l) => sum + (l.currentValue || 0), 0);

  return (
    <>
      <FarmerNav />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-2xl">
                  <Beef size={40} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Quản lý vật nuôi</h1>
                  <p className="text-orange-100 mt-2">Theo dõi và quản lý tất cả vật nuôi của bạn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Tổng đàn</p>
                  <p className="text-4xl font-bold mt-3 text-gray-900">{totalLivestock}</p>
                  <p className="text-orange-600 text-xs mt-2">Đàn vật nuôi</p>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg">
                  <Beef className="text-white" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Đang hoạt động</p>
                  <p className="text-4xl font-bold mt-3 text-gray-900">{activeLivestock}</p>
                  <p className="text-blue-600 text-xs mt-2">Đàn</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-2xl shadow-lg">
                  <TrendingUp className="text-white" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Tổng số lượng</p>
                  <p className="text-4xl font-bold mt-3 text-gray-900">{totalCount}</p>
                  <p className="text-green-600 text-xs mt-2">Con vật</p>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl shadow-lg">
                  <MapPin className="text-white" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Tổng giá trị</p>
                  <p className="text-2xl font-bold mt-3 text-gray-900">
                    {(totalValue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-purple-600 text-xs mt-2">VNĐ</p>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-2xl shadow-lg">
                  <DollarSign className="text-white" size={28} />
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
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterStatus === 'active'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đang hoạt động
              </button>
              <button
                onClick={() => setFilterStatus('HEALTHY')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterStatus === 'HEALTHY'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Khỏe mạnh
              </button>
              <button
                onClick={() => setFilterStatus('SICK')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterStatus === 'SICK'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bị bệnh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-red-600 mb-6 text-lg">{error}</div>
              <button
                onClick={loadLivestock}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : filteredLivestock.length === 0 ? (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-orange-300">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Beef className="text-orange-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có vật nuôi</h3>
              <p className="text-gray-600 mb-6 text-lg">Thêm vật nuôi từ trang quản lý đất canh tác</p>
              <Link
                href="/farmer/farmlands"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <MapPin size={20} />
                Đến trang đất canh tác
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLivestock.map((item) => {
                const healthBadge = getHealthBadge(item.healthStatus || 'HEALTHY');
                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl">
                            <Beef className="text-orange-600" size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {item.name || item.livestockBreed?.vietnameseName || 'Vật nuôi'}
                            </h3>
                            {item.livestockBreed && (
                              <p className="text-sm text-gray-600">
                                {item.livestockBreed.breedName}
                                {item.livestockBreed.animalSpecies && ` - ${item.livestockBreed.animalSpecies.vietnameseName}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(item.id, item.name || 'vật nuôi này')}
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
                          {!item.isActive && (
                            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Không hoạt động
                            </span>
                          )}
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">Số lượng:</span>
                            <span className="text-2xl font-bold text-orange-600">{item.count}</span>
                          </div>
                        </div>

                        {item.dateAcquired && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} className="text-blue-600" />
                            <span className="font-medium">Ngày mua:</span>
                            <span>{new Date(item.dateAcquired).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}

                        {item.purchasePrice && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign size={16} className="text-green-600" />
                            <span className="font-medium">Giá mua:</span>
                            <span>{formatCurrency(item.purchasePrice)}</span>
                          </div>
                        )}

                        {item.currentValue && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp size={16} className="text-purple-600" />
                            <span className="font-medium">Giá trị hiện tại:</span>
                            <span className="font-semibold">{formatCurrency(item.currentValue)}</span>
                          </div>
                        )}

                        {item.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 line-clamp-2">{item.notes}</p>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/farmer/livestock/${item.id}`}
                        className="w-full px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 flex items-center justify-center gap-2 font-semibold transition-all"
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
