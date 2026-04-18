'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { FacilityType } from '@/types';

const OPTIONS: { type: FacilityType; label: string; color: string; emoji: string }[] = [
  { type: 'clinic',        label: '의원',       color: '#10b981', emoji: '🏥' },
  { type: 'hospital',      label: '병원',       color: '#3b82f6', emoji: '🏨' },
  { type: 'pharmacy',      label: '약국',       color: '#f59e0b', emoji: '💊' },
  { type: 'health_center', label: '보건소',     color: '#a855f7', emoji: '🏛️' },
  { type: 'dental',        label: '치과의원',   color: '#ec4899', emoji: '🦷' },
  { type: 'oriental',      label: '한의원',     color: '#eab308', emoji: '🌿' },
];

interface Props {
  x: number;
  y: number;
  onSelect: (type: FacilityType) => void;
  onCancel: () => void;
}

export default function FacilityTypePicker({ x, y, onSelect, onCancel }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onCancel]);

  // 화면 경계 안으로 위치 보정
  const posX = Math.min(x, window.innerWidth  - 200);
  const posY = Math.min(y, window.innerHeight - 260);

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-slate-800/95 border border-slate-600/60 rounded-xl shadow-2xl backdrop-blur-sm p-3 w-48"
      style={{ left: posX, top: posY }}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-slate-300">시설 유형 선택</span>
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition">
          <X size={13} />
        </button>
      </div>

      <div className="space-y-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-700 transition-all text-left"
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: opt.color }}
            />
            <span className="text-base leading-none">{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
