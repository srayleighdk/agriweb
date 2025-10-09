'use client';

import { useState, useEffect } from 'react';
import { farmerService, FarmerStats } from '@/lib/api/farmer';
import { MapPin, Sprout, Beef, DollarSign, TrendingUp, Plus, BarChart3, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import FarmerNav from '@/components/layout/FarmerNav';

export default function FarmerDashboard() {
  const [stats, setStats] = useState<FarmerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await farmerService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <FarmerNav />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">Đang tải bảng điều khiển...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FarmerNav />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Chào mừng trở lại, Nông dân! 👋</h1>
              <p className="text-green-100 text-lg">Quản lý trang trại và theo dõi dự án của bạn</p>
            </div>
            <Link
              href="/farmer/investments/new"
              className="hidden md:flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Tạo dự án mới
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Getting Started Banner */}
        {(!stats || (stats.farmlands === 0 && stats.crops === 0)) && (
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">🌱 Bắt đầu hành trình của bạn</h3>
                <p className="text-blue-100 mb-4 text-lg">
                  Thêm đất nông nghiệp đầu tiên để bắt đầu quản lý cây trồng và vật nuôi
                </p>
                <Link
                  href="/farmer/farmlands/new"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-semibold transition-all"
                >
                  Thêm đất nông nghiệp
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/farmer/farmlands" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Đất canh tác</p>
                <p className="text-4xl font-bold mt-3 text-gray-900">{stats?.farmlands || 0}</p>
                <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  Xem chi tiết
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="text-white" size={28} />
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Cây trồng</p>
                <p className="text-4xl font-bold mt-3 text-gray-900">{stats?.crops || 0}</p>
                <p className="text-blue-600 text-xs mt-2">Đang canh tác</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-2xl shadow-lg">
                <Sprout className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Vật nuôi</p>
                <p className="text-4xl font-bold mt-3 text-gray-900">{stats?.livestock || 0}</p>
                <p className="text-orange-600 text-xs mt-2">Đang chăn nuôi</p>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg">
                <Beef className="text-white" size={28} />
              </div>
            </div>
          </div>

          <Link href="/farmer/investments" className="group bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-semibold uppercase tracking-wide">Vốn đã huy động</p>
                <p className="text-4xl font-bold mt-3">
                  ${(stats?.investments.totalFunded || 0).toLocaleString()}
                </p>
                <p className="text-purple-200 text-xs mt-2 flex items-center gap-1">
                  <ArrowRight size={14} />
                  Xem dự án
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                <DollarSign className="text-white" size={28} />
              </div>
            </div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Investment Overview - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="text-green-600" size={28} />
                Tổng quan Dự án
              </h2>
              <Link
                href="/farmer/investments"
                className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
              >
                Xem tất cả <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
                <p className="text-gray-600 text-sm font-medium mb-2">Tổng dự án</p>
                <p className="text-4xl font-bold text-gray-900">{stats?.investments.total || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <p className="text-green-700 text-sm font-medium mb-2">Đang hoạt động</p>
                <p className="text-4xl font-bold text-green-600">{stats?.investments.active || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <p className="text-blue-700 text-sm font-medium mb-2">Hoàn thành</p>
                <p className="text-4xl font-bold text-blue-600">{stats?.investments.completed || 0}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-8 rounded-2xl shadow-xl text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar size={24} />
              Hành động nhanh
            </h2>
            <div className="space-y-3">
              <Link
                href="/farmer/farmlands/new"
                className="flex items-center gap-3 w-full px-4 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all group"
              >
                <MapPin className="group-hover:scale-110 transition-transform" size={20} />
                <span className="font-medium">Thêm đất canh tác</span>
              </Link>
              <Link
                href="/farmer/investments/new"
                className="flex items-center gap-3 w-full px-4 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all group"
              >
                <Plus className="group-hover:scale-110 transition-transform" size={20} />
                <span className="font-medium">Tạo dự án mới</span>
              </Link>
              <Link
                href="/farmer/diary"
                className="flex items-center gap-3 w-full px-4 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all group"
              >
                <Calendar className="group-hover:scale-110 transition-transform" size={20} />
                <span className="font-medium">Nhật ký canh tác</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Sprout className="text-green-600" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Quản lý thông minh</h3>
            <p className="text-gray-600 text-sm">Theo dõi cây trồng, vật nuôi và tiến độ canh tác một cách dễ dàng</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Kêu gọi đầu tư</h3>
            <p className="text-gray-600 text-sm">Tạo dự án và nhận vốn đầu tư từ các nhà đầu tư tiềm năng</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Minh bạch & An toàn</h3>
            <p className="text-gray-600 text-sm">Quy trình đầu tư được giám sát chặt chẽ và minh bạch</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
