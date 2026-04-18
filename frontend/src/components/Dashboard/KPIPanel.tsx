'use client';

import { useCallback } from 'react';
import {
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Clock,
  Award,
  BarChart3,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { fetchScenarioScore } from '@/lib/api';
import { clsx } from 'clsx';

// ── 점수 게이지 ───────────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const r = 44;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * 0.75; // 270도 호
  const filled = arc * (score / 100);
  const offset = circumference * 0.125; // 시작점 조정

  const color =
    score >= 75 ? '#10b981' :
    score >= 50 ? '#f59e0b' :
    score >= 30 ? '#f97316' :
    '#ef4444';

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-[135deg]">
        {/* 배경 트랙 */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
        />
        {/* 채워진 부분 */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-slate-400 text-xs">/ 100</span>
      </div>
    </div>
  );
}

// ── 지표 카드 ─────────────────────────────────────────────────────────────────
function MetricCard({
  icon,
  label,
  before,
  after,
  unit = '',
  direction = 'down',
}: {
  icon: React.ReactNode;
  label: string;
  before: number | string;
  after: number | string;
  unit?: string;
  direction?: 'up' | 'down';
}) {
  const improved = direction === 'down'
    ? Number(after) < Number(before)
    : Number(after) > Number(before);

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-cyan-500">{icon}</span>
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-slate-500 text-sm line-through">
          {typeof before === 'number' ? before.toLocaleString() : before}{unit}
        </span>
        <span className={clsx('text-base font-bold', improved ? 'text-emerald-400' : 'text-red-400')}>
          {typeof after === 'number' ? after.toLocaleString() : after}{unit}
        </span>
      </div>
    </div>
  );
}

