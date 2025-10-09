'use client';

import { useState, useEffect } from 'react';
import { farmlandsService, Farmland } from '@/lib/api/farmlands';
import { MapPin, Plus, Edit, Sprout, Beef, Eye, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import FarmerNav from '@/components/layout/FarmerNav';
import FarmlandOnboarding from '@/components/farmer/FarmlandOnboarding';

export default function FarmlandsPage() {
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadFarmlands();
  }, []);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('farmland_onboarding_completed');

    // Show onboarding only if user hasn't seen it and has no farmlands
    if (!hasSeenOnboarding && !loading && farmlands.length === 0) {
      setShowOnboarding(true);
    }
  }, [loading, farmlands]);

  const loadFarmlands = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await farmlandsService.getFarmlands();
      // Backend returns { data: Farmland[] } or just Farmland[]
      const farmlandsData = Array.isArray(response) ? response : (response.data || []);
      setFarmlands(farmlandsData);
    } catch (err: any) {
      console.error('Failed to load farmlands:', err);
      setError(err.response?.data?.message || 'Failed to load farmlands');
      setFarmlands([]);
    } finally {
      setLoading(false);
    }
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CROP':
        return <Sprout className="text-green-600" size={20} />;
      case 'LIVESTOCK':
        return <Beef className="text-orange-600" size={20} />;
      default:
        return <MapPin className="text-blue-600" size={20} />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      CROP: 'bg-green-100 text-green-800',
      LIVESTOCK: 'bg-orange-100 text-orange-800',
      MIX: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      CROP: 'Trồng trọt',
      LIVESTOCK: 'Chăn nuôi',
      MIX: 'Hỗn hợp',
    };
    return {
      style: styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800',
      label: labels[type as keyof typeof labels] || type
    };
  };

  const totalArea = farmlands.reduce((sum, f) => sum + f.size, 0);
  const totalCrops = farmlands.reduce((sum, f) => sum + (f.crops?.length || 0), 0);
  const totalLivestock = farmlands.reduce((sum, f) => sum + (f.livestock?.length || 0), 0);

  const handleOnboardingComplete = () => {
    localStorage.setItem('farmland_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingClose = () => {
    localStorage.setItem('farmland_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      <FarmerNav />
      {showOnboarding && (
        <FarmlandOnboarding
          onClose={handleOnboardingClose}
          onComplete={handleOnboardingComplete}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Tổng diện tích</p>
                <p className="text-4xl font-bold mt-3 text-gray-900">{totalArea.toFixed(1)}</p>
                <p className="text-green-600 text-xs mt-2">Hecta</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl shadow-lg">
                <MapPin className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Cây trồng</p>
                <p className="text-4xl font-bold mt-3 text-gray-900">{totalCrops}</p>
                <p className="text-blue-600 text-xs mt-2">Loại cây</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-2xl shadow-lg">
                <Sprout className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Vật nuôi</p>
                <p className="text-4xl font-bold mt-3 text-gray-900">{totalLivestock}</p>
                <p className="text-orange-600 text-xs mt-2">Đàn vật nuôi</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg">
                <Beef className="text-white" size={28} />
              </div>
            </div>
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
              onClick={loadFarmlands}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all"
            >
              Thử lại
            </button>
          </div>
        ) : !farmlands || farmlands.length === 0 ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-green-300">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="text-green-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có đất canh tác</h3>
            <p className="text-gray-600 mb-6 text-lg">Bắt đầu bằng cách thêm mảnh đất đầu tiên của bạn</p>
            <Link
              href="/farmer/farmlands/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Thêm đất canh tác
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmlands.map((farmland) => {
              const typeBadge = getTypeBadge(farmland.farmlandType);
              return (
                <div key={farmland.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl">
                          {getTypeIcon(farmland.farmlandType)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{farmland.name}</h3>
                          <p className="text-sm text-green-600 font-semibold">{farmland.size} hecta</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${typeBadge.style}`}>
                        {typeBadge.label}
                      </span>
                      {farmland.soilType && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Loại đất:</span> {farmland.soilType}
                        </p>
                      )}
                      {farmland.address && (
                        <p className="text-sm text-gray-600 flex items-start gap-1">
                          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{farmland.address}</span>
                        </p>
                      )}
                    </div>

                    {(farmland.irrigationAccess || farmland.electricityAccess) && (
                      <div className="flex gap-2 text-xs mb-4 flex-wrap">
                        {farmland.irrigationAccess && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">💧 Nước</span>
                        )}
                        {farmland.electricityAccess && (
                          <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full font-medium">⚡ Điện</span>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <Sprout size={16} />
                          <p className="text-xs font-medium">Cây trồng</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{farmland.crops?.length || 0}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                          <Beef size={16} />
                          <p className="text-xs font-medium">Vật nuôi</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{farmland.livestock?.length || 0}</p>
                      </div>
                    </div>

                    <Link
                      href={`/farmer/farmlands/${farmland.id}`}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 font-semibold transition-all"
                    >
                      <Eye size={18} />
                      Xem
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
