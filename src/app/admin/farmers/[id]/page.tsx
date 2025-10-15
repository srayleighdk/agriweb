'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  User, MapPin, DollarSign, TrendingUp, Award, Shield,
  CheckCircle, XCircle
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface FarmerDetail {
  id: number;
  userId: number;
  isVerified: boolean;
  verificationLevel: string;
  farmingExperience: number | null;
  farmingGeneration: number | null;
  totalProjects: number;
  successfulProjects: number;
  creditScore: number | null;
  riskLevel: string;
  monthlyIncome: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  cooperativeMember: boolean;
  cooperativeName: string | null;
  householdHead: boolean;
  householdMembers: number | null;
  onTimeRepaymentRate: number;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountVerified: boolean;
  agriculturalInsurance: boolean;
  socialInsurance: boolean;
  nationalId: string | null;
  nationalIdIssueDate: string | null;
  nationalIdIssuePlace: string | null;
  dateOfBirth: string | null;
  placeOfBirth: string | null;
  businessLicense: string | null;
  taxCode: string | null;
  certifications: string[];
  trainingPrograms: string[];
  governmentSupport: string[];
  technicalSupport: string[];
  collateralType: string[];
  marketRisk: string[];
  equipmentValue: number | null;
  livestockValue: number | null;
  seasonalIncome: Record<string, unknown>;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    province: string | null;
    commune: string | null;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
  farmlands: Array<{
    id: number;
    name: string;
    farmlandType: string;
    size: number;
    soilType?: string;
    address?: string;
    irrigationAccess?: boolean;
    electricityAccess?: boolean;
    organicCertified?: boolean;
  }>;
  investmentRequests: Array<{
    id: number;
    title: string;
    description?: string | null;
    status: string;
    investmentType: string;
    requestedAmount: number;
    currentAmount: number;
    riskLevel: string;
    approvedAmount?: number;
    createdAt: string;
  }>;
}

type TabType = 'personal' | 'financial' | 'verification' | 'farmlands' | 'investments' | 'performance';