// ── 메인 KPI 패널 ─────────────────────────────────────────────────────────────
export default function KPIPanel() {
  const {
    analysisMode,
    scenarioResult,
    proposedFacilities,
    bounds,
    diseaseType,
    regionType,
    loadingScenario,
    setLoadingScenario,
    setScenarioResult,
    gapGeoJSON,
    facilities,
    populationCells,
    setAnalysisMode,
    clearProposed,
  } = useStore();

  // 분석 실행
  const handleRunAnalysis = useCallback(async () => {
    if (!bounds || proposedFacilities.length === 0) return;
    setLoadingScenario(true);
    try {
      const result = await fetchScenarioScore(bounds, proposedFacilities, diseaseType, regionType);
      setScenarioResult(result);
    } catch (e) {
      console.error('시나리오 분석 실패:', e);
    } finally {
      setLoadingScenario(false);
    }
  }, [bounds, proposedFacilities, diseaseType, regionType, setLoadingScenario, setScenarioResult]);

  // 갭 분석 통계
  const gapStats = (() => {
    if (!gapGeoJSON?.features?.length) return null;
    const scores = gapGeoJSON.features.map((f) => f.properties?.need_score ?? 0);
    const critical = scores.filter((s) => s >= 80).length;
    const high     = scores.filter((s) => s >= 60 && s < 80).length;
    const avg      = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { critical, high, avg: avg.toFixed(1), total: scores.length };
  })();

  return (
    <aside className="flex flex-col h-full bg-slate-900 border-l border-slate-700/50 w-80 flex-shrink-0 overflow-y-auto">
      {/* 헤더 */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-cyan-500" />
          <p className="font-bold text-slate-100 text-sm">KPI 대시보드</p>
        </div>
        <p className="text-slate-500 text-xs mt-0.5">정책 실효성 지표</p>
      </div>

      <div className="flex-1 px-3 py-4 space-y-4">

        {/* ── 시나리오 분석 패널 ──────────────────────────────── */}
        {analysisMode === 'scenario' && (
          <>
            {/* 분석 실행 버튼 */}
            <div className="space-y-2">
              <button
                onClick={handleRunAnalysis}
                disabled={loadingScenario || proposedFacilities.length === 0}
                className={clsx(
                  'w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
                  proposedFacilities.length > 0
                    ? 'bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white shadow-lg shadow-cyan-900/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed',
                )}
              >
                {loadingScenario
                  ? <><Loader2 size={16} className="animate-spin" /> 분석 중...</>
                  : <><Award size={16} /> 분석 실행 ({proposedFacilities.length}곳)</>
                }
              </button>

              {proposedFacilities.length === 0 && (
                <p className="text-center text-slate-500 text-xs">
                  지도에서 후보지를 클릭하여 배치하세요
                </p>
              )}

              {proposedFacilities.length > 0 && !scenarioResult && (
                <button
                  onClick={clearProposed}
                  className="w-full py-1.5 text-xs text-slate-500 hover:text-red-400 transition"
                >
                  후보지 초기화
                </button>
              )}
            </div>

            {/* 시나리오 결과 */}
            {scenarioResult && (
              <div className="space-y-4 animate-count">
                {/* 종합 점수 */}
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 text-center mb-2 uppercase tracking-wider">
                    정책 실효성 점수
                  </p>
                  <ScoreGauge score={scenarioResult.score} />
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-slate-700/50 rounded-lg p-2">
                      <p className="text-slate-400">접근성</p>
                      <p className="text-cyan-400 font-bold">{scenarioResult.access_score.toFixed(0)}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-2">
                      <p className="text-slate-400">커버리지</p>
                      <p className="text-violet-400 font-bold">{scenarioResult.coverage_score.toFixed(0)}</p>
                    </div>
                  </div>
                </div>

                {/* 이동시간 개선 */}
                <MetricCard
                  icon={<Clock size={14} />}
                  label="평균 이동 시간"
                  before={scenarioResult.avg_time_before.toFixed(1)}
                  after={scenarioResult.avg_time_after.toFixed(1)}
                  unit="분"
                  direction="down"
                />

                {/* 커버리지 증가 */}
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users size={14} className="text-cyan-500" />
                    <span className="text-xs text-slate-400 font-medium">커버리지 인구</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-500 text-sm">
                      {scenarioResult.coverage_rate_before.toFixed(1)}%
                    </span>
                    <span className="text-emerald-400 text-base font-bold">
                      {scenarioResult.coverage_rate_after.toFixed(1)}%
                    </span>
                    <span className="text-emerald-500 text-xs">
                      (+{scenarioResult.coverage_added.toLocaleString()}명)
                    </span>
                  </div>
                  {/* 바 차트 */}
                  <div className="mt-2 bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${scenarioResult.coverage_rate_after}%` }}
                    />
                  </div>
                </div>

                {/* 이동시간 개선율 */}
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                  <TrendingDown size={22} className="text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">평균 이동시간 감소율</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {scenarioResult.time_reduction_pct.toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500">
                      {scenarioResult.avg_time_before.toFixed(1)}분 → {scenarioResult.avg_time_after.toFixed(1)}분
                    </p>
                  </div>
                </div>

                {/* 역학적 가중치 */}
                {scenarioResult.disease_weight !== 1.0 && (
                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3 flex items-center gap-2">
                    <Award size={14} className="text-violet-400" />
                    <p className="text-xs text-violet-300">
                      역학적 가중치 × {scenarioResult.disease_weight} 적용됨
                    </p>
                  </div>
                )}

                {/* 중복도 경고 */}
                {scenarioResult.redundancy_warning ? (
                  <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={14} className="text-amber-400" />
                      <span className="text-xs font-bold text-amber-400">예산 낭비 위험</span>
                    </div>
                    <p className="text-xs text-amber-300/80">
                      후보지가 기존 시설 권역과 {scenarioResult.redundancy_overlap_pct.toFixed(0)}% 중복됩니다.
                      위치 재검토를 권장합니다.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <p className="text-xs text-emerald-300">시설 중복 없음 — 최적 위치</p>
                  </div>
                )}

                {/* 리포트 버튼 */}
                <button
                  onClick={clearProposed}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition border border-slate-700 rounded-lg"
                >
                  분석 초기화
                </button>
              </div>
            )}
          </>
        )}

        {/* ── 공백 분석 패널 ──────────────────────────────────── */}
        {(analysisMode === 'gap' || (analysisMode === 'profiling' && gapStats)) && gapStats && (
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

            <button
              onClick={() => setAnalysisMode('scenario')}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-700/80 to-violet-700/80 hover:from-cyan-600 hover:to-violet-600 text-white text-sm font-semibold rounded-xl transition"
            >
              시나리오 모드로 전환 →
            </button>
          </div>
        )}

        {/* ── 프로파일링 기본 상태 ────────────────────────────── */}
        {analysisMode === 'profiling' && !gapStats && (
          <div className="text-center py-8 text-slate-500">
            <BarChart3 size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">지도를 이동하면</p>
            <p className="text-sm">자동으로 데이터를 로드합니다</p>
            <p className="text-xs mt-2 text-slate-600">
              상단 탭에서 분석 모드를 선택하세요
            </p>
          </div>
        )}
      </div>

      {/* 하단 범례 */}
      <div className="px-4 py-3 border-t border-slate-700/50 space-y-2">
        <p className="text-xs text-slate-500 font-medium">필요도 색상 범례</p>
        <div className="flex items-center gap-1">
          {[
            ['#10b981', '양호'],
            ['#84cc16', '보통'],
            ['#eab308', '주의'],
            ['#f97316', '위험'],
            ['#ef4444', '심각'],
          ].map(([c, l]) => (
            <div key={l} className="flex-1 text-center">
              <div className="h-2 rounded" style={{ background: c }} />
              <p className="text-slate-600 text-xs mt-0.5" style={{ fontSize: '9px' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
