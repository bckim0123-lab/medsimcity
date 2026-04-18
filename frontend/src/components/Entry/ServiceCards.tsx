'use client';

import { useState } from 'react';
import { Bot, FileText, ArrowRight, ChevronDown, MapPin, Send, Pill, HeartPulse } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';
import type { FacilityType, AnalysisMode } from '@/types';

/* ──────────────── Seoul district coordinates ──────────────── */
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
  { value: 'profiling', label: '\uC2DC\uC124 \uBD84\uD3EC \uD655\uC778', desc: '\uD604\uC7AC \uC758\uB8CC \uC778\uD504\uB77C \uBD84\uD3EC\uC640 \uC778\uAD6C \uBC00\uB3C4\uB97C \uC9C0\uB3C4\uC5D0 \uD45C\uC2DC' },
  { value: 'gap',       label: '\uC758\uB8CC \uACF5\uBC31 \uBD84\uC11D', desc: '\uBBF8\uCDA9\uC871 \uC758\uB8CC \uC218\uC694 \uACA9\uC790\uB97C \uD788\uD2B8\uB9F5\uC73C\uB85C \uD45C\uC2DC' },
];

const DISEASE_OPTIONS = [
  '\uB2F9\uB1CC\uBCD1',
  '\uACE0\uD601\uC555',
  '\uC554',
  '\uC2EC\uD601\uAD00\uC9C8\uD658',
  '\uB1CC\uC90C\uC911',
  '\uACE0\uB839\uC9C8\uD658',
];

const COST_ANALYSIS_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'cost',         label: '\uC9C4\uB8CC\uBE44 \uBD84\uC11D',  desc: '\uC9C8\uD658\uBCC4 \uD3C9\uADE0 \uC9C4\uB8CC\uBE44 \uBC0F \uC608\uC0B0 \uBD84\uC11D' },
  { value: 'prescription', label: '\uCC98\uBC29 \uD328\uD134',        desc: '\uC8FC\uC694 \uCC98\uBC29\uC57D \uBC0F \uBCF5\uC6A9 \uD328\uD134 \uBD84\uC11D' },
  { value: 'pathway',      label: '\uCC98\uCE58 \uACBD\uB85C',        desc: '\uCD5C\uC801 \uC9C4\uB8CC \uACBD\uB85C \uBC0F \uC758\uB8CC\uAE30\uAD00 \uC120\uD0DD' },
  { value: 'regional',     label: '\uC9C0\uC5ED\uBCC4 \uBD84\uD3EC',  desc: '\uC9C8\uD658 \uBC0F \uC758\uB8CC \uC774\uC6A9 \uC9C0\uC5ED \uBD84\uD3EC \uBD84\uC11D' },
];

const AUTO_EXAMPLES = [
  '\uC11C\uC6B8\uC2DC \uC18C\uC544\uACFC \uC9C4\uB8CC\uBE44 \uC9C0\uC5ED\uBCC4 \uBD84\uD3EC \uBD84\uC11D \ucf54\ub4dc',
  '\uC758\uC6D0\uAE09 \uCC98\uBC29 \uD68C\uC218 \uC0C1\uC704 20\uAC1C \uBAA9\uB85D \uCD94\uCD9C',
  '\uC5F0\uB839\uB300\uBCC4 \uB0B4\uACFC \uC774\uC6A9 \uD328\uD134 \uBD84\uC11D \ucf54\ub4dc',
];