export default function FarmerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const farmerId = params.id as string;

  const [farmer, setFarmer] = useState<FarmerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [updating, setUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const loadFarmer = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get(`/admin/farmers/${farmerId}`);
      setFarmer(response.data);
    } catch (err: unknown) {
      console.error('Failed to load farmer:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load farmer details');
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    loadFarmer();
  }, [loadFarmer]);

  const handleVerificationChange = async (isVerified: boolean) => {
    setConfirmDialog({
      open: true,
      title: isVerified ? 'Xác minh nông dân' : 'Hủy xác minh nông dân',
      description: `Bạn có chắc chắn muốn ${isVerified ? 'xác minh' : 'hủy xác minh'} nông dân này không?`,
      variant: isVerified ? 'info' : 'warning',
      onConfirm: async () => {
        try {
          setUpdating(true);
          await apiClient.patch(`/admin/farmers/${farmerId}/verification`, { isVerified });
          await loadFarmer();
          setToastMessage(`Đã ${isVerified ? 'xác minh' : 'hủy xác minh'} nông dân thành công`);
          setToastType('success');
          setShowToast(true);
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          setToastMessage(error.response?.data?.message || 'Không thể cập nhật trạng thái xác minh');
          setToastType('error');
          setShowToast(true);
        } finally {
          setUpdating(false);
        }
      },
    });
  };

  const handleVerificationLevelChange = async (level: string) => {
    setConfirmDialog({
      open: true,
      title: 'Thay đổi cấp độ xác minh',
      description: `Bạn có chắc chắn muốn thay đổi cấp độ xác minh thành ${level} không?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          setUpdating(true);
          await apiClient.patch(`/admin/farmers/${farmerId}/verification`, { verificationLevel: level });
          await loadFarmer();
          setToastMessage(`Đã cập nhật cấp độ xác minh thành ${level}`);
          setToastType('success');
          setShowToast(true);
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          setToastMessage(error.response?.data?.message || 'Không thể cập nhật cấp độ xác minh');
          setToastType('error');
          setShowToast(true);
        } finally {
          setUpdating(false);
        }
      },
    });
  };

  const handleRiskLevelChange = async (riskLevel: string) => {
    setConfirmDialog({
      open: true,
      title: 'Thay đổi mức độ rủi ro',
      description: `Bạn có chắc chắn muốn thay đổi mức độ rủi ro thành ${riskLevel} không?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setUpdating(true);
          await apiClient.patch(`/admin/farmers/${farmerId}`, { riskLevel });
          await loadFarmer();
          setToastMessage(`Đã cập nhật mức độ rủi ro thành ${riskLevel}`);
          setToastType('success');
          setShowToast(true);
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          setToastMessage(error.response?.data?.message || 'Không thể cập nhật mức độ rủi ro');
          setToastType('error');
          setShowToast(true);
        } finally {
          setUpdating(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin nông dân...</p>
        </div>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || 'Không tìm thấy nông dân'}</p>
          <button
            onClick={() => router.push('/admin/farmers')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Quay lại danh sách nông dân
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Thông tin cá nhân', icon: User },
    { id: 'financial', label: 'Tài chính', icon: DollarSign },
    { id: 'verification', label: 'Xác minh', icon: Shield },
    { id: 'farmlands', label: 'Vùng đất', icon: MapPin },
    { id: 'investments', label: 'Đầu tư', icon: TrendingUp },
    { id: 'performance', label: 'Hiệu suất', icon: Award },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/farmers')}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2"
        >
          ← Quay lại danh sách nông dân
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{farmer.user.name || 'Nông dân chưa đặt tên'}</h1>
            <p className="text-gray-600 mt-2">{farmer.user.email}</p>
            {farmer.user.phone && <p className="text-gray-600">{farmer.user.phone}</p>}
          </div>
          <div className="flex gap-2">
            {farmer.isVerified ? (
              <button
                onClick={() => handleVerificationChange(false)}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle size={18} />
                Hủy xác minh
              </button>
            ) : (
              <button
                onClick={() => handleVerificationChange(true)}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Xác minh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Xác minh</div>
          <div className="text-xl font-bold mt-1">{farmer.verificationLevel}</div>
          <div className="text-xs mt-1">
            {farmer.isVerified ? (
              <span className="text-green-600">✓ Đã xác minh</span>
            ) : (
              <span className="text-red-600">Chưa xác minh</span>
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Mức độ rủi ro</div>
          <div className="text-xl font-bold mt-1">{farmer.riskLevel}</div>
          <div className="text-xs mt-1 text-gray-600">
            Điểm tín dụng: {farmer.creditScore || 'N/A'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Dự án</div>
          <div className="text-xl font-bold mt-1">
            {farmer.successfulProjects}/{farmer.totalProjects}
          </div>
          <div className="text-xs mt-1 text-gray-600">
            {farmer.totalProjects > 0
              ? `${((farmer.successfulProjects / farmer.totalProjects) * 100).toFixed(0)}% thành công`
              : 'Chưa có dự án'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Vùng đất</div>
          <div className="text-xl font-bold mt-1">{farmer.farmlands?.length || 0}</div>
          <div className="text-xs mt-1 text-gray-600">
            Trả nợ đúng hạn: {farmer.onTimeRepaymentRate}%
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <div className="text-gray-900">{farmer.user.name || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="text-gray-900">{farmer.user.email}</div>
                  {farmer.user.isEmailVerified && (
                    <span className="text-xs text-green-600">✓ Đã xác minh</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <div className="text-gray-900">{farmer.user.phone || '-'}</div>
                  {farmer.user.isPhoneVerified && (
                    <span className="text-xs text-green-600">✓ Đã xác minh</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <div className="text-gray-900">
                    {farmer.dateOfBirth ? new Date(farmer.dateOfBirth).toLocaleDateString() : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nơi sinh</label>
                  <div className="text-gray-900">{farmer.placeOfBirth || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <div className="text-gray-900">{farmer.user.address || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh</label>
                  <div className="text-gray-900">{farmer.user.province || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xã</label>
                  <div className="text-gray-900">{farmer.user.commune || '-'}</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Lý lịch nông nghiệp</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm canh tác</label>
                    <div className="text-gray-900">
                      {farmer.farmingExperience ? `${farmer.farmingExperience} năm` : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thế hệ làm nông</label>
                    <div className="text-gray-900">
                      {farmer.farmingGeneration ? `Thế hệ ${farmer.farmingGeneration}` : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thành viên hợp tác xã</label>
                    <div className="text-gray-900">
                      {farmer.cooperativeMember ? 'Có' : 'Không'}
                      {farmer.cooperativeName && ` - ${farmer.cooperativeName}`}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hộ gia đình</label>
                    <div className="text-gray-900">
                      {farmer.householdHead ? 'Chủ hộ' : 'Thành viên'}
                      {farmer.householdMembers && ` - ${farmer.householdMembers} người`}
                    </div>
                  </div>
                </div>
              </div>

              {farmer.certifications && farmer.certifications.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Chứng chỉ</h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.certifications.map((cert, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {farmer.trainingPrograms && farmer.trainingPrograms.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Chương trình đào tạo</h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.trainingPrograms.map((training, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {training}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thu nhập hàng tháng</label>
                  <div className="text-xl font-bold text-gray-900">
                    ₫{farmer.monthlyIncome?.toLocaleString() || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tài sản</label>
                  <div className="text-xl font-bold text-gray-900">
                    ₫{farmer.totalAssets?.toLocaleString() || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng nợ phải trả</label>
                  <div className="text-xl font-bold text-gray-900">
                    ₫{farmer.totalLiabilities?.toLocaleString() || '-'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị thiết bị</label>
                  <div className="text-gray-900">₫{farmer.equipmentValue?.toLocaleString() || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị vật nuôi</label>
                  <div className="text-gray-900">₫{farmer.livestockValue?.toLocaleString() || '-'}</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Thông tin ngân hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngân hàng</label>
                    <div className="text-gray-900">{farmer.bankName || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
                    <div className="text-gray-900">{farmer.bankAccountNumber || '-'}</div>
                    {farmer.bankAccountVerified && (
                      <span className="text-xs text-green-600">✓ Đã xác minh</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Bảo hiểm</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hiểm nông nghiệp</label>
                    <div className="text-gray-900">{farmer.agriculturalInsurance ? 'Có' : 'Không'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hiểm xã hội</label>
                    <div className="text-gray-900">{farmer.socialInsurance ? 'Có' : 'Không'}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Tín dụng & Rủi ro</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm tín dụng</label>
                    <div className="text-gray-900">{farmer.creditScore || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ rủi ro</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{farmer.riskLevel}</span>
                      <select
                        onChange={(e) => handleRiskLevelChange(e.target.value)}
                        value={farmer.riskLevel}
                        disabled={updating}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="VERY_HIGH">VERY_HIGH</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trả nợ đúng hạn</label>
                    <div className="text-gray-900">{farmer.onTimeRepaymentRate}%</div>
                  </div>
                </div>
              </div>

              {farmer.collateralType && farmer.collateralType.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Loại tài sản thế chấp</h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.collateralType.map((type, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Trạng thái xác minh</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cấp độ xác minh</label>
                    <select
                      onChange={(e) => handleVerificationLevelChange(e.target.value)}
                      value={farmer.verificationLevel}
                      disabled={updating}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="BASIC">Cơ bản</option>
                      <option value="DOCUMENTS">Tài liệu</option>
                      <option value="FIELD">Thực địa</option>
                      <option value="CERTIFIED">Chứng nhận</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái xác minh</label>
                    <div className="flex items-center gap-4">
                      {farmer.isVerified ? (
                        <span className="text-green-600 flex items-center gap-2">
                          <CheckCircle size={20} />
                          Đã xác minh
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-2">
                          <XCircle size={20} />
                          Chưa xác minh
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Giấy tờ tùy thân</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CMND/CCCD</label>
                    <div className="text-gray-900">{farmer.nationalId || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
                    <div className="text-gray-900">
                      {farmer.nationalIdIssueDate
                        ? new Date(farmer.nationalIdIssueDate).toLocaleDateString()
                        : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nơi cấp</label>
                    <div className="text-gray-900">{farmer.nationalIdIssuePlace || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giấy phép kinh doanh</label>
                    <div className="text-gray-900">{farmer.businessLicense || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                    <div className="text-gray-900">{farmer.taxCode || '-'}</div>
                  </div>
                </div>
              </div>

              {(farmer.governmentSupport && farmer.governmentSupport.length > 0) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Hỗ trợ từ chính phủ</h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.governmentSupport.map((support, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {support}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(farmer.technicalSupport && farmer.technicalSupport.length > 0) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Hỗ trợ kỹ thuật</h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.technicalSupport.map((support, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        {support}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Farmlands Tab */}
          {activeTab === 'farmlands' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Vùng đất ({farmer.farmlands?.length || 0})</h3>
              {!farmer.farmlands || farmer.farmlands.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Chưa đăng ký vùng đất nào</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farmer.farmlands.map((farmland) => (
                    <div key={farmland.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{farmland.name}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {farmland.farmlandType}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Diện tích: {farmland.size} héc-ta</div>
                        {farmland.soilType && <div>Loại đất: {farmland.soilType}</div>}
                        {farmland.address && <div>Vị trí: {farmland.address}</div>}
                        <div className="flex gap-2 mt-2">
                          {farmland.irrigationAccess && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Tưới tiêu</span>
                          )}
                          {farmland.electricityAccess && (
                            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded">Điện</span>
                          )}
                          {farmland.organicCertified && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">Hữu cơ</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Investments Tab */}
          {activeTab === 'investments' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Yêu cầu đầu tư ({farmer.investmentRequests?.length || 0})
              </h3>
              {!farmer.investmentRequests || farmer.investmentRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Chưa có yêu cầu đầu tư</div>
              ) : (
                <div className="space-y-4">
                  {farmer.investmentRequests.map((investment) => (
                    <div key={investment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{investment.title}</h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            investment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : investment.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : investment.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : investment.status === 'COMPLETED'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {investment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Yêu cầu</div>
                          <div className="font-medium">₫{investment.requestedAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Đã huy động</div>
                          <div className="font-medium">₫{investment.currentAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Loại</div>
                          <div className="font-medium">{investment.investmentType}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Rủi ro</div>
                          <div className="font-medium">{investment.riskLevel}</div>
                        </div>
                      </div>
                      {investment.description && (
                        <p className="text-sm text-gray-600 mt-2">{investment.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Tổng dự án</div>
                  <div className="text-3xl font-bold text-gray-900">{farmer.totalProjects}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Dự án thành công</div>
                  <div className="text-3xl font-bold text-green-600">{farmer.successfulProjects}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Tỷ lệ thành công</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {farmer.totalProjects > 0
                      ? `${((farmer.successfulProjects / farmer.totalProjects) * 100).toFixed(0)}%`
                      : '0%'}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Hiệu suất trả nợ</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Tỷ lệ trả nợ đúng hạn</span>
                    <span className="text-2xl font-bold text-green-600">{farmer.onTimeRepaymentRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${farmer.onTimeRepaymentRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {farmer.marketRisk && farmer.marketRisk.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Rủi ro thị trường</h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.marketRisk.map((risk, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                        {risk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Ngày tham gia</h3>
                <div className="text-gray-900">{new Date(farmer.createdAt).toLocaleDateString()}</div>
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
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
