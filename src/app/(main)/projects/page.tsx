'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { investmentsService, Investment } from '@/lib/api/investments';
import { getImageUrl } from '@/lib/api/client';
import { ArrowRight, MapPin, Target, TrendingUp, Shield } from 'lucide-react';

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

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [broken, setBroken] = useState<Record<number, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await investmentsService.getInvestments({
          page: 1,
          limit: 24,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        setProjects(res.data || []);
      } catch {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Dự án kêu gọi đầu tư</h1>
            <p className="text-gray-600 max-w-2xl">
              Xem các dự án nông nghiệp đang mở. Contact nông dân bị ẩn cho khách — đăng nhập nhà đầu tư để liên hệ hoặc đầu tư.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">Đang tải dự án...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Chưa có dự án công khai</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const cover = project.images?.find((i) => isUsableImageUrl(i));
                const show = !!cover && !broken[project.id];
                const requested = Number(project.requestedAmount) || 0;
                const current = Number(project.currentAmount) || 0;
                const progress =
                  requested > 0 ? Math.min(100, Math.round((current / requested) * 100)) : 0;
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden border border-green-50 flex flex-col"
                  >
                    <div className="relative h-44 bg-gradient-to-br from-green-100 to-emerald-200">
                      {show ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getImageUrl(cover!)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={() =>
                            setBroken((p) => ({
                              ...p,
                              [project.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Target className="h-14 w-14 text-green-600" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 top-0 p-3 flex justify-between gap-2">
                        <span className="px-2.5 py-1 bg-white/95 rounded-full text-[11px] font-semibold">
                          {typeLabel[project.investmentType || ''] || 'Dự án'}
                        </span>
                        {project.riskLevel && (
                          <span className="px-2.5 py-1 bg-white/95 rounded-full text-[11px] font-semibold inline-flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {riskLabel[project.riskLevel] || project.riskLevel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
                        {project.title}
                      </h2>
                      <div className="text-sm text-gray-600 mb-3">
                        ₫{requested.toLocaleString('vi-VN')} · {progress}%
                      </div>
                      <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {project.expectedReturn != null ? `${project.expectedReturn}%` : '—'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {project.farmer?.user?.province || 'VN'}
                        </span>
                        <span className="text-green-700 font-semibold inline-flex items-center gap-1">
                          Xem <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
