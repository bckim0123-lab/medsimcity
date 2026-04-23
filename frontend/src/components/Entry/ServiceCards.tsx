'use client';

import { useState } from 'react';
import { Bot, FileText, ArrowRight, ChevronDown, MapPin, Send, Pill, HeartPulse, Zap, Radio, Map } from 'lucide-react';
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

/* ──────────────── Policy Simulator constants ──────────────── */
const DISEASE_SIM_OPTIONS = [
  '\uC2EC\uD601\uAD00',
  '\uB1CC\uD601\uAD00',
  '\uC554',
  '\uACE0\uC704\uD5D8 \uC0B0\uBAA8',
  '\uC18C\uC544 \uC751\uAE09',
];

const INTERVENTION_OPTIONS: { value: string; label: string; desc: string }[] = [
  {
    value: 'specialist',
    label: '\uC804\uBB38\uC758 \uC99D\uC6D0',
    desc: '\uC804\uBB38\uC758 \uC218 \uC870\uC815 \uC2DC \uACE8\uB4E0\uD0C0\uC784 \uBC0F \uC0AC\uB9DD\uB960 \uBCC0\uD654 \uC608\uCE21',
  },
  {
    value: 'emergency',
    label: '\uC751\uAE09\uC13C\uD130 \uCD94\uAC00',
    desc: '\uC751\uAE09\uC758\uB8CC\uC13C\uD130 \uC2E0\uC124 \uC2DC \uB300\uC751 \uC5ED\uB7C9 \uC2DC\uBBAC\uB808\uC774\uC158',
  },
  {
    value: 'hospital',
    label: '\uBCD1\uC6D0 \uC2E0\uC124',
    desc: '\uC885\uD569\uBCD1\uC6D0 \uC2E0\uADDC \uC124\uB9BD\uC5D0 \uB530\uB978 \uC9C0\uC5ED \uC218\uAE09 \uD6A8\uACFC \uBD84\uC11D',
  },
];

const HORIZONS = ['1\uB144', '3\uB144', '5\uB144', '10\uB144'];

/* ──────────────── EssentialMap constants ──────────────── */
const ESSENTIAL_SPECIALTIES = [
  '\uC18C\uC544\uCCAD\uC18C\uB144\uACFC',
  '\uC0B0\uBD80\uC778\uACFC',
  '\uC751\uAE09\uC758\uD559\uACFC',
  '\uC678\uACFC',
];

const EMDI_ANALYSIS_OPTIONS: { value: string; label: string; desc: string }[] = [
  {
    value: 'emdi',
    label: 'EMDI \uC704\uAE30 \uC9C0\uC218',
    desc: '\uC778\uAD6C \uB300\uBE44 \uD544\uC218\uC758\uC6D0 \uC218 \uBC0F \uD3D0\uC5C5 \uC704\uD5D8\uB3C4 \uC0B0\uCD9C (5\uB2E8\uACC4 \uB4F1\uAE09)',
  },
  {
    value: 'closure',
    label: '\uD3D0\uC5C5 \uB3D9\uD5A5 \uBD84\uC11D',
    desc: '\uCD5C\uADFC 3\uAC1C\uC6D4 \uD3D0\uC5C5\u00B7\uD734\uC5C5 \uC2E0\uACE0 \uCD94\uC774 \uBC0F \uAC00\uC18D\uB3C4 \uBD84\uC11D',
  },
  {
    value: 'policy',
    label: '\uC815\uCC45 \uAC1C\uC785 \uCD94\uCC9C',
    desc: '\uC704\uAE30 \uB4F1\uAE09\uBCC4 \uB9DE\uCDA4 \uC815\uCC45 \uCC98\uBC29 (\uAE34\uAE09\uD30C\uACAC/\uC218\uAC00\uAC00\uC0B0 \uB4F1)',
  },
];

