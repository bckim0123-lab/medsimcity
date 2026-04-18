'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, IconLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { MapViewState, PickingInfo, WebMercatorViewport } from '@deck.gl/core';
import { Map } from 'react-map-gl/maplibre';
import { useStore } from '@/store/useStore';
import { useMapData, MIN_GAP_ZOOM } from '@/hooks/useMapData';
import { useMarkerIcons } from '@/hooks/useMarkerIcons';
import type { Facility, GapGeoJSON, PopulationCell } from '@/types';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const ICON_SIZE_BY_TYPE: Record<string, number> = {
  hospital:      42,
  clinic:        30,
  pharmacy:      28,
  health_center: 34,
  oriental:      26,
};

const ICON_MAPPING = {
  icon: { x: 0, y: 0, width: 256, height: 256, anchorY: 256 },
};

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
    const [minLon, minLat] = vp.unproject([0,     height]);
    const [maxLon, maxLat] = vp.unproject([width, 0]);
    return {
      min_lat: minLat - 0.01,
      max_lat: maxLat + 0.01,
      min_lon: minLon - 0.01,
      max_lon: maxLon + 0.01,
    };
  } catch {
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

const FACILITY_TYPES = ['hospital', 'clinic', 'pharmacy', 'health_center'] as const;

export default function MapCanvas() {
  const {
    viewState,
    setViewState,
    setBounds,
    facilities,
    populationCells,
    gapGeoJSON,
    showFacilities,
    showPopulation,
    showGap,
    analysisMode,
    setTooltip,
    tooltip,
  } = useStore();

  const markerIcons = useMarkerIcons();
  const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });

  useMapData();

  // Keep a stable ref to the latest viewState so resize effect can use it without stale closure
  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;

  useEffect(() => {
    const el = document.getElementById('deckgl-wrapper');
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const updateBounds = useCallback(
    (vs: MapViewState) => {
      setBounds(viewportToBounds(vs, containerSize.width, containerSize.height));
    },
    [containerSize, setBounds],
  );

  const handleViewStateChange = useCallback(
    ({ viewState: vs }: { viewState: MapViewState }) => {
      setViewState(vs as typeof viewState);
      updateBounds(vs as MapViewState);
    },
    [setViewState, updateBounds],
  );

  // Re-fire bounds whenever container size changes (resize) or on mount
  useEffect(() => {
    updateBounds(viewStateRef.current as MapViewState);
  }, [updateBounds]);

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

  // ?? ?? ??
  const handleMapLoad = useCallback((evt: { target: { getStyle: () => { layers: Array<{ id: string; type: string }> }; setPaintProperty: (id: string, prop: string, val: unknown) => void } }) => {
    const map = evt.target;
    try {
      map.getStyle().layers
        .filter((l) => l.type === 'symbol')
        .forEach((l) => {
          map.setPaintProperty(l.id, 'text-color', '#ffffff');
          map.setPaintProperty(l.id, 'text-halo-color', 'rgba(0,0,0,0.98)');
          map.setPaintProperty(l.id, 'text-halo-width', 3);
          map.setPaintProperty(l.id, 'text-halo-blur', 0.5);
        });
    } catch {
      // ??? ?? ? ?? ? ??
    }
  }, []);

  const currentZoom = (viewState as MapViewState).zoom ?? 12;
  const gapEnabled  = currentZoom >= MIN_GAP_ZOOM;
  const iconsReady  = Object.keys(markerIcons).length === FACILITY_TYPES.length;

  const layers = useMemo(() => {
    const result = [];

    // 1. ?? ?? ??? (?? 600m)
    if (showPopulation && populationCells.length > 0) {
      result.push(
        new HexagonLayer<PopulationCell>({
          id: 'population-hex',
          data: populationCells,
          getPosition: (d) => [d.lon, d.lat],
          getElevationWeight: (d) => d.population,
          getColorWeight: (d) => d.population,
          elevationScale: 0,
          extruded: false,
          radius: 600,
          coverage: 0.9,
          colorRange: [
            [1,  152, 189, 140],
            [73, 227, 206, 150],
            [216, 254, 181, 160],
            [254, 237, 177, 170],
            [254, 173,  84, 185],
            [209,  55,  78, 200],
          ],
          opacity: 0.7,
          pickable: true,
          onHover: handleHover,
        }),
      );
    }

    // 2. ?? ?? GeoJSON ? ???? ????? ??? ?? ON ?? ?? ???
    if (gapEnabled && showGap && gapGeoJSON) {
      result.push(
        new GeoJsonLayer({
          id: 'gap-analysis',
          data: gapGeoJSON as GapGeoJSON,
          filled: true,
          stroked: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          getFillColor: (f: any) =>
            (f.properties?.color ?? [150, 150, 150, 100]) as [number, number, number, number],
          opacity: 0.72,
          pickable: true,
          autoHighlight: false,
          onHover: handleHover,
        }),
      );
    }

    // 3. ?? ?? IconLayer (SVG ?????? ???)
    if (showFacilities && facilities.length > 0 && iconsReady) {
      FACILITY_TYPES.forEach((type) => {
        const dataUrl = markerIcons[type];
        if (!dataUrl) return;

        const typeData = facilities.filter((f) => f.type === type);
        if (!typeData.length) return;

        result.push(
          new IconLayer<Facility>({
            id: `facilities-${type}`,
            data: typeData,
            getPosition: (d) => [d.lon, d.lat],
            iconAtlas: dataUrl,
            iconMapping: ICON_MAPPING,
            getIcon: () => 'icon',
            getSize: ICON_SIZE_BY_TYPE[type] ?? 30,
            sizeUnits: 'pixels',
            pickable: true,
            onHover: handleHover,
          }),
        );
      });
    }

    return result;
  }, [
    showPopulation, populationCells,
    showGap, gapGeoJSON, analysisMode, gapEnabled,
    showFacilities, facilities,
    markerIcons, iconsReady,
    handleHover,
  ]);

  return (
    <div id="deckgl-wrapper" className="relative w-full h-full">
      <DeckGL
        viewState={viewState as MapViewState}
        controller={{ dragRotate: false, touchRotate: false }}
        layers={layers}
        onViewStateChange={handleViewStateChange as (args: unknown) => void}
        getCursor={({ isHovering }) => (isHovering ? 'pointer' : 'grab')}
      >
        <Map mapStyle={MAP_STYLE} onLoad={handleMapLoad as never} />
      </DeckGL>

      {/* ?? */}
      {tooltip?.object && (
        <div
          className="map-tooltip absolute z-50 max-w-xs"
          style={{ left: tooltip.x + 14, top: tooltip.y - 12 }}
        >
          <TooltipContent info={tooltip} />
        </div>
      )}

      {/* facility legend */}
      <div className="absolute bottom-6 left-4 z-30 bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-2.5 backdrop-blur-sm shadow-xl">
        <p className="text-xs text-slate-500 font-medium mb-2">{'\uC2DC\uC124 \uBC94\uB840'}</p>
        {[
          { type: 'hospital',      label: '\uBCD1\uC6D0' },
          { type: 'clinic',        label: '\uC758\uC6D0' },
          { type: 'pharmacy',      label: '\uC57D\uAD6D' },
          { type: 'health_center', label: '\uBCF4\uAC74\uC18C' },
        ].map(({ type, label }) => (
          <div key={type} className="flex items-center gap-2 py-0.5">
            <img src={`/markers/${type}.svg`} alt={label} className="w-5 h-5 object-contain" />
            <span className="text-xs text-slate-300">{label}</span>
          </div>
        ))}
      </div>

      {/* zoom warning */}
      {!gapEnabled && analysisMode === 'gap' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-slate-800/90 border border-amber-500/50 text-amber-400 text-xs font-medium rounded-full backdrop-blur-sm pointer-events-none">
          {'\uC904\uC744 \uB192\uC5EC\uC57C \uBD84\uC11D\uB429\uB2C8\uB2E4'} ({'\uD604\uC7AC zoom'} {currentZoom.toFixed(1)} / {'\uCD5C\uC18C'} {MIN_GAP_ZOOM})
        </div>
      )}
    </div>
  );
}

