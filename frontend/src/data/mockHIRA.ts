export interface HiraItem {
  name: string;
  code: string;
  price: number;
  type: '급여' | '비급여(평균)' | '선택진료';
  category: '검사' | '처치' | '영상' | '수술' | '상담';
}

export interface HiraResult {
  disease: string;
  icd: string;
  description: string;
  items: HiraItem[];
}

const DB: Record<string, HiraResult> = {
  치매: {
    disease: '치매',
    icd: 'F00–F03',
    description: '알츠하이머·혈관성 치매 등 인지기능 저하 질환',
    items: [
      { name: '간이정신상태검사 (MMSE)', code: 'L2603', price: 15_400, type: '급여', category: '검사' },
      { name: '신경인지기능검사 (SNSB)', code: 'L2611', price: 87_000, type: '급여', category: '검사' },
      { name: '뇌 MRI (조영제 포함)', code: 'HH141', price: 512_000, type: '비급여(평균)', category: '영상' },
      { name: '아세틸콜린에스테라제 억제제', code: 'N06DA', price: 28_000, type: '급여', category: '처치' },
      { name: '치매 안심센터 상담', code: 'Z71.3', price: 0, type: '급여', category: '상담' },
    ],
  },
  고혈압: {
    disease: '고혈압',
    icd: 'I10',
    description: '일차성·이차성 고혈압, 수축기 140mmHg 이상',
    items: [
      { name: '혈압 측정 (외래)', code: 'E6551', price: 4_200, type: '급여', category: '검사' },
      { name: '24시간 활동혈압 검사', code: 'E6555', price: 42_000, type: '급여', category: '검사' },
      { name: '심전도 (12유도)', code: 'E6100', price: 18_700, type: '급여', category: '검사' },
      { name: '칼슘채널차단제 (암로디핀)', code: 'C08CA01', price: 3_800, type: '급여', category: '처치' },
      { name: '심장초음파', code: 'E4301', price: 148_000, type: '급여', category: '영상' },
    ],
  },
  당뇨: {
    disease: '당뇨',
    icd: 'E11',
    description: '제2형 당뇨병, 인슐린 비의존성',
    items: [
      { name: '공복혈당 검사', code: 'D2601', price: 5_600, type: '급여', category: '검사' },
      { name: '당화혈색소 (HbA1c)', code: 'D2605', price: 12_100, type: '급여', category: '검사' },
      { name: '안저 검사 (합병증 선별)', code: 'F0201', price: 21_300, type: '급여', category: '검사' },
      { name: '메트포르민 처방', code: 'A10BA02', price: 2_400, type: '급여', category: '처치' },
      { name: '당뇨발 관리 교육', code: 'Z71.89', price: 8_500, type: '급여', category: '상담' },
    ],
  },
  뇌졸중: {
    disease: '뇌졸중',
    icd: 'I63',
    description: '허혈성 뇌졸중, 골든타임 4.5시간 내 치료 필수',
    items: [
      { name: '뇌 CT (비조영)', code: 'HH101', price: 68_000, type: '급여', category: '영상' },
      { name: '뇌 MRI + MRA', code: 'HH151', price: 380_000, type: '비급여(평균)', category: '영상' },
      { name: '정맥 내 혈전용해술 (tPA)', code: 'M6561', price: 1_240_000, type: '급여', category: '수술' },
      { name: '신경학적 결손 평가 (NIHSS)', code: 'L2701', price: 24_000, type: '급여', category: '검사' },
      { name: '재활치료 (초기 집중)', code: 'MM101', price: 65_000, type: '급여', category: '처치' },
    ],
  },
  암: {
    disease: '암',
    icd: 'C00–D49',
    description: '악성 신생물 통칭, 5대 암 기준 국가검진 포함',
    items: [
      { name: '종양표지자 검사 (CEA, CA125)', code: 'D4251', price: 32_000, type: '급여', category: '검사' },
      { name: 'PET-CT (전신 영상)', code: 'HH701', price: 920_000, type: '선택진료', category: '영상' },
      { name: '조직 생검 (침생검)', code: 'N2001', price: 185_000, type: '급여', category: '검사' },
      { name: '항암 화학요법 (1사이클)', code: 'M6011', price: 1_800_000, type: '급여', category: '처치' },
      { name: '방사선 치료 (IMRT, 1분획)', code: 'H7501', price: 230_000, type: '급여', category: '수술' },
    ],
  },
  독감: {
    disease: '독감',
    icd: 'J09–J11',
    description: '인플루엔자 바이러스 감염증',
    items: [
      { name: '인플루엔자 신속항원검사', code: 'D1231', price: 9_800, type: '급여', category: '검사' },
      { name: '오셀타미비르 (타미플루)', code: 'J05AH02', price: 14_200, type: '급여', category: '처치' },
      { name: '흉부 X선 (폐렴 감별)', code: 'E6602', price: 22_000, type: '급여', category: '영상' },
    ],
  },
};

export function searchHIRA(query: string): HiraResult | null {
  if (!query.trim()) return null;
  const q = query.trim();
  const key = Object.keys(DB).find((k) => q.includes(k) || k.includes(q));
  return key ? DB[key] : null;
}

export const POPULAR_QUERIES = ['치매', '고혈압', '당뇨', '뇌졸중', '암'];
