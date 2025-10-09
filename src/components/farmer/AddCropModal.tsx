'use client';

import { useState, useEffect } from 'react';
import { X, Sprout } from 'lucide-react';
import { cropsService, cropVarietiesService, CropVariety, CreateCropDto } from '@/lib/api/crops';
import Toast from '@/components/ui/Toast';

interface AddCropModalProps {
  farmlandId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCropModal({ farmlandId, onClose, onSuccess }: AddCropModalProps) {
  const [varieties, setVarieties] = useState<CropVariety[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVarieties, setLoadingVarieties] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [formData, setFormData] = useState<CreateCropDto>({
    farmlandId,
    cropVarietyId: 0,
    cropName: '',
    areaPlanted: undefined,
    plantedDate: '',
    expectedHarvest: '',
    healthStatus: 'GOOD',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    loadVarieties();
  }, []);

  const loadVarieties = async () => {
    try {
      setLoadingVarieties(true);
      const data = await cropVarietiesService.getAll();
      setVarieties(data);
    } catch (error) {
      console.error('Failed to load crop varieties:', error);
      alert('Không thể tải danh sách giống cây');
    } finally {
      setLoadingVarieties(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cropVarietyId) {
      setToastMessage('Vui lòng chọn giống cây');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);
      await cropsService.createCrop(formData);

      // Close modal first
      onClose();

      // Call onSuccess to refresh data
      await onSuccess();

      // Show success toast after a brief delay
      setTimeout(() => {
        setToastMessage('Thêm cây trồng thành công!');
        setToastType('success');
        setShowToast(true);
      }, 100);
    } catch (error: any) {
      console.error('Failed to create crop:', error);
      setToastMessage(error.response?.data?.message || 'Thêm cây trồng thất bại');
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
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Sprout size={24} />
              </div>
              <h2 className="text-2xl font-bold">Thêm cây trồng mới</h2>
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
          {/* Crop Variety */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giống cây <span className="text-red-600">*</span>
            </label>
            {loadingVarieties ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600 mx-auto"></div>
              </div>
            ) : (
              <select
                value={formData.cropVarietyId}
                onChange={(e) => setFormData({ ...formData, cropVarietyId: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">-- Chọn giống cây --</option>
                {varieties.map((variety) => (
                  <option key={variety.id} value={variety.id}>
                    {variety.vietnameseName} ({variety.name})
                    {variety.plant && ` - ${variety.plant.vietnameseName}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Crop Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên cây trồng (tùy chọn)
            </label>
            <input
              type="text"
              value={formData.cropName}
              onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
              placeholder="VD: Lúa vụ xuân 2025"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Area Planted */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Diện tích trồng (hecta)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.areaPlanted || ''}
              onChange={(e) => setFormData({ ...formData, areaPlanted: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="VD: 2.5"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Planted Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ngày gieo trồng
            </label>
            <input
              type="date"
              value={formData.plantedDate}
              onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Expected Harvest */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ngày dự kiến thu hoạch
            </label>
            <input
              type="date"
              value={formData.expectedHarvest}
              onChange={(e) => setFormData({ ...formData, expectedHarvest: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="EXCELLENT">Xuất sắc</option>
              <option value="GOOD">Tốt</option>
              <option value="FAIR">Trung bình</option>
              <option value="POOR">Kém</option>
              <option value="DISEASED">Bị bệnh</option>
            </select>
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
              placeholder="Thông tin bổ sung về cây trồng..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang thêm...' : 'Thêm cây trồng'}
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
