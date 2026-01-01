'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { animalsService, CreateAnimalData } from '@/lib/api/animals';

// Extended interface to include additional fields from backend
interface AnimalWithExtras {
  vietnameseName: string;
  englishName: string | null;
  scientificName: string | null;
  category: string;
  averageLifespan: number | null;
  commonNames?: string[];
  temperament?: string;
}

export default function EditAnimalPage() {
  const router = useRouter();
  const params = useParams();
  const animalId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    vietnameseName: '',
    englishName: '',
    scientificName: '',
    category: 'RUMINANTS',
    commonNames: '',
    averageLifespan: '',
    temperament: '',
  });

  const loadAnimal = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const animal = await animalsService.getAnimalById(animalId) as AnimalWithExtras;
      
      setFormData({
        vietnameseName: animal.vietnameseName,
        englishName: animal.englishName || '',
        scientificName: animal.scientificName || '',
        category: animal.category,
        commonNames: animal.commonNames ? animal.commonNames.join(', ') : '',
        averageLifespan: animal.averageLifespan?.toString() || '',
        temperament: animal.temperament || '',
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load animal species');
    } finally {
      setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    loadAnimal();
  }, [loadAnimal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, unknown> = {
      vietnameseName: formData.vietnameseName,
      category: formData.category,
      commonNames: formData.commonNames
        ? formData.commonNames.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
        : [],
      exportPotential: false,
    };

    // Only add optional fields if they have values
    if (formData.englishName) data.englishName = formData.englishName;
    if (formData.scientificName) data.scientificName = formData.scientificName;
    if (formData.averageLifespan) data.averageLifespan = parseInt(formData.averageLifespan);
    if (formData.temperament) data.temperament = formData.temperament;

    try {
      setSaving(true);
      await animalsService.updateAnimal(animalId, data as unknown as Partial<CreateAnimalData>);
      router.push('/admin/animals');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to update animal species');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading animal species...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/animals')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Animals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/animals')}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Animals
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Animal Species</h1>
        <p className="text-gray-600 mt-2">Update animal species information</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vietnamese Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.vietnameseName}
                  onChange={(e) => setFormData({ ...formData, vietnameseName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Bò"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English Name</label>
                <input
                  type="text"
                  value={formData.englishName}
                  onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Cow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scientific Name</label>
                <input
                  type="text"
                  value={formData.scientificName}
                  onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Bos taurus"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="RUMINANTS">Ruminants</option>
                  <option value="POULTRY">Poultry</option>
                  <option value="SWINE">Swine</option>
                  <option value="AQUACULTURE">Aquaculture</option>
                  <option value="SMALL_ANIMALS">Small Animals</option>
                  <option value="DRAFT_ANIMALS">Draft Animals</option>
                  <option value="SPECIALTY">Specialty</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Common Names (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.commonNames}
                  onChange={(e) => setFormData({ ...formData, commonNames: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Bò vàng, Bò ta"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter multiple names separated by commas
                </p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Lifespan (years)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.averageLifespan}
                  onChange={(e) => setFormData({ ...formData, averageLifespan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperament</label>
                <input
                  type="text"
                  value={formData.temperament}
                  onChange={(e) => setFormData({ ...formData, temperament: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Docile, Aggressive, Friendly"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Updating...' : 'Update Animal'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/animals')}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
