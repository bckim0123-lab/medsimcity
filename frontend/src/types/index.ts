// ── 의료 시설 ─────────────────────────────────────────────────────────────────
export type FacilityType =
  | 'hospital'
  | 'clinic'
  | 'pharmacy'
  | 'health_center'
  | 'dental'
  | 'oriental';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  category: string;
  lat: number;
  lon: number;
  address: string;
  beds?: number | null;
  phone?: string | null;
}

// ── 인구 격자 ─────────────────────────────────────────────────────────────────
export interface PopulationCell {
  id?: number;
  lat: number;
  lon: number;
  population: number;
  elderly_ratio: number;
  child_ratio: number;
  district: string;
}

// ── 공백 분석 결과 ────────────────────────────────────────────────────────────
export interface GapFeatureProperties {
  need_score: number;
  travel_time_min: number;
  nearest_dist_m: number;
  population: number;
  color: [number, number, number, number];
}

export interface GapGeoJSON {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: GapFeatureProperties;
}

// ── 제안 시설 ─────────────────────────────────────────────────────────────────
export interface ProposedFacility {
  id: string;
  lat: number;
  lon: number;
  type: FacilityType;
  name: string;
}

// ── 시나리오 결과 ─────────────────────────────────────────────────────────────
export interface ScenarioResult {
  score: number;
  coverage_added: number;
  total_population: number;
  coverage_before: number;
  coverage_after: number;
  coverage_rate_before: number;
  coverage_rate_after: number;
  avg_time_before: number;
  avg_time_after: number;
  time_reduction_pct: number;
  redundancy_warning: boolean;
  redundancy_overlap_pct: number;
  disease_weight: number;
  access_score: number;
  coverage_score: number;
}

// ── 분석 모드 ─────────────────────────────────────────────────────────────────
export type AnalysisMode = 'profiling' | 'gap' | 'scenario';
export type DiseaseType  = 'all' | 'emergency' | 'chronic' | 'pediatric';
export type RegionType   = 'urban' | 'suburban' | 'rural';

// ── 지도 경계 ─────────────────────────────────────────────────────────────────
export interface MapBounds {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

// ── 툴팁 ──────────────────────────────────────────────────────────────────────
export interface TooltipInfo {
  x: number;
  y: number;
  object?: Facility | GeoJSONFeature | null;
  layer?: string;
}
