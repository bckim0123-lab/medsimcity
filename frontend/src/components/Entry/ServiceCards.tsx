'use client';

import { Map, Bot, FileText, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface ServiceCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  gradient: string;
  borderHover: string;
  shadowHover: string;
  ready: boolean;
}

const CARDS: ServiceCard[] = [
  {
    id: 'simcity',
    icon: <Map size={24} />,
    title: '정책 시뮬레이션',
    subtitle: 'SimCity',
    description: '서울시 의료 공백을 격자 단위로 분석하고, 신규 시설 배치의 정책 효과를 실시간으로 시뮬레이션합니다.',
    gradient: 'from-cyan-500 to-blue-600',
    borderHover: 'hover:border-cyan-500/60',
    shadowHover: 'hover:shadow-cyan-500/20',
    ready: true,
  },
  {
    id: 'auto-hira',
    icon: <Bot size={24} />,
    title: '자율 분석',
    subtitle: 'Auto-HIRA',
    description: '자연어 명령으로 보건의료 빅데이터 코딩을 자동화합니다. "마포구 65세 이상 입원율 추이" 같은 질문을 SQL로 변환합니다.',
    badge: '개발 중',
    gradient: 'from-violet-500 to-purple-600',
    borderHover: 'hover:border-violet-500/60',
    shadowHover: 'hover:shadow-violet-500/20',
    ready: false,
  },
  {
    id: 'protocol',
    icon: <FileText size={24} />,
    title: '수가 & 프로토콜',
    subtitle: 'Cost Protocol',
    description: '질환별 최적 진료 경로와 건강보험 수가를 분석합니다. 비급여 평균 비용과 급여 기준을 한눈에 비교하세요.',
    badge: '개발 중',
    gradient: 'from-emerald-500 to-teal-600',
    borderHover: 'hover:border-emerald-500/60',
    shadowHover: 'hover:shadow-emerald-500/20',
    ready: false,
  },
  {
    id: 'drug',
    icon: <AlertTriangle size={24} />,
    title: '다약제 부작용 탐지',
    subtitle: 'GNN Drug Interaction',
    description: '그래프 신경망(GNN) 기반으로 다약제 복용 환자의 약물 상호작용 위험을 조기에 감지합니다.',
    badge: '개발 중',
    gradient: 'from-orange-500 to-red-600',
    borderHover: 'hover:border-orange-500/60',
    shadowHover: 'hover:shadow-orange-500/20',
    ready: false,
  },
];

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

      <div className="grid grid-cols-2 gap-4">
        {CARDS.map((card) => (
          <button
            key={card.id}
            onClick={card.ready ? onLaunchSimCity : undefined}
            disabled={!card.ready}
            className={clsx(
              'relative text-left p-5 rounded-2xl border transition-all duration-300 group',
              'bg-slate-900/80 border-slate-700/60',
              card.ready
                ? [card.borderHover, 'hover:shadow-lg', card.shadowHover, 'cursor-pointer hover:-translate-y-0.5']
                : 'cursor-default opacity-80',
            )}
          >
            {/* 아이콘 */}
            <div className={clsx(
              'w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br text-white',
              card.gradient,
            )}>
              {card.icon}
            </div>

            {/* 제목 */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-slate-500 font-medium tracking-wide">{card.subtitle}</p>
                <h3 className="text-base font-bold text-slate-100 mt-0.5">{card.title}</h3>
              </div>
              {card.badge ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700/60 flex-shrink-0 mt-0.5">
                  {card.badge}
                </span>
              ) : (
                <ArrowRight
                  size={16}
                  className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-0.5"
                />
              )}
            </div>

            {/* 설명 */}
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{card.description}</p>

            {/* 활성 카드 하이라이트 라인 */}
            {card.ready && (
              <div className={clsx(
                'absolute bottom-0 left-5 right-5 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r',
                card.gradient,
              )} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
