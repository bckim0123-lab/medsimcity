import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar/Sidebar';
import KPIPanel from '@/components/Dashboard/KPIPanel';
import Toolbar from '@/components/UI/Toolbar';
import ErrorToast from '@/components/UI/ErrorToast';

// MapCanvas는 SSR 비활성화 (MapLibre GL은 브라우저 전용)
const MapCanvas = dynamic(() => import('@/components/Map/MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">지도 초기화 중...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
      {/* 상단 툴바 */}
      <Toolbar />

      {/* 본문: 사이드바 + 지도 + KPI 패널 */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* 지도 영역 */}
        <main className="relative flex-1 overflow-hidden">
          <MapCanvas />
        </main>

        <KPIPanel />
      </div>

      {/* 전역 에러 토스트 */}
      <ErrorToast />
    </div>
  );
}
