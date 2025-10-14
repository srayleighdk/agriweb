'use client';

import { useState, useEffect } from 'react';
import { statsService, DashboardStats } from '@/lib/api/stats';
import { Users, DollarSign, MapPin, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-gray-600 mt-2">Chào mừng trở lại! Đây là những gì đang diễn ra hôm nay.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Tổng người dùng</p>
              <p className="text-3xl font-bold mt-2">{stats?.users.total || 0}</p>
              <p className="text-sm text-green-600 mt-2">
                +{stats?.users.newThisMonth || 0} tháng này
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        {/* Active Investments */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Đầu tư đang hoạt động</p>
              <p className="text-3xl font-bold mt-2">{stats?.investments.active || 0}</p>
              <p className="text-sm text-gray-600 mt-2">
                ₫{(stats?.investments.totalFunded || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Total Farmlands */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Tổng vùng đất</p>
              <p className="text-3xl font-bold mt-2">{stats?.farmlands.total || 0}</p>
              <p className="text-sm text-gray-600 mt-2">
                {(stats?.farmlands.totalArea || 0).toFixed(1)} héc-ta
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <MapPin className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Chờ phê duyệt</p>
              <p className="text-3xl font-bold mt-2">{stats?.investments.pending || 0}</p>
              <p className="text-sm text-orange-600 mt-2">Cần chú ý</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Phân bố người dùng</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Nông dân</span>
              </div>
              <span className="font-semibold">{stats?.users.farmers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Nhà đầu tư</span>
              </div>
              <span className="font-semibold">{stats?.users.investors || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Quản trị viên</span>
              </div>
              <span className="font-semibold">{stats?.users.admins || 0}</span>
            </div>
          </div>
        </div>

        {/* Investment Overview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Tổng quan đầu tư</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Tổng đầu tư</span>
              <span className="font-semibold">{stats?.investments.total || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Chờ xử lý</span>
              <span className="font-semibold text-orange-600">{stats?.investments.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Đang hoạt động</span>
              <span className="font-semibold text-green-600">{stats?.investments.active || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Hoàn thành</span>
              <span className="font-semibold text-blue-600">{stats?.investments.completed || 0}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Tổng số tiền</span>
                <span className="font-bold text-lg">
                  ₫{(stats?.investments.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Hoạt động gần đây</h2>
        </div>
        <div className="divide-y">
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500 mt-1">by {activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              Không có hoạt động gần đây
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
