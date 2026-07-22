'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { investmentsService, Investment } from '@/lib/api/investments';
import { uploadService } from '@/lib/api/upload';
import { getImageUrl } from '@/lib/api/client';
import Toast from '@/components/ui/Toast';

const INVESTMENT_TYPES = [
  'CROP_FUNDING',
  'LIVESTOCK_FUNDING',
  'FARMLAND_EXPANSION',
  'EQUIPMENT_PURCHASE',
  'INFRASTRUCTURE',
];

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];

export default function AdminEditInvestmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
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
    collateral: '',
    insurance: '',
    imagesText: '',
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await investmentsService.getInvestmentByIdAdmin(id);
        setInvestment(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          investmentType: data.investmentType || 'CROP_FUNDING',
          requestedAmount: data.requestedAmount?.toString() || '',
          expectedReturn: data.expectedReturn?.toString() || '',
          duration: data.duration?.toString() || '',
          riskLevel: data.riskLevel || 'MEDIUM',
          minimumInvestment: data.minimumInvestment?.toString() || '',
          maximumInvestment: data.maximumInvestment?.toString() || '',
          fundingDeadline: data.fundingDeadline
            ? new Date(data.fundingDeadline).toISOString().split('T')[0]
            : '',
          repaymentTerms: data.repaymentTerms || '',
          collateral: data.collateral || '',
          insurance: data.insurance || '',
          imagesText: (data.images || []).join('\n'),
        });
        setImages(data.images || []);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message || 'Không thể tải dự án');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.requestedAmount) {
      setToast({ message: 'Vui lòng nhập tiêu đề và số tiền', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const imageList = images.length
        ? images
        : form.imagesText
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);

      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || undefined,
        investmentType: form.investmentType,
        requestedAmount: parseFloat(form.requestedAmount),
        riskLevel: form.riskLevel,
        repaymentTerms: form.repaymentTerms || undefined,
        collateral: form.collateral || undefined,
        insurance: form.insurance || undefined,
        images: imageList,
      };

      if (form.expectedReturn) payload.expectedReturn = parseFloat(form.expectedReturn);
      if (form.duration) payload.duration = parseInt(form.duration, 10);
      if (form.minimumInvestment) {
        payload.minimumInvestment = parseFloat(form.minimumInvestment);
      }
      if (form.maximumInvestment) {
        payload.maximumInvestment = parseFloat(form.maximumInvestment);
      }
      if (form.fundingDeadline) payload.fundingDeadline = form.fundingDeadline;

      await investmentsService.updateInvestmentAdmin(id, payload);
      setToast({ message: 'Đã cập nhật dự án', type: 'success' });
      setTimeout(() => router.push(`/admin/investments/${id}`), 700);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setToast({
        message: error.response?.data?.message || 'Không thể cập nhật dự án',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  if (error || !investment) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          {error || 'Không tìm thấy dự án'}
        </div>
        <button
          onClick={() => router.push('/admin/investments')}
          className="text-green-700 hover:underline"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.push(`/admin/investments/${id}`)}
        className="text-green-700 hover:underline mb-4"
      >
        ← Quay lại chi tiết
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Sửa dự án #{id}</h1>
      <p className="text-gray-600 mb-6">{investment.title}</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên dự án *</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loại đầu tư</label>
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
          <label className="block text-sm font-medium mb-1">Điều khoản hoàn trả</label>
          <textarea
            name="repaymentTerms"
            value={form.repaymentTerms}
            onChange={onChange}
            rows={2}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tài sản đảm bảo</label>
            <textarea
              name="collateral"
              value={form.collateral}
              onChange={onChange}
              rows={2}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bảo hiểm</label>
            <textarea
              name="insurance"
              value={form.insurance}
              onChange={onChange}
              rows={2}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ảnh dự án</label>
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {images.map((img, idx) => (
                <div key={`${img}-${idx}`} className="relative border rounded-lg overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageUrl(img)} alt={`img-${idx}`} className="w-full h-28 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const next = images.filter((_, i) => i !== idx);
                      setImages(next);
                      setForm((f) => ({ ...f, imagesText: next.join('\n') }));
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              {uploading ? 'Đang upload...' : 'Upload ảnh'}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  try {
                    setUploading(true);
                    const uploaded = await uploadService.uploadMultipleImages(files);
                    const urls = uploaded.map((u) => u.url).filter(Boolean);
                    const next = [...images, ...urls];
                    setImages(next);
                    setForm((f) => ({ ...f, imagesText: next.join('\n') }));
                    setToast({ message: `Đã upload ${urls.length} ảnh`, type: 'success' });
                  } catch (err: unknown) {
                    const error = err as { response?: { data?: { message?: string } } };
                    setToast({
                      message: error.response?.data?.message || 'Upload ảnh thất bại',
                      type: 'error',
                    });
                  } finally {
                    setUploading(false);
                    e.target.value = '';
                  }
                }}
              />
            </label>
            <p className="text-xs text-gray-500">Hoặc dán URL ảnh (mỗi dòng 1 URL) bên dưới.</p>
          </div>
          <textarea
            name="imagesText"
            value={form.imagesText}
            onChange={(e) => {
              onChange(e);
              setImages(
                e.target.value
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              );
            }}
            rows={3}
            placeholder="https://.../image1.jpg"
            className="w-full border rounded-lg px-3 py-2 font-mono text-sm mt-3"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/admin/investments/${id}`)}
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
