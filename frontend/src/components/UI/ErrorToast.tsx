'use client';

import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ErrorToast() {
  const { errorMessage, setErrorMessage } = useStore();

  // 5초 후 자동 소멸
  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(null), 5000);
    return () => clearTimeout(t);
  }, [errorMessage, setErrorMessage]);

  if (!errorMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-start gap-3 max-w-sm bg-red-950/90 border border-red-500/50 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm animate-count">
      <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-red-200 flex-1">{errorMessage}</p>
      <button
        onClick={() => setErrorMessage(null)}
        className="text-red-400 hover:text-red-200 transition flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
