'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, MapPin } from 'lucide-react';
import ServiceCards from './ServiceCards';
import AgentChat from './AgentChat';

export default function CommandCenter() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const goToDashboard = () => {
    setLeaving(true);
    setTimeout(() => router.push('/dashboard'), 380);
  };

  return (
    <div
      className="relative min-h-screen bg-[#020817] overflow-hidden"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(0.97)' : 'scale(1)',
        transition: 'opacity 0.38s ease-in, transform 0.38s ease-in',
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
        <ServiceCards onLaunchSimCity={goToDashboard} />

        {/* AI Agent chat */}
        <AgentChat />
      </main>
    </div>
  );
}
