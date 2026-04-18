import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { fetchFacilities, fetchPopulation, fetchGapAnalysis } from '@/lib/api';

const DEBOUNCE_MS = 400;

/** Shared constant — import in MapCanvas instead of re-declaring */
export const MIN_GAP_ZOOM = 10;

export function useMapData() {
  const {
    bounds,
    showFacilities,
    showPopulation,
    showGap,
    diseaseType,
    facilityTypeFilter,
    analysisMode,
    setFacilities,
    setPopulationCells,
    setGapGeoJSON,
    setLoadingFacilities,
    setLoadingGap,
    setErrorMessage,
  } = useStore();

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef    = useRef(0); // increments on every fetch; used to discard stale responses

  useEffect(() => {
    if (!bounds) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const reqId = ++reqIdRef.current;

      // Read zoom from live store state — avoids viewState in deps (prevents double-trigger on pan)
      const zoom = useStore.getState().viewState.zoom ?? 12;

      const needFac = showFacilities;
      const needPop = showPopulation;
      const needGap = (showGap || analysisMode === 'gap') && zoom >= MIN_GAP_ZOOM;

      // If gap requested but zoom too low, clear stale data immediately
      if ((showGap || analysisMode === 'gap') && zoom < MIN_GAP_ZOOM) {
        setGapGeoJSON(null);
        setLoadingGap(false);
      }

      // Set loading states upfront
      if (needFac) setLoadingFacilities(true);
      if (needGap) setLoadingGap(true);

      // Fire all three requests in parallel
      const [facRes, popRes, gapRes] = await Promise.allSettled([
        needFac ? fetchFacilities(bounds, facilityTypeFilter) : Promise.resolve(null),
        needPop ? fetchPopulation(bounds)                    : Promise.resolve(null),
        needGap ? fetchGapAnalysis(bounds, diseaseType, facilityTypeFilter) : Promise.resolve(null),
      ]);

      // Discard stale responses (a newer request already fired)
      if (reqId !== reqIdRef.current) return;

      // ── Facilities ──────────────────────────────────────────────
      if (needFac) {
        setLoadingFacilities(false);
        if (facRes.status === 'fulfilled' && facRes.value !== null) {
          setFacilities(facRes.value);
        } else if (facRes.status === 'rejected') {
          setErrorMessage(
            '\uC2DC\uC124 \uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uBC31\uC5D4\uB4DC \uC11C\uBC84\uB97C \uD655\uC778\uD558\uC138\uC694.',
          );
        }
      } else {
        // Layer was toggled off — clear stale data so KPI/map stay consistent
        setFacilities([]);
        setLoadingFacilities(false);
      }

      // ── Population ──────────────────────────────────────────────
      if (needPop) {
        if (popRes.status === 'fulfilled' && popRes.value !== null) {
          setPopulationCells(popRes.value);
        }
        // Population failures are silent (optional layer)
      } else {
        setPopulationCells([]);
      }

      // ── Gap analysis ────────────────────────────────────────────
      if (needGap) {
        setLoadingGap(false);
        if (gapRes.status === 'fulfilled' && gapRes.value !== null) {
          setGapGeoJSON(gapRes.value);
        } else if (gapRes.status === 'rejected') {
          setErrorMessage(
            '\uACF5\uBC31 \uBD84\uC11D\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uBDF0\uD3EC\uD2B8\uB97C \uC88C\uC0C8 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.',
          );
          setGapGeoJSON(null);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    bounds,
    showFacilities, showPopulation, showGap,
    diseaseType, facilityTypeFilter, analysisMode,
    // Intentionally omitting viewState — zoom is read via useStore.getState() at call time
    // to prevent double-trigger on every pan (bounds already captures viewport change).
    setFacilities, setPopulationCells, setGapGeoJSON,
    setLoadingFacilities, setLoadingGap, setErrorMessage,
  ]);
}
