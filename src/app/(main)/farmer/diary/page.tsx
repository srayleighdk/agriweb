'use client';

import { useState, useEffect } from 'react';
import FarmerNav from '@/components/layout/FarmerNav';
import {
  cropDiaryService,
  livestockDiaryService,
  CropDiaryEntry,
  LivestockDiaryEntry,
  CROP_ACTIVITY_TYPES,
  LIVESTOCK_ACTIVITY_TYPES
} from '@/lib/api/diary';
import { cropsService, Crop } from '@/lib/api/crops';
import { livestockService, Livestock } from '@/lib/api/livestock';
import {
  BookOpen,
  Calendar,
  Droplets,
  Sprout,
  Bug,
  Package,
  DollarSign,
  Beef,
  Filter,
  Activity,
  ChevronRight,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import Toast from '@/components/ui/Toast';
import Link from 'next/link';
import AddCropDiaryModal from '@/components/farmer/AddCropDiaryModal';
import AddLivestockDiaryModal from '@/components/farmer/AddLivestockDiaryModal';

type DiaryType = 'all' | 'crop' | 'livestock';

export default function FarmerDiaryPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [selectedLivestockId, setSelectedLivestockId] = useState<number | null>(null);
  const [cropDiaries, setCropDiaries] = useState<CropDiaryEntry[]>([]);
  const [livestockDiaries, setLivestockDiaries] = useState<LivestockDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDiaries, setLoadingDiaries] = useState(false);
  const [filterType, setFilterType] = useState<DiaryType>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showAddDiaryModal, setShowAddDiaryModal] = useState(false);

  useEffect(() => {
    fetchCropsAndLivestock();
  }, []);

  const fetchCropsAndLivestock = async () => {
    try {
      setLoading(true);
      const [cropsData, livestockData] = await Promise.all([
        cropsService.getCrops().catch(() => []),
        livestockService.getLivestock().catch(() => []),
      ]);
      setCrops(cropsData);
      setLivestock(livestockData);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setToastMessage('Không thể tải dữ liệu');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCropClick = async (cropId: number) => {
    setSelectedCropId(cropId);
    setSelectedLivestockId(null);
    setLoadingDiaries(true);
    try {
      const diaries = await cropDiaryService.getAll(cropId);
      setCropDiaries(diaries);
      setLivestockDiaries([]);
    } catch (error) {
      console.error('Failed to load crop diaries:', error);
      setCropDiaries([]);
    } finally {
      setLoadingDiaries(false);
    }
  };

  const handleLivestockClick = async (livestockId: number) => {
    setSelectedLivestockId(livestockId);
    setSelectedCropId(null);
    setLoadingDiaries(true);
    try {
      const diaries = await livestockDiaryService.getAll(livestockId);
      setLivestockDiaries(diaries);
      setCropDiaries([]);
    } catch (error) {
      console.error('Failed to load livestock diaries:', error);
      setLivestockDiaries([]);
    } finally {
      setLoadingDiaries(false);
    }
  };

  const handleBackToList = () => {
    setSelectedCropId(null);
    setSelectedLivestockId(null);
    setCropDiaries([]);
    setLivestockDiaries([]);
  };

  const refreshDiaries = async () => {
    if (selectedCropId) {
      await handleCropClick(selectedCropId);
    } else if (selectedLivestockId) {
      await handleLivestockClick(selectedLivestockId);
    }
  };

  const getActivityIcon = (activity: string, type: 'crop' | 'livestock') => {
    const lower = activity.toLowerCase();
    if (type === 'livestock') {
      return <Beef className="h-5 w-5 text-orange-500" />;
    }
    if (lower.includes('water')) return <Droplets className="h-5 w-5 text-blue-500" />;
    if (lower.includes('plant') || lower.includes('seed'))
      return <Sprout className="h-5 w-5 text-green-500" />;
    if (lower.includes('pest') || lower.includes('spray'))
      return <Bug className="h-5 w-5 text-red-500" />;
    if (lower.includes('fertiliz')) return <Package className="h-5 w-5 text-yellow-600" />;
    return <Activity className="h-5 w-5 text-gray-500" />;
  };

  const getActivityLabel = (type: string, diaryType: 'crop' | 'livestock') => {
    const activityTypes = diaryType === 'crop' ? CROP_ACTIVITY_TYPES : LIVESTOCK_ACTIVITY_TYPES;
    const found = activityTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getCropName = (crop: Crop) => {
    return crop.cropName || crop.cropVariety?.vietnameseName || `Cây trồng #${crop.id}`;
  };

  const getLivestockName = (item: Livestock) => {
    return item.name || item.livestockBreed?.vietnameseName || `Vật nuôi #${item.id}`;
  };

  const filteredCrops = filterType === 'livestock' ? [] : crops;
  const filteredLivestock = filterType === 'crop' ? [] : livestock;

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

  // Show diary entries for selected item
  if (selectedCropId || selectedLivestockId) {
    const isDisplayingCrop = selectedCropId !== null;
    const selectedItem = isDisplayingCrop
      ? crops.find(c => c.id === selectedCropId)
      : livestock.find(l => l.id === selectedLivestockId);
    const diaries = isDisplayingCrop ? cropDiaries : livestockDiaries;
    const itemName = isDisplayingCrop
      ? (selectedItem ? getCropName(selectedItem as Crop) : 'Cây trồng')
      : (selectedItem ? getLivestockName(selectedItem as Livestock) : 'Vật nuôi');

    return (
      <>
        <FarmerNav />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
            >
              <ArrowLeft size={20} />
              Quay lại danh sách
            </button>

            {/* Header */}
            <div className={`bg-gradient-to-r ${isDisplayingCrop ? 'from-green-600 to-emerald-600' : 'from-orange-600 to-amber-600'} rounded-2xl shadow-lg p-8 mb-8 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 p-4 rounded-2xl">
                    {isDisplayingCrop ? <Sprout size={40} /> : <Beef size={40} />}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Nhật ký: {itemName}</h1>
                    <p className={`${isDisplayingCrop ? 'text-green-100' : 'text-orange-100'} mt-2`}>
                      {diaries.length} nhật ký
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddDiaryModal(true)}
                  className="px-6 py-3 bg-white text-green-600 hover:bg-green-50 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
                  style={{ color: isDisplayingCrop ? '#059669' : '#ea580c' }}
                >
                  <Plus size={20} />
                  Thêm nhật ký
                </button>
              </div>
            </div>

            {/* Diary Entries */}
            {loadingDiaries ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                <p className="mt-6 text-gray-600 text-lg">Đang tải nhật ký...</p>
              </div>
            ) : diaries.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="text-gray-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có nhật ký</h3>
                <p className="text-gray-600 mb-6 text-lg">
                  Thêm nhật ký từ trang chi tiết
                </p>
                <Link
                  href={isDisplayingCrop ? `/farmer/crops/${selectedCropId}` : `/farmer/livestock/${selectedLivestockId}`}
                  className={`inline-flex items-center gap-2 px-8 py-4 ${isDisplayingCrop ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl`}
                >
                  {isDisplayingCrop ? <Sprout size={20} /> : <Beef size={20} />}
                  Đến trang chi tiết
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {diaries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`bg-gradient-to-br ${isDisplayingCrop ? 'from-green-100 to-green-200' : 'from-orange-100 to-orange-200'} p-3 rounded-xl flex-shrink-0`}>
                          {getActivityIcon(entry.activityType, isDisplayingCrop ? 'crop' : 'livestock')}
                        </div>
                        <div className="flex-1">
                          {/* Title and Activity Type */}
                          <div className="mb-3">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{entry.title}</h3>
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              isDisplayingCrop
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {getActivityLabel(entry.activityType, isDisplayingCrop ? 'crop' : 'livestock')}
                            </span>
                          </div>

                          {/* Description */}
                          {entry.description && (
                            <p className="text-gray-600 mb-3">{entry.description}</p>
                          )}

                          {/* Meta Information */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(entry.date).toLocaleString('vi-VN')}</span>
                            </div>
                            {entry.quantityUsed && (
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                <span>
                                  {entry.quantityUsed} {entry.unit}
                                </span>
                              </div>
                            )}
                            {entry.cost && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{entry.cost.toLocaleString('vi-VN')} VNĐ</span>
                              </div>
                            )}
                          </div>

                          {/* Health Status for Livestock */}
                          {!isDisplayingCrop && (entry as LivestockDiaryEntry).healthStatus && (
                            <div className="mb-3">
                              <span className="text-sm text-gray-600 mr-2">Tình trạng sức khỏe:</span>
                              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {(entry as LivestockDiaryEntry).healthStatus}
                              </span>
                            </div>
                          )}

                          {/* Notes */}
                          {entry.notes && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">Ghi chú:</span> {entry.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Diary Modal */}
        {showAddDiaryModal && isDisplayingCrop && selectedCropId && (
          <AddCropDiaryModal
            cropId={selectedCropId}
            onClose={() => setShowAddDiaryModal(false)}
            onSuccess={(message) => {
              refreshDiaries();
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

        {showAddDiaryModal && !isDisplayingCrop && selectedLivestockId && (
          <AddLivestockDiaryModal
            livestockId={selectedLivestockId}
            onClose={() => setShowAddDiaryModal(false)}
            onSuccess={(message) => {
              refreshDiaries();
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
      </>
    );
  }

  // Show list of crops and livestock
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
                  <BookOpen size={40} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Nhật ký canh tác</h1>
                  <p className="text-green-100 mt-2">Chọn cây trồng hoặc vật nuôi để xem nhật ký</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Cây trồng</p>
                  <p className="text-4xl font-bold mt-3 text-gray-900">{crops.length}</p>
                  <p className="text-green-600 text-xs mt-2">Có thể xem nhật ký</p>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl shadow-lg">
                  <Sprout className="text-white" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Vật nuôi</p>
                  <p className="text-4xl font-bold mt-3 text-gray-900">{livestock.length}</p>
                  <p className="text-orange-600 text-xs mt-2">Có thể xem nhật ký</p>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg">
                  <Beef className="text-white" size={28} />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <Filter size={20} />
                <span>Hiển thị:</span>
              </div>
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType('crop')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterType === 'crop'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chỉ cây trồng
              </button>
              <button
                onClick={() => setFilterType('livestock')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filterType === 'livestock'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chỉ vật nuôi
              </button>
            </div>
          </div>

          {/* Crops List */}
          {filteredCrops.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sprout className="text-green-600" size={28} />
                Cây trồng ({crops.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCrops.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => handleCropClick(crop.id)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-green-300 p-6 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl">
                          <Sprout className="text-green-600" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {getCropName(crop)}
                          </h3>
                          {crop.cropVariety && (
                            <p className="text-sm text-gray-600">
                              {crop.cropVariety.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Livestock List */}
          {filteredLivestock.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Beef className="text-orange-600" size={28} />
                Vật nuôi ({livestock.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLivestock.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleLivestockClick(item.id)}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-orange-300 p-6 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl">
                          <Beef className="text-orange-600" size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {getLivestockName(item)}
                          </h3>
                          {item.livestockBreed && (
                            <p className="text-sm text-gray-600">
                              {item.livestockBreed.breedName}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {crops.length === 0 && livestock.length === 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-gray-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có cây trồng hoặc vật nuôi</h3>
              <p className="text-gray-600 mb-6 text-lg">
                Thêm cây trồng hoặc vật nuôi để bắt đầu ghi nhật ký
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/farmer/farmlands"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <Sprout size={20} />
                  Đến trang đất canh tác
                </Link>
              </div>
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
