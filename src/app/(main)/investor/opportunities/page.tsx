'use client';

import { useState, useEffect } from 'react';
import { investmentsService, Investment, InvestmentStatus } from '@/lib/api/investments';
import { Search, DollarSign, TrendingUp, MapPin, Calendar } from 'lucide-react';

export default function OpportunitiesPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOpportunities();
  }, [search]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError('');
      // Use available endpoint to get approved investments
      const response = await investmentsService.getInvestments({
        status: InvestmentStatus.APPROVED,
        search: search || undefined,
      });
      setInvestments(response.data || []);
    } catch (err: any) {
      console.error('Failed to load opportunities:', err);
      setError(err.response?.data?.message || 'Failed to load opportunities');
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const getFundingProgress = (current: number, requested: number) => {
    return Math.round((current / requested) * 100);
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      LOW: 'text-green-600 bg-green-100',
      MEDIUM: 'text-yellow-600 bg-yellow-100',
      HIGH: 'text-orange-600 bg-orange-100',
      VERY_HIGH: 'text-red-600 bg-red-100',
    };
    return colors[risk as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Investment Opportunities</h1>
          <p className="text-gray-600 mt-2">Discover agricultural projects seeking funding</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading opportunities...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={loadOpportunities}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : !investments || investments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities available</h3>
            <p className="text-gray-600">Check back later for new investment opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {investments.map((investment) => (
              <div key={investment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{investment.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{investment.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRiskColor(investment.riskLevel)}`}>
                      {investment.riskLevel}
                    </span>
                  </div>

                  {investment.farmer && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <MapPin size={16} />
                      <span>by {investment.farmer.user.name || 'Farmer'}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Requested Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${investment.requestedAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expected Return</p>
                      <p className="text-lg font-bold text-green-600">
                        {investment.expectedReturn ? `${investment.expectedReturn}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Funding Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Funding Progress</span>
                      <span className="font-semibold">
                        {getFundingProgress(investment.currentAmount, investment.requestedAmount)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${getFundingProgress(investment.currentAmount, investment.requestedAmount)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ${investment.currentAmount.toLocaleString()} raised
                    </p>
                  </div>

                  {investment.duration && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Calendar size={16} />
                      <span>{investment.duration} months duration</span>
                    </div>
                  )}

                  <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2">
                    <TrendingUp size={20} />
                    Invest Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
