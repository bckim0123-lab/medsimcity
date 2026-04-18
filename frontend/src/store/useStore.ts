import { create } from 'zustand';
import type {
  Facility,
  PopulationCell,
  GapGeoJSON,
  AnalysisMode,
  DiseaseType,
  MapBounds,
  TooltipInfo,
  FacilityType,
} from '@/types';

interface MediSimState {
  // ── 지도 상태 ──────────────────────────────────────────────
  bounds: MapBounds | null;
  setBounds: (b: MapBounds) => void;

  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  setViewState: (vs: MediSimState['viewState']) => void;

  // ── 데이터 레이어 ──────────────────────────────────────────
  facilities: Facility[];
  setFacilities: (f: Facility[]) => void;

  populationCells: PopulationCell[];
  setPopulationCells: (c: PopulationCell[]) => void;

  gapGeoJSON: GapGeoJSON | null;
  setGapGeoJSON: (g: GapGeoJSON | null) => void;

  // ── 분석 설정 ──────────────────────────────────────────────
  analysisMode: AnalysisMode;
  setAnalysisMode: (m: AnalysisMode) => void;

  diseaseType: DiseaseType;
  setDiseaseType: (d: DiseaseType) => void;

  facilityTypeFilter: FacilityType | 'all';
  setFacilityTypeFilter: (t: FacilityType | 'all') => void;

  // ── 레이어 가시성 ──────────────────────────────────────────
  showPopulation: boolean;
  togglePopulation: () => void;

  showGap: boolean;
  toggleGap: () => void;

  showFacilities: boolean;
  toggleFacilities: () => void;

  // ── 로딩 상태 ──────────────────────────────────────────────
  loadingFacilities: boolean;
  setLoadingFacilities: (v: boolean) => void;

  loadingGap: boolean;
  setLoadingGap: (v: boolean) => void;

  // ── 툴팁 ──────────────────────────────────────────────────
  tooltip: TooltipInfo | null;
  setTooltip: (t: TooltipInfo | null) => void;

  // ── 에러 ────────────────────────────────────────────────
  errorMessage: string | null;
  setErrorMessage: (m: string | null) => void;

  // ── 선택 지역 ─────────────────────────────────────────────
  selectedRegionName: string;
  setSelectedRegionName: (n: string) => void;
}

export const useStore = create<MediSimState>((set) => ({
  // ── 지도 ────────────────────────────────────────────────────
  bounds: null,
  setBounds: (bounds) => set({ bounds }),

  viewState: {
    longitude: 126.978,
    latitude:  37.566,
    zoom:      12,
    pitch:     0,
    bearing:   0,
  },
  setViewState: (viewState) => set({ viewState }),

  // ── 데이터 ──────────────────────────────────────────────────
  facilities:      [],
  setFacilities:   (facilities) => set({ facilities }),

  populationCells:     [],
  setPopulationCells:  (populationCells) => set({ populationCells }),

  gapGeoJSON:    null,
  setGapGeoJSON: (gapGeoJSON) => set({ gapGeoJSON }),

  // ── 설정 ────────────────────────────────────────────────────
  analysisMode:    'profiling',
  setAnalysisMode: (analysisMode) =>
    set({ analysisMode, gapGeoJSON: null }),

  diseaseType:    'all',
  setDiseaseType: (diseaseType) => set({ diseaseType }),

  facilityTypeFilter:    'all',
  setFacilityTypeFilter: (facilityTypeFilter) => set({ facilityTypeFilter }),

  // ── 레이어 ──────────────────────────────────────────────────
  showPopulation:   false,
  togglePopulation: () => set((s) => ({ showPopulation: !s.showPopulation })),

  showGap:    false,
  toggleGap:  () => set((s) => ({ showGap: !s.showGap })),

  showFacilities:   true,
  toggleFacilities: () => set((s) => ({ showFacilities: !s.showFacilities })),

  // ── 로딩 ────────────────────────────────────────────────────
  loadingFacilities:    false,
  setLoadingFacilities: (v) => set({ loadingFacilities: v }),

  loadingGap:    false,
  setLoadingGap: (v) => set({ loadingGap: v }),

  // ── 툴팁 ────────────────────────────────────────────────────
  tooltip:    null,
  setTooltip: (tooltip) => set({ tooltip }),

  // ── 에러 ────────────────────────────────────────────────────
  errorMessage:    null,
  setErrorMessage: (errorMessage) => set({ errorMessage }),

  // ── 지역 ────────────────────────────────────────────────────
  selectedRegionName:    '서울특별시',
  setSelectedRegionName: (selectedRegionName) => set({ selectedRegionName }),
}));
