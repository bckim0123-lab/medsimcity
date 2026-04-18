'use client';

import { useState, useCallback } from 'react';
import {
  Layers,
  MapPin,
  Users,
  Activity,
  Pill,
  HeartPulse,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { geocode } from '@/lib/api';
import type { DiseaseType, FacilityType } from '@/types';
import { clsx } from 'clsx';

const FACILITY_ICONS: Partial<Record<string, string>> = {
  hospital:      '/markers/hospital.svg',
  clinic:        '/markers/clinic.svg',
  pharmacy:      '/markers/pharmacy.svg',
  health_center: '/markers/health_center.svg',
};

function LayerToggle({
  label,
  active,
  color,
  onToggle,
  icon,
}: {
  label: string;
  active: boolean;
  color: string;
  onToggle: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      className={clsx(
        'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-slate-700 text-slate-100'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300',
      )}
    >
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ background: active ? color : '#475569' }}
      />
      {icon && <span className="opacity-70">{icon}</span>}
      <span className="flex-1 text-left">{label}</span>
      <span className={clsx('text-xs px-1.5 py-0.5 rounded', active ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-600')}>
        {active ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}

function RadioOption<T extends string>({
  label,
  value,
  current,
  onChange,
  imgSrc,
}: {
  label: string;
  value: T;
  current: T;
  onChange: (v: T) => void;
  imgSrc?: string;
}) {
  return (
    <button
      onClick={() => onChange(value)}
      className={clsx(
        'flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-all',
        current === value
          ? 'bg-cyan-500/15 text-cyan-400 font-medium'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300',
      )}
    >
      <span
        className={clsx(
          'w-3.5 h-3.5 rounded-full border-2 flex-shrink-0',
          current === value ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600',
        )}
      />
      {imgSrc && (
        <img src={imgSrc} alt={label} className="w-5 h-5 object-contain flex-shrink-0" />
      )}
      {label}
    </button>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 pt-1">
      <span className="text-cyan-500">{icon}</span>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
    </div>
  );
}

export default function Sidebar() {
  const {
    showPopulation, togglePopulation,
    showGap, toggleGap,
    showFacilities, toggleFacilities,
    diseaseType, setDiseaseType,
    facilityTypeFilter, setFacilityTypeFilter,
    facilities,
    setViewState,
    viewState,
    setSelectedRegionName,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await geocode(searchQuery);
      if (result) {
        setViewState({ ...viewState, latitude: result.lat, longitude: result.lon, zoom: 13, pitch: 0, bearing: 0 });
        setSelectedRegionName(result.name.split(',')[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, setViewState, viewState, setSelectedRegionName]);

  return (
    <aside className="flex flex-col h-full bg-slate-900 border-r border-slate-700/50 w-64 flex-shrink-0 overflow-y-auto">
      <div className="px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <div>
            <p className="font-bold text-slate-100 text-sm leading-none">MediSim</p>
            <p className="text-slate-500 text-xs mt-0.5">{'\uC11C\uC6B8 \uC785\uC9C0\uBD84\uC11D'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-5">
        <div>
          <SectionHeader icon={<Search size={13} />} title={'\uC9C0\uC5ED \uAC80\uC0C9'} />
          <div className="flex gap-1.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={'\uC608: \uB9C8\uD3EC\uAD6C, \uAC15\uB0A8\uAD6C...'}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {isSearching ? '...' : <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        <div>
          <SectionHeader icon={<Layers size={13} />} title={'\uB808\uC774\uC5B4'} />
          <div className="space-y-1">
            <LayerToggle
              label={'\uC778\uAD6C \uBD84\uD3EC'}
              active={showPopulation}
              color="#38bdf8"
              onToggle={togglePopulation}
              icon={<Users size={12} />}
            />
            <LayerToggle
              label={'\uC758\uB8CC \uACF5\uBC31 \uBD84\uC11D'}
              active={showGap}
              color="#f97316"
              onToggle={toggleGap}
              icon={<Activity size={12} />}
            />
            <LayerToggle
              label={'\uC2DC\uC124 \uD45C\uC2DC'}
              active={showFacilities}
              color="#10b981"
              onToggle={toggleFacilities}
              icon={<MapPin size={12} />}
            />
          </div>
        </div>

        <div>
          <SectionHeader icon={<HeartPulse size={13} />} title={'\uC2DC\uC124 \uC720\uD615'} />
          <div className="space-y-0.5">
            {([
              ['all',           '\uC804\uCCB4',   undefined],
              ['hospital',      '\uBCD1\uC6D0',   FACILITY_ICONS['hospital']],
              ['clinic',        '\uC758\uC6D0',   FACILITY_ICONS['clinic']],
              ['pharmacy',      '\uC57D\uAD6D',   FACILITY_ICONS['pharmacy']],
              ['health_center', '\uBCF4\uAC74\uC18C', FACILITY_ICONS['health_center']],
            ] as [FacilityType | 'all', string, string | undefined][]).map(([v, l, img]) => (
              <RadioOption
                key={v}
                label={l}
                value={v}
                current={facilityTypeFilter}
                onChange={setFacilityTypeFilter}
                imgSrc={img}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionHeader icon={<Pill size={13} />} title={'\uC9C8\uD658 \uD544\uD130'} />
          <div className="space-y-0.5">
            {([
              ['all',       '\uC804\uCCB4 (\uAE30\uBCF8 \uBD84\uC11D)'],
              ['emergency', '\uC751\uAE09 \uC758\uB8CC (\uC2EC\uC7A5\uB9C8\uBE44)'],
              ['chronic',   '\uB9CC\uC131\uC9C8\uD658 (\uB2F9\uB1CC \uC678)'],
              ['pediatric', '\uC18C\uC544\uACFC (\uC57C\uAC04 \uCD94\uAC00)'],
            ] as [DiseaseType, string][]).map(([v, l]) => (
              <RadioOption
                key={v}
                label={l}
                value={v}
                current={diseaseType}
                onChange={setDiseaseType}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-slate-700/50 text-xs text-slate-500">
        <p>{'\uB85C\uB4DC\uB41C \uC2DC\uC124: '}<span className="text-slate-300 font-mono">{facilities.length.toLocaleString()}{'\uAC1C'}</span></p>
        <p className="mt-0.5 text-slate-600">{'\uB370\uC774\uD130 \uCD9C\uCC98: HIRA \uAC74\uAC15\uBCF4\uD5EC\uC2EC\uC0AC\uD3C9\uAC00\uC6D0'}</p>
      </div>
    </aside>
  );
}
