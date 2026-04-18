'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, GeoJsonLayer, TextLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { MapViewState, PickingInfo, WebMercatorViewport } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import { useStore } from '@/store/useStore';
import { useMapData } from '@/hooks/useMapData';
import type { Facility, ProposedFacility, PopulationCell } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import FacilityTypePicker from './FacilityTypePicker';
import type { FacilityType } from '@/types';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// 줌 레벨 가드 — 이 이하로 줌아웃 시 공백 분석 비활성화
const MIN_GAP_ZOOM = 10;

const FACILITY_COLORS: Record<string, [number, number, number]> = {
  hospital:      [59,  130, 246],
  clinic:        [16,  185, 129],
  pharmacy:      [245, 158,  11],
  health_center: [167,  85, 247],
  dental:        [236,  72, 153],
  oriental:      [234, 179,   8],
};

const FACILITY_RADIUS: Record<string, number> = {
  hospital:      200,
  clinic:         90,
  pharmacy:       70,
  health_center: 120,
  dental:         70,
  oriental:       70,
};

function getFacilityColor(type: string): [number, number, number, number] {
  const c = FACILITY_COLORS[type] ?? [100, 100, 100];
  return [...c, 220] as [number, number, number, number];
}

// 실제 viewport → 바운딩박스 계산
function viewportToBounds(vs: MapViewState, width: number, height: number) {
  try {
    const vp = new WebMercatorViewport({
      width, height,
      longitude: vs.longitude,
      latitude:  vs.latitude,
      zoom:      vs.zoom,
      pitch:     vs.pitch ?? 0,
      bearing:   vs.bearing ?? 0,
    });
    const [minLon, minLat] = vp.unproject([0,      height]);
    const [maxLon, maxLat] = vp.unproject([width,  0]);
    return {
      min_lat: minLat - 0.01,  // 10% 여백 (edge-tile 대응)
      max_lat: maxLat + 0.01,
      min_lon: minLon - 0.01,
      max_lon: maxLon + 0.01,
    };
  } catch {
    // fallback
    const span    = 360 / Math.pow(2, vs.zoom ?? 12) * 0.8;
    const latSpan = span * 0.6;
    return {
      min_lat: vs.latitude  - latSpan,
      max_lat: vs.latitude  + latSpan,
      min_lon: vs.longitude - span,
      max_lon: vs.longitude + span,
    };
  }
}

interface PickerState {
  x: number;
  y: number;
  lat: number;
  lon: number;
}

