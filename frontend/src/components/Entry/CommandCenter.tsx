'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, MapPin, ChevronRight } from 'lucide-react';
import HeroSearch from './HeroSearch';
import ServiceCards from './ServiceCards';
import AIAgentWidget from './AIAgentWidget';

export default function CommandCenter() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const goToDashboard = () => {
    setLeaving(true);
    setTimeout(() => router.push('/dashboard'), 380);
  };

  return (
    <div
      className="relative min-h-screen bg-[#020817] overflow-hidden transition-all duration-400"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(0.97)' : 'scale(1)',
        transition: 'opacity 0.38s ease-in, transform 0.38s ease-in',
      }}
    >
      {/* 배경 그리드 패턴 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 배경 글로우 */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-cyan-500/25">
            M
          </div>
          <div>
            <span className="font-bold text-slate-100 text-base tracking-tight">MediSim</span>
            <span className="ml-2 text-xs text-slate-600">보건의료 빅데이터 플랫폼</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
            <MapPin size={11} className="text-cyan-500" />
            <span>서울특별시 · 데모</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <Activity size={11} />
            <span>시스템 정상</span>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-16 pb-24 gap-12">
        {/* 히어로 타이틀 */}
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            HIRA 건강보험심사평가원 데이터 연동
          </div>
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
            의료 정책의 미래를
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              데이터로 설계합니다
            </span>
          </h1>
          <p className="mt-4 text-base text-slate-400 leading-relaxed">
            실시간 의료 인프라 공백 분석 · 정책 효과 시뮬레이션 · 수가 최적 경로 탐색
          </p>
        </div>

        {/* 검색 */}
        <div className="w-full max-w-2xl">
          <HeroSearch />
        </div>

        {/* 서비스 카드 */}
        <ServiceCards onLaunchSimCity={goToDashboard} />

        {/* 하단 퀵 링크 */}
        <button
          onClick={goToDashboard}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors group"
        >
          바로 지도 대시보드로 이동
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </main>

      {/* AI 에이전트 */}
      <AIAgentWidget />
    </div>
  );
}
