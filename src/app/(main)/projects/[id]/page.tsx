'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import { investmentsService, Investment } from '@/lib/api/investments';
import {
  contactRequestService,
  ContactRequest,
  ContactRequestStatus,
} from '@/lib/api/contact-request';
import { investorService } from '@/lib/api/investor';
import { farmerService } from '@/lib/api/farmer';
import { getImageUrl } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';
import { Role } from '@/types';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Lock,
  Map,
  MapPin,
  Phone,
  Shield,
  Target,
  TrendingUp,
  Unlock,
  User,
  X,
} from 'lucide-react';

const riskLabel: Record<string, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  VERY_HIGH: 'Rất cao',
};

const typeLabel: Record<string, string> = {
  CROP_FUNDING: 'Cây trồng',
  LIVESTOCK_FUNDING: 'Chăn nuôi',
  FARMLAND_EXPANSION: 'Mở rộng đất',
  EQUIPMENT_PURCHASE: 'Thiết bị',
  INFRASTRUCTURE: 'Hạ tầng',
};

function isUsableImageUrl(url?: string | null) {
  if (!url) return false;
  if (/example\.com/i.test(url)) return false;
  return true;
}

const ProjectLocationMap = dynamic(
  () => import('@/components/maps/ProjectLocationMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[300px] bg-gray-100 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Đang tải bản đồ...</p>
        </div>
      </div>
    ),
  },
);