export default function MapCanvas() {
  const {
    viewState,
    setViewState,
    setBounds,
    facilities,
    populationCells,
    gapGeoJSON,
    proposedFacilities,
    showFacilities,
    showPopulation,
    showGap,
    is3D,
    analysisMode,
    addProposed,
    removeProposed,
    setTooltip,
    tooltip,
  } = useStore();

  // 시설 유형 선택 팝업
  const [picker, setPicker] = useState<PickerState | null>(null);

  // 컨테이너 크기 (실제 viewport bounds 계산용)
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });

  useMapData();

  // 컨테이너 resize 감지
  useEffect(() => {
    const el = document.getElementById('deckgl-wrapper');
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({
        width:  entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 바운딩박스 갱신 — 실제 WebMercatorViewport 기반
  const updateBounds = useCallback(
    (vs: MapViewState) => {
      const bounds = viewportToBounds(vs, containerSize.width, containerSize.height);
      setBounds(bounds);
    },
    [containerSize, setBounds],
  );

  const handleViewStateChange = useCallback(
    ({ viewState: vs }: { viewState: MapViewState }) => {
      setViewState(vs as typeof viewState);
      updateBounds(vs as MapViewState);
      setPicker(null); // 지도 이동 시 팝업 닫기
    },
    [setViewState, updateBounds],
  );

  // 초기 바운딩박스
  useEffect(() => {
    updateBounds(viewState as MapViewState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 지도 클릭 핸들러
  const handleMapClick = useCallback(
    (info: PickingInfo) => {
      if (analysisMode !== 'scenario') return;
      if (!info.coordinate) return;

      // 기존 proposed 마커 클릭 → 무시 (우클릭으로 삭제)
      if (info.layer?.id?.includes('proposed')) return;

      const [lon, lat] = info.coordinate as [number, number];
      setPicker({ x: info.x, y: info.y, lat, lon });
    },
    [analysisMode],
  );

  // 우클릭 → proposed 마커 삭제
  const handleContextMenu = useCallback(
    (info: PickingInfo, event: MouseEvent) => {
      if (info.layer?.id?.includes('proposed') && info.object) {
        event.preventDefault();
        const obj = info.object as ProposedFacility;
        removeProposed(obj.id);
      }
    },
    [removeProposed],
  );

  // 시설 유형 확정 → 마커 추가
  const handlePickerConfirm = useCallback(
    (type: FacilityType) => {
      if (!picker) return;
      addProposed({
        id:   uuidv4(),
        lat:  picker.lat,
        lon:  picker.lon,
        type,
        name: '신규 시설 후보',
      });
      setPicker(null);
    },
    [picker, addProposed],
  );

  // 툴팁 핸들러
  const handleHover = useCallback(
    (info: PickingInfo): boolean => {
      if (info.object) {
        setTooltip({ x: info.x, y: info.y, object: info.object, layer: info.layer?.id });
      } else {
        setTooltip(null);
      }
      return false;
    },
    [setTooltip],
  );

  // 줌 레벨 확인
  const currentZoom = (viewState as MapViewState).zoom ?? 12;
  const gapEnabled  = currentZoom >= MIN_GAP_ZOOM;

  // ── Deck.gl 레이어 ────────────────────────────────────────────
  const layers = useMemo(() => {
    const result = [];

    // 1️⃣ 인구 밀도 헥사곤
    if (showPopulation && populationCells.length > 0) {
      result.push(
        new HexagonLayer<PopulationCell>({
          id: 'population-hex',
          data: populationCells,
          getPosition: (d) => [d.lon, d.lat],
          getElevationWeight: (d) => d.population,
          getColorWeight: (d) => d.population,
          elevationScale: is3D ? 12 : 0,
          extruded: is3D,
          radius: 300,
          coverage: 0.85,
          colorRange: [
            [1,  152, 189, 160],
            [73, 227, 206, 170],
            [216, 254, 181, 170],
            [254, 237, 177, 180],
            [254, 173,  84, 190],
            [209,  55,  78, 200],
          ],
          opacity: 0.75,
          pickable: true,
          onHover: handleHover,
        }),
      );
    }

    // 2️⃣ 의료 공백 GeoJSON (줌 가드 적용)
    if (gapEnabled && (showGap || analysisMode === 'gap') && gapGeoJSON) {
      result.push(
        new GeoJsonLayer({
          id: 'gap-analysis',
          data: gapGeoJSON as unknown as string,
          filled: true,
          stroked: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          getFillColor: (f: any) =>
            (f.properties?.color ?? [150, 150, 150, 100]) as [number, number, number, number],
          opacity: 0.72,
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 255, 255, 60] as [number, number, number, number],
          onHover: handleHover,
        }),
      );
    }

    // 3️⃣ 의료 시설 마커
    if (showFacilities && facilities.length > 0) {
      result.push(
        new ScatterplotLayer<Facility>({
          id: 'facilities',
          data: facilities,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: (d) => getFacilityColor(d.type),
          getRadius: (d) => FACILITY_RADIUS[d.type] ?? 70,
          radiusUnits: 'meters',
          filled: true,
          stroked: true,
          lineWidthMinPixels: 1,
          getLineColor: [255, 255, 255, 60],
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 255, 255, 80],
          onHover: handleHover,
        }),
      );
    }

    // 4️⃣ 제안 시설 (우클릭 삭제 가능)
    if (proposedFacilities.length > 0) {
      result.push(
        new ScatterplotLayer<ProposedFacility>({
          id: 'proposed-facilities',
          data: proposedFacilities,
          getPosition: (d) => [d.lon, d.lat],
          getFillColor: (d) => (FACILITY_COLORS[d.type]
            ? [...FACILITY_COLORS[d.type], 230] as [number, number, number, number]
            : [250, 204, 21, 230]),
          getRadius: 230,
          radiusUnits: 'meters',
          filled: true,
          stroked: true,
          lineWidthMinPixels: 2,
          getLineColor: [255, 255, 255, 200],
          pickable: true,
          onHover: handleHover,
          // @ts-expect-error — DeckGL context menu
          onContextMenu: handleContextMenu,
        }),
      );

      result.push(
        new TextLayer<ProposedFacility>({
          id: 'proposed-labels',
          data: proposedFacilities,
          getPosition: (d) => [d.lon, d.lat],
          getText: () => '★',
          getSize: 20,
          getColor: [255, 255, 255, 255],
          getPixelOffset: [0, -26],
          pickable: false,
        }),
      );
    }

    return result;
  }, [
    showPopulation, populationCells, is3D,
    showGap, gapGeoJSON, analysisMode, gapEnabled,
    showFacilities, facilities,
    proposedFacilities,
    handleHover, handleContextMenu,
  ]);

  const getCursor = useCallback(
    ({ isHovering }: { isHovering: boolean }) => {
      if (analysisMode === 'scenario') return 'crosshair';
      return isHovering ? 'pointer' : 'grab';
    },
    [analysisMode],
  );

  return (
    <div id="deckgl-wrapper" className="relative w-full h-full">
      <DeckGL
        viewState={viewState as MapViewState}
        controller={{ dragRotate: true, touchRotate: true }}
        layers={layers}
        onClick={handleMapClick}
        onViewStateChange={handleViewStateChange as (args: unknown) => void}
        getCursor={getCursor}
      >
        <Map mapStyle={MAP_STYLE} />
      </DeckGL>

      {/* 툴팁 */}
      {tooltip?.object && (
        <div
          className="map-tooltip absolute z-50 max-w-xs"
          style={{ left: tooltip.x + 14, top: tooltip.y - 12 }}
        >
          <TooltipContent info={tooltip} />
        </div>
      )}

      {/* 시설 유형 선택 팝업 */}
      {picker && (
        <FacilityTypePicker
          x={picker.x}
          y={picker.y}
          onSelect={handlePickerConfirm}
          onCancel={() => setPicker(null)}
        />
      )}

      {/* 줌아웃 경고 */}
      {!gapEnabled && (analysisMode === 'gap') && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-slate-800/90 border border-amber-500/50 text-amber-400 text-xs font-medium rounded-full backdrop-blur-sm pointer-events-none">
          줌인이 필요합니다 (현재 zoom {currentZoom.toFixed(1)} / 최소 {MIN_GAP_ZOOM})
        </div>
      )}

      {/* 시나리오 안내 */}
      {analysisMode === 'scenario' && !picker && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-amber-500/90 text-slate-900 text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm pointer-events-none">
          클릭하여 후보지 배치 · 우클릭으로 삭제
        </div>
      )}
    </div>
  );
}

// ── 툴팁 내용 ─────────────────────────────────────────────────────────────────
function TooltipContent({ info }: { info: { object?: unknown; layer?: string } }) {
  const obj     = info.object as Record<string, unknown>;
  const layerId = info.layer ?? '';

  if (layerId.includes('gap') && obj?.properties) {
    const p = obj.properties as Record<string, number>;
    const scoreColor = p.need_score >= 80 ? 'text-red-400'
      : p.need_score >= 60 ? 'text-orange-400'
      : p.need_score >= 40 ? 'text-amber-400'
      : 'text-emerald-400';
    return (
      <>
        <p className="font-bold text-cyan-400 mb-1.5">의료 공백 지표</p>
        <div className="space-y-0.5">
          <p>필요도: <span className={`font-mono font-bold ${scoreColor}`}>{p.need_score?.toFixed(1)}점</span></p>
          <p>이동 시간: <span className="font-mono">{p.travel_time_min?.toFixed(1)}분</span></p>
          <p>최근접 거리: <span className="font-mono">{(p.nearest_dist_m / 1000)?.toFixed(2)}km</span></p>
          {p.population > 0 && <p>거주 인구: <span className="font-mono">{p.population.toLocaleString()}명</span></p>}
        </div>
      </>
    );
  }

  if (layerId.includes('facilities') && obj?.name) {
    return (
      <>
        <p className="font-bold text-cyan-400 mb-1">{String(obj.name)}</p>
        <p className="text-slate-300">{String(obj.category ?? obj.type)}</p>
        {(obj.beds as number) ? <p>병상 <span className="font-mono text-cyan-300">{String(obj.beds)}개</span></p> : null}
        {obj.phone && <p className="text-slate-400 text-xs">{String(obj.phone)}</p>}
        {obj.address && <p className="text-slate-500 text-xs mt-1 max-w-48 truncate">{String(obj.address)}</p>}
      </>
    );
  }

  if (layerId.includes('proposed') && obj?.type) {
    const typeLabel: Record<string, string> = {
      hospital: '병원', clinic: '의원', pharmacy: '약국',
      health_center: '보건소', dental: '치과', oriental: '한의원',
    };
    return (
      <>
        <p className="font-bold text-amber-400 mb-1">★ {typeLabel[String(obj.type)] ?? '후보 시설'}</p>
        <p className="text-slate-400 text-xs">우클릭으로 삭제 · KPI 패널에서 분석 실행</p>
      </>
    );
  }

  return null;
}
