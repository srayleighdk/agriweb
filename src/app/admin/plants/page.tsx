'use client';

import { useState, useEffect } from 'react';
import { plantsService, Plant } from '@/lib/api/plants';
import { Search, Plus, Edit, Trash2, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadPlants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const loadPlants = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await plantsService.getPlants({
        page,
        limit,
        search: search || undefined,
      });
      setPlants(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err: unknown) {
      console.error('Failed to load plants:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load plants');
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete plant "${name}"?`)) return;

    try {
      await plantsService.deletePlant(id);
      loadPlants();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to delete plant');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plants Catalog</h1>
          <p className="text-gray-600 mt-2">Manage agricultural plant database</p>
        </div>
        <Link
          href="/admin/plants/new"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Plant
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search plants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Plants Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading plants...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={loadPlants}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        ) : !plants || plants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No plants found</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {plants.map((plant) => (
                <div key={plant.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Leaf className="text-green-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{plant.vietnameseName}</h3>
                        {plant.englishName && (
                          <p className="text-sm text-gray-500">{plant.englishName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {plant.scientificName && (
                      <p className="text-sm text-gray-600 italic">{plant.scientificName}</p>
                    )}
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {plant.cropType}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {plant.category}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    {plant.growingPeriodDays && (
                      <div>
                        <p className="text-gray-500">Growing Period</p>
                        <p className="font-medium">{plant.growingPeriodDays} days</p>
                      </div>
                    )}
                    {plant.averageYieldPerSeason && (
                      <div>
                        <p className="text-gray-500">Avg Yield</p>
                        <p className="font-medium">{plant.averageYieldPerSeason} kg</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button className="flex-1 px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plant.id, plant.vietnameseName)}
                      className="flex-1 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
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
