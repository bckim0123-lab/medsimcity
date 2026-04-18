import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { fetchFacilities, fetchPopulation, fetchGapAnalysis } from '@/lib/api';

const DEBOUNCE_MS  = 400;
const MIN_GAP_ZOOM = 10;

export function useMapData() {
  const {
    bounds,
    showFacilities,
    showPopulation,
    showGap,
    diseaseType,
    facilityTypeFilter,
    analysisMode,
    viewState,
    setFacilities,
    setPopulationCells,
    setGapGeoJSON,
    setLoadingFacilities,
    setLoadingGap,
    setErrorMessage,
  } = useStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!bounds) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      // 시설 레이어
      if (showFacilities) {
        setLoadingFacilities(true);
        try {
          const data = await fetchFacilities(bounds, facilityTypeFilter);
          setFacilities(data);
        } catch {
          setErrorMessage('시설 데이터를 불러오지 못했습니다. 백엔드 서버를 확인하세요.');
        } finally {
          setLoadingFacilities(false);
        }
      }

      // 인구 격자
      if (showPopulation) {
        try {
          const data = await fetchPopulation(bounds);
          setPopulationCells(data);
        } catch {
          // 인구 레이어는 선택적이므로 에러 무시
        }
      }

      // 공백 분석 — 줌 레벨 가드
      const zoom = (viewState as { zoom?: number }).zoom ?? 12;
      if ((showGap || analysisMode === 'gap') && zoom >= MIN_GAP_ZOOM) {
        setLoadingGap(true);
        try {
          const data = await fetchGapAnalysis(bounds, diseaseType, facilityTypeFilter);
          setGapGeoJSON(data);
        } catch {
          setErrorMessage('공백 분석에 실패했습니다. 뷰포트를 좁혀 다시 시도하세요.');
          setGapGeoJSON(null);
        } finally {
          setLoadingGap(false);
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
    viewState,
    setFacilities, setPopulationCells, setGapGeoJSON,
    setLoadingFacilities, setLoadingGap, setErrorMessage,
  ]);
}