export default function PublicProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string, 10);

  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  const [project, setProject] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [brokenCover, setBrokenCover] = useState(false);

  // Investor contact/invest state
  const [contactRequest, setContactRequest] = useState<ContactRequest | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [investmentNotes, setInvestmentNotes] = useState('');
  const [submittingInvest, setSubmittingInvest] = useState(false);
  const [investError, setInvestError] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const role = user?.role;
  const isInvestor = isAuthenticated && role === Role.INVESTOR;
  const isFarmer = isAuthenticated && role === Role.FARMER;
  const isAdmin = isAuthenticated && role === Role.ADMIN;

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setBrokenCover(false);

      // Prefer authenticated detail when logged in (unlock state for investor, full for owner)
      let data: Investment;
      if (isAuthenticated && (isInvestor || isFarmer || isAdmin)) {
        try {
          data = await investmentsService.getInvestmentById(projectId);
        } catch {
          data = await investmentsService.getPublicInvestmentById(projectId);
        }
      } else {
        data = await investmentsService.getPublicInvestmentById(projectId);
      }
      setProject(data);

      // Role redirects: owner/admin go to their management pages
      if (isAdmin) {
        router.replace(`/admin/investments/${projectId}`);
        return;
      }
      if (isFarmer) {
        try {
          const profile = await farmerService.getProfile();
          if (profile?.id && data.farmerId === profile.id) {
            router.replace(`/farmer/investments/${projectId}`);
            return;
          }
        } catch {
          // stay on public page if profile fetch fails
        }
      }

      if (isInvestor) {
        try {
          const cr = await contactRequestService.getForProject(projectId);
          setContactRequest(cr);
        } catch {
          setContactRequest(null);
        }
      } else {
        setContactRequest(null);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Không tìm thấy dự án');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, isAuthenticated, isInvestor, isFarmer, isAdmin, router]);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!Number.isFinite(projectId)) {
      setError('ID dự án không hợp lệ');
      setLoading(false);
      return;
    }
    loadProject();
  }, [_hasHydrated, projectId, loadProject]);

  const cover = useMemo(() => {
    if (!project?.images?.length) return null;
    return project.images.find((img) => isUsableImageUrl(img)) || null;
  }, [project]);

  const currentAmount = Number(project?.currentAmount) || 0;
  const requestedAmount = Number(project?.requestedAmount) || 0;
  const progress =
    requestedAmount > 0
      ? Math.min(100, Math.round((currentAmount / requestedAmount) * 100))
      : 0;
  const remaining = Math.max(0, requestedAmount - currentAmount);
  const mapLocation = project?.preciseLocation ?? project?.approxLocation ?? null;

  const loginHref = `/login?next=${encodeURIComponent(`/projects/${projectId}`)}`;
  const registerHref = `/register?next=${encodeURIComponent(`/projects/${projectId}`)}`;

  const formatNumberWithCommas = (value: string) =>
    value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setInvestmentAmount(raw);
    setDisplayAmount(formatNumberWithCommas(raw));
  };

  const handleContactSubmit = async () => {
    if (!project) return;
    try {
      setContactLoading(true);
      const created = await contactRequestService.create({
        farmerInvestmentId: project.id,
        message: contactMessage || undefined,
      });
      setContactRequest(created);
      setShowContactModal(false);
      setToast({
        message: 'Đã gửi yêu cầu liên hệ. Admin sẽ thẩm định và phản hồi.',
        type: 'success',
      });
      await loadProject();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setToast({
        message: e.response?.data?.message || 'Không thể gửi yêu cầu liên hệ',
        type: 'error',
      });
    } finally {
      setContactLoading(false);
    }
  };

  const handleInvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount < 100000) {
      setInvestError('Số tiền đầu tư tối thiểu là 100,000 VND');
      return;
    }
    if (amount > remaining) {
      setInvestError(`Dự án chỉ cần thêm ₫${remaining.toLocaleString('vi-VN')}`);
      return;
    }
    try {
      setSubmittingInvest(true);
      setInvestError('');
      await investorService.createInvestment({
        farmerInvestmentId: project.id,
        amount,
        expectedReturn: project.expectedReturn || undefined,
        notes: investmentNotes || undefined,
      });
      setShowInvestModal(false);
      setToast({
        message: 'Đầu tư thành công! Chúng tôi sẽ xử lý yêu cầu của bạn.',
        type: 'success',
      });
      setTimeout(() => router.push('/investor/portfolio'), 1200);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setInvestError(error.response?.data?.message || 'Không thể tạo đầu tư');
    } finally {
      setSubmittingInvest(false);
    }
  };

  if (!_hasHydrated || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">Đang tải dự án...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-red-700 mb-6">{error || 'Không tìm thấy dự án'}</p>
          <Link href="/#projects" className="text-green-700 hover:underline inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Quay lại danh sách dự án
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const province =
    project.farmer?.user?.province ||
    (project.farmland as { province?: string | null } | undefined)?.province ||
    null;
  const farmerName = project.farmer?.user?.name || 'Nông dân';
  const unlocked = project.unlockedFarmerContact;
  const showCover = !!cover && !brokenCover;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-green-700 hover:underline mb-6"
          >
            <ArrowLeft size={16} />
            Quay lại dự án
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-green-100 to-emerald-200">
                  {showCover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(cover!)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => setBrokenCover(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Target className="h-20 w-20 text-green-600 opacity-80" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 top-0 p-4 flex justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/95 text-xs font-semibold shadow">
                      {typeLabel[project.investmentType || ''] ||
                        project.investmentType ||
                        'Dự án'}
                    </span>
                    {project.riskLevel && (
                      <span className="px-3 py-1 rounded-full bg-white/95 text-xs font-semibold shadow inline-flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        {riskLabel[project.riskLevel] || project.riskLevel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3 break-words">
                    {project.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <span className="inline-flex items-center gap-1">
                      <User size={16} /> {farmerName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={16} /> {province || 'Việt Nam'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp size={16} />
                      {project.expectedReturn != null
                        ? `${project.expectedReturn}% kỳ vọng`
                        : 'Lợi nhuận: —'}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {project.description || 'Chưa có mô tả chi tiết.'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Tiến độ huy động</h2>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Đã huy động</span>
                  <span className="font-semibold">
                    ₫{currentAmount.toLocaleString('vi-VN')} / ₫
                    {requestedAmount.toLocaleString('vi-VN')} ({progress}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">Còn cần</div>
                    <div className="font-semibold">
                      ₫{remaining.toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">Thời hạn</div>
                    <div className="font-semibold">
                      {project.duration ? `${project.duration} tháng` : '—'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">Tối thiểu</div>
                    <div className="font-semibold">
                      {project.minimumInvestment
                        ? `₫${Number(project.minimumInvestment).toLocaleString('vi-VN')}`
                        : '₫100,000'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500">Rủi ro</div>
                    <div className="font-semibold">
                      {riskLabel[project.riskLevel] || project.riskLevel || '—'}
                    </div>
                  </div>
                </div>
              </div>

              {mapLocation && (
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Map className="h-5 w-5 text-green-600" />
                    Vị trí dự án
                  </h2>
                  <div className="h-[300px] rounded-xl overflow-hidden">
                    <ProjectLocationMap
                      lat={mapLocation.lat}
                      lng={mapLocation.lng}
                      precision={mapLocation.precision}
                      radiusMeters={
                        mapLocation.precision === 'APPROXIMATE'
                          ? mapLocation.radiusMeters
                          : undefined
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
                    {mapLocation.precision === 'EXACT' ? (
                      <>
                        <Unlock size={14} className="mt-0.5 shrink-0 text-green-600" />
                        Vị trí chính xác của trang trại.
                      </>
                    ) : (
                      <>
                        <Lock size={14} className="mt-0.5 shrink-0" />
                        Vị trí gần đúng trong bán kính ~3km. Mở khóa liên hệ để xem vị trí chính
                        xác.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Action panel */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-3">Tham gia dự án</h2>

                {/* Guest */}
                {!isAuthenticated && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Contact nông dân bị ẩn. Đăng nhập với tài khoản nhà đầu tư để gửi yêu cầu
                      liên hệ hoặc đầu tư.
                    </p>
                    <Link
                      href={loginHref}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
                    >
                      Đăng nhập nhà đầu tư
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      href={registerHref}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border rounded-xl font-semibold hover:bg-gray-50"
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}

                {/* Investor actions */}
                {isInvestor && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
                        <Phone size={18} className="text-blue-600" />
                        Liên hệ nông dân
                      </div>

                      {unlocked ? (
                        <div className="bg-white rounded-lg border border-green-200 p-3 text-sm space-y-1">
                          <div className="flex items-center gap-1 text-green-700 font-semibold mb-1">
                            <Unlock size={16} /> Đã mở khóa
                          </div>
                          <div>Tên: {unlocked.name || '—'}</div>
                          <div>Email: {unlocked.email}</div>
                          <div>SĐT: {unlocked.phone || 'Chưa cập nhật'}</div>
                        </div>
                      ) : contactRequest?.status === ContactRequestStatus.PENDING ? (
                        <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                          <Lock size={16} className="mt-0.5 shrink-0" />
                          Đã gửi yêu cầu — chờ admin duyệt
                        </div>
                      ) : contactRequest?.status === ContactRequestStatus.REJECTED ? (
                        <div className="space-y-2">
                          <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3">
                            Yêu cầu bị từ chối. Bạn có thể gửi lại.
                          </div>
                          <button
                            onClick={() => setShowContactModal(true)}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
                          >
                            Gửi lại yêu cầu liên hệ
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowContactModal(true)}
                          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 inline-flex items-center justify-center gap-2"
                        >
                          <Phone size={18} />
                          Liên hệ
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowInvestModal(true);
                        setInvestmentAmount('');
                        setDisplayAmount('');
                        setInvestmentNotes('');
                        setInvestError('');
                      }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-blue-700 inline-flex items-center justify-center gap-2"
                    >
                      <DollarSign size={20} />
                      Đầu tư ngay
                    </button>

                    <Link
                      href="/investor/contacts"
                      className="block text-center text-sm text-blue-700 hover:underline"
                    >
                      Xem dự án đã liên hệ
                    </Link>
                  </div>
                )}

                {/* Other logged-in non-investor roles (non-owner farmer/company) */}
                {isAuthenticated && !isInvestor && !isAdmin && (
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>
                      Bạn đang đăng nhập với vai trò <b>{role}</b>. Chỉ nhà đầu tư mới có thể gửi
                      yêu cầu liên hệ hoặc đầu tư vào dự án này.
                    </p>
                    {isFarmer && (
                      <Link
                        href="/farmer/investments"
                        className="inline-flex text-green-700 hover:underline"
                      >
                        Về dự án của tôi
                      </Link>
                    )}
                  </div>
                )}

                <div className="mt-5 pt-4 border-t text-xs text-gray-500 flex items-start gap-2">
                  <Lock size={14} className="mt-0.5 shrink-0" />
                  Email/SĐT nông dân luôn ẩn với khách. Nhà đầu tư chỉ thấy sau khi admin phê duyệt
                  yêu cầu liên hệ.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Contact modal */}
      {showContactModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Yêu cầu liên hệ</h3>
              <button onClick={() => setShowContactModal(false)} className="text-gray-400">
                <X size={22} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Admin sẽ nhận yêu cầu, thẩm định hai bên, rồi mới mở khóa contact nông dân.
            </p>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={4}
              placeholder="Bạn muốn đầu tư thế nào? (tuỳ chọn)"
              className="w-full border rounded-xl p-3 mb-4"
            />
            <button
              onClick={handleContactSubmit}
              disabled={contactLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {contactLoading ? 'Đang gửi...' : 'Gửi yêu cầu liên hệ'}
            </button>
          </div>
        </div>
      )}

      {/* Invest modal */}
      {showInvestModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Xác nhận đầu tư</h3>
              <button onClick={() => setShowInvestModal(false)} className="text-gray-400">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleInvestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Số tiền (VND)</label>
                <input
                  value={displayAmount}
                  onChange={handleAmountChange}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="1,000,000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <textarea
                  value={investmentNotes}
                  onChange={(e) => setInvestmentNotes(e.target.value)}
                  rows={3}
                  className="w-full border rounded-xl px-3 py-2"
                />
              </div>
              {investError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
                  {investError}
                </div>
              )}
              <button
                type="submit"
                disabled={submittingInvest}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {submittingInvest ? 'Đang gửi...' : 'Xác nhận đầu tư'}
              </button>
            </form>
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
