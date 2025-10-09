'use client';

import { useState, useEffect } from 'react';
import { investorService, InvestorStats } from '@/lib/api/investor';
import { DollarSign, TrendingUp, PieChart, Target, Search, Briefcase, ArrowRight, Award, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import InvestorNav from '@/components/layout/InvestorNav';

export default function InvestorDashboard() {
  const [stats, setStats] = useState<InvestorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await investorService.getStats();
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
        <InvestorNav />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">Đang tải bảng điều khiển...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <InvestorNav />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Xin chào, Nhà đầu tư! 💼</h1>
              <p className="text-blue-100 text-lg">Theo dõi danh mục đầu tư và lợi nhuận của bạn</p>
            </div>
            <Link
              href="/investor/opportunities"
              className="hidden md:flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Search size={20} />
              Khám phá cơ hội
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Getting Started Banner */}
        {(!stats || stats.activeInvestments === 0) && (
          <div className="mb-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">🌾 Bắt đầu đầu tư ngay hôm nay</h3>
                <p className="text-emerald-100 mb-4 text-lg">
                  Khám phá các dự án nông nghiệp tiềm năng và hỗ trợ nông dân phát triển bền vững
                </p>
                <Link
                  href="/investor/opportunities"
                  className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 font-semibold transition-all"
                >
                  Xem cơ hội đầu tư
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Tổng đầu tư</p>
                <p className="text-4xl font-bold mt-3 text-gray-900">
                  ${(stats?.totalInvested || 0).toLocaleString()}
                </p>
                <p className="text-blue-600 text-xs mt-2">Vốn đã rót</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-2xl shadow-lg">
                <DollarSign className="text-white" size={28} />
              </div>
            </div>
          </div>

          <Link href="/investor/portfolio" className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Đang đầu tư</p>
                <p className="text-4xl font-bold mt-3 text-gray-900">{stats?.activeInvestments || 0}</p>
                <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                  <TrendingUp size={14} />
                  Xem danh mục
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <PieChart className="text-white" size={28} />
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Lợi nhuận</p>
                <p className="text-4xl font-bold mt-3 text-gray-900">
                  ${(stats?.totalReturns || 0).toLocaleString()}
                </p>
                <p className="text-purple-600 text-xs mt-2">Tổng thu về</p>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-2xl shadow-lg">
                <TrendingUp className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-semibold uppercase tracking-wide">Tỷ suất ROI</p>
                <p className="text-4xl font-bold mt-3">{(stats?.roi || 0).toFixed(1)}%</p>
                <p className="text-orange-200 text-xs mt-2 flex items-center gap-1">
                  <Award size={14} />
                  Hiệu quả đầu tư
                </p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl">
                <Target className="text-white" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Overview - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={28} />
                Tổng quan Danh mục
              </h2>
              <Link
                href="/investor/portfolio"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                Chi tiết <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <p className="text-blue-700 text-sm font-medium mb-2">Giá trị danh mục</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${(stats?.portfolioValue || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <p className="text-green-700 text-sm font-medium mb-2">Đang hoạt động</p>
                <p className="text-3xl font-bold text-green-600">{stats?.activeInvestments || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
                <p className="text-gray-700 text-sm font-medium mb-2">Đã hoàn thành</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.completedInvestments || 0}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 rounded-2xl shadow-xl text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Briefcase size={24} />
              Hành động nhanh
            </h2>
            <div className="space-y-3">
              <Link
                href="/investor/opportunities"
                className="flex items-center gap-3 w-full px-4 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all group"
              >
                <Search className="group-hover:scale-110 transition-transform" size={20} />
                <span className="font-medium">Khám phá cơ hội</span>
              </Link>
              <Link
                href="/investor/portfolio"
                className="flex items-center gap-3 w-full px-4 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all group"
              >
                <PieChart className="group-hover:scale-110 transition-transform" size={20} />
                <span className="font-medium">Xem danh mục</span>
              </Link>
              <Link
                href="/investor/profile"
                className="flex items-center gap-3 w-full px-4 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all group"
              >
                <Target className="group-hover:scale-110 transition-transform" size={20} />
                <span className="font-medium">Cập nhật hồ sơ</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Đầu tư thông minh</h3>
            <p className="text-gray-600 text-sm">Lựa chọn dự án phù hợp với mục tiêu tài chính của bạn</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Lợi nhuận ổn định</h3>
            <p className="text-gray-600 text-sm">Nhận lợi nhuận từ các dự án nông nghiệp bền vững</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Award className="text-purple-600" size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Hỗ trợ nông dân</h3>
            <p className="text-gray-600 text-sm">Góp phần phát triển nông nghiệp Việt Nam</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
