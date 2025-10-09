'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FarmerNav from '@/components/layout/FarmerNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  farmerInvestmentsService,
  FarmerInvestment,
  InvestmentStatus,
} from '@/lib/api/farmer-investments';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function FarmerInvestmentsPage() {
  const router = useRouter();
  const [investments, setInvestments] = useState<FarmerInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<InvestmentStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchInvestments();
    fetchStats();
  }, [filter]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const params = filter !== 'ALL' ? { status: filter } : {};
      const data = await farmerInvestmentsService.getMyInvestments(params);
      setInvestments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await farmerInvestmentsService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusBadge = (status: InvestmentStatus) => {
    const badges: Record<InvestmentStatus, { label: string; className: string; icon: any }> = {
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-500', icon: Clock },
      APPROVED: { label: 'Đã duyệt', className: 'bg-blue-500', icon: CheckCircle },
      REJECTED: { label: 'Từ chối', className: 'bg-red-500', icon: XCircle },
      ACTIVE: { label: 'Đang gọi vốn', className: 'bg-green-500', icon: TrendingUp },
      COMPLETED: { label: 'Hoàn thành', className: 'bg-purple-500', icon: CheckCircle },
      CANCELLED: { label: 'Đã hủy', className: 'bg-gray-500', icon: XCircle },
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <Badge className={badge.className}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  const getFundingPercentage = (investment: FarmerInvestment) => {
    return Math.min((investment.currentFunding / investment.fundingGoal) * 100, 100);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;
    try {
      await farmerInvestmentsService.deleteInvestment(id);
      alert('Xóa thành công!');
      fetchInvestments();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete investment:', error);
      alert('Xóa thất bại!');
    }
  };

  if (loading) {
    return (
      <>
        <FarmerNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FarmerNav />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dự án của tôi</h1>
              <p className="text-gray-600 mt-2">Quản lý các dự án kêu gọi đầu tư</p>
            </div>
            <Button
              onClick={() => router.push('/farmer/investments/new')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Tạo dự án mới
            </Button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng dự án</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalInvestments}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Đang gọi vốn</p>
                      <p className="text-2xl font-bold text-green-600">{stats.activeInvestments}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Hoàn thành</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.completedInvestments}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng vốn huy động</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {(stats.totalFunding / 1000000).toFixed(0)}M
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                onClick={() => setFilter(status as any)}
                className={filter === status ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {status === 'ALL'
                  ? 'Tất cả'
                  : status === 'PENDING'
                  ? 'Chờ duyệt'
                  : status === 'APPROVED'
                  ? 'Đã duyệt'
                  : status === 'ACTIVE'
                  ? 'Đang gọi vốn'
                  : status === 'COMPLETED'
                  ? 'Hoàn thành'
                  : 'Từ chối'}
              </Button>
            ))}
          </div>

          {/* Investments List */}
          <div className="grid grid-cols-1 gap-6">
            {!investments || investments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Chưa có dự án nào</p>
                  <Button
                    onClick={() => router.push('/farmer/investments/new')}
                    className="mt-4 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo dự án đầu tiên
                  </Button>
                </CardContent>
              </Card>
            ) : (
              investments.map((investment) => (
                <Card key={investment.id} className="hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{investment.title}</CardTitle>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {investment.description}
                        </p>
                      </div>
                      <div className="ml-4">{getStatusBadge(investment.status)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Funding Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Tiến độ gọi vốn</span>
                        <span className="font-semibold">
                          {getFundingPercentage(investment).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={getFundingPercentage(investment)} className="h-2" />
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-green-600 font-semibold">
                          {(investment.currentFunding / 1000000).toFixed(0)}M VNĐ
                        </span>
                        <span className="text-gray-600">
                          / {(investment.fundingGoal / 1000000).toFixed(0)}M VNĐ
                        </span>
                      </div>
                    </div>

                    {/* Investment Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>Lợi nhuận kỳ vọng</span>
                        </div>
                        <p className="font-semibold text-green-600">
                          {investment.expectedReturn}%
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span>Thời gian</span>
                        </div>
                        <p className="font-semibold">{investment.returnPeriod} tháng</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Đầu tư tối thiểu</span>
                        </div>
                        <p className="font-semibold">
                          {(investment.minInvestment / 1000000).toFixed(0)}M VNĐ
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Users className="h-4 w-4" />
                          <span>Nhà đầu tư</span>
                        </div>
                        <p className="font-semibold">
                          {investment.investorInvestments?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/farmer/investments/${investment.id}`)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                      {investment.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(`/farmer/investments/${investment.id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(investment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
