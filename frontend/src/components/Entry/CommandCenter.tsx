'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, MapPin } from 'lucide-react';
import ServiceCards from './ServiceCards';
import AgentChat from './AgentChat';
import { useStore } from '@/store/useStore';

const SEOUL_GU_COORDS: Record<string, [number, number]> = {
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

export default function CommandCenter() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [agentTrigger, setAgentTrigger] = useState<{ query: string; ts: number } | null>(null);
  const agentSectionRef = useRef<HTMLDivElement>(null);

  const { setAnalysisMode, setViewState, setSelectedRegionName, setShowGap } = useStore();

  const goToDashboard = useCallback(() => {
    setLeaving(true);
    setTimeout(() => router.push('/dashboard'), 380);
  }, [router]);

  const launchToMap = useCallback((region: string) => {
    const [lon, lat] = SEOUL_GU_COORDS[region] ?? [126.978, 37.566];
    const zoom = region === '\uC804\uCCB4 \uC11C\uC6B8' ? 11 : 13;
    const currentVS = useStore.getState().viewState;
    setViewState({ ...currentVS, longitude: lon, latitude: lat, zoom, pitch: 0, bearing: 0 });
    setSelectedRegionName(region === '\uC804\uCCB4 \uC11C\uC6B8' ? '\uC11C\uC6B8\uD2B9\uBCC4\uC2DC' : region);
    setAnalysisMode('gap');
    setShowGap(true);
    setLeaving(true);
    setTimeout(() => router.push('/dashboard'), 380);
  }, [router, setAnalysisMode, setViewState, setSelectedRegionName, setShowGap]);

  const sendToAgent = useCallback((query: string) => {
    agentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      setAgentTrigger({ query, ts: Date.now() });
    }, 350);
  }, []);

  return (
    <div
      className="relative min-h-screen bg-[#020817] overflow-hidden"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(0.97)' : 'scale(1)',
        transition: 'opacity 0.38s ease-in, transform 0.38s ease-in',
        pointerEvents: leaving ? 'none' : 'auto',
      }}
    >
      {/* Background grid */}
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
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-cyan-500/25">
            M
          </div>
          <div>
            <span className="font-bold text-slate-100 text-base tracking-tight">MediSim</span>
            <span className="ml-2 text-xs text-slate-600">{'\uBCF4\uAC74\uC758\uB8CC \uBE45\uB370\uC774\uD130 \uD50C\uB7AB\uD3FC'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
            <MapPin size={11} className="text-cyan-500" />
            <span>{'\uC11C\uC6B8\uD2B9\uBCC4\uC2DC \u00B7 \uB370\uBAA8'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <Activity size={11} />
            <span>{'\uC2DC\uC2A4\uD15C \uC815\uC0C1'}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-12 pb-16 gap-10">
        {/* Hero title */}
        <div className="text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            {'\uAC74\uAC15\uBCF4\uD5EC\uC2EC\uC0AC\uD3C9\uAC00\uC6D0 \uB370\uC774\uD130 \uC5F0\uB3D9'}
          </div>
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
            {'\uC758\uB8CC \uC815\uCC45\uC758 \uBBF8\uB798\uB97C'}
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              {'\uB370\uC774\uD130\uB85C \uC124\uACC4\uD569\uB2C8\uB2E4'}
            </span>
          </h1>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            {'\uC2E4\uC2DC\uAC04 \uC758\uB8CC \uC778\uD504\uB77C \uACF5\uBC31 \uBD84\uC11D \u00B7 \uC815\uCC45 \uD6A8\uACFC \uC2DC\uBBAC\uB808\uC774\uC158 \u00B7 \uC218\uAC00 \uCD5C\uC801 \uACBD\uB85C \uD0D0\uC0C9'}
          </p>
        </div>

        {/* Service cards */}
        <ServiceCards
          onLaunchSimCity={goToDashboard}
          onSendToAgent={sendToAgent}
          onLaunchMap={launchToMap}
        />

        {/* AI Agent chat — scroll target */}
        <div ref={agentSectionRef} className="w-full flex justify-center">
          <AgentChat triggerQuery={agentTrigger} />
        </div>
      </main>
    </div>
  );
}
