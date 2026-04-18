import { create } from 'zustand';
import type {
  Facility,
  PopulationCell,
  GapGeoJSON,
  ProposedFacility,
  ScenarioResult,
  AnalysisMode,
  DiseaseType,
  RegionType,
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

  // ── 시나리오 ───────────────────────────────────────────────
  proposedFacilities: ProposedFacility[];
  addProposed: (f: ProposedFacility) => void;
  removeProposed: (id: string) => void;
  clearProposed: () => void;

  scenarioResult: ScenarioResult | null;
  setScenarioResult: (r: ScenarioResult | null) => void;

  // ── 분석 설정 ──────────────────────────────────────────────
  analysisMode: AnalysisMode;
  setAnalysisMode: (m: AnalysisMode) => void;

  diseaseType: DiseaseType;
  setDiseaseType: (d: DiseaseType) => void;

  regionType: RegionType;
  setRegionType: (r: RegionType) => void;

  facilityTypeFilter: FacilityType | 'all';
  setFacilityTypeFilter: (t: FacilityType | 'all') => void;

  // ── 레이어 가시성 ──────────────────────────────────────────
  showPopulation: boolean;
  togglePopulation: () => void;

  showGap: boolean;
  toggleGap: () => void;

  showFacilities: boolean;
  toggleFacilities: () => void;

  is3D: boolean;
  toggle3D: () => void;

  // ── 로딩 상태 ──────────────────────────────────────────────
  loadingFacilities: boolean;
  setLoadingFacilities: (v: boolean) => void;

  loadingGap: boolean;
  setLoadingGap: (v: boolean) => void;

  loadingScenario: boolean;
  setLoadingScenario: (v: boolean) => void;

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
    pitch:     30,
    bearing:    0,
  },
  setViewState: (viewState) => set({ viewState }),

  // ── 데이터 ──────────────────────────────────────────────────
  facilities:      [],
  setFacilities:   (facilities) => set({ facilities }),

  populationCells:     [],
  setPopulationCells:  (populationCells) => set({ populationCells }),

  gapGeoJSON:    null,
  setGapGeoJSON: (gapGeoJSON) => set({ gapGeoJSON }),

  // ── 시나리오 ────────────────────────────────────────────────
  proposedFacilities: [],
  addProposed: (f) =>
    set((s) => ({ proposedFacilities: [...s.proposedFacilities, f] })),
  removeProposed: (id) =>
    set((s) => ({ proposedFacilities: s.proposedFacilities.filter((p) => p.id !== id) })),
  clearProposed: () => set({ proposedFacilities: [], scenarioResult: null }),

  scenarioResult:    null,
  setScenarioResult: (scenarioResult) => set({ scenarioResult }),

  // ── 설정 ────────────────────────────────────────────────────
  analysisMode:    'profiling',
  setAnalysisMode: (analysisMode) =>
    set({ analysisMode, scenarioResult: null, gapGeoJSON: null }),

  diseaseType:    'all',
  setDiseaseType: (diseaseType) => set({ diseaseType }),

  regionType:    'urban',
  setRegionType: (regionType) => set({ regionType }),

  facilityTypeFilter:    'all',
  setFacilityTypeFilter: (facilityTypeFilter) => set({ facilityTypeFilter }),

  // ── 레이어 ──────────────────────────────────────────────────
  showPopulation:  true,
  togglePopulation:() => set((s) => ({ showPopulation: !s.showPopulation })),

  showGap:    false,
  toggleGap:  () => set((s) => ({ showGap: !s.showGap })),

  showFacilities:  true,
  toggleFacilities:() => set((s) => ({ showFacilities: !s.showFacilities })),

  is3D:     true,
  toggle3D: () => set((s) => ({ is3D: !s.is3D })),

  // ── 로딩 ────────────────────────────────────────────────────
  loadingFacilities:    false,
  setLoadingFacilities: (v) => set({ loadingFacilities: v }),

  loadingGap:    false,
  setLoadingGap: (v) => set({ loadingGap: v }),

  loadingScenario:    false,
  setLoadingScenario: (v) => set({ loadingScenario: v }),

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
