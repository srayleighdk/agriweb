'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import InvestorNav from '@/components/layout/InvestorNav';
import {
  contactRequestService,
  ContactRequest,
  ContactRequestStatus,
  UnlockedFarmerContact,
} from '@/lib/api/contact-request';
import { Phone, Eye, Lock, Unlock } from 'lucide-react';

export default function InvestorContactsPage() {
  const [items, setItems] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactRequestStatus | ''>('');
  const [unlocked, setUnlocked] = useState<Record<number, UnlockedFarmerContact>>({});

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contactRequestService.getMine(
        statusFilter || undefined,
      );
      setItems(data || []);

      // Prefetch unlocked contacts
      const approved = (data || []).filter(
        (i) => i.status === ContactRequestStatus.APPROVED,
      );
      const entries = await Promise.all(
        approved.map(async (i) => {
          try {
            const c = await contactRequestService.getUnlockedContact(i.id);
            return [i.id, c] as const;
          } catch {
            return null;
          }
        }),
      );
      const map: Record<number, UnlockedFarmerContact> = {};
      entries.forEach((e) => {
        if (e) map[e[0]] = e[1];
      });
      setUnlocked(map);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Không thể tải danh sách liên hệ');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (s: ContactRequestStatus) =>
    ({
      PENDING: 'Chờ admin duyệt',
      APPROVED: 'Đã mở khóa',
      REJECTED: 'Bị từ chối',
    })[s];

  const statusClass = (s: ContactRequestStatus) =>
    ({
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    })[s];

  return (
    <>
      <InvestorNav />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Phone className="text-blue-600" />
              Dự án đã liên hệ
            </h1>
            <p className="text-gray-600 mt-1">
              Contact nông dân chỉ hiện sau khi admin phê duyệt yêu cầu của bạn
            </p>
          </div>

          <div className="mb-4">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ContactRequestStatus | '')
              }
              className="border rounded-lg px-3 py-2 bg-white"
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã mở khóa</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <Lock className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 mb-4">Bạn chưa gửi yêu cầu liên hệ nào</p>
              <Link
                href="/investor/opportunities"
                className="inline-flex px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Xem cơ hội đầu tư
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const contact = unlocked[item.id];
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow p-5 border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {item.farmerInvestment?.title ||
                            `Dự án #${item.farmerInvestmentId}`}
                        </h2>
                        <div className="text-sm text-gray-500 mt-1">
                          Gửi lúc {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </div>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${statusClass(item.status)}`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </div>
                      <Link
                        href={`/investor/opportunities/${item.farmerInvestmentId}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                      >
                        <Eye size={16} />
                        Xem dự án
                      </Link>
                    </div>

                    {item.status === ContactRequestStatus.APPROVED && contact && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                          <Unlock size={18} />
                          Liên hệ nông dân đã mở khóa
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Tên: </span>
                            {contact.farmerContact.name || '—'}
                          </div>
                          <div>
                            <span className="text-gray-500">Email: </span>
                            {contact.farmerContact.email}
                          </div>
                          <div>
                            <span className="text-gray-500">SĐT: </span>
                            {contact.farmerContact.phone || 'Chưa cập nhật'}
                          </div>
                          <div>
                            <span className="text-gray-500">Địa chỉ: </span>
                            {[
                              contact.farmerContact.address,
                              contact.farmerContact.commune,
                              contact.farmerContact.province,
                            ]
                              .filter(Boolean)
                              .join(', ') || '—'}
                          </div>
                        </div>
                      </div>
                    )}

                    {item.status === ContactRequestStatus.PENDING && (
                      <div className="mt-4 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        Admin đang thẩm định. Contact nông dân vẫn bị ẩn.
                      </div>
                    )}

                    {item.status === ContactRequestStatus.REJECTED && (
                      <div className="mt-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl p-3">
                        Yêu cầu bị từ chối
                        {item.adminNotes ? `: ${item.adminNotes}` : '.'} Bạn có thể gửi lại từ trang dự án.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
