// ── 의료 시설 ─────────────────────────────────────────────────────────────────
export type FacilityType =
  | 'hospital'
  | 'clinic'
  | 'pharmacy'
  | 'health_center'
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

// ── 분석 모드 ─────────────────────────────────────────────────────────────────
export type AnalysisMode = 'profiling' | 'gap';
export type DiseaseType  = 'all' | 'emergency' | 'chronic' | 'pediatric';

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
