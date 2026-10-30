import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  activityCategoryLabels,
  bbchPrincipalStages,
  certStandardLabels,
  getTrace,
  inputCategoryLabels,
  normalizeBatchCode,
  stageLabels,
  type Trace,
} from '@/lib/api/trace';

type Props = { params: Promise<{ code: string }> };

// Dates are stored in UTC; farms and buyers read them in Vietnam time.
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatNumber(n: number): string {
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
}

async function load(params: Props['params']): Promise<Trace | null> {
  const code = normalizeBatchCode((await params).code);
  return code ? getTrace(code) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trace = await load(params);
  return {
    title: trace
      ? `${trace.product.plant} ${trace.product.variety} · Truy xuất nguồn gốc`
      : 'Truy xuất nguồn gốc',
    // Codes are meant to be reached from a label, not from a search engine.
    robots: { index: false, follow: false },
  };
}

export default async function TracePage({ params }: Props) {
  const trace = await load(params);
  if (!trace) notFound();

  const { product, harvest, origin } = trace;
  const place = [origin.commune, origin.province].filter(Boolean).join(', ');
  const grade = [harvest.quality, harvest.gradeLevel].filter(Boolean).join(' · ');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <section className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Truy xuất nguồn gốc</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              {product.plant} · {product.variety}
            </h1>
            {product.scientificName && (
              <p className="text-sm italic text-gray-500">{product.scientificName}</p>
            )}
            <p className="mt-3 font-mono text-lg tracking-widest text-gray-800">
              {trace.batchCode}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500">Ngày thu hoạch</dt>
                <dd className="font-medium">{formatDate(harvest.harvestDate)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Sản lượng lô</dt>
                <dd className="font-medium">
                  {formatNumber(harvest.quantity)} {harvest.unit}
                </dd>
              </div>
              {grade && (
                <div className="col-span-2">
                  <dt className="text-gray-500">Chất lượng</dt>
                  <dd className="font-medium">{grade}</dd>
                </div>
              )}
            </dl>
            <div
              className={`mt-4 flex items-start gap-2 rounded-lg p-3 text-sm ${
                trace.phiRespected
                  ? 'bg-green-50 text-green-800'
                  : 'bg-orange-50 text-orange-800'
              }`}
            >
              {trace.phiRespected ? (
                <ShieldCheck className="h-5 w-5 shrink-0" />
              ) : (
                <ShieldAlert className="h-5 w-5 shrink-0" />
              )}
              <span>
                {trace.phiRespected
                  ? trace.phiClearFrom
                    ? `Thu hoạch sau thời gian cách ly của thuốc và phân bón đã dùng (an toàn từ ${formatDate(trace.phiClearFrom)}).`
                    : 'Không dùng vật tư nào có thời gian cách ly.'
                  : `Thu hoạch trước khi hết thời gian cách ly (an toàn từ ${formatDate(trace.phiClearFrom!)}).`}
              </span>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
              <MapPin className="h-5 w-5 text-green-600" /> Nguồn gốc
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Nông trại</dt>
                <dd className="font-medium text-right">{origin.farm}</dd>
              </div>
              {place && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Địa chỉ</dt>
                  <dd className="font-medium text-right">{place}</dd>
                </div>
              )}
              {origin.plot && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Lô trồng</dt>
                  <dd className="font-medium text-right">
                    {origin.plot.name
                      ? `${origin.plot.code} · ${origin.plot.name}`
                      : origin.plot.code}
                  </dd>
                </div>
              )}
              {origin.plantedDate && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Ngày gieo trồng</dt>
                  <dd className="font-medium text-right">
                    {formatDate(origin.plantedDate)}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {trace.certifications.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <BadgeCheck className="h-5 w-5 text-green-600" /> Chứng nhận
              </h2>
              <ul className="mt-3 space-y-3 text-sm">
                {trace.certifications.map((c, i) => (
                  <li key={i} className="border-l-4 border-green-500 pl-3">
                    <p className="font-medium">
                      {c.standard ? certStandardLabels[c.standard] : c.type}
                      {c.certificateNo && ` · Số ${c.certificateNo}`}
                    </p>
                    <p className="text-gray-500">
                      {[
                        c.issuedBy && `Cấp bởi ${c.issuedBy}`,
                        c.issuedAt && `ngày ${formatDate(c.issuedAt)}`,
                        c.expiresAt && `hiệu lực đến ${formatDate(c.expiresAt)}`,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {trace.growthStages.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <Sprout className="h-5 w-5 text-green-600" /> Quá trình sinh trưởng
              </h2>
              <ol className="mt-3 space-y-2 text-sm">
                {trace.growthStages.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-24 shrink-0 text-gray-500">
                      {formatDate(s.observedAt)}
                    </span>
                    <span>
                      {s.bbchCode != null
                        ? `BBCH ${String(s.bbchCode).padStart(2, '0')} · ${bbchPrincipalStages[Math.floor(s.bbchCode / 10)]}`
                        : stageLabels[s.stage]}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {trace.activities.length > 0 && (
            <section className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                <ClipboardList className="h-5 w-5 text-green-600" /> Nhật ký canh tác
              </h2>
              <ol className="mt-3 space-y-4 text-sm">
                {trace.activities.map((a, i) => (
                  <li key={i}>
                    <p className="flex items-center gap-2 text-gray-500">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(a.date)}
                      {a.category && ` · ${activityCategoryLabels[a.category]}`}
                    </p>
                    <p className="font-medium text-gray-900">{a.title}</p>
                    {a.inputs.length > 0 && (
                      <ul className="mt-1 space-y-1">
                        {a.inputs.map((input, j) => (
                          <li key={j} className="rounded bg-gray-50 px-3 py-2">
                            <p>
                              {input.name} · {formatNumber(input.quantity)} {input.unit}
                              <span className="text-gray-500">
                                {' '}
                                ({inputCategoryLabels[input.category]})
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              {[
                                input.activeIngredient &&
                                  `Hoạt chất: ${input.activeIngredient}`,
                                input.registrationNo &&
                                  `Số đăng ký: ${input.registrationNo}`,
                                input.preHarvestIntervalDays != null &&
                                  `Cách ly ${input.preHarvestIntervalDays} ngày`,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