const LIVE_ALERTS = [
  {
    emoji: '\uD83D\uDEA8',
    region: '\uB9C8\uD3EC\uAD6C',
    specialty: '\uC18C\uC544\uCCAD\uC18C\uB144\uACFC',
    msg: '1\uAC1C\uC18C \uD3D0\uC5C5 \uC2E0\uACE0 \uC811\uC218',
    change: 'EMDI +0.5',
    color: 'text-red-400',
  },
  {
    emoji: '\u26A0\uFE0F',
    region: '\uB178\uC6D0\uAD6C',
    specialty: '\uC678\uACFC',
    msg: '3\uACF3 4\uC8FC \uC5F0\uC18D \uD658\uC790 \uAC10\uC18C',
    change: '2\uB4F1\uAE09 \uACBD\uACE0',
    color: 'text-amber-400',
  },
  {
    emoji: '\u2705',
    region: '\uAC15\uB3D9\uAD6C',
    specialty: '\uC0B0\uBD80\uC778\uACFC',
    msg: '\uC2E0\uADDC \uAC1C\uC6D0 1\uAC1C\uC18C',
    change: 'EMDI -0.2',
    color: 'text-emerald-400',
  },
];

/* ──────────────── Card 1: Location Analysis ──────────────── */
function LocationCard({ onLaunch }: { onLaunch: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<FacilityType | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('profiling');
  const [selectedGu, setSelectedGu] = useState<string>('\uC804\uCCB4 \uC11C\uC6B8');
  const { setFacilityTypeFilter, setAnalysisMode, setViewState, setSelectedRegionName } = useStore();

  const handleStart = () => {
    const [lon, lat] = SEOUL_GU[selectedGu] ?? [126.978, 37.566];
    const currentVS = useStore.getState().viewState;
    setFacilityTypeFilter(selectedFacility);
    setAnalysisMode(selectedMode);
    setViewState({ ...currentVS, longitude: lon, latitude: lat, zoom: selectedGu === '\uC804\uCCB4 \uC11C\uC6B8' ? 11 : 13, pitch: 0, bearing: 0 });
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

/* ──────────────── Card 4: Policy Simulator ──────────────── */
function PolicySimulatorCard({ onSendToAgent, onLaunchMap }: { onSendToAgent: (q: string) => void; onLaunchMap: (region: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<string>('\uC2EC\uD601\uAD00');
  const [selectedIntervention, setSelectedIntervention] = useState<string>('specialist');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('5\uB144');
  const [selectedGu, setSelectedGu] = useState<string>('\uC804\uCCB4 \uC11C\uC6B8');

  const handleStart = () => {
    const intervention = INTERVENTION_OPTIONS.find((o) => o.value === selectedIntervention);
    const query = `${selectedGu} ${selectedDisease} \uC9C8\uD658\uC5D0 \uB300\uD574 ${intervention?.label ?? ''} \uC815\uCC45\uC744 \uC2DC\uD589\uD560 \uACBD\uC6B0 ${selectedHorizon} \uB4A4\uC758 \uACE8\uB4E0\uD0C0\uC784, \uC0AC\uB9DD\uB960, \uAC74\uBCF4\uC7AC\uC815 \uBCC0\uD654\uB97C \uC2DC\uBBAC\uB808\uC774\uC158\uD574\uC918.`;
    onSendToAgent(query);
    setExpanded(false);
  };

  return (
    <div className={clsx(
      'relative flex flex-col rounded-2xl border transition-all duration-300 bg-slate-900/80',
      expanded
        ? 'border-orange-500/50 shadow-lg shadow-orange-500/10'
        : 'border-slate-700/60 hover:border-orange-500/40 hover:shadow-md hover:shadow-orange-500/10 hover:-translate-y-0.5',
    )}>
      <button className="text-left p-5" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600 flex-shrink-0">
            <Zap size={18} className="text-white" />
          </div>
          <ChevronDown size={15} className={clsx('text-slate-500 transition-transform duration-200 mt-1', expanded && 'rotate-180 text-orange-400')} />
        </div>
        <p className="text-[10px] text-slate-500 font-medium tracking-wide mb-0.5">MediSim City</p>
        <h3 className="text-sm font-bold text-slate-100 leading-snug">{'\uC815\uCC45 \uC2DC\uBBAC\uB808\uC774\uD130'}</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {'\uC758\uB8CC \uC790\uC6D0 \uBC30\uCE58 \uC2DC\uB098\uB9AC\uC624\uC758 \uC784\uC0C1\u00B7\uC7AC\uC815 \uC601\uD5A5 \uC608\uCE21'}
        </p>
      </button>

      <div className={clsx('overflow-hidden transition-all duration-300', expanded ? 'max-h-[560px]' : 'max-h-0')}>
        <div className="px-5 pb-5 border-t border-slate-700/50 pt-4 space-y-4">
          {/* Disease selection */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uC9C8\uD658 \uC120\uD0DD'}</p>
            <div className="flex flex-wrap gap-1.5">
              {DISEASE_SIM_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDisease(d)}
                  className={clsx(
                    'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                    selectedDisease === d
                      ? 'bg-orange-500/20 border-orange-500/60 text-orange-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-orange-500/30',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Intervention type */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uAC1C\uC785 \uC720\uD615'}</p>
            <div className="space-y-1.5">
              {INTERVENTION_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setSelectedIntervention(value)}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-lg border transition-all',
                    selectedIntervention === value
                      ? 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-orange-500/30',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={clsx('w-2.5 h-2.5 rounded-full border-2 flex-shrink-0', selectedIntervention === value ? 'border-orange-400 bg-orange-400' : 'border-slate-600')} />
                    <span className="text-[11px] font-medium">{label}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5 ml-4">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time horizon */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uC608\uCE21 \uC2DC\uAC04'}</p>
            <div className="flex gap-1.5">
              {HORIZONS.map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHorizon(h)}
                  className={clsx(
                    'flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all',
                    selectedHorizon === h
                      ? 'bg-orange-500/20 border-orange-500/60 text-orange-300'
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-orange-500/30',
                  )}
                >
                  {h}
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
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500 transition"
            >
              {Object.keys(SEOUL_GU).map((gu) => (
                <option key={gu} value={gu}>{gu}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleStart}
              className="flex-1 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2"
            >
              <Zap size={13} />
              {'\uC2DC\uBBAC\uB808\uC774\uC158 \uC2DC\uC791'}
            </button>
            <button
              onClick={() => onLaunchMap(selectedGu)}
              title={'\uC9C0\uB3C4\uC5D0\uC11C \uC758\uB8CC \uACF5\uBC31 \uD604\uD669 \uBCF4\uAE30'}
              className="px-3 py-2.5 bg-slate-800/60 border border-orange-500/30 hover:border-orange-500/60 text-orange-400 hover:text-orange-300 rounded-xl text-xs transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Map size={13} />
              {'\uC9C0\uB3C4'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {['GNN', 'NAS', 'LangGraph', 'KOSIS'].map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-orange-900/30 text-orange-400 border border-orange-800/40 font-mono">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Card 5: Essential Medical Tracking ──────────────── */
function EssentialMapCard({ onSendToAgent, onLaunchMap }: { onSendToAgent: (q: string) => void; onLaunchMap: (region: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('\uC18C\uC544\uCCAD\uC18C\uB144\uACFC');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('emdi');
  const [selectedGu, setSelectedGu] = useState<string>('\uC804\uCCB4 \uC11C\uC6B8');

  const handleStart = () => {
    const analysisLabel = EMDI_ANALYSIS_OPTIONS.find((o) => o.value === selectedAnalysis)?.label ?? selectedAnalysis;
    const query = `${selectedGu} ${selectedSpecialty} ${analysisLabel}\uC744 \uC218\uD589\uD574\uC918. HIRA \uAC1C\uD3D0\uC5C5 \uB370\uC774\uD130\uC640 EMDI \uC704\uAE30 \uC9C0\uC218\uB97C \uAE30\uBC18\uC73C\uB85C \uC815\uCC45 \uAC1C\uC785 \uC2DC\uC810\uACFC \uBC29\uBC95\uC744 \uC54C\uB824\uC918.`;
    onSendToAgent(query);
    setExpanded(false);
  };

  return (
    <div className={clsx(
      'relative flex flex-col rounded-2xl border transition-all duration-300 bg-slate-900/80',
      expanded
        ? 'border-rose-500/50 shadow-lg shadow-rose-500/10'
        : 'border-slate-700/60 hover:border-rose-500/40 hover:shadow-md hover:shadow-rose-500/10 hover:-translate-y-0.5',
    )}>
      <button className="text-left p-5" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-rose-500 to-red-600 flex-shrink-0">
            <Radio size={18} className="text-white" />
          </div>
          <ChevronDown size={15} className={clsx('text-slate-500 transition-transform duration-200 mt-1', expanded && 'rotate-180 text-rose-400')} />
        </div>
        <p className="text-[10px] text-slate-500 font-medium tracking-wide mb-0.5">EssentialMap</p>
        <h3 className="text-sm font-bold text-slate-100 leading-snug">{'4\uB300 \uD544\uC218\uC758\uB8CC \uACF5\uBC31 \uCD94\uC801'}</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {'\uC2E4\uC2DC\uAC04 EMDI \uC9C0\uC218 \uAE30\uBC18 \uD544\uC218\uC758\uB8CC \uBD95\uAD34 \uC9C1\uC804 \uACBD\uBCF4 \uC2DC\uC2A4\uD15C'}
        </p>
      </button>

      <div className={clsx('overflow-hidden transition-all duration-300', expanded ? 'max-h-[600px]' : 'max-h-0')}>
        <div className="px-5 pb-5 border-t border-slate-700/50 pt-4 space-y-4">
          {/* Live alerts ticker */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <p className="text-[11px] text-red-400 font-medium">{'\uB77C\uC774\uBE0C \uACBD\uBCF4'}</p>
            </div>
            <div className="space-y-1.5">
              {LIVE_ALERTS.map((alert, i) => (
                <div key={i} className="flex items-start gap-2 px-2.5 py-2 bg-slate-800/60 rounded-lg border border-slate-700/40">
                  <span className="text-[11px] flex-shrink-0 mt-0.5">{alert.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 leading-tight">
                      <span className="text-slate-200 font-medium">{alert.region}</span>{' '}
                      {alert.specialty} {alert.msg}
                    </p>
                    <span className={clsx('text-[9px] font-mono font-bold', alert.color)}>{alert.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialty selector */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uD544\uC218\uACFC\uBAA9'}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {ESSENTIAL_SPECIALTIES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSpecialty(s)}
                  className={clsx(
                    'px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-center',
                    selectedSpecialty === s
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-rose-500/30',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis type */}
          <div>
            <p className="text-[11px] text-slate-500 font-medium mb-2">{'\uBD84\uC11D \uC720\uD615'}</p>
            <div className="space-y-1.5">
              {EMDI_ANALYSIS_OPTIONS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setSelectedAnalysis(value)}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-lg border transition-all',
                    selectedAnalysis === value
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-rose-500/30',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={clsx('w-2.5 h-2.5 rounded-full border-2 flex-shrink-0', selectedAnalysis === value ? 'border-rose-400 bg-rose-400' : 'border-slate-600')} />
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
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition"
            >
              {Object.keys(SEOUL_GU).map((gu) => (
                <option key={gu} value={gu}>{gu}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleStart}
              className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2"
            >
              <Radio size={13} />
              {'\uACF5\uBC31 \uCD94\uC801 \uC2DC\uC791'}
            </button>
            <button
              onClick={() => onLaunchMap(selectedGu)}
              title={'\uC9C0\uB3C4\uC5D0\uC11C \uD544\uC218\uC758\uB8CC \uACF5\uBC31 \uD604\uD669 \uBCF4\uAE30'}
              className="px-3 py-2.5 bg-slate-800/60 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:text-rose-300 rounded-xl text-xs transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <Map size={13} />
              {'\uC9C0\uB3C4'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {['EMDI', 'HIRA \uAC1C\uD3D0\uC5C5API', 'KOSIS'].map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900/30 text-rose-400 border border-rose-800/40 font-mono">{tag}</span>
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
  onLaunchMap: (region: string) => void;
}

export default function ServiceCards({ onLaunchSimCity, onSendToAgent, onLaunchMap }: Props) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] text-slate-500 font-medium tracking-wider uppercase">Core Services</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <LocationCard onLaunch={onLaunchSimCity} />
        <AutoAnalysisCard onSendToAgent={onSendToAgent} />
        <CostDiseaseCard onSendToAgent={onSendToAgent} />
        <PolicySimulatorCard onSendToAgent={onSendToAgent} onLaunchMap={onLaunchMap} />
        <EssentialMapCard onSendToAgent={onSendToAgent} onLaunchMap={onLaunchMap} />
      </div>
    </div>
  );
}
