'use client';

import { MapPin, Activity, Loader2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';
import type { AnalysisMode } from '@/types';

const MODES: { id: AnalysisMode; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'profiling',
    label: '시설 분포',
    icon: <MapPin size={14} />,
    desc: '시설 분포 및 인구 밀도 시각화',
  },
  {
    id: 'gap',
    label: '의료 공백 분석',
    icon: <Activity size={14} />,
    desc: '미충족 의료 수요 격자 분석',
  },
];

export default function Toolbar() {
  const router = useRouter();
  const {
    analysisMode,
    setAnalysisMode,
    loadingGap,
    loadingFacilities,
    selectedRegionName,
  } = useStore();

  const isLoading = loadingGap || loadingFacilities;

  return (
    <header className="flex items-center h-14 px-4 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 z-30 gap-4">
      {/* 홈 복귀 */}
      <button
        onClick={() => router.push('/')}
        title="Command Center로 돌아가기"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
      >
        <ChevronLeft size={13} />
        <span className="hidden sm:block">홈</span>
      </button>

      {/* 로고 */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
          M
        </div>
        <span className="font-bold text-slate-100 text-sm hidden sm:block">MediSim</span>
      </div>

      {/* 모드 탭 */}
      <nav className="flex gap-1 flex-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setAnalysisMode(m.id)}
            title={m.desc}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              analysisMode === m.id
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
            )}
          >
            {m.icon}
            <span className="hidden md:block">{m.label}</span>
          </button>
        ))}
      </nav>

      {/* 오른쪽 컨트롤 */}
      <div className="flex items-center gap-2">
        {selectedRegionName && (
          <span className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
            <MapPin size={11} className="text-cyan-500" />
            {selectedRegionName}
          </span>
        )}

        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-cyan-400">
            <Loader2 size={13} className="animate-spin" />
            <span className="hidden sm:block">로딩 중</span>
          </div>
        )}
      </div>
    </header>
  );
}
