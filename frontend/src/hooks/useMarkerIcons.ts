'use client';

import { useState, useEffect } from 'react';

export type MarkerIconMap = Partial<Record<string, string>>;

const MARKER_TYPES = ['hospital', 'clinic', 'pharmacy', 'health_center'] as const;

// SVG → Canvas PNG data URL 변환 (Deck.gl WebGL 텍스처 호환)
function rasterizeSvg(url: string, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('no ctx')); return; }
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    // SVG 로드 시 timestamp로 캐시 무효화 방지
    img.src = url;
  });
}

/**
 * SVG 마커 4종을 PNG data URL로 래스터라이즈하여 반환.
 * - SVG는 투명 배경이므로 별도 배경 제거 불필요
 * - Deck.gl IconLayer의 iconAtlas는 WebGL 텍스처 기반으로 PNG data URL이 가장 안정적
 */
export function useMarkerIcons(): MarkerIconMap {
  const [icons, setIcons] = useState<MarkerIconMap>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const entries = await Promise.all(
        MARKER_TYPES.map(async (type) => {
          try {
            const dataUrl = await rasterizeSvg(`/markers/${type}.svg`, 256);
            return [type, dataUrl] as [string, string];
          } catch {
            // 래스터라이즈 실패 시 SVG URL 직접 사용
            return [type, `/markers/${type}.svg`] as [string, string];
          }
        }),
      );

      if (!cancelled) {
        setIcons(Object.fromEntries(entries));
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return icons;
}
