'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/lib/api/auth';
import InvestorNav from '@/components/layout/InvestorNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Award,
  TrendingUp,
  Briefcase,
  DollarSign,
  Building,
  FileText,
  Edit,
  Save,
  X,
  BarChart3,
  Target,
} from 'lucide-react';

export default function InvestorProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    province: '',
    commune: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfileData(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        province: data.province || '',
        commune: data.commune || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: Add update profile API call
      // await authService.updateProfile(formData);
      setEditing(false);
      alert('Cập nhật thành công!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'I';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getInvestorTypeBadge = (type?: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      INDIVIDUAL: { label: 'Cá nhân', className: 'bg-blue-500' },
      INSTITUTIONAL: { label: 'Tổ chức', className: 'bg-purple-500' },
      ACCREDITED: { label: 'Được chứng nhận', className: 'bg-green-500' },
      GOVERNMENT: { label: 'Chính phủ', className: 'bg-red-500' },
    };
    const badge = badges[type || 'INDIVIDUAL'];
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const getRiskToleranceBadge = (risk?: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      LOW: { label: 'Thấp', className: 'bg-green-500' },
      MEDIUM: { label: 'Trung bình', className: 'bg-yellow-500' },
      HIGH: { label: 'Cao', className: 'bg-red-500' },
    };
    const badge = badges[risk || 'MEDIUM'];
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  if (loading) {
    return (
      <>
        <InvestorNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <InvestorNav />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Hồ sơ của tôi</h1>
            <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và hồ sơ nhà đầu tư</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Avatar & Quick Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Avatar Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4">
                      <AvatarImage src={profileData?.avatar} alt={profileData?.name} />
                      <AvatarFallback className="bg-blue-600 text-white text-3xl">
                        {getInitials(profileData?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold text-gray-900 text-center">
                      {profileData?.name}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{profileData?.email}</p>
                    <div className="mt-4 flex gap-2">
                      {getInvestorTypeBadge(profileData?.investor?.investorType)}
                      {profileData?.investor?.isVerified && (
                        <Badge className="bg-green-500">Đã xác minh</Badge>
                      )}
                    </div>
                    <Button variant="outline" className="mt-4 w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Đổi ảnh đại diện
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thống kê đầu tư</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Tổng đầu tư</span>
                    </div>
                    <span className="font-semibold">
                      {profileData?.investor?.totalInvestments || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Đang hoạt động</span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {profileData?.investor?.activeInvestments || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Thành công</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {profileData?.investor?.successfulInvestments || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Lợi nhuận TB</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {profileData?.investor?.averageReturn || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Khẩu vị rủi ro</span>
                    </div>
                    {getRiskToleranceBadge(profileData?.investor?.riskTolerance)}
                  </div>
                </CardContent>
              </Card>

              {/* Investment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tài chính</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500">Tổng đã đầu tư</Label>
                    <div className="text-xl font-bold text-blue-600">
                      {(profileData?.investor?.totalInvested || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Tổng lợi nhuận</Label>
                    <div className="text-xl font-bold text-green-600">
                      {(profileData?.investor?.totalReturned || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Giá trị danh mục</Label>
                    <div className="text-xl font-bold text-purple-600">
                      {(profileData?.investor?.portfolioValue || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  {!editing ? (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditing(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Hủy
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Họ và tên</Label>
                      {editing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{profileData?.name}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{profileData?.email}</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      {editing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{profileData?.phone}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Ngày tham gia</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>
                          {new Date(profileData?.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      {editing ? (
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{profileData?.address}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="province">Tỉnh/Thành phố</Label>
                      {editing ? (
                        <Input
                          id="province"
                          value={formData.province}
                          onChange={(e) =>
                            setFormData({ ...formData, province: e.target.value })
                          }
                        />
                      ) : (
                        <div className="mt-2">{profileData?.province}</div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="commune">Xã/Phường</Label>
                      {editing ? (
                        <Input
                          id="commune"
                          value={formData.commune}
                          onChange={(e) =>
                            setFormData({ ...formData, commune: e.target.value })
                          }
                        />
                      ) : (
                        <div className="mt-2">{profileData?.commune}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investor Specific Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin đầu tư</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Kinh nghiệm đầu tư</Label>
                      <div className="mt-2 font-semibold">
                        {profileData?.investor?.experience || 0} năm
                      </div>
                    </div>
                    <div>
                      <Label>Tổng tài sản ròng</Label>
                      <div className="mt-2 font-semibold text-purple-600">
                        {(profileData?.investor?.netWorth || 0).toLocaleString('vi-VN')} VNĐ
                      </div>
                    </div>
                    <div>
                      <Label>Thu nhập hàng năm</Label>
                      <div className="mt-2 font-semibold text-green-600">
                        {(profileData?.investor?.annualIncome || 0).toLocaleString('vi-VN')} VNĐ
                      </div>
                    </div>
                    <div>
                      <Label>Quỹ khả dụng</Label>
                      <div className="mt-2 font-semibold text-blue-600">
                        {(profileData?.investor?.totalAvailableFunds || 0).toLocaleString('vi-VN')}{' '}
                        VNĐ
                      </div>
                    </div>
                    <div>
                      <Label>Số tiền đầu tư tối thiểu</Label>
                      <div className="mt-2">
                        {(profileData?.investor?.minInvestmentAmount || 0).toLocaleString('vi-VN')}{' '}
                        VNĐ
                      </div>
                    </div>
                    <div>
                      <Label>Số tiền đầu tư tối đa</Label>
                      <div className="mt-2">
                        {(profileData?.investor?.maxInvestmentAmount || 0).toLocaleString('vi-VN')}{' '}
                        VNĐ
                      </div>
                    </div>
                    <div>
                      <Label>Thời gian ưa thích</Label>
                      <div className="mt-2">{profileData?.investor?.preferredDuration}</div>
                    </div>
                    <div>
                      <Label>Nghề nghiệp</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span>{profileData?.investor?.profession}</span>
                      </div>
                    </div>
                    {profileData?.investor?.companyName && (
                      <>
                        <div>
                          <Label>Tên công ty</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span>{profileData?.investor?.companyName}</span>
                          </div>
                        </div>
                        <div>
                          <Label>Ngành</Label>
                          <div className="mt-2">{profileData?.investor?.industry}</div>
                        </div>
                        <div>
                          <Label>Mã số thuế</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span>{profileData?.investor?.taxId}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Identity Information */}
              {profileData?.investor?.nationalId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin định danh</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Số CMND/CCCD</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{profileData?.investor?.nationalId}</span>
                        </div>
                      </div>
                      <div>
                        <Label>Ngày sinh</Label>
                        <div className="mt-2">
                          {profileData?.investor?.dateOfBirth &&
                            new Date(profileData?.investor?.dateOfBirth).toLocaleDateString(
                              'vi-VN'
                            )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
