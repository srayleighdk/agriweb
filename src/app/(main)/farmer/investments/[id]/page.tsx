'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import FarmerNav from '@/components/layout/FarmerNav';
import Toast from '@/components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  farmerInvestmentsService,
  InvestmentStatus,
  FarmerInvestment,
} from '@/lib/api/farmer-investments';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  MapPin,
  AlertCircle,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

export default function InvestmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [investment, setInvestment] = useState<FarmerInvestment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (id) {
      loadInvestment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadInvestment = async () => {
    try {
      setLoading(true);
      const data = await farmerInvestmentsService.getInvestmentById(parseInt(id));
      console.log('Investment data:', data);
      setInvestment(data);
    } catch (error) {
      console.error('Failed to load investment:', error);
      setToastMessage('Không thể tải thông tin dự án');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;

    try {
      await farmerInvestmentsService.deleteInvestment(parseInt(id));
      setToastMessage('Xóa dự án thành công!');
      setToastType('success');
      setShowToast(true);

      setTimeout(() => {
        router.push('/farmer/investments');
      }, 1500);
    } catch (error: unknown) {
      console.error('Failed to delete investment:', error);
      const err = error as { response?: { data?: { message?: string } } };
      setToastMessage(err.response?.data?.message || 'Xóa dự án thất bại!');
      setToastType('error');
      setShowToast(true);
    }
  };

  const getStatusBadge = (status: InvestmentStatus) => {
    const badges: Record<InvestmentStatus, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
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

  const getFundingPercentage = () => {
    if (!investment) return 0;
    return Math.min((investment.currentFunding / investment.fundingGoal) * 100, 100);
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

  if (!investment) {
    return (
      <>
        <FarmerNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Không tìm thấy dự án</p>
            <Button onClick={() => router.push('/farmer/investments')} className="mt-4">
              Quay lại danh sách
            </Button>
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
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/farmer/investments')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{investment.title}</h1>
                <div className="flex items-center gap-3">
                  {getStatusBadge(investment.status)}
                  <span className="text-sm text-gray-500">
                    Tạo lúc: {new Date(investment.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {investment.status === 'PENDING' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/farmer/investments/${id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Funding Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Tiến độ gọi vốn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Đã huy động</span>
                        <span className="font-semibold">{getFundingPercentage().toFixed(1)}%</span>
                      </div>
                      <Progress value={getFundingPercentage()} className="h-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Đã huy động</p>
                        <p className="text-2xl font-bold text-green-600">
                          {(investment.currentFunding / 1000000).toFixed(0)}M VNĐ
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Mục tiêu</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(investment.fundingGoal / 1000000).toFixed(0)}M VNĐ
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {investment.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mô tả dự án</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{investment.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Note: Images, risk factors, collateral, and insurance are not in the FarmerInvestment type */}
              {/* These fields may need to be added to the backend API response */}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chi tiết đầu tư</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Lợi nhuận kỳ vọng</span>
                    </div>
                    <p className="text-xl font-bold text-green-600">{investment.expectedReturn}%</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Thời gian</span>
                    </div>
                    <p className="text-xl font-bold">{investment.returnPeriod} tháng</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Đầu tư tối thiểu</span>
                    </div>
                    <p className="text-xl font-bold">
                      {(investment.minInvestment / 1000000).toFixed(0)}M VNĐ
                    </p>
                  </div>

                  {investment.maxInvestment && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Đầu tư tối đa</span>
                      </div>
                      <p className="text-xl font-bold">
                        {(investment.maxInvestment / 1000000).toFixed(0)}M VNĐ
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Users className="h-4 w-4" />
                      <span>Số nhà đầu tư</span>
                    </div>
                    <p className="text-xl font-bold">
                      {investment.investorInvestments && Array.isArray(investment.investorInvestments)
                        ? investment.investorInvestments.length
                        : 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thời gian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ngày bắt đầu:</span>
                    <span className="font-semibold">
                      {investment.startDate ? new Date(investment.startDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ngày kết thúc:</span>
                    <span className="font-semibold">
                      {investment.endDate ? new Date(investment.endDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </span>
                  </div>

                  {investment.approvedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Được duyệt:</span>
                      <span className="font-semibold">
                        {new Date(investment.approvedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {investment.farmlandId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Đất canh tác
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">ID: {investment.farmlandId}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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
