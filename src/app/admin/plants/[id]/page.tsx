'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { plantsService, CreatePlantData } from '@/lib/api/plants';

// Extended interface to include additional fields from backend
interface PlantWithExtras {
  vietnameseName: string;
  englishName: string | null;
  scientificName: string | null;
  cropType: 'ANNUAL' | 'PERENNIAL';
  category: string;
  expectedLifespan: number | null;
  growingPeriodDays: number | null;
  commonNames?: string[];
}

export default function EditPlantPage() {
  const router = useRouter();
  const params = useParams();
  const plantId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    vietnameseName: '',
    englishName: '',
    scientificName: '',
    commonNames: '',
    cropType: 'ANNUAL',
    category: '',
    expectedLifespan: '',
    growingPeriodDays: '',
  });

  const loadPlant = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const plant = await plantsService.getPlantById(plantId) as PlantWithExtras;
      
      setFormData({
        vietnameseName: plant.vietnameseName,
        englishName: plant.englishName || '',
        scientificName: plant.scientificName || '',
        commonNames: plant.commonNames ? plant.commonNames.join(', ') : '',
        cropType: plant.cropType,
        category: plant.category,
        expectedLifespan: plant.expectedLifespan?.toString() || '',
        growingPeriodDays: plant.growingPeriodDays?.toString() || '',
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load plant');
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  useEffect(() => {
    loadPlant();
  }, [loadPlant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, unknown> = {
      vietnameseName: formData.vietnameseName,
      cropType: formData.cropType as 'ANNUAL' | 'PERENNIAL',
      category: formData.category,
      commonNames: formData.commonNames
        ? formData.commonNames.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
        : [],
      seasonsPerYear: 1,
      optimalSoilTypes: [],
      plantingSeasons: [],
      harvestSeasons: [],
      commonDiseases: [],
      commonPests: [],
      suitableProvinces: [],
    };

    // Only add optional fields if they have values
    if (formData.englishName) data.englishName = formData.englishName;
    if (formData.scientificName) data.scientificName = formData.scientificName;
    if (formData.expectedLifespan) data.expectedLifespan = parseInt(formData.expectedLifespan);
    if (formData.growingPeriodDays) data.growingPeriodDays = parseInt(formData.growingPeriodDays);

    try {
      setSaving(true);
      await plantsService.updatePlant(plantId, data as unknown as Partial<CreatePlantData>);
      router.push('/admin/plants');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to update plant');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading plant...</p>
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
            onClick={() => router.push('/admin/plants')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Plants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/plants')}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Plants
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Plant</h1>
        <p className="text-gray-600 mt-2">Update plant information</p>
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
                  placeholder="e.g., Lúa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English Name</label>
                <input
                  type="text"
                  value={formData.englishName}
                  onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Rice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scientific Name</label>
                <input
                  type="text"
                  value={formData.scientificName}
                  onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Oryza sativa"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Type <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="ANNUAL">Annual</option>
                  <option value="PERENNIAL">Perennial</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Grains, Vegetables, Fruits"
                />
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
                  placeholder="e.g., Lúa nước, Lúa chiêm"
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
                  Expected Lifespan (months)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.expectedLifespan}
                  onChange={(e) => setFormData({ ...formData, expectedLifespan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Growing Period (days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.growingPeriodDays}
                  onChange={(e) => setFormData({ ...formData, growingPeriodDays: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 120"
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
              {saving ? 'Updating...' : 'Update Plant'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/plants')}
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
