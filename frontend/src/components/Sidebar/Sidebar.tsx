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
  hospital:      '/markers/hospital.png',
  clinic:        '/markers/clinic.png',
  pharmacy:      '/markers/pharmacy.png',
  health_center: '/markers/health_center.png',
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
      {/* 로고 */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <div>
            <p className="font-bold text-slate-100 text-sm leading-none">MediSim</p>
            <p className="text-slate-500 text-xs mt-0.5">서울 입지분석</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-5">
        {/* 지역 검색 */}
        <div>
          <SectionHeader icon={<Search size={13} />} title="지역 검색" />
          <div className="flex gap-1.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="예: 강남구, 노원구..."
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

        {/* 레이어 제어 */}
        <div>
          <SectionHeader icon={<Layers size={13} />} title="레이어" />
          <div className="space-y-1">
            <LayerToggle
              label="인구 밀도"
              active={showPopulation}
              color="#38bdf8"
              onToggle={togglePopulation}
              icon={<Users size={12} />}
            />
            <LayerToggle
              label="의료 공백 분석"
              active={showGap}
              color="#f97316"
              onToggle={toggleGap}
              icon={<Activity size={12} />}
            />
            <LayerToggle
              label="의료 시설"
              active={showFacilities}
              color="#10b981"
              onToggle={toggleFacilities}
              icon={<MapPin size={12} />}
            />
          </div>
        </div>

        {/* 시설 유형 필터 */}
        <div>
          <SectionHeader icon={<HeartPulse size={13} />} title="시설 유형" />
          <div className="space-y-0.5">
            {([
              ['all',          '전체', undefined],
              ['hospital',     '병원',   FACILITY_ICONS['hospital']],
              ['clinic',       '의원',   FACILITY_ICONS['clinic']],
              ['pharmacy',     '약국',   FACILITY_ICONS['pharmacy']],
              ['health_center','보건소', FACILITY_ICONS['health_center']],
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

        {/* 질환 우선순위 */}
        <div>
          <SectionHeader icon={<Pill size={13} />} title="질환 우선순위" />
          <div className="space-y-0.5">
            {([
              ['all',       '전체 (균등 가중치)'],
              ['emergency', '중증 응급 (골든타임)'],
              ['chronic',   '만성질환 (고령자 가중)'],
              ['pediatric', '소아청소년 (아동 가중)'],
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

      {/* 하단 통계 */}
      <div className="px-4 py-3 border-t border-slate-700/50 text-xs text-slate-500">
        <p>로드된 시설: <span className="text-slate-300 font-mono">{facilities.length.toLocaleString()}개</span></p>
        <p className="mt-0.5 text-slate-600">데이터 출처: HIRA 건강보험심사평가원</p>
      </div>
    </aside>
  );
}
