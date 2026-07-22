'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  contactRequestService,
  ContactRequest,
  ContactRequestStatus,
} from '@/lib/api/contact-request';
import { Search, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

export default function AdminContactRequestsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactRequestStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await contactRequestService.getAllAdmin({
        page,
        limit,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setItems(res.data || []);
      setTotalPages(res.totalPages || 0);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Không thể tải yêu cầu liên hệ');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: ContactRequestStatus) => {
    const map = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    const labels = {
      PENDING: 'Chờ duyệt',
      APPROVED: 'Đã mở khóa',
      REJECTED: 'Từ chối',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yêu cầu liên hệ dự án</h1>
        <p className="text-gray-600 mt-1">
          Nhà đầu tư bấm Liên hệ → admin thẩm định → mở khóa contact nông dân
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), loadData())}
            placeholder="Tìm theo dự án / nhà đầu tư..."
            className="w-full pl-10 pr-3 py-2 border rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as ContactRequestStatus | '');
          }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã mở khóa</option>
          <option value="REJECTED">Từ chối</option>
        </select>
        <button
          onClick={() => {
            setPage(1);
            loadData();
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Lọc
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Đang tải...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500">
          Chưa có yêu cầu liên hệ
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dự án</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà đầu tư</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gói</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">#{item.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.farmerInvestment?.title || `Dự án #${item.farmerInvestmentId}`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>{item.investor?.user?.name || '—'}</div>
                    <div className="text-xs text-gray-500">{item.investor?.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.investor?.accessTier === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.investor?.accessTier || 'FREE'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{statusBadge(item.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/admin/contact-requests/${item.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <Eye size={16} />
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            {page}/{totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
