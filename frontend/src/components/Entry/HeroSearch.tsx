'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronRight, Zap } from 'lucide-react';
import { searchHIRA, POPULAR_QUERIES } from '@/data/mockHIRA';
import type { HiraResult } from '@/data/mockHIRA';
import { clsx } from 'clsx';

const CATEGORY_COLORS: Record<string, string> = {
  검사: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  영상: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  처치: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  수술: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  상담: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
};

const TYPE_COLORS: Record<string, string> = {
  '급여': 'text-emerald-400',
  '비급여(평균)': 'text-amber-400',
  '선택진료': 'text-orange-400',
};

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<HiraResult | null>(null);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query) {
      setVisible(false);
      return;
    }
    const id = setTimeout(() => {
      const found = searchHIRA(query);
      setResult(found);
      setVisible(true);
    }, 220);
    return () => clearTimeout(id);
  }, [query]);

  const handlePopular = (kw: string) => {
    setQuery(kw);
    inputRef.current?.focus();
  };

  const clear = () => {
    setQuery('');
    setVisible(false);
    setResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 검색 입력창 */}
      <div className="relative group">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center bg-slate-900 border border-slate-700 group-focus-within:border-cyan-500/60 rounded-2xl transition-all duration-300 shadow-2xl">
          <Search size={18} className="ml-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="질환명이나 상병코드를 입력하세요 (예: 치매, 고혈압, I10)"
            className="flex-1 bg-transparent px-4 py-4 text-base text-slate-100 placeholder-slate-500 outline-none"
          />
          {query && (
            <button onClick={clear} className="mr-4 p-1 text-slate-500 hover:text-slate-300 transition-colors">
              <X size={16} />
            </button>
          )}
          <div className="mr-3 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 text-sm font-medium text-white">
            <Zap size={14} />
            <span>분석</span>
          </div>
        </div>
      </div>

      {/* 인기 검색어 */}
      {!query && (
        <div className="flex items-center gap-2 mt-3 px-1">
          <span className="text-xs text-slate-600">인기:</span>
          {POPULAR_QUERIES.map((kw) => (
            <button
              key={kw}
              onClick={() => handlePopular(kw)}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/60 transition-all"
            >
              {kw}
            </button>
          ))}
        </div>
      )}

      {/* 결과 카드 */}
      <div
        className={clsx(
          'mt-3 overflow-hidden transition-all duration-400 ease-out',
          visible && result ? 'max-h-[480px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2',
        )}
        style={{ transitionProperty: 'max-height, opacity, transform' }}
      >
        {result && (
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 backdrop-blur-sm shadow-2xl">
            {/* 질환 헤더 */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{result.disease}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                    {result.icd}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">{result.description}</p>
              </div>
              <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg">
                HIRA Mock
              </span>
            </div>

            {/* 수가 테이블 */}
            <div className="space-y-2">
              {result.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors group/item"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-md border flex-shrink-0', CATEGORY_COLORS[item.category])}>
                      {item.category}
                    </span>
                    <span className="text-sm text-slate-200 truncate">{item.name}</span>
                    <span className="text-xs text-slate-600 font-mono flex-shrink-0 hidden sm:block">{item.code}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className={clsx('text-xs flex-shrink-0', TYPE_COLORS[item.type])}>
                      {item.type}
                    </span>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {item.price === 0 ? '무료' : `${item.price.toLocaleString()}원`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
              <span className="text-xs text-slate-600">※ 실제 수가는 기관별·요양급여기준 상이</span>
              <button className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                상세 프로토콜 보기 <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        {visible && !result && query && (
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 text-center">
            <p className="text-slate-500 text-sm">
              <span className="text-slate-300">&apos;{query}&apos;</span>에 대한 수가 정보가 없습니다.
            </p>
            <p className="text-xs text-slate-600 mt-1">치매, 고혈압, 당뇨, 뇌졸중, 암, 독감을 검색해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
