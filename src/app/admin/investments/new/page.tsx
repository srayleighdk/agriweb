'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { investmentsService } from '@/lib/api/investments';
import { cropVarietiesService, CropVariety } from '@/lib/api/crops';
import Toast from '@/components/ui/Toast';

interface FarmerOption {
  id: number;
  user?: { name?: string | null; email?: string; phone?: string | null };
}

const INVESTMENT_TYPES = [
  'CROP_FUNDING',
  'LIVESTOCK_FUNDING',
  'FARMLAND_EXPANSION',
  'EQUIPMENT_PURCHASE',
  'INFRASTRUCTURE',
];

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];

export default function AdminCreateInvestmentPage() {
  const router = useRouter();
  const [farmers, setFarmers] = useState<FarmerOption[]>([]);
  const [loadingFarmers, setLoadingFarmers] = useState(true);
  const [varieties, setVarieties] = useState<CropVariety[]>([]);
  const [selectedVarieties, setSelectedVarieties] = useState<number[]>([]);
  const [varietySearch, setVarietySearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    farmerId: '',
    title: '',
    description: '',
    investmentType: 'CROP_FUNDING',
    requestedAmount: '',
    expectedReturn: '',
    duration: '',
    riskLevel: 'MEDIUM',
    minimumInvestment: '',
    maximumInvestment: '',
    fundingDeadline: '',
    repaymentTerms: '',
    farmlandId: '',
  });

  useEffect(() => {
    (async () => {
      try {
        setLoadingFarmers(true);
        const res = await apiClient.get('/admin/farmers', {
          params: { page: 1, limit: 100 },
        });
        const data = res.data?.data || res.data || [];
        setFarmers(Array.isArray(data) ? data : []);
      } catch {
        setFarmers([]);
      } finally {
        setLoadingFarmers(false);
      }

      try {
        const list = await cropVarietiesService.getAll();
        setVarieties(Array.isArray(list) ? list : []);
      } catch {
        setVarieties([]);
      }
    })();
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.farmerId || !form.title || !form.requestedAmount) {
      setToast({ message: 'Vui lòng nhập nông dân, tiêu đề và số tiền', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const selectedNames = varieties
        .filter((v) => selectedVarieties.includes(v.id))
        .map((v) => v.vietnameseName || v.name || `#${v.id}`);
      const varietyNote = selectedNames.length
        ? `\n\n[Giống cây đã chọn]: ${selectedNames.join(', ')}`
        : '';

      const payload: Record<string, unknown> = {
        farmerId: parseInt(form.farmerId, 10),
        title: form.title,
        description: `${form.description || ''}${varietyNote}`.trim() || undefined,
        investmentType: form.investmentType,
        requestedAmount: parseFloat(form.requestedAmount),
        riskLevel: form.riskLevel,
        repaymentTerms: form.repaymentTerms || undefined,
      };
      if (form.expectedReturn) payload.expectedReturn = parseFloat(form.expectedReturn);
      if (form.duration) payload.duration = parseInt(form.duration, 10);
      if (form.minimumInvestment) payload.minimumInvestment = parseFloat(form.minimumInvestment);
      if (form.maximumInvestment) payload.maximumInvestment = parseFloat(form.maximumInvestment);
      if (form.fundingDeadline) payload.fundingDeadline = form.fundingDeadline;
      if (form.farmlandId) payload.farmlandId = parseInt(form.farmlandId, 10);

      const created = await investmentsService.createInvestmentAdmin(payload);
      setToast({ message: 'Đã tạo dự án cho nông dân', type: 'success' });
      setTimeout(() => router.push(`/admin/investments/${created.id}`), 800);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setToast({
        message: error.response?.data?.message || 'Không thể tạo dự án',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.push('/admin/investments')}
        className="text-green-700 hover:underline mb-4"
      >
        ← Quay lại
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo dự án đầu tư (Admin)</h1>
      <p className="text-gray-600 mb-6">
        Tạo dự án thay nông dân (ví dụ: Trồng lúa). Dự án sẽ gắn với nông dân được chọn và bắt đầu ở trạng thái PENDING.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nông dân *</label>
          <select
            name="farmerId"
            value={form.farmerId}
            onChange={onChange}
            className="w-full border rounded-lg px-3 py-2"
            required
            disabled={loadingFarmers}
          >
            <option value="">-- Chọn nông dân --</option>
            {farmers.map((f) => (
              <option key={f.id} value={f.id}>
                #{f.id} — {f.user?.name || 'Không tên'} ({f.user?.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tên dự án *</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Ví dụ: Trồng lúa"
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={4}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <label className="block text-sm font-medium mb-1">
            Giống cây (chọn nhiều) — theo demo Thoại: “Thăng Long Ruột Trắng”…
          </label>
          <input
            value={varietySearch}
            onChange={(e) => setVarietySearch(e.target.value)}
            placeholder="Tìm giống..."
            className="w-full border rounded-lg px-3 py-2 mb-3 bg-white"
          />
          <div className="max-h-44 overflow-y-auto space-y-1 bg-white border rounded-lg p-2">
            {varieties
              .filter((v) => {
                const label = `${v.vietnameseName || ''} ${v.name || ''} ${v.plant?.vietnameseName || ''} ${v.plant?.name || ''}`.toLowerCase();
                return !varietySearch || label.includes(varietySearch.toLowerCase());
              })
              .slice(0, 80)
              .map((v) => {
                const checked = selectedVarieties.includes(v.id);
                const label = v.vietnameseName || v.name || `Giống #${v.id}`;
                return (
                  <label key={v.id} className="flex items-center gap-2 text-sm px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setSelectedVarieties((prev) =>
                          checked ? prev.filter((id) => id !== v.id) : [...prev, v.id],
                        );
                      }}
                    />
                    <span>
                      {label}
                      {v.plant?.vietnameseName || v.plant?.name ? (
                        <span className="text-gray-500"> · {v.plant?.vietnameseName || v.plant?.name}</span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            {varieties.length === 0 && (
              <div className="text-sm text-gray-500 p-2">Chưa có dữ liệu giống cây</div>
            )}
          </div>
          {selectedVarieties.length > 0 && (
            <div className="text-xs text-green-700 mt-2">
              Đã chọn {selectedVarieties.length} giống
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loại đầu tư *</label>
            <select
              name="investmentType"
              value={form.investmentType}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              {INVESTMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mức rủi ro</label>
            <select
              name="riskLevel"
              value={form.riskLevel}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              {RISK_LEVELS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Số tiền kêu gọi (VND) *</label>
            <input
              name="requestedAmount"
              type="number"
              min={1000000}
              value={form.requestedAmount}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lợi nhuận kỳ vọng (%)</label>
            <input
              name="expectedReturn"
              type="number"
              min={0}
              max={100}
              value={form.expectedReturn}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Thời hạn (tháng)</label>
            <input
              name="duration"
              type="number"
              min={1}
              value={form.duration}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đầu tư tối thiểu</label>
            <input
              name="minimumInvestment"
              type="number"
              value={form.minimumInvestment}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đầu tư tối đa</label>
            <input
              name="maximumInvestment"
              type="number"
              value={form.maximumInvestment}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hạn huy động vốn</label>
            <input
              name="fundingDeadline"
              type="date"
              value={form.fundingDeadline}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Farmland ID (tuỳ chọn)</label>
            <input
              name="farmlandId"
              type="number"
              value={form.farmlandId}
              onChange={onChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Điều khoản hoàn trả</label>
          <textarea
            name="repaymentTerms"
            value={form.repaymentTerms}
            onChange={onChange}
            rows={2}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Đang tạo...' : 'Tạo dự án'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/investments')}
            className="px-5 py-2 border rounded-lg"
          >
            Hủy
          </button>
        </div>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
