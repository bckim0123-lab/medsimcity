'use client';

import { useState } from 'react';
import { Bot, FileText, ArrowRight, ChevronDown, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';
import type { FacilityType, AnalysisMode } from '@/types';

/* ──────────────────── Seoul district coordinates ──────────────────── */
const SEOUL_GU: Record<string, [number, number]> = {
  '\uC804\uCCB4 \uC11C\uC6B8': [126.978, 37.566],
  '\uAC15\uB0A8\uAD6C': [127.047, 37.517],
  '\uAC15\uB3D9\uAD6C': [127.124, 37.530],
  '\uAC15\uBD81\uAD6C': [127.011, 37.640],
  '\uAC15\uC11C\uAD6C': [126.849, 37.551],
  '\uAD00\uC545\uAD6C': [126.951, 37.478],
  '\uAD11\uC9C4\uAD6C': [127.082, 37.538],
  '\uAD6C\uB85C\uAD6C': [126.888, 37.495],
  '\uAE08\uCC9C\uAD6C': [126.896, 37.457],
  '\uB178\uC6D0\uAD6C': [127.057, 37.655],
  '\uB3C4\uBD09\uAD6C': [127.047, 37.669],
  '\uB3D9\uB300\uBB38\uAD6C': [127.040, 37.574],
  '\uB3D9\uC791\uAD6C': [126.940, 37.512],
  '\uB9C8\uD3EC\uAD6C': [126.909, 37.566],
  '\uC11C\uB300\uBB38\uAD6C': [126.938, 37.579],
  '\uC11C\uCD08\uAD6C': [127.032, 37.483],
  '\uC131\uB3D9\uAD6C': [127.041, 37.563],
  '\uC131\uBD81\uAD6C': [127.017, 37.606],
  '\uC1A1\uD30C\uAD6C': [127.107, 37.514],
  '\uC591\uCC9C\uAD6C': [126.867, 37.517],
  '\uC601\uB4F1\uD3EC\uAD6C': [126.896, 37.526],
  '\uC6A9\uC0B0\uAD6C': [126.990, 37.532],
  '\uC740\uD3C9\uAD6C': [126.929, 37.603],
  '\uC885\uB85C\uAD6C': [126.979, 37.573],
  '\uC911\uAD6C': [126.997, 37.563],
  '\uC911\uB791\uAD6C': [127.093, 37.606],
};

const FACILITY_OPTIONS: { value: FacilityType | 'all'; label: string; img?: string }[] = [
  { value: 'all',           label: '\uC804\uCCB4' },
  { value: 'hospital',      label: '\uBCD1\uC6D0',   img: '/markers/hospital.svg' },
  { value: 'clinic',        label: '\uC758\uC6D0',   img: '/markers/clinic.svg' },
  { value: 'pharmacy',      label: '\uC57D\uAD6D',   img: '/markers/pharmacy.svg' },
  { value: 'health_center', label: '\uBCF4\uAC74\uC18C', img: '/markers/health_center.svg' },
];

const MODE_OPTIONS: { value: AnalysisMode; label: string; desc: string }[] = [
  { value: 'profiling', label: '\uC2DC\uC124 \uBD84\uD3EC \uD655\uC778', desc: '\uD604\uC7AC \uC758\uB8CC \uC778\uD504\uB77C \uBD84\uD3EC\uC640 \uC778\uAD6C \uBC00\uB3C4\uB97C \uC9C0\uB3C4\uC5D0 \uD45C\uC2DC\uD569\uB2C8\uB2E4' },
  { value: 'gap',       label: '\uC758\uB8CC \uACF5\uBC31 \uBD84\uC11D', desc: '\uBBF8\uCDA9\uC871 \uC758\uB8CC \uC218\uC694 \uACA9\uC790\uB97C \uD788\uD2B8\uB9F5\uC73C\uB85C \uD45C\uC2DC\uD569\uB2C8\uB2E4' },
];

/* ──────────────────── Card 1: Location Analysis ──────────────────── */
function LocationCard({ onLaunch }: { onLaunch: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<FacilityType | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('profiling');
  const [selectedGu, setSelectedGu] = useState<string>('\uC804\uCCB4 \uC11C\uC6B8');
  const router = useRouter();
  const { setFacilityTypeFilter, setAnalysisMode, setViewState, setSelectedRegionName, viewState } = useStore();

  const handleStart = () => {
    const [lon, lat] = SEOUL_GU[selectedGu] ?? [126.978, 37.566];
    setFacilityTypeFilter(selectedFacility);
    setAnalysisMode(selectedMode);
    setViewState({ ...viewState, longitude: lon, latitude: lat, zoom: selectedGu === '\uC804\uCCB4 \uC11C\uC6B8' ? 11 : 13, pitch: 0, bearing: 0 });
    setSelectedRegionName(selectedGu === '\uC804\uCCB4 \uC11C\uC6B8' ? '\uC11C\uC6B8\uD2B9\uBCC4\uC2DC' : selectedGu);
    onLaunch();
    setTimeout(() => router.push('/dashboard'), 380);
  };

  return (
    <div className={clsx(
      'relative flex flex-col rounded-2xl border transition-all duration-300 bg-slate-900/80',
      expanded
        ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10'
        : 'border-slate-700/60 hover:border-cyan-500/40 hover:shadow-md hover:shadow-cyan-500/10 hover:-translate-y-0.5',
    )}>
      <button className="text-left p-5" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0">
            <MapPin size={18} className="text-white" />
          </div>
          <ChevronDown size={15} className={clsx('text-slate-500 transition-transform duration-200 mt-1', expanded && 'rotate-180 text-cyan-400')} />
        </div>
        <p className="text-[10px] text-slate-500 font-medium tracking-wide mb-0.5">Location Analysis</p>
        <h3 className="text-sm font-bold text-slate-100 leading-snug">{'\uBCD1\uC758\uC6D0 \uBC0F \uC57D\uAD6D \uC785\uC9C0\uBD84\uC11D'}</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {'\uC11C\uC6B8\uC2DC \uC758\uB8CC \uACF5\uBC31\uC744 \uACA9\uC790 \uB2E8\uC704\uB85C \uBD84\uC11D\uD569\uB2C8\uB2E4'}
        </p>
      </button>

      <div className={clsx('overflow-hidden transition-all duration-300', expanded ? 'max-h-96' : 'max-h-0')}>
        <div className="px-5 pb-5 space-y-4 border-t border-slate-700/50 pt-4">
          {/* Facility Type */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uC2DC\uC124 \uC720\uD615'}</p>
            <div className="flex flex-wrap gap-1.5">
              {FACILITY_OPTIONS.map(({ value, label, img }) => (
                <button
                  key={value}
                  onClick={() => setSelectedFacility(value)}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                    selectedFacility === value
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500',
                  )}
                >
                  {img && <img src={img} alt={label} className="w-3.5 h-3.5 object-contain" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Mode */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uBD84\uC11D \uBAA9\uC801'}</p>
            <div className="space-y-1.5">
              {MODE_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setSelectedMode(value)}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-lg border transition-all',
                    selectedMode === value
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={clsx('w-2.5 h-2.5 rounded-full border-2 flex-shrink-0', selectedMode === value ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600')} />
                    <span className="text-[11px] font-medium">{label}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5 ml-4">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uBD84\uC11D \uC9C0\uC5ED'}</p>
            <select
              value={selectedGu}
              onChange={(e) => setSelectedGu(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition"
            >
              {Object.keys(SEOUL_GU).map((gu) => (
                <option key={gu} value={gu}>{gu}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2"
          >
            <ArrowRight size={14} />
            {'\uBD84\uC11D \uC2DC\uC791'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Card 2: Auto Analysis ──────────────────── */
function AutoAnalysisCard() {
  return (
    <div className="relative flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900/80 p-5 opacity-80 cursor-not-allowed">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0">
          <Bot size={18} className="text-white" />
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-600 border border-slate-700/60">{'\uAC1C\uBC1C \uC911'}</span>
      </div>
      <p className="text-[10px] text-slate-500 font-medium tracking-wide mb-0.5">Auto-HIRA</p>
      <h3 className="text-sm font-bold text-slate-300 leading-snug">{'\uC790\uC728 \uBD84\uC11D'}</h3>
      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
        {'\uC790\uC5F0\uC5B4 \uBA85\uB839\uC73C\uB85C HIRA \uBE45\uB370\uC774\uD130 \uCF54\uB529 \uC790\uB3D9\uD654'}
      </p>
      <div className="mt-auto pt-4 border-t border-slate-800/60 mt-4">
        <div className="flex flex-wrap gap-1">
          {['Python', 'Pandas', 'HIRA API'].map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-600 font-mono">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Card 3: Cost & Disease ──────────────────── */
function CostDiseaseCard() {
  return (
    <div className="relative flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900/80 p-5 opacity-80 cursor-not-allowed">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
          <FileText size={18} className="text-white" />
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-600 border border-slate-700/60">{'\uAC1C\uBC1C \uC911'}</span>
      </div>
      <p className="text-[10px] text-slate-500 font-medium tracking-wide mb-0.5">Cost Protocol</p>
      <h3 className="text-sm font-bold text-slate-300 leading-snug">{'\uC218\uAC00 \uBC0F \uC9C8\uD658\uBCC4 \uBD84\uC11D'}</h3>
      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
        {'\uC9C8\uD658\uBCC4 \uCD5C\uC801 \uC9C4\uB8CC \uACBD\uB85C \uBC0F \uAC74\uAC15\uBCF4\uD5EC \uC218\uAC00 \uBD84\uC11D'}
      </p>
      <div className="mt-auto pt-4 border-t border-slate-800/60 mt-4">
        <div className="flex flex-wrap gap-1">
          {['ICD-10', 'DRG', 'HIRA \uC218\uAC00'].map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-600 font-mono">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Main export ──────────────────── */
interface Props {
  onLaunchSimCity: () => void;
}

export default function ServiceCards({ onLaunchSimCity }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] text-slate-500 font-medium tracking-wider uppercase">Core Services</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <LocationCard onLaunch={onLaunchSimCity} />
        <AutoAnalysisCard />
        <CostDiseaseCard />
      </div>
    </div>
  );
}
