'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, Calendar, MapPin, User } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface FarmlandDetail {
  id: number;
  name: string;
  size: number;
  farmlandType: string;
  soilType: string | null;
  address: string | null;
  province: string | null;
  commune: string | null;
  coordinates: string | null;
  landUseCertificateNo: string | null;
  landValue: number | null;
  irrigationAccess: boolean;
  electricityAccess: boolean;
  organicCertified: boolean;
  vietGapCertified: boolean;
  globalGapCertified: boolean;
  createdAt: string;
  updatedAt: string;
  cropCount: number;
  livestockCount: number;
  ownerType: 'FARMER' | 'COMPANY' | 'UNKNOWN';
  ownerUserId: number | null;
  farmer: {
    id: number;
    farmingExperience: number | null;
    verificationLevel: string;
    isVerified: boolean;
    user: {
      id: number;
      name: string | null;
      email: string;
      phone: string | null;
      address: string | null;
      province: string | null;
      commune: string | null;
    };
  } | null;
  company: {
    id: number;
    name: string;
    businessRegistrationNumber: string | null;
    representative: string | null;
    position: string | null;
    email: string | null;
    phone: string | null;
    isVerified: boolean;
    verificationLevel: string;
    user: {
      id: number;
      name: string | null;
      email: string;
      phone: string | null;
      address: string | null;
      province: string | null;
      commune: string | null;
    } | null;
  } | null;
  crops: Array<{
    id: number;
    cropName: string | null;
    areaPlanted: number | null;
    isActive: boolean;
    plantedDate: string | null;
  }>;
  livestock: Array<{
    id: number;
    name: string | null;
    count: number;
    healthStatus: string;
    isActive: boolean;
  }>;
  certifications: Array<{ id: number; type: string; isActive: boolean }>;
  taxRecords: Array<{ id: number; taxYear: number; amount: number | null }>;
  soilTests: Array<{ id: number; testDate: string; soilQuality: string | null }>;
}