function TooltipContent({ info }: { info: { object?: unknown; layer?: string } }) {
  const obj     = info.object as Record<string, unknown>;
  const layerId = info.layer ?? '';

  // HexagonLayer bin hover
  if (layerId.includes('population-hex')) {
    const count      = (obj?.count as number) ?? 0;
    const elevation  = (obj?.elevationValue as number) ?? 0;
    const population = elevation > 0 ? elevation : count;
    return (
      <>
        <p className="font-bold text-sky-400 mb-1">{'\uC778\uAD6C \uBD84\uD3EC'}</p>
        <p>{'\uADF8\uB9AC\uB4DC \uC778\uAD6C:'} <span className="font-mono text-sky-300">{Math.round(population).toLocaleString()}{'\uBA85'}</span></p>
        {count > 0 && <p className="text-slate-400 text-xs">{'\uACA9\uC790 \uB0B4 \uC138\uC2DC\uC218: '}{count.toLocaleString()}</p>}
      </>
    );
  }

  if (layerId.includes('gap') && obj?.properties) {
    const p = obj.properties as Record<string, number>;
    const scoreColor = p.need_score >= 80 ? 'text-red-400'
      : p.need_score >= 60 ? 'text-orange-400'
      : p.need_score >= 40 ? 'text-amber-400'
      : 'text-emerald-400';
    return (
      <>
        <p className="font-bold text-cyan-400 mb-1.5">{'\uC758\uB8CC \uACF5\uBC31 \uBD84\uC11D'}</p>
        <div className="space-y-0.5">
          <p>{'\uC810\uC218:'} <span className={`font-mono font-bold ${scoreColor}`}>{(p.need_score ?? 0).toFixed(1)}{'\uC810'}</span></p>
          <p>{'\uC774\uB3D9 \uC2DC\uAC04:'} <span className="font-mono">{(p.travel_time_min ?? 0).toFixed(1)}{'\uBD84'}</span></p>
          <p>{'\uCD5C\uADFC \uC2DC\uC124:'} <span className="font-mono">{((p.nearest_dist_m ?? 0) / 1000).toFixed(2)}km</span></p>
          {(p.population ?? 0) > 0 && <p>{'\uC778\uAD6C \uC218:'} <span className="font-mono">{(p.population ?? 0).toLocaleString()}{'\uBA85'}</span></p>}
        </div>
      </>
    );
  }

  if (layerId.includes('facilities') && obj?.name) {
    const typeLabel: Record<string, string> = {
      hospital: '\uBCD1\uC6D0', clinic: '\uC758\uC6D0', pharmacy: '\uC57D\uAD6D',
      health_center: '\uBCF4\uAC74\uC18C', oriental: '\uD55C\uC758\uC6D0',
    };
    return (
      <>
        <p className="font-bold text-cyan-400 mb-1">{String(obj.name)}</p>
        <p className="text-slate-300">{typeLabel[String(obj.type)] ?? String(obj.category ?? obj.type)}</p>
        {(obj.beds as number) ? <p>{'\uBCD1\uC0C1'} <span className="font-mono text-cyan-300">{String(obj.beds)}{'\uAC1C'}</span></p> : null}
        {obj.phone && <p className="text-slate-400 text-xs">{String(obj.phone)}</p>}
        {obj.address && <p className="text-slate-500 text-xs mt-1 max-w-48 truncate">{String(obj.address)}</p>}
      </>
    );
  }

  return null;
}
