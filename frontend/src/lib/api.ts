import type {
  Facility,
  PopulationCell,
  GapGeoJSON,
  ScenarioResult,
  MapBounds,
  DiseaseType,
  RegionType,
  ProposedFacility,
} from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error(`API Error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API Error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── 시설 ─────────────────────────────────────────────────────────────────────
export function fetchFacilities(
  bounds: MapBounds,
  types: string = 'all',
): Promise<Facility[]> {
  return get<Facility[]>('/api/facilities/', {
    min_lat: bounds.min_lat,
    max_lat: bounds.max_lat,
    min_lon: bounds.min_lon,
    max_lon: bounds.max_lon,
    types,
  });
}

export function fetchStats() {
  return get<{ total: number; by_type: Record<string, number> }>('/api/facilities/stats');
}

// ── 인구 격자 ─────────────────────────────────────────────────────────────────
export function fetchPopulation(bounds: MapBounds): Promise<PopulationCell[]> {
  return get<PopulationCell[]>('/api/analysis/population', {
    min_lat: bounds.min_lat,
    max_lat: bounds.max_lat,
    min_lon: bounds.min_lon,
    max_lon: bounds.max_lon,
  });
}

// ── 공백 분석 ─────────────────────────────────────────────────────────────────
export function fetchGapAnalysis(
  bounds: MapBounds,
  disease_type: DiseaseType = 'all',
  facility_type: string = 'all',
): Promise<GapGeoJSON> {
  return get<GapGeoJSON>('/api/analysis/gap', {
    min_lat: bounds.min_lat,
    max_lat: bounds.max_lat,
    min_lon: bounds.min_lon,
    max_lon: bounds.max_lon,
    disease_type,
    facility_type,
  });
}

// ── 시나리오 분석 ─────────────────────────────────────────────────────────────
export function fetchScenarioScore(
  bounds: MapBounds,
  proposed: ProposedFacility[],
  disease_type: DiseaseType,
  region_type: RegionType,
): Promise<ScenarioResult> {
  return post<ScenarioResult>('/api/analysis/scenario', {
    bbox: bounds,
    proposed_facilities: proposed,
    disease_type,
    region_type,
  });
}

// ── Nominatim 지오코딩 (무료 OSM) ─────────────────────────────────────────────
export async function geocode(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('countrycodes', 'kr');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: { 'Accept-Language': 'ko', 'User-Agent': 'MediSim/1.0' },
  });
  if (!res.ok) return null;
  const data: Array<{ lat: string; lon: string; display_name: string }> = await res.json();
  if (!data.length) return null;
  return {
    lat:  parseFloat(data[0].lat),
    lon:  parseFloat(data[0].lon),
    name: data[0].display_name,
  };
}
