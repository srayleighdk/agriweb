'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, DollarSign, TrendingUp, Shield, FileText, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '@/lib/api/client';

interface InvestorDetail {
  id: number;
  userId: number;
  investorType: string;
  isVerified: boolean;
  riskTolerance: string;
  totalInvested: number;
  totalReturned: number;
  activeInvestments: number;
  totalInvestments: number;
  successfulInvestments: number;
  portfolioValue: number;
  averageReturn: number | null;
  experience: number | null;
  netWorth: number | null;
  annualIncome: number | null;
  totalAvailableFunds: number | null;
  minInvestmentAmount: number | null;
  maxInvestmentAmount: number | null;
  preferredDuration: string | null;
  investmentFocus: string[];
  preferredRegions: string[];
  excludedSectors: string[];
  profession: string | null;
  companyName: string | null;
  industry: string | null;
  nationalId: string | null;
  taxId: string | null;
  dateOfBirth: string | null;
  province: string | null;
  commune: string | null;
  address: string | null;
  idDocument: string | null;
  addressProof: string | null;
  incomeProof: string | null;
  businessRegistration: string | null;
  verificationDocument: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
  investments: any[];
}

type TabType = 'personal' | 'financial' | 'portfolio' | 'verification' | 'preferences';

export default function InvestorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const investorId = params.id as string;

  const [investor, setInvestor] = useState<InvestorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadInvestor();
  }, [investorId]);

  const loadInvestor = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get(`/admin/investors/${investorId}`);
      setInvestor(response.data);
    } catch (err: any) {
      console.error('Failed to load investor:', err);
      setError(err.response?.data?.message || 'Failed to load investor details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationChange = async (isVerified: boolean) => {
    if (!confirm(`${isVerified ? 'Verify' : 'Unverify'} this investor?`)) return;

    try {
      setUpdating(true);
      await apiClient.patch(`/admin/investors/${investorId}`, { isVerified });
      await loadInvestor();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update verification status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading investor details...</p>
        </div>
      </div>
    );
  }

  if (error || !investor) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error || 'Investor not found'}</p>
          <button
            onClick={() => router.push('/admin/investors')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Investors
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: FileText },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/investors')}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Investors
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{investor.user.name || 'Unnamed Investor'}</h1>
            <p className="text-gray-600 mt-2">{investor.user.email}</p>
            {investor.user.phone && <p className="text-gray-600">{investor.user.phone}</p>}
          </div>
          <div className="flex gap-2">
            {investor.isVerified ? (
              <button
                onClick={() => handleVerificationChange(false)}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle size={18} />
                Unverify
              </button>
            ) : (
              <button
                onClick={() => handleVerificationChange(true)}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Verify
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Type</div>
          <div className="text-xl font-bold mt-1">{investor.investorType}</div>
          <div className="text-xs mt-1">
            {investor.isVerified ? (
              <span className="text-green-600">✓ Verified</span>
            ) : (
              <span className="text-red-600">Not verified</span>
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Portfolio Value</div>
          <div className="text-xl font-bold mt-1">₫{investor.portfolioValue.toLocaleString()}</div>
          <div className="text-xs mt-1 text-gray-600">
            Risk: {investor.riskTolerance}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Invested</div>
          <div className="text-xl font-bold mt-1">₫{investor.totalInvested.toLocaleString()}</div>
          <div className="text-xs mt-1 text-gray-600">
            Active: {investor.activeInvestments}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Success Rate</div>
          <div className="text-xl font-bold mt-1">
            {investor.totalInvestments > 0
              ? `${((investor.successfulInvestments / investor.totalInvestments) * 100).toFixed(0)}%`
              : '0%'}
          </div>
          <div className="text-xs mt-1 text-gray-600">
            {investor.successfulInvestments}/{investor.totalInvestments}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="text-gray-900">{investor.user.name || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="text-gray-900">{investor.user.email}</div>
                  {investor.user.isEmailVerified && (
                    <span className="text-xs text-green-600">✓ Verified</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="text-gray-900">{investor.user.phone || '-'}</div>
                  {investor.user.isPhoneVerified && (
                    <span className="text-xs text-green-600">✓ Verified</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div className="text-gray-900">
                    {investor.dateOfBirth ? new Date(investor.dateOfBirth).toLocaleDateString() : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <div className="text-gray-900">{investor.province || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                  <div className="text-gray-900">{investor.commune || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="text-gray-900">{investor.address || '-'}</div>
                </div>
              </div>

              {investor.investorType === 'INDIVIDUAL' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                      <div className="text-gray-900">{investor.profession || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                      <div className="text-gray-900">
                        {investor.experience ? `${investor.experience} years` : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(investor.investorType === 'INSTITUTIONAL' || investor.investorType === 'ACCREDITED') && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <div className="text-gray-900">{investor.companyName || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <div className="text-gray-900">{investor.industry || '-'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                  <div className="text-xl font-bold text-gray-900">
                    ₫{investor.annualIncome?.toLocaleString() || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Net Worth</label>
                  <div className="text-xl font-bold text-gray-900">
                    ₫{investor.netWorth?.toLocaleString() || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Funds</label>
                  <div className="text-xl font-bold text-gray-900">
                    ₫{investor.totalAvailableFunds?.toLocaleString() || '-'}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Investment Capacity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Investment</label>
                    <div className="text-gray-900">₫{investor.minInvestmentAmount?.toLocaleString() || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Investment</label>
                    <div className="text-gray-900">₫{investor.maxInvestmentAmount?.toLocaleString() || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Duration</label>
                    <div className="text-gray-900">{investor.preferredDuration || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
                    <div className="text-gray-900">{investor.riskTolerance}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Identity Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                    <div className="text-gray-900">{investor.nationalId || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                    <div className="text-gray-900">{investor.taxId || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Portfolio Value</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₫{investor.portfolioValue.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Total Invested</div>
                  <div className="text-2xl font-bold text-green-600">
                    ₫{investor.totalInvested.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Total Returned</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₫{investor.totalReturned.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Average Return</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {investor.averageReturn ? `${investor.averageReturn.toFixed(2)}%` : '-'}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Investment Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Total Investments</div>
                    <div className="text-xl font-bold text-gray-900">{investor.totalInvestments}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Active Investments</div>
                    <div className="text-xl font-bold text-green-600">{investor.activeInvestments}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Successful</div>
                    <div className="text-xl font-bold text-blue-600">{investor.successfulInvestments}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Investment History</h3>
                {!investor.investments || investor.investments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No investments yet</div>
                ) : (
                  <div className="space-y-4">
                    {investor.investments.map((investment: any) => (
                      <div key={investment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {investment.farmerInvestment?.title || 'Investment'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(investment.investmentDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              investment.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : investment.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {investment.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Amount</div>
                            <div className="font-medium">₫{investment.amount.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Expected Return</div>
                            <div className="font-medium">
                              {investment.expectedReturn ? `${investment.expectedReturn}%` : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">ROI</div>
                            <div className="font-medium">
                              {investment.roi ? `${investment.roi.toFixed(2)}%` : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
                <div className="flex items-center gap-4">
                  {investor.isVerified ? (
                    <span className="text-green-600 flex items-center gap-2 text-lg">
                      <CheckCircle size={24} />
                      Verified Investor
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-2 text-lg">
                      <XCircle size={24} />
                      Not Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Verification Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Document</label>
                    <div className="text-gray-900">{investor.idDocument || 'Not uploaded'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Proof</label>
                    <div className="text-gray-900">{investor.addressProof || 'Not uploaded'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Income Proof</label>
                    <div className="text-gray-900">{investor.incomeProof || 'Not uploaded'}</div>
                  </div>
                  {investor.businessRegistration && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Registration</label>
                      <div className="text-gray-900">{investor.businessRegistration}</div>
                    </div>
                  )}
                  {investor.verificationDocument && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verification Document</label>
                      <div className="text-gray-900">{investor.verificationDocument}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {investor.investmentFocus && investor.investmentFocus.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Investment Focus</h3>
                  <div className="flex flex-wrap gap-2">
                    {investor.investmentFocus.map((focus, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {investor.preferredRegions && investor.preferredRegions.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Preferred Regions</h3>
                  <div className="flex flex-wrap gap-2">
                    {investor.preferredRegions.map((region, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {investor.excludedSectors && investor.excludedSectors.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Excluded Sectors</h3>
                  <div className="flex flex-wrap gap-2">
                    {investor.excludedSectors.map((sector, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Member Since</h3>
                <div className="text-gray-900">{new Date(investor.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
