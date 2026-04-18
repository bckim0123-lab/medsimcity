'use client';

import { BarChart3, Activity } from 'lucide-react';
import { useStore } from '@/store/useStore';

const FACILITY_LEGEND = [
  { type: 'hospital',      label: '병원',  img: '/markers/hospital.svg' },
  { type: 'clinic',        label: '의원',  img: '/markers/clinic.svg' },
  { type: 'pharmacy',      label: '약국',  img: '/markers/pharmacy.svg' },
  { type: 'health_center', label: '보건소', img: '/markers/health_center.svg' },
];

const GAP_LEGEND = [
  { color: '#10b981', label: '양호' },
  { color: '#84cc16', label: '보통' },
  { color: '#eab308', label: '주의' },
  { color: '#f97316', label: '위험' },
  { color: '#ef4444', label: '심각' },
];

export default function KPIPanel() {
  const {
    analysisMode,
    gapGeoJSON,
    facilities,
    populationCells,
  } = useStore();

  const gapStats = (() => {
    if (!gapGeoJSON?.features?.length) return null;
    const scores = gapGeoJSON.features.map((f) => f.properties?.need_score ?? 0);
    const critical = scores.filter((s) => s >= 80).length;
    const high     = scores.filter((s) => s >= 60 && s < 80).length;
    const avg      = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { critical, high, avg: avg.toFixed(1), total: scores.length };
  })();

  const facilityStats = (() => {
    if (!facilities.length) return null;
    const counts: Record<string, number> = {};
    facilities.forEach((f) => { counts[f.type] = (counts[f.type] ?? 0) + 1; });
    return counts;
  })();

  return (
    <aside className="flex flex-col h-full bg-slate-900 border-l border-slate-700/50 w-72 flex-shrink-0 overflow-y-auto">
      {/* 헤더 */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-cyan-500" />
          <p className="font-bold text-slate-100 text-sm">분석 현황</p>
        </div>
        <p className="text-slate-500 text-xs mt-0.5">서울시 의료 인프라</p>
      </div>

      <div className="flex-1 px-3 py-4 space-y-4">
        {/* 시설 현황 카드 */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Activity size={12} className="text-cyan-400" />
            현재 뷰 시설 현황
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FACILITY_LEGEND.map(({ type, label, img }) => (
              <div key={type} className="flex items-center gap-2 bg-slate-700/40 rounded-lg px-2.5 py-2">
                <img src={img} alt={label} className="w-6 h-6 object-contain flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-bold text-slate-100 font-mono">
                    {facilityStats?.[type]?.toLocaleString() ?? 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-500">전체 시설</span>
            <span className="text-cyan-400 font-bold font-mono">{facilities.length.toLocaleString()}개</span>
          </div>
        </div>

        {/* 공백 분석 통계 */}
        {gapStats && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 size={12} className="text-orange-400" />
              의료 공백 분포
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-400">{gapStats.critical}</p>
                <p className="text-xs text-slate-400 mt-0.5">심각 격자</p>
                <p className="text-xs text-slate-600">(점수 ≥ 80)</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-orange-400">{gapStats.high}</p>
                <p className="text-xs text-slate-400 mt-0.5">위험 격자</p>
                <p className="text-xs text-slate-600">(점수 60~80)</p>
              </div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">전체 평균 필요도</p>
              <p className="text-2xl font-bold text-amber-400">{gapStats.avg}</p>
              <p className="text-xs text-slate-500">/ 100점</p>
            </div>
          </div>
        )}

        {/* 기본 안내 */}
        {analysisMode === 'profiling' && !gapStats && (
          <div className="text-center py-6 text-slate-500">
            <BarChart3 size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">지도를 이동하면</p>
            <p className="text-sm">자동으로 데이터를 로드합니다</p>
            <p className="text-xs mt-2 text-slate-600">상단 탭에서 분석 모드를 선택하세요</p>
          </div>
        )}

        {/* 인구 격자 정보 */}
        {populationCells.length > 0 && (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">로드된 인구 격자</p>
            <p className="text-base font-bold text-sky-400 font-mono">{populationCells.length.toLocaleString()}개</p>
          </div>
        )}
      </div>

      {/* 범례 */}
      <div className="px-4 py-4 border-t border-slate-700/50 space-y-4">
        <div>
          <p className="text-xs text-slate-500 font-medium mb-2">시설 범례</p>
          <div className="grid grid-cols-2 gap-1.5">
            {FACILITY_LEGEND.map(({ type, label, img }) => (
              <div key={type} className="flex items-center gap-1.5">
                <img src={img} alt={label} className="w-5 h-5 object-contain flex-shrink-0" />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium mb-2">공백 필요도</p>
          <div className="flex items-center gap-1">
            {GAP_LEGEND.map(({ color, label }) => (
              <div key={label} className="flex-1 text-center">
                <div className="h-2 rounded" style={{ background: color }} />
                <p className="text-slate-600 mt-0.5" style={{ fontSize: '9px' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
