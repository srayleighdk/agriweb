import { API_BASE_URL } from './client';

export type CropLifecycleStage =
  | 'SEEDLING'
  | 'GROWING'
  | 'MATURE'
  | 'FLOWERING'
  | 'FRUITING'
  | 'HARVEST_READY'
  | 'DORMANT'
  | 'DECLINING';

export type InputCategory =
  | 'FERTILIZER'
  | 'PESTICIDE'
  | 'HERBICIDE'
  | 'FUNGICIDE'
  | 'SEED'
  | 'OTHER';

export type ActivityCategory =
  | 'LAND_PREPARATION'
  | 'PLANTING'
  | 'FERTILIZING'
  | 'SPRAYING'
  | 'IRRIGATION'
  | 'WEEDING'
  | 'PRUNING'
  | 'SCOUTING'
  | 'HARVESTING'
  | 'OTHER';

export type CertStandard = 'VIETGAP' | 'GLOBALGAP' | 'ORGANIC' | 'OTHER';

export interface TraceInput {
  name: string;
  category: InputCategory;
  activeIngredient: string | null;
  registrationNo: string | null;
  quantity: number;
  unit: string;
  preHarvestIntervalDays: number | null;
}

/** Public trace data of a published harvest batch (GET /trace/:batchCode). */
export interface Trace {
  batchCode: string;
  product: {
    plant: string;
    englishName: string | null;
    scientificName: string | null;
    variety: string;
  };
  harvest: {
    harvestDate: string;
    quantity: number;
    unit: string;
    quality: string | null;
    gradeLevel: string | null;
  };
  origin: {
    farm: string;
    commune: string | null;
    province: string | null;
    plot: { code: string; name: string | null } | null;
    plantedDate: string | null;
  };
  certifications: {
    standard: CertStandard | null;
    type: string;
    certificateNo: string | null;
    issuedBy: string | null;
    issuedAt: string | null;
    expiresAt: string | null;
  }[];
  growthStages: {
    observedAt: string;
    bbchCode: number | null;
    stage: CropLifecycleStage;
  }[];
  activities: {
    date: string;
    category: ActivityCategory | null;
    activityType: string;
    title: string;
    inputs: TraceInput[];
  }[];
  phiClearFrom: string | null;
  phiRespected: boolean;
}

/** Batch codes are "AG" plus 8 characters, read off labels and QR codes. */
export function normalizeBatchCode(raw: string): string | null {
  const code = decodeURIComponent(raw).trim().toUpperCase();
  return /^[A-Z0-9]{4,20}$/.test(code) ? code : null;
}

/**
 * Fetches a batch's trace data, or null when no public batch has the code.
 * Not cached: unpublishing a batch must hide its page at once.
 */
export async function getTrace(batchCode: string): Promise<Trace | null> {
  const res = await fetch(`${API_BASE_URL}/trace/${batchCode}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Trace request failed: ${res.status}`);
  return res.json() as Promise<Trace>;
}

export const stageLabels: Record<CropLifecycleStage, string> = {
  SEEDLING: 'Cây con',
  GROWING: 'Sinh trưởng',
  MATURE: 'Trưởng thành',
  FLOWERING: 'Ra hoa',
  FRUITING: 'Nuôi quả',
  HARVEST_READY: 'Sẵn sàng thu hoạch',
  DORMANT: 'Ngủ nghỉ',
  DECLINING: 'Tàn',
};

export const inputCategoryLabels: Record<InputCategory, string> = {
  FERTILIZER: 'Phân bón',
  PESTICIDE: 'Thuốc trừ sâu',
  HERBICIDE: 'Thuốc trừ cỏ',
  FUNGICIDE: 'Thuốc trừ bệnh',
  SEED: 'Giống',
  OTHER: 'Khác',
};

export const activityCategoryLabels: Record<ActivityCategory, string> = {
  LAND_PREPARATION: 'Làm đất',
  PLANTING: 'Gieo trồng',
  FERTILIZING: 'Bón phân',
  SPRAYING: 'Phun thuốc',
  IRRIGATION: 'Tưới nước',
  WEEDING: 'Làm cỏ',
  PRUNING: 'Tỉa cành',
  SCOUTING: 'Thăm đồng',
  HARVESTING: 'Thu hoạch',
  OTHER: 'Khác',
};

export const certStandardLabels: Record<CertStandard, string> = {
  VIETGAP: 'VietGAP',
  GLOBALGAP: 'GlobalGAP',
  ORGANIC: 'Hữu cơ',
  OTHER: 'Khác',
};

/** BBCH principal growth stages: the tens digit of a BBCH code. */
export const bbchPrincipalStages = [
  'Nảy mầm',
  'Phát triển lá',
  'Đẻ nhánh, ra chồi',
  'Vươn lóng, phát triển thân',
  'Phát triển bộ phận thu hoạch',
  'Xuất hiện hoa, trổ bông',
  'Ra hoa',
  'Phát triển quả, hạt',
  'Chín',
  'Già cỗi, ngủ nghỉ',
];
