/** @type {import('next').NextConfig} */
const nextConfig = {
  // maplibre-gl / deck.gl 워커 파일 트랜스파일 이슈 방지
  transpilePackages: ['maplibre-gl'],

  // Render 백엔드 CORS 우회: Vercel이 서버사이드 프록시 역할
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? 'http://localhost:8000';
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${backend}/:path*`,
      },
    ];
  },

  webpack: (config) => {
    // deck.gl이 사용하는 GLSL 파일 처리
    config.module.rules.push({
      test: /\.glsl$/,
      use: 'raw-loader',
    });
    return config;
  },
};

module.exports = nextConfig;
