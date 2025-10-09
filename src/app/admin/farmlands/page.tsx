'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface Farmland {
  id: number;
  farmerId: number;
  name: string;
  size: number;
  farmlandType: string;
  soilType: string | null;
  address: string | null;
  province: string | null;
  commune: string | null;
  landUseCertificateNo: string | null;
  landValue: number | null;
  irrigationAccess: boolean;
  electricityAccess: boolean;
  organicCertified: boolean;
  vietGapCertified: boolean;
  globalGapCertified: boolean;
  createdAt: string;
  farmer: {
    id: number;
    user: {
      name: string | null;
      email: string;
    };
  };
  crops: any[];
  livestock: any[];
}

export default function FarmlandsPage() {
  const [farmlands, setFarmlands] = useState<Farmland[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [provinceFilter, setProvinceFilter] = useState<string>('');
  const [certifiedFilter, setCertifiedFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadFarmlands();
  }, [page, search, typeFilter, provinceFilter, certifiedFilter]);

  const loadFarmlands = async () => {
    try {
      setLoading(true);
      setError('');

      const params: any = {
        page,
        limit,
      };

      if (search) params.search = search;
      if (typeFilter) params.farmlandType = typeFilter;
      if (provinceFilter) params.province = provinceFilter;
      if (certifiedFilter === 'organic') params.organicCertified = true;
      if (certifiedFilter === 'vietgap') params.vietGapCertified = true;
      if (certifiedFilter === 'globalgap') params.globalGapCertified = true;

      const response = await apiClient.get('/admin/farmlands', { params });
      setFarmlands(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 0);
    } catch (err: any) {
      console.error('Failed to load farmlands:', err);
      setError(err.response?.data?.message || 'Failed to load farmlands');
      setFarmlands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      CROP: 'bg-green-100 text-green-800',
      LIVESTOCK: 'bg-orange-100 text-orange-800',
      MIX: 'bg-blue-100 text-blue-800',
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Farmlands Management</h1>
        <p className="text-gray-600 mt-2">Overview of all registered farmlands</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search farmlands..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Types</option>
              <option value="CROP">Crop</option>
              <option value="LIVESTOCK">Livestock</option>
              <option value="MIX">Mixed</option>
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by province..."
              value={provinceFilter}
              onChange={(e) => { setProvinceFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Certification Filter */}
          <div>
            <select
              value={certifiedFilter}
              onChange={(e) => { setCertifiedFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Certifications</option>
              <option value="organic">Organic</option>
              <option value="vietgap">VietGAP</option>
              <option value="globalgap">GlobalGAP</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Farmlands</div>
          <div className="text-2xl font-bold mt-1">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Area</div>
          <div className="text-2xl font-bold mt-1">
            {farmlands.reduce((sum, f) => sum + f.size, 0).toFixed(2)} ha
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Certified Organic</div>
          <div className="text-2xl font-bold mt-1">
            {farmlands.filter(f => f.organicCertified).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">With Irrigation</div>
          <div className="text-2xl font-bold mt-1">
            {farmlands.filter(f => f.irrigationAccess).length}
          </div>
        </div>
      </div>

      {/* Farmlands Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading farmlands...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={loadFarmlands}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        ) : !farmlands || farmlands.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No farmlands found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmland</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certifications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Infrastructure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {farmlands.map((farmland) => (
                    <tr key={farmland.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{farmland.name}</div>
                        {farmland.landUseCertificateNo && (
                          <div className="text-xs text-gray-500">Cert: {farmland.landUseCertificateNo}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{farmland.farmer.user.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{farmland.farmer.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{farmland.province || '-'}</div>
                        {farmland.commune && (
                          <div className="text-xs text-gray-500">{farmland.commune}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(farmland.farmlandType)}`}>
                          {farmland.farmlandType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{farmland.size} ha</div>
                        {farmland.soilType && (
                          <div className="text-xs text-gray-500">{farmland.soilType}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {farmland.organicCertified && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle size={12} /> Organic
                            </span>
                          )}
                          {farmland.vietGapCertified && (
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              <CheckCircle size={12} /> VietGAP
                            </span>
                          )}
                          {farmland.globalGapCertified && (
                            <span className="text-xs text-purple-600 flex items-center gap-1">
                              <CheckCircle size={12} /> GlobalGAP
                            </span>
                          )}
                          {!farmland.organicCertified && !farmland.vietGapCertified && !farmland.globalGapCertified && (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {farmland.irrigationAccess && (
                            <span className="text-xs text-blue-600">Irrigation</span>
                          )}
                          {farmland.electricityAccess && (
                            <span className="text-xs text-yellow-600">Electricity</span>
                          )}
                          {!farmland.irrigationAccess && !farmland.electricityAccess && (
                            <span className="text-xs text-gray-400">Basic</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
