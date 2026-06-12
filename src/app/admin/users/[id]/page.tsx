'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Shield, Calendar, Save, X, CheckCircle } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { Role } from '@/types';
import Toast from '@/components/ui/Toast';

interface OwnedFarmland {
  id: number;
  name: string;
  size: number;
  farmlandType: string;
  soilType: string | null;
  address: string | null;
  province: string | null;
  commune: string | null;
  organicCertified: boolean;
  vietGapCertified: boolean;
  globalGapCertified: boolean;
  irrigationAccess: boolean;
  electricityAccess: boolean;
  createdAt: string;
  ownerType: 'FARMER' | 'COMPANY';
}

interface UserDetail {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  province: string | null;
  commune: string | null;
  role: Role;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  company?: {
    id: number;
    name: string;
    businessRegistrationNumber: string | null;
    representative: string | null;
    position: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  ownedFarmlands?: OwnedFarmland[];
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserDetail>>({});
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get(`/admin/users/${userId}`);
      setUser(response.data);
      setFormData(response.data);
    } catch (err: unknown) {
      console.error('Failed to load user:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.patch(`/admin/users/${userId}`, formData);
      await loadUser();
      setEditing(false);
      setToastMessage('User updated successfully');
      setToastType('success');
      setShowToast(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setToastMessage(error.response?.data?.message || 'Failed to update user');
      setToastType('error');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await apiClient.delete(`/admin/users/${userId}`);
      router.push('/admin/users');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setToastMessage(error.response?.data?.message || 'Failed to delete user');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case Role.FARMER:
        return 'bg-green-100 text-green-800';
      case Role.INVESTOR:
        return 'bg-blue-100 text-blue-800';
      case Role.COMPANY:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFarmlandTypeBadge = (type: string) => {
    switch (type) {
      case 'CROP':
        return 'bg-green-100 text-green-800';
      case 'LIVESTOCK':
        return 'bg-orange-100 text-orange-800';
      case 'MIX':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ownedFarmlands = user.ownedFarmlands || [];
  const totalOwnedArea = ownedFarmlands.reduce((sum, farmland) => sum + farmland.size, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Users
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name || 'Unnamed User'}</h1>
            <p className="text-gray-600 mt-2">{user.email}</p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(user);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Role</div>
          <div className="mt-2">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Email Status</div>
          <div className="text-lg font-bold mt-1">
            {user.isEmailVerified ? (
              <span className="text-green-600">✓ Verified</span>
            ) : (
              <span className="text-red-600">Not Verified</span>
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Phone Status</div>
          <div className="text-lg font-bold mt-1">
            {user.isPhoneVerified ? (
              <span className="text-green-600">✓ Verified</span>
            ) : (
              <span className="text-red-600">Not Verified</span>
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Owned Farmlands</div>
          <div className="text-lg font-bold mt-1 text-gray-900">{ownedFarmlands.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Area</div>
          <div className="text-sm mt-1 text-gray-900">{totalOwnedArea.toFixed(2)} ha</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Last Login</div>
          <div className="text-sm mt-1 text-gray-900">
            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">User Information</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline mr-2" size={16} />
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <div className="text-gray-900">{user.name || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline mr-2" size={16} />
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <div className="text-gray-900">{user.email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline mr-2" size={16} />
                Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <div className="text-gray-900">{user.phone || '-'}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="inline mr-2" size={16} />
                Role
              </label>
              {editing ? (
                <select
                  value={formData.role || user.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value={Role.FARMER}>Farmer</option>
                  <option value={Role.INVESTOR}>Investor</option>
                  <option value={Role.ADMIN}>Admin</option>
                </select>
              ) : (
                <div className="text-gray-900">{user.role}</div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              <MapPin className="inline mr-2" size={18} />
              Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.province || ''}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <div className="text-gray-900">{user.province || '-'}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.commune || ''}
                    onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <div className="text-gray-900">{user.commune || '-'}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                {editing ? (
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <div className="text-gray-900">{user.address || '-'}</div>
                )}
              </div>
            </div>
          </div>

          {user.company && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <div className="text-gray-900">{user.company.name || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration</label>
                  <div className="text-gray-900">{user.company.businessRegistrationNumber || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Representative</label>
                  <div className="text-gray-900">{user.company.representative || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <div className="text-gray-900">{user.company.position || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
                  <div className="text-gray-900">{user.company.email || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Phone</label>
                  <div className="text-gray-900">{user.company.phone || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Mobile</label>
                  <div className="text-gray-900">{user.phone || '-'}</div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Owned Farmlands</h3>
            {ownedFarmlands.length === 0 ? (
              <div className="text-gray-500">This user does not own any farmlands yet.</div>
            ) : (
              <div className="space-y-4">
                {ownedFarmlands.map((farmland) => (
                  <div
                    key={farmland.id}
                    className="cursor-pointer border rounded-lg p-4 transition hover:bg-gray-50"
                    onClick={() => router.push(`/admin/farmlands/${farmland.id}`)}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{farmland.name}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getFarmlandTypeBadge(farmland.farmlandType)}`}>
                            {farmland.farmlandType}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                            Owner: {farmland.ownerType}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div>Area: {farmland.size} ha</div>
                          {(farmland.province || farmland.commune) && (
                            <div>
                              Location: {[farmland.commune, farmland.province].filter(Boolean).join(', ')}
                            </div>
                          )}
                          {farmland.address && <div>Address: {farmland.address}</div>}
                          {farmland.soilType && <div>Soil type: {farmland.soilType}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 text-xs">
                        {farmland.organicCertified && (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={12} /> Organic
                          </span>
                        )}
                        {farmland.vietGapCertified && (
                          <span className="text-blue-600 flex items-center gap-1">
                            <CheckCircle size={12} /> VietGAP
                          </span>
                        )}
                        {farmland.globalGapCertified && (
                          <span className="text-purple-600 flex items-center gap-1">
                            <CheckCircle size={12} /> GlobalGAP
                          </span>
                        )}
                        {farmland.irrigationAccess && <span className="text-blue-600">Irrigation</span>}
                        {farmland.electricityAccess && <span className="text-yellow-600">Electricity</span>}
                        {!farmland.organicCertified &&
                          !farmland.vietGapCertified &&
                          !farmland.globalGapCertified &&
                          !farmland.irrigationAccess &&
                          !farmland.electricityAccess && (
                            <span className="text-gray-400">No extra attributes</span>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              <Calendar className="inline mr-2" size={18} />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <div className="text-gray-900">{new Date(user.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                <div className="text-gray-900">{new Date(user.updatedAt).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <div className="text-gray-900">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                </div>
              </div>
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
    </div>
  );
}
