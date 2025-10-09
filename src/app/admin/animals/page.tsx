'use client';

import { useState, useEffect } from 'react';
import { animalsService, AnimalSpecies } from '@/lib/api/animals';
import { Search, Plus, Edit, Trash2, Beef } from 'lucide-react';
import Link from 'next/link';

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<AnimalSpecies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadAnimals();
  }, [page, search]);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await animalsService.getAnimals({
        page,
        limit,
        search: search || undefined,
      });
      setAnimals(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err: any) {
      console.error('Failed to load animals:', err);
      setError(err.response?.data?.message || 'Failed to load animals');
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete animal "${name}"?`)) return;

    try {
      await animalsService.deleteAnimal(id);
      loadAnimals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete animal');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Animal Species Catalog</h1>
          <p className="text-gray-600 mt-2">Manage livestock and animal database</p>
        </div>
        <Link
          href="/admin/animals/new"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Animal
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search animals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Animals Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading animals...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={loadAnimals}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        ) : !animals || animals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No animals found</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {animals.map((animal) => (
                <div key={animal.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-3 rounded-full">
                        <Beef className="text-orange-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{animal.vietnameseName}</h3>
                        {animal.englishName && (
                          <p className="text-sm text-gray-500">{animal.englishName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {animal.scientificName && (
                      <p className="text-sm text-gray-600 italic">{animal.scientificName}</p>
                    )}
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        {animal.category}
                      </span>
                      {animal.subcategory && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          {animal.subcategory}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    {animal.averageLifespan && (
                      <div>
                        <p className="text-gray-500">Lifespan</p>
                        <p className="font-medium">{animal.averageLifespan} years</p>
                      </div>
                    )}
                    {animal.averageAdultWeight && (
                      <div>
                        <p className="text-gray-500">Avg Weight</p>
                        <p className="font-medium">{animal.averageAdultWeight} kg</p>
                      </div>
                    )}
                  </div>

                  {animal.primaryPurpose && animal.primaryPurpose.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Purpose:</p>
                      <div className="flex flex-wrap gap-1">
                        {animal.primaryPurpose.map((purpose, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {purpose}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <button className="flex-1 px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(animal.id, animal.vietnameseName)}
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
