'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import apiClient from '@/lib/api/client';

export default function NewPlantPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    vietnameseName: '',
    englishName: '',
    scientificName: '',
    commonNames: '',
    cropType: 'ANNUAL',
    category: '',
    family: '',
    expectedLifespan: '',
    averageYieldPerSeason: '',
    seasonsPerYear: '1',
    optimalSoilTypes: '',
    soilPhMin: '',
    soilPhMax: '',
    waterRequirement: '',
    sunlightRequirement: '',
    temperatureMin: '',
    temperatureMax: '',
    plantingSeasons: '',
    growingPeriodDays: '',
    harvestSeasons: '',
    commonDiseases: '',
    commonPests: '',
    pestResistance: '',
    averageMarketPrice: '',
    marketDemand: '',
    suitableProvinces: '',
    traditionalUse: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, unknown> = {
      vietnameseName: formData.vietnameseName,
      englishName: formData.englishName || null,
      scientificName: formData.scientificName || null,
      commonNames: formData.commonNames ? formData.commonNames.split(',').map(s => s.trim()) : [],
      cropType: formData.cropType,
      category: formData.category,
      family: formData.family || null,
      expectedLifespan: formData.expectedLifespan ? parseInt(formData.expectedLifespan) : null,
      averageYieldPerSeason: formData.averageYieldPerSeason ? parseFloat(formData.averageYieldPerSeason) : null,
      seasonsPerYear: parseInt(formData.seasonsPerYear),
      optimalSoilTypes: formData.optimalSoilTypes ? formData.optimalSoilTypes.split(',').map(s => s.trim()) : [],
      soilPhMin: formData.soilPhMin ? parseFloat(formData.soilPhMin) : null,
      soilPhMax: formData.soilPhMax ? parseFloat(formData.soilPhMax) : null,
      waterRequirement: formData.waterRequirement || null,
      sunlightRequirement: formData.sunlightRequirement || null,
      temperatureMin: formData.temperatureMin ? parseFloat(formData.temperatureMin) : null,
      temperatureMax: formData.temperatureMax ? parseFloat(formData.temperatureMax) : null,
      plantingSeasons: formData.plantingSeasons ? formData.plantingSeasons.split(',').map(s => s.trim()) : [],
      growingPeriodDays: formData.growingPeriodDays ? parseInt(formData.growingPeriodDays) : null,
      harvestSeasons: formData.harvestSeasons ? formData.harvestSeasons.split(',').map(s => s.trim()) : [],
      commonDiseases: formData.commonDiseases ? formData.commonDiseases.split(',').map(s => s.trim()) : [],
      commonPests: formData.commonPests ? formData.commonPests.split(',').map(s => s.trim()) : [],
      pestResistance: formData.pestResistance || null,
      averageMarketPrice: formData.averageMarketPrice ? parseFloat(formData.averageMarketPrice) : null,
      marketDemand: formData.marketDemand || null,
      suitableProvinces: formData.suitableProvinces ? formData.suitableProvinces.split(',').map(s => s.trim()) : [],
      traditionalUse: formData.traditionalUse || null,
    };

    try {
      setSaving(true);
      await apiClient.post('/admin/plants', data);
      router.push('/admin/plants');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to create plant');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/plants')}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Plants
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Plant</h1>
        <p className="text-gray-600 mt-2">Add a new plant species to the catalog</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vietnamese Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.vietnameseName}
                  onChange={(e) => setFormData({ ...formData, vietnameseName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">English Name</label>
                <input
                  type="text"
                  value={formData.englishName}
                  onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scientific Name</label>
                <input
                  type="text"
                  value={formData.scientificName}
                  onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Common Names (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.commonNames}
                  onChange={(e) => setFormData({ ...formData, commonNames: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="name1, name2, name3"
                />
              </div>
              <div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Vegetables, Fruits, Grains"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family</label>
                <input
                  type="text"
                  value={formData.family}
                  onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Growth Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Growth Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lifespan (months)</label>
                <input
                  type="number"
                  value={formData.expectedLifespan}
                  onChange={(e) => setFormData({ ...formData, expectedLifespan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Growing Period (days)</label>
                <input
                  type="number"
                  value={formData.growingPeriodDays}
                  onChange={(e) => setFormData({ ...formData, growingPeriodDays: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seasons Per Year</label>
                <input
                  type="number"
                  value={formData.seasonsPerYear}
                  onChange={(e) => setFormData({ ...formData, seasonsPerYear: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avg Yield/Season (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.averageYieldPerSeason}
                  onChange={(e) => setFormData({ ...formData, averageYieldPerSeason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Growing Conditions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Growing Conditions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH Min</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.soilPhMin}
                  onChange={(e) => setFormData({ ...formData, soilPhMin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Soil pH Max</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.soilPhMax}
                  onChange={(e) => setFormData({ ...formData, soilPhMax: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature Min (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperatureMin}
                  onChange={(e) => setFormData({ ...formData, temperatureMin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature Max (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperatureMax}
                  onChange={(e) => setFormData({ ...formData, temperatureMax: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Water Requirement</label>
                <input
                  type="text"
                  value={formData.waterRequirement}
                  onChange={(e) => setFormData({ ...formData, waterRequirement: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Low, Medium, High"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sunlight Requirement</label>
                <input
                  type="text"
                  value={formData.sunlightRequirement}
                  onChange={(e) => setFormData({ ...formData, sunlightRequirement: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Full Sun, Partial Shade"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Optimal Soil Types (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.optimalSoilTypes}
                  onChange={(e) => setFormData({ ...formData, optimalSoilTypes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="CLAY, LOAMY, SANDY"
                />
              </div>
            </div>
          </div>

          {/* Market Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Market Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avg Market Price (VND/kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.averageMarketPrice}
                  onChange={(e) => setFormData({ ...formData, averageMarketPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Demand</label>
                <input
                  type="text"
                  value={formData.marketDemand}
                  onChange={(e) => setFormData({ ...formData, marketDemand: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., High, Medium, Low"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suitable Provinces (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.suitableProvinces}
                  onChange={(e) => setFormData({ ...formData, suitableProvinces: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Province1, Province2, Province3"
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
              {saving ? 'Saving...' : 'Save Plant'}
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
