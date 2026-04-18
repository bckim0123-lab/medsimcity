import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediSim — 의료 정책 시뮬레이터',
  description: 'HIRA 데이터 기반 2D/3D 입지 적합성 및 실효성 분석 엔진',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
