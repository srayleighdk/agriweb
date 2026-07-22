'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  contactRequestService,
  ContactRequest,
  ContactRequestStatus,
} from '@/lib/api/contact-request';
import Toast from '@/components/ui/Toast';
import apiClient from '@/lib/api/client';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminContactRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);

  const [item, setItem] = useState<ContactRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contactRequestService.getByIdAdmin(id);
      setItem(data);
      setAdminNotes(data.adminNotes || '');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Không thể tải chi tiết yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const markInvestorPaid = async () => {
    const investorId = item?.investorId || item?.investor?.id;
    if (!investorId) {
      setToast({ message: 'Không tìm thấy nhà đầu tư', type: 'error' });
      return;
    }
    if (!confirm('Đánh dấu nhà đầu tư này là PAID (1 năm)?')) return;
    try {
      setUpdating(true);
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      await apiClient.patch(`/admin/investors/${investorId}`, {
        accessTier: 'PAID',
        paidUntil: d.toISOString(),
      });
      setToast({ message: 'Đã đặt nhà đầu tư sang PAID', type: 'success' });
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setToast({ message: e.response?.data?.message || 'Không thể cập nhật PAID', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const review = async (status: ContactRequestStatus.APPROVED | ContactRequestStatus.REJECTED) => {
    try {
      setUpdating(true);
      await contactRequestService.review(id, { status, adminNotes: adminNotes || undefined });
      setToast({
        message:
          status === ContactRequestStatus.APPROVED
            ? 'Đã mở khóa liên hệ cho nhà đầu tư'
            : 'Đã từ chối yêu cầu liên hệ',
        type: 'success',
      });
      await load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setToast({
        message: e.response?.data?.message || 'Không thể cập nhật yêu cầu',
        type: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  if (error || !item) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
          {error || 'Không tìm thấy yêu cầu'}
        </div>
        <button
          onClick={() => router.push('/admin/contact-requests')}
          className="text-green-700 hover:underline"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  const farmer = item.farmerInvestment?.farmer;
  const farmerUser = farmer?.user;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => router.push('/admin/contact-requests')}
        className="text-green-700 hover:underline mb-4"
      >
        ← Quay lại danh sách
      </button>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yêu cầu liên hệ #{item.id}</h1>
          <p className="text-gray-600 mt-1">
            Dự án: {item.farmerInvestment?.title || `#${item.farmerInvestmentId}`}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            item.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-800'
              : item.status === 'APPROVED'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {item.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold">Nhà đầu tư</h2>
          <div>
            <div className="text-sm text-gray-500">Tên</div>
            <div className="font-medium">{item.investor?.user?.name || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="font-medium">{item.investor?.user?.email || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">SĐT</div>
            <div className="font-medium">{item.investor?.user?.phone || 'Chưa cập nhật'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Gói truy cập</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                item.investor?.accessTier === 'PAID'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {item.investor?.accessTier || 'FREE'}
              </span>
              {item.investor?.paidUntil && (
                <span className="text-xs text-gray-500">
                  đến {new Date(item.investor!.paidUntil).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
            {item.investor?.accessTier !== 'PAID' && (
              <button
                type="button"
                disabled={updating}
                onClick={markInvestorPaid}
                className="mt-2 text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Đánh dấu PAID (đã thu phí offline)
              </button>
            )}
          </div>
          <div>
            <div className="text-sm text-gray-500">Lời nhắn</div>
            <div className="font-medium whitespace-pre-wrap">{item.message || '—'}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold">Nông dân (contact thật)</h2>
          <div>
            <div className="text-sm text-gray-500">Tên</div>
            <div className="font-medium">{farmerUser?.name || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Email</div>
            <div className="font-medium">{farmerUser?.email || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">SĐT</div>
            <div className="font-medium">{farmerUser?.phone || 'Chưa cập nhật'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Địa chỉ</div>
            <div className="font-medium">
              {[farmerUser?.address, farmerUser?.commune, farmerUser?.province]
                .filter(Boolean)
                .join(', ') || '—'}
            </div>
          </div>
          <button
            onClick={() =>
              router.push(`/admin/investments/${item.farmerInvestmentId}`)
            }
            className="text-sm text-green-700 hover:underline"
          >
            Xem chi tiết dự án →
          </button>
        </div>
      </div>

      {item.status === 'PENDING' && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-3">Thẩm định & quyết định</h2>
          <p className="text-sm text-gray-600 mb-3">
            Theo quy trình Thoại: admin liên hệ 2 bên, xác nhận ý định đầu tư, rồi mới mở khóa contact.
          </p>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            placeholder="Ghi chú nội bộ (tuỳ chọn)"
            className="w-full border rounded-lg p-3 mb-4"
          />
          <div className="flex gap-3">
            <button
              disabled={updating}
              onClick={() => review(ContactRequestStatus.APPROVED)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle size={18} />
              Mở khóa liên hệ
            </button>
            <button
              disabled={updating}
              onClick={() => review(ContactRequestStatus.REJECTED)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle size={18} />
              Từ chối
            </button>
          </div>
        </div>
      )}

      {item.status !== 'PENDING' && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-2">Kết quả</h2>
          <div className="text-sm text-gray-600">
            {item.contactUnlockedAt && (
              <div>
                Mở khóa lúc: {new Date(item.contactUnlockedAt).toLocaleString('vi-VN')}
              </div>
            )}
            <div className="mt-2 whitespace-pre-wrap">
              Ghi chú: {item.adminNotes || '—'}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
