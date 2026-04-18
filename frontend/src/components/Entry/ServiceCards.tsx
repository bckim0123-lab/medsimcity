'use client';

import { useState } from 'react';
import { Bot, FileText, AlertTriangle, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';
import type { FacilityType, AnalysisMode } from '@/types';

const SEOUL_GU: Record<string, [number, number]> = {
  '전체 서울': [126.978, 37.566],
  '강남구':    [127.047, 37.517],
  '강동구':    [127.124, 37.530],
  '강북구':    [127.011, 37.640],
  '강서구':    [126.849, 37.551],
  '관악구':    [126.951, 37.478],
  '광진구':    [127.082, 37.538],
  '구로구':    [126.888, 37.495],
  '금천구':    [126.896, 37.457],
  '노원구':    [127.057, 37.655],
  '도봉구':    [127.047, 37.669],
  '동대문구':  [127.040, 37.574],
  '동작구':    [126.940, 37.512],
  '마포구':    [126.909, 37.566],
  '서대문구':  [126.938, 37.579],
  '서초구':    [127.032, 37.483],
  '성동구':    [127.041, 37.563],
  '성북구':    [127.017, 37.606],
  '송파구':    [127.107, 37.514],
  '양천구':    [126.867, 37.517],
  '영등포구':  [126.896, 37.526],
  '용산구':    [126.990, 37.532],
  '은평구':    [126.929, 37.603],
  '종로구':    [126.979, 37.573],
  '중구':      [126.997, 37.563],
  '중랑구':    [127.093, 37.606],
};

const FACILITY_OPTIONS: { value: FacilityType | 'all'; label: string; img?: string }[] = [
  { value: 'all',           label: '전체' },
  { value: 'hospital',      label: '병원',   img: '/markers/hospital.svg' },
  { value: 'clinic',        label: '의원',   img: '/markers/clinic.svg' },
  { value: 'pharmacy',      label: '약국',   img: '/markers/pharmacy.svg' },
  { value: 'health_center', label: '보건소', img: '/markers/health_center.svg' },
];

const MODE_OPTIONS: { value: AnalysisMode; label: string; desc: string }[] = [
  { value: 'profiling', label: '시설 분포 확인', desc: '현재 의료 인프라 분포와 인구 밀도를 지도에 표시합니다' },
  { value: 'gap',       label: '의료 공백 분석', desc: '미충족 의료 수요 격자를 히트맵으로 표시합니다' },
];

function AnalysisCard({ onLaunch }: { onLaunch: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<FacilityType | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('profiling');
  const [selectedGu, setSelectedGu] = useState<string>('전체 서울');
  const router = useRouter();
  const { setFacilityTypeFilter, setAnalysisMode, setViewState, setSelectedRegionName, viewState } = useStore();

  const handleStart = () => {
    const [lon, lat] = SEOUL_GU[selectedGu] ?? [126.978, 37.566];
    setFacilityTypeFilter(selectedFacility);
    setAnalysisMode(selectedMode);
    setViewState({ ...viewState, longitude: lon, latitude: lat, zoom: selectedGu === '전체 서울' ? 11 : 13, pitch: 0, bearing: 0 });
    setSelectedRegionName(selectedGu === '전체 서울' ? '서울특별시' : selectedGu);
    onLaunch();
    setTimeout(() => router.push('/dashboard'), 380);
  };

  return (
    <div className={clsx(
      'relative rounded-2xl border transition-all duration-300 bg-slate-900/80 border-slate-700/60',
      expanded ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'hover:border-cyan-500/40 hover:shadow-md hover:shadow-cyan-500/10 hover:-translate-y-0.5',
    )}>
      <button className="w-full text-left p-5" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0">
              <div className="grid grid-cols-2 gap-0.5">
                {['hospital', 'clinic', 'pharmacy', 'health_center'].map((t) => (
                  <img key={t} src={`/markers/${t}.svg`} alt="" className="w-4 h-4 object-contain" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Location Analysis</p>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">병의원 및 약국 입지분석</h3>
            </div>
          </div>
          <ChevronDown size={16} className={clsx('text-slate-500 transition-transform duration-200 flex-shrink-0 mt-1', expanded && 'rotate-180 text-cyan-400')} />
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">
          서울시 의료 공백을 격자 단위로 분석합니다. 시설 유형과 분석 목적을 선택하면 맞춤 지도로 이동합니다.
        </p>
      </button>

      <div className={clsx('overflow-hidden transition-all duration-300', expanded ? 'max-h-[420px]' : 'max-h-0')}>
        <div className="px-5 pb-5 space-y-4 border-t border-slate-700/50 pt-4">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-2">시설 유형</p>
            <div className="flex flex-wrap gap-2">
              {FACILITY_OPTIONS.map(({ value, label, img }) => (
                <button
                  key={value}
                  onClick={() => setSelectedFacility(value)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    selectedFacility === value
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500',
                  )}
                >
                  {img && <img src={img} alt={label} className="w-4 h-4 object-contain" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 font-medium mb-2">분석 목적</p>
            <div className="space-y-1.5">
              {MODE_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setSelectedMode(value)}
                  className={clsx(
                    'w-full text-left px-3 py-2.5 rounded-xl border transition-all',
                    selectedMode === value
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={clsx('w-3 h-3 rounded-full border-2 flex-shrink-0', selectedMode === value ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600')} />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 ml-5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 font-medium mb-2">분석 지역</p>
            <select
              value={selectedGu}
              onChange={(e) => setSelectedGu(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition"
            >
              {Object.keys(SEOUL_GU).map((gu) => (
                <option key={gu} value={gu}>{gu}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} />
            분석 시작
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  onLaunchSimCity: () => void;
}

export default function ServiceCards({ onLaunchSimCity }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={14} className="text-cyan-400" />
        <span className="text-sm text-slate-500 font-medium tracking-wider uppercase">Core Services</span>
      </div>
      <div className="space-y-4">
        <AnalysisCard onLaunch={onLaunchSimCity} />
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <Bot size={20} />, title: '자율 분석', subtitle: 'Auto-HIRA', desc: '자연어 명령으로 HIRA 빅데이터 코딩 자동화', gradient: 'from-violet-500 to-purple-600' },
            { icon: <FileText size={20} />, title: '수가 & 프로토콜', subtitle: 'Cost Protocol', desc: '질환별 최적 진료 경로 및 건강보험 수가 분석', gradient: 'from-emerald-500 to-teal-600' },
            { icon: <AlertTriangle size={20} />, title: '다약제 탐지', subtitle: 'GNN Drug', desc: 'GNN 기반 약물 상호작용 위험 조기 감지', gradient: 'from-orange-500 to-red-600' },
          ].map((card) => (
            <div key={card.subtitle} className="relative text-left p-4 rounded-2xl border bg-slate-900/80 border-slate-700/60 opacity-70">
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br text-white', card.gradient)}>
                {card.icon}
              </div>
              <p className="text-xs text-slate-600 font-medium">{card.subtitle}</p>
              <h3 className="text-sm font-bold text-slate-300 mt-0.5">{card.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{card.desc}</p>
              <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-600 border border-slate-700/60">개발 중</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
