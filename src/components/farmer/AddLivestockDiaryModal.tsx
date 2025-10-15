'use client';

import { useState, useEffect } from 'react';
import { X, Beef } from 'lucide-react';
import { livestockDiaryService, CreateLivestockDiaryDto, LIVESTOCK_ACTIVITY_TYPES } from '@/lib/api/diary';
import { livestockService, Livestock } from '@/lib/api/livestock';
import Toast from '@/components/ui/Toast';

interface AddLivestockDiaryModalProps {
  livestockId?: number; // Pre-selected livestock ID from detail page
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function AddLivestockDiaryModal({ livestockId, onClose, onSuccess, onError }: AddLivestockDiaryModalProps) {
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLivestock, setLoadingLivestock] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [formData, setFormData] = useState<CreateLivestockDiaryDto>({
    livestockId: livestockId || 0,
    title: '',
    description: '',
    activityType: 'feeding',
    date: new Date().toISOString().slice(0, 16),
    notes: '',
    quantityUsed: undefined,
    unit: '',
    cost: undefined,
    healthStatus: '',
  });

  useEffect(() => {
    loadLivestock();
  }, []);

  const loadLivestock = async () => {
    try {
      setLoadingLivestock(true);
      const data = await livestockService.getLivestock();
      setLivestock(data);
    } catch (error) {
      console.error('Failed to load livestock:', error);
      setToastMessage('Không thể tải danh sách vật nuôi');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoadingLivestock(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.livestockId) {
      setToastMessage('Vui lòng chọn vật nuôi');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);
      await livestockDiaryService.create({
        ...formData,
        date: new Date(formData.date).toISOString(),
      });

      onClose();
      onSuccess('Thêm nhật ký thành công!');
    } catch (error: unknown) {
      console.error('Failed to create diary entry:', error);
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Thêm nhật ký thất bại';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Beef size={24} />
              </div>
              <h2 className="text-2xl font-bold">Thêm nhật ký vật nuôi</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Livestock Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vật nuôi <span className="text-red-600">*</span>
            </label>
            {loadingLivestock ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
              </div>
            ) : (
              <select
                value={formData.livestockId}
                onChange={(e) => setFormData({ ...formData, livestockId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={!!livestockId}
              >
                <option value="">-- Chọn vật nuôi --</option>
                {livestock.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.livestockBreed?.vietnameseName || `Vật nuôi #${item.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Kiểm tra sức khỏe định kỳ"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Loại hoạt động <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.activityType}
              onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              {LIVESTOCK_ACTIVITY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ngày thực hiện <span className="text-red-600">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Mô tả chi tiết hoạt động..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Health Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tình trạng sức khỏe
            </label>
            <select
              value={formData.healthStatus}
              onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Không ghi nhận --</option>
              <option value="healthy">Khỏe mạnh</option>
              <option value="sick">Bị bệnh</option>
              <option value="recovering">Đang hồi phục</option>
            </select>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số lượng sử dụng
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.quantityUsed || ''}
                onChange={(e) => setFormData({ ...formData, quantityUsed: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="VD: 25"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Đơn vị
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="VD: kg, ml"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chi phí (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.cost || ''}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="VD: 250000"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Ghi chú thêm (tùy chọn)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang thêm...' : 'Thêm nhật ký'}
            </button>
          </div>
        </form>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
