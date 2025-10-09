'use client';

import { useState, useEffect } from 'react';
import { X, Beef } from 'lucide-react';
import { livestockService, livestockBreedsService, LivestockBreed, CreateLivestockDto } from '@/lib/api/livestock';
import Toast from '@/components/ui/Toast';

interface AddLivestockModalProps {
  farmlandId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLivestockModal({ farmlandId, onClose, onSuccess }: AddLivestockModalProps) {
  const [breeds, setBreeds] = useState<LivestockBreed[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBreeds, setLoadingBreeds] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [formData, setFormData] = useState<CreateLivestockDto>({
    farmlandId,
    livestockBreedId: 0,
    name: '',
    count: 1,
    dateAcquired: '',
    healthStatus: 'HEALTHY',
    purchasePrice: undefined,
    currentValue: undefined,
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    loadBreeds();
  }, []);

  const loadBreeds = async () => {
    try {
      setLoadingBreeds(true);
      const data = await livestockBreedsService.getAll();
      setBreeds(data);
    } catch (error) {
      console.error('Failed to load livestock breeds:', error);
      alert('Không thể tải danh sách giống vật nuôi');
    } finally {
      setLoadingBreeds(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.livestockBreedId) {
      setToastMessage('Vui lòng chọn giống vật nuôi');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);
      await livestockService.createLivestock(formData);

      // Close modal first
      onClose();

      // Call onSuccess to refresh data
      await onSuccess();

      // Show success toast after a brief delay
      setTimeout(() => {
        setToastMessage('Thêm vật nuôi thành công!');
        setToastType('success');
        setShowToast(true);
      }, 100);
    } catch (error: any) {
      console.error('Failed to create livestock:', error);
      setToastMessage(error.response?.data?.message || 'Thêm vật nuôi thất bại');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Beef size={24} />
              </div>
              <h2 className="text-2xl font-bold">Thêm vật nuôi mới</h2>
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
          {/* Livestock Breed */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giống vật nuôi <span className="text-red-600">*</span>
            </label>
            {loadingBreeds ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
              </div>
            ) : (
              <select
                value={formData.livestockBreedId}
                onChange={(e) => setFormData({ ...formData, livestockBreedId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">-- Chọn giống vật nuôi --</option>
                {breeds.map((breed) => (
                  <option key={breed.id} value={breed.id}>
                    {breed.vietnameseName} ({breed.breedName})
                    {breed.animalSpecies && ` - ${breed.animalSpecies.vietnameseName}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên đàn/nhóm (tùy chọn)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Đàn bò sữa A"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Số lượng <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
              placeholder="VD: 25"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Date Acquired */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ngày mua/nhận
            </label>
            <input
              type="date"
              value={formData.dateAcquired}
              onChange={(e) => setFormData({ ...formData, dateAcquired: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              <option value="HEALTHY">Khỏe mạnh</option>
              <option value="SICK">Bị bệnh</option>
              <option value="RECOVERING">Đang hồi phục</option>
            </select>
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giá mua (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.purchasePrice || ''}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="VD: 50000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Current Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giá trị hiện tại (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.currentValue || ''}
              onChange={(e) => setFormData({ ...formData, currentValue: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="VD: 55000000"
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
              rows={3}
              placeholder="Thông tin bổ sung về vật nuôi..."
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
              {loading ? 'Đang thêm...' : 'Thêm vật nuôi'}
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
