/** @type {import('next').NextConfig} */
const nextConfig = {
  // maplibre-gl / deck.gl 워커 파일 트랜스파일 이슈 방지
  transpilePackages: ['maplibre-gl'],
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
