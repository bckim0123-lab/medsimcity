'use client';

import { useState, useEffect } from 'react';

export type MarkerIconMap = Partial<Record<string, string>>;

const MARKER_TYPES = ['hospital', 'clinic', 'pharmacy', 'health_center'] as const;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function removeWhiteBg(url: string): Promise<string> {
  const img = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 흰색/밝은 배경(R>230 && G>230 && B>230) 픽셀의 알파값을 투명으로
  // 엣지 픽셀은 부드럽게 처리
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    if (r > 230 && g > 230 && b > 230) {
      // 완전히 흰색에 가까울수록 더 투명
      const alpha = Math.max(0, 255 - brightness);
      data[i + 3] = Math.round(alpha * 0.3); // 완전 투명에 가깝게
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * 마커 이미지 4종을 로드하여 흰 배경을 제거한 data URL 맵을 반환.
 * SSR 환경에서는 빈 객체를 반환하고 클라이언트에서만 처리됨.
 */
export function useMarkerIcons(): MarkerIconMap {
  const [icons, setIcons] = useState<MarkerIconMap>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const entries = await Promise.all(
        MARKER_TYPES.map(async (type) => {
          try {
            const dataUrl = await removeWhiteBg(`/markers/${type}.png`);
            return [type, dataUrl] as [string, string];
          } catch {
            // 실패 시 원본 URL 사용
            return [type, `/markers/${type}.png`] as [string, string];
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
