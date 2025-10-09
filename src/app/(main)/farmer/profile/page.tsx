'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/lib/api/auth';
import FarmerNav from '@/components/layout/FarmerNav';
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
  Users,
  Building,
  CreditCard,
  FileText,
  Edit,
  Save,
  X,
} from 'lucide-react';

export default function FarmerProfilePage() {
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
    if (!name) return 'F';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getVerificationBadge = (level?: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      CERTIFIED: { label: 'Đã chứng nhận', className: 'bg-green-500' },
      FIELD: { label: 'Đã khảo sát', className: 'bg-blue-500' },
      DOCUMENTS: { label: 'Đã có hồ sơ', className: 'bg-yellow-500' },
      BASIC: { label: 'Cơ bản', className: 'bg-gray-500' },
    };
    const badge = badges[level || 'BASIC'];
    return <Badge className={badge.className}>{badge.label}</Badge>;
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Hồ sơ của tôi</h1>
            <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và hồ sơ nông dân</p>
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
                      <AvatarFallback className="bg-green-600 text-white text-3xl">
                        {getInitials(profileData?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold text-gray-900 text-center">
                      {profileData?.name}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{profileData?.email}</p>
                    <div className="mt-4">
                      {profileData?.farmer?.isVerified ? (
                        getVerificationBadge(profileData?.farmer?.verificationLevel)
                      ) : (
                        <Badge className="bg-gray-400">Chưa xác minh</Badge>
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
                  <CardTitle className="text-lg">Thống kê</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Dự án</span>
                    </div>
                    <span className="font-semibold">
                      {profileData?.farmer?.totalProjects || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Thành công</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {profileData?.farmer?.successfulProjects || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Điểm tín dụng</span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {profileData?.farmer?.creditScore || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Mức rủi ro</span>
                    </div>
                    <Badge
                      className={
                        profileData?.farmer?.riskLevel === 'LOW'
                          ? 'bg-green-500'
                          : profileData?.farmer?.riskLevel === 'MEDIUM'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }
                    >
                      {profileData?.farmer?.riskLevel === 'LOW'
                        ? 'Thấp'
                        : profileData?.farmer?.riskLevel === 'MEDIUM'
                        ? 'Trung bình'
                        : 'Cao'}
                    </Badge>
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

              {/* Farmer Specific Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin nông nghiệp</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Kinh nghiệm canh tác</Label>
                      <div className="mt-2 font-semibold">
                        {profileData?.farmer?.farmingExperience || 0} năm
                      </div>
                    </div>
                    <div>
                      <Label>Thế hệ canh tác</Label>
                      <div className="mt-2 font-semibold">
                        Thế hệ thứ {profileData?.farmer?.farmingGeneration || 1}
                      </div>
                    </div>
                    <div>
                      <Label>Thu nhập hàng tháng</Label>
                      <div className="mt-2 font-semibold text-green-600">
                        {(profileData?.farmer?.monthlyIncome || 0).toLocaleString('vi-VN')} VNĐ
                      </div>
                    </div>
                    <div>
                      <Label>Tài sản tổng</Label>
                      <div className="mt-2 font-semibold text-blue-600">
                        {(profileData?.farmer?.totalAssets || 0).toLocaleString('vi-VN')} VNĐ
                      </div>
                    </div>
                    <div>
                      <Label>Thành viên hộ gia đình</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{profileData?.farmer?.householdMembers || 0} người</span>
                      </div>
                    </div>
                    <div>
                      <Label>Tỷ lệ trả nợ đúng hạn</Label>
                      <div className="mt-2 font-semibold text-green-600">
                        {profileData?.farmer?.onTimeRepaymentRate || 0}%
                      </div>
                    </div>
                    {profileData?.farmer?.cooperativeMember && (
                      <div className="md:col-span-2">
                        <Label>Hợp tác xã</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span>{profileData?.farmer?.cooperativeName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Banking & Identity */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin ngân hàng & CMND</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileData?.farmer?.bankName && (
                      <>
                        <div>
                          <Label>Ngân hàng</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            <span>{profileData?.farmer?.bankName}</span>
                          </div>
                        </div>
                        <div>
                          <Label>Số tài khoản</Label>
                          <div className="mt-2">
                            {profileData?.farmer?.bankAccountNumber}
                            {profileData?.farmer?.bankAccountVerified && (
                              <Badge className="ml-2 bg-green-500">Đã xác minh</Badge>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    {profileData?.farmer?.nationalId && (
                      <>
                        <div>
                          <Label>Số CMND/CCCD</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span>{profileData?.farmer?.nationalId}</span>
                          </div>
                        </div>
                        <div>
                          <Label>Ngày cấp</Label>
                          <div className="mt-2">
                            {profileData?.farmer?.nationalIdIssueDate &&
                              new Date(
                                profileData?.farmer?.nationalIdIssueDate
                              ).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div>
                          <Label>Nơi cấp</Label>
                          <div className="mt-2">{profileData?.farmer?.nationalIdIssuePlace}</div>
                        </div>
                        <div>
                          <Label>Ngày sinh</Label>
                          <div className="mt-2">
                            {profileData?.farmer?.dateOfBirth &&
                              new Date(profileData?.farmer?.dateOfBirth).toLocaleDateString(
                                'vi-VN'
                              )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