export default function FarmlandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const farmlandId = params.id as string;

  const [farmland, setFarmland] = useState<FarmlandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFarmland = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get(`/admin/farmlands/${farmlandId}`);
      setFarmland(response.data);
    } catch (err: unknown) {
      console.error('Failed to load farmland:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load farmland details');
    } finally {
      setLoading(false);
    }
  }, [farmlandId]);

  useEffect(() => {
    loadFarmland();
  }, [loadFarmland]);

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      CROP: 'bg-green-100 text-green-800',
      LIVESTOCK: 'bg-orange-100 text-orange-800',
      MIX: 'bg-blue-100 text-blue-800',
    };

    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  const ownerName = farmland?.farmer?.user.name
    || farmland?.company?.user?.name
    || farmland?.company?.name
    || 'Unknown owner';
  const ownerEmail = farmland?.farmer?.user.email
    || farmland?.company?.user?.email
    || farmland?.company?.email
    || '-';
  const ownerMobile = farmland?.farmer?.user.phone
    || farmland?.company?.user?.phone
    || '-';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farmland details...</p>
        </div>
      </div>
    );
  }

  if (error || !farmland) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || 'Farmland not found'}</p>
          <button
            onClick={() => router.push('/admin/farmlands')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Farmlands
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/farmlands')}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Farmlands
        </button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{farmland.name}</h1>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getTypeBadge(farmland.farmlandType)}`}>
                {farmland.farmlandType}
              </span>
            </div>
            <p className="text-gray-600 mt-2">Farmland ID: #{farmland.id}</p>
          </div>

          {farmland.ownerUserId && (
            <button
              onClick={() => router.push(`/admin/users/${farmland.ownerUserId}`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              View Owner Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Area</div>
          <div className="text-2xl font-bold mt-1">{farmland.size.toFixed(2)} ha</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Owner Type</div>
          <div className="text-lg font-bold mt-1">{farmland.ownerType}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Crops</div>
          <div className="text-2xl font-bold mt-1">{farmland.cropCount}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Livestock</div>
          <div className="text-2xl font-bold mt-1">{farmland.livestockCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Farmland Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <div className="text-gray-900">{farmland.province || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                <div className="text-gray-900">{farmland.commune || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="text-gray-900">{farmland.address || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                <div className="text-gray-900">{farmland.soilType || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land Certificate No.</label>
                <div className="text-gray-900">{farmland.landUseCertificateNo || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land Value</label>
                <div className="text-gray-900">
                  {farmland.landValue !== null ? `${farmland.landValue.toLocaleString()} VND` : '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates</label>
                <div className="text-gray-900 break-all">{farmland.coordinates || '-'}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Infrastructure & Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {farmland.irrigationAccess && <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">Irrigation</span>}
              {farmland.electricityAccess && <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm rounded-full">Electricity</span>}
              {farmland.organicCertified && <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">Organic</span>}
              {farmland.vietGapCertified && <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-sm rounded-full">VietGAP</span>}
              {farmland.globalGapCertified && <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">GlobalGAP</span>}
              {!farmland.irrigationAccess
                && !farmland.electricityAccess
                && !farmland.organicCertified
                && !farmland.vietGapCertified
                && !farmland.globalGapCertified && (
                  <span className="text-gray-500">No extra attributes</span>
                )}
            </div>

            {farmland.certifications.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-2">Certification Records</h3>
                <div className="space-y-2">
                  {farmland.certifications.map((certification) => (
                    <div key={certification.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                      <span>{certification.type}</span>
                      <span className={certification.isActive ? 'text-green-600' : 'text-gray-400'}>
                        {certification.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Production</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Crops</h3>
                {farmland.crops.length === 0 ? (
                  <div className="text-gray-500">No crops recorded</div>
                ) : (
                  <div className="space-y-2">
                    {farmland.crops.map((crop) => (
                      <div key={crop.id} className="border rounded-lg px-3 py-2">
                        <div className="font-medium text-gray-900">{crop.cropName || 'Unnamed crop'}</div>
                        <div className="text-sm text-gray-500">
                          {crop.areaPlanted ? `${crop.areaPlanted} ha` : 'Area not set'}
                          {' • '}
                          {crop.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Livestock</h3>
                {farmland.livestock.length === 0 ? (
                  <div className="text-gray-500">No livestock recorded</div>
                ) : (
                  <div className="space-y-2">
                    {farmland.livestock.map((item) => (
                      <div key={item.id} className="border rounded-lg px-3 py-2">
                        <div className="font-medium text-gray-900">{item.name || 'Unnamed livestock'}</div>
                        <div className="text-sm text-gray-500">
                          Count: {item.count}
                          {' • '}
                          {item.healthStatus}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {farmland.ownerType === 'COMPANY' ? <Building2 size={20} /> : <User size={20} />}
              Owner Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <div className="text-gray-900">{ownerName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{ownerEmail}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <div className="text-gray-900">{ownerMobile}</div>
              </div>

              {farmland.ownerType === 'FARMER' && farmland.farmer && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
                    <div className="text-gray-900">
                      {farmland.farmer.isVerified ? 'Verified' : 'Not verified'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <div className="text-gray-900">
                      {farmland.farmer.farmingExperience ? `${farmland.farmer.farmingExperience} years` : '-'}
                    </div>
                  </div>
                </>
              )}

              {farmland.ownerType === 'COMPANY' && farmland.company && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Registration</label>
                    <div className="text-gray-900">{farmland.company.businessRegistrationNumber || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Representative</label>
                    <div className="text-gray-900">{farmland.company.representative || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <div className="text-gray-900">{farmland.company.position || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
                    <div className="text-gray-900">{farmland.company.email || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Phone</label>
                    <div className="text-gray-900">{farmland.company.phone || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
                    <div className="text-gray-900">
                      {farmland.company.isVerified ? 'Verified' : 'Not verified'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Records
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <div className="text-gray-900">{new Date(farmland.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                <div className="text-gray-900">{new Date(farmland.updatedAt).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Records</label>
                <div className="text-gray-900">{farmland.taxRecords.length}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil Tests</label>
                <div className="text-gray-900">{farmland.soilTests.length}</div>
              </div>
            </div>
          </div>

          {(farmland.taxRecords.length > 0 || farmland.soilTests.length > 0) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Latest Records</h2>
              <div className="space-y-4">
                {farmland.taxRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="border rounded-lg px-3 py-2">
                    <div className="font-medium text-gray-900">Tax Year {record.taxYear}</div>
                    <div className="text-sm text-gray-500">
                      {record.amount !== null ? `${record.amount.toLocaleString()} VND` : 'Amount not set'}
                    </div>
                  </div>
                ))}
                {farmland.soilTests.slice(0, 3).map((test) => (
                  <div key={test.id} className="border rounded-lg px-3 py-2">
                    <div className="font-medium text-gray-900">Soil Test</div>
                    <div className="text-sm text-gray-500">
                      {new Date(test.testDate).toLocaleDateString()}
                      {test.soilQuality ? ` • ${test.soilQuality}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