/* ──────────────── Card 1: Location Analysis ──────────────── */
function LocationCard({ onLaunch }: { onLaunch: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<FacilityType | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('profiling');
  const [selectedGu, setSelectedGu] = useState<string>('\uC804\uCCB4 \uC11C\uC6B8');
  const { setFacilityTypeFilter, setAnalysisMode, setViewState, setSelectedRegionName, viewState } = useStore();

  const handleStart = () => {
    const [lon, lat] = SEOUL_GU[selectedGu] ?? [126.978, 37.566];
    setFacilityTypeFilter(selectedFacility);
    setAnalysisMode(selectedMode);
    setViewState({ ...viewState, longitude: lon, latitude: lat, zoom: selectedGu === '\uC804\uCCB4 \uC11C\uC6B8' ? 11 : 13, pitch: 0, bearing: 0 });
    setSelectedRegionName(selectedGu === '\uC804\uCCB4 \uC11C\uC6B8' ? '\uC11C\uC6B8\uD2B9\uBCC4\uC2DC' : selectedGu);
    onLaunch();
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

/* ──────────────── Card 2: Auto Analysis ──────────────── */
function AutoAnalysisCard({ onSendToAgent }: { onSendToAgent: (q: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');

  const handleSend = (text?: string) => {
    const q = (text ?? query).trim();
    if (!q) return;
    onSendToAgent(q);
    setExpanded(false);
    setQuery('');
  };

  return (
    <div className={clsx(
      'relative flex flex-col rounded-2xl border transition-all duration-300 bg-slate-900/80',
      expanded
        ? 'border-violet-500/50 shadow-lg shadow-violet-500/10'
        : 'border-slate-700/60 hover:border-violet-500/40 hover:shadow-md hover:shadow-violet-500/10 hover:-translate-y-0.5',
    )}>
      <button className="text-left p-5" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0">
            <Bot size={18} className="text-white" />
          </div>
          <ChevronDown size={15} className={clsx('text-slate-500 transition-transform duration-200 mt-1', expanded && 'rotate-180 text-violet-400')} />
        </div>
        <p className="text-[10px] text-slate-500 font-medium tracking-wide mb-0.5">Auto-HIRA</p>
        <h3 className="text-sm font-bold text-slate-100 leading-snug">{'\uC790\uC728 \uBD84\uC11D'}</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {'\uC790\uC5F0\uC5B4 \uBA85\uB839\uC73C\uB85C HIRA \uBE45\uB370\uC774\uD130 \uCF54\uB529 \uC790\uB3D9\uD654'}
        </p>
      </button>

      <div className={clsx('overflow-hidden transition-all duration-300', expanded ? 'max-h-[420px]' : 'max-h-0')}>
        <div className="px-5 pb-5 border-t border-slate-700/50 pt-4 space-y-3">
          {/* Example queries */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uBD84\uC11D \uC608\uC2DC'}</p>
            <div className="space-y-1.5">
              {AUTO_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(ex)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-violet-500/40 hover:bg-violet-500/5 text-[11px] text-slate-400 hover:text-violet-300 transition-all leading-relaxed"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Custom query input */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uC9C1\uC811 \uC785\uB825'}</p>
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl border border-slate-700/60 focus-within:border-violet-500/50 transition-colors px-3 py-2.5">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={'\uBD84\uC11D \uC694\uCCAD\uC744 \uC785\uB825\uD558\uC138\uC694\u2026'}
                className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!query.trim()}
                className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 text-white flex items-center justify-center transition-all flex-shrink-0"
              >
                <Send size={12} />
              </button>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap gap-1">
            {['Python', 'Pandas', 'HIRA API'].map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-violet-900/30 text-violet-400 border border-violet-800/40 font-mono">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Card 3: Cost & Disease ──────────────── */
function CostDiseaseCard({ onSendToAgent }: { onSendToAgent: (q: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<string>('\uB2F9\uB1CC\uBCD1');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('cost');

  const handleStart = () => {
    const analysisLabel = COST_ANALYSIS_OPTIONS.find((o) => o.value === selectedAnalysis)?.label ?? selectedAnalysis;
    const query = `\uC11C\uC6B8\uC2DC ${selectedDisease} \uD658\uC790\uC758 ${analysisLabel}\uC744 \uBD84\uC11D\uD574\uC918. HIRA \uB370\uC774\uD130 \uAE30\uBC18\uC73C\uB85C \uC9C0\uC5ED\uBCC4 \uBD84\uD3EC\uC640 \uC9C4\uB8CC\uBE44 \uD604\uD669\uB3C4 \uD568\uAED8 \uBB3C\uC5B4\uBD10.`;
    onSendToAgent(query);
    setExpanded(false);
  };

  return (
    <div className={clsx(
      'relative flex flex-col rounded-2xl border transition-all duration-300 bg-slate-900/80',
      expanded
        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
        : 'border-slate-700/60 hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/10 hover:-translate-y-0.5',
    )}>
      <button className="text-left p-5" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
            <FileText size={18} className="text-white" />
          </div>
          <ChevronDown size={15} className={clsx('text-slate-500 transition-transform duration-200 mt-1', expanded && 'rotate-180 text-emerald-400')} />
        </div>
        <p className="text-[10px] text-slate-500 font-medium tracking-wide mb-0.5">Cost Protocol</p>
        <h3 className="text-sm font-bold text-slate-100 leading-snug">{'\uC218\uAC00 \uBC0F \uC9C8\uD658\uBCC4 \uBD84\uC11D'}</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {'\uC9C8\uD658\uBCC4 \uCD5C\uC801 \uC9C4\uB8CC \uACBD\uB85C \uBC0F \uAC74\uAC15\uBCF4\uD5EC \uC218\uAC00 \uBD84\uC11D'}
        </p>
      </button>

      <div className={clsx('overflow-hidden transition-all duration-300', expanded ? 'max-h-[500px]' : 'max-h-0')}>
        <div className="px-5 pb-5 border-t border-slate-700/50 pt-4 space-y-4">
          {/* Disease selector */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uC9C8\uD658 \uC120\uD0DD'}</p>
            <div className="flex flex-wrap gap-1.5">
              {DISEASE_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDisease(d)}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                    selectedDisease === d
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500',
                  )}
                >
                  <Pill size={9} />
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis type */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uBD84\uC11D \uC720\uD615'}</p>
            <div className="space-y-1.5">
              {COST_ANALYSIS_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setSelectedAnalysis(value)}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-lg border transition-all',
                    selectedAnalysis === value
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={clsx('w-2.5 h-2.5 rounded-full border-2 flex-shrink-0', selectedAnalysis === value ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600')} />
                    <span className="text-[11px] font-medium">{label}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5 ml-4">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview query */}
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-500 mb-1">{'\uC0DD\uC131\uB418\uB294 \uC9C8\uBB38'}</p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {'\uC11C\uC6B8\uC2DC '}{selectedDisease}{' \uD658\uC790\uC758 '}
              {COST_ANALYSIS_OPTIONS.find((o) => o.value === selectedAnalysis)?.label}
              {'\uC744 \uBD84\uC11D\uD574\uC918.'}
            </p>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
          >
            <HeartPulse size={14} />
            {'\uC9C8\uD658 \uBD84\uC11D \uC2DC\uC791'}
          </button>

          <div className="flex flex-wrap gap-1">
            {['ICD-10', 'DRG', 'HIRA \uC218\uAC00'].map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-500 border border-emerald-800/40 font-mono">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Main export ──────────────── */
interface Props {
  onLaunchSimCity: () => void;
  onSendToAgent: (query: string) => void;
}

export default function ServiceCards({ onLaunchSimCity, onSendToAgent }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] text-slate-500 font-medium tracking-wider uppercase">Core Services</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LocationCard onLaunch={onLaunchSimCity} />
        <AutoAnalysisCard onSendToAgent={onSendToAgent} />
        <CostDiseaseCard onSendToAgent={onSendToAgent} />
      </div>
    </div>
  );
}
