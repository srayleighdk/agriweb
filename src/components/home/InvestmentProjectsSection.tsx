'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  investmentsService,
  Investment,
} from '@/lib/api/investments';
import { getImageUrl } from '@/lib/api/client';
import {
  ArrowRight,
  Coins,
  MapPin,
  TrendingUp,
  Target,
  Shield,
} from 'lucide-react';

const riskLabel: Record<string, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  VERY_HIGH: 'Rất cao',
};

const riskClass: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  VERY_HIGH: 'bg-red-100 text-red-800',
};

const investmentTypeLabel: Record<string, string> = {
  CROP_FUNDING: 'Cây trồng',
  LIVESTOCK_FUNDING: 'Chăn nuôi',
  FARMLAND_EXPANSION: 'Mở rộng đất',
  EQUIPMENT_PURCHASE: 'Thiết bị',
  INFRASTRUCTURE: 'Hạ tầng',
};

function formatInvestmentType(type?: string | null) {
  if (!type) return 'Dự án';
  return investmentTypeLabel[type] || type.replaceAll('_', ' ');
}

function isUsableImageUrl(url?: string | null) {
  if (!url) return false;
  // Skip obvious placeholder/example URLs used in smoke tests
  if (/example\.com/i.test(url)) return false;
  return true;
}

export function InvestmentProjectsSection() {
  const [projects, setProjects] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await investmentsService.getInvestments({
        page: 1,
        limit: 6,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setProjects(res.data || []);
      setBrokenImages({});
    } catch (err) {
      console.error('Failed to load homepage projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="projects" className="py-20 px-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải dự án đầu tư...</p>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section
      id="projects"
      className="py-20 px-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
            <Coins className="h-4 w-4" />
            Cơ hội đầu tư
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Dự Án Kêu Gọi Đầu Tư
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá các dự án nông nghiệp đang mở. Thông tin liên hệ nông dân được bảo vệ —
            đăng nhập nhà đầu tư và gửi yêu cầu liên hệ để admin mở khóa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const current = Number(project.currentAmount) || 0;
            const requested = Number(project.requestedAmount) || 0;
            const progress =
              requested > 0 ? Math.min(100, Math.round((current / requested) * 100)) : 0;
            const cover = project.images?.find((img) => isUsableImageUrl(img));
            const showImage = !!cover && !brokenImages[project.id];
            const province =
              project.farmer?.user?.province ||
              (project.farmland as { province?: string | null } | undefined)?.province ||
              null;
            const farmerName = project.farmer?.user?.name || 'Nông dân';

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-green-50 flex flex-col h-full"
              >
                <div className="relative h-44 bg-gradient-to-br from-green-100 to-emerald-200 overflow-hidden shrink-0">
                  {showImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getImageUrl(cover!)}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={() =>
                        setBrokenImages((prev) => ({
                          ...prev,
                          [project.id]: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Target className="h-16 w-16 text-green-600 opacity-80" />
                    </div>
                  )}

                  {/* Badge row stays on cover only; title lives below in body */}
                  <div className="absolute inset-x-0 top-0 z-10 p-3 flex items-start justify-between gap-2 pointer-events-none">
                    <span className="max-w-[55%] truncate px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-[11px] font-semibold text-gray-800 shadow-sm">
                      {formatInvestmentType(project.investmentType)}
                    </span>
                    {project.riskLevel ? (
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm ${
                          riskClass[project.riskLevel] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <Shield className="h-3 w-3" />
                        {riskLabel[project.riskLevel] || project.riskLevel}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 break-words group-hover:text-green-600 transition-colors">
                    {project.title}
                  </h4>
                  {project.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 break-words">
                      {project.description}
                    </p>
                  )}

                  <div className="space-y-3 mb-4 mt-auto">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Mục tiêu</span>
                      <span className="font-semibold text-gray-900">
                        ₫{requested.toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Tiến độ</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        {project.expectedReturn != null
                          ? `${project.expectedReturn}%`
                          : '—'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-green-600" />
                        {province || 'Việt Nam'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Nông dân: <span className="font-medium text-gray-700">{farmerName}</span>
                      <span className="text-gray-400"> · contact ẩn</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between text-sm">
                    <span className="text-green-700 font-semibold group-hover:underline">
                      Xem chi tiết
                    </span>
                    <ArrowRight className="h-4 w-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Xem Tất Cả Dự Án
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
