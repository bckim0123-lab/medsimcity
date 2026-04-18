'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Bot, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface Message {
  role: 'agent' | 'user';
  text: string;
}

const MOCK_REPLIES: Record<string, string> = {
  마포구: '마포구의 응급의료 취약지를 분석합니다. 현재 반경 2km 이내 응급실이 없는 격자가 전체의 12%로 나타났습니다. 정책 시뮬레이션 탭에서 상세 분석을 확인해보세요.',
  서울: '서울시 전체 의료 공백 현황을 로드합니다. 자치구별 의원 수 편차가 최대 4.3배로 확인됩니다.',
  치매: '치매 관련 의료기관 분포를 분석합니다. 치매안심센터 25개소와 전문 치료 기관의 접근성을 지도에 표시하겠습니다.',
  고혈압: '고혈압 유병률이 높은 65세 이상 인구 밀집 지역을 필터링합니다. 만성질환 가중 분석 모드로 전환을 추천합니다.',
  당뇨: '당뇨 전문 클리닉 접근성 분석을 시작합니다. 도보 20분 이내 당뇨 전문의 부재 지역이 서울 기준 23%입니다.',
};

const INITIAL_MESSAGE: Message = {
  role: 'agent',
  text: '안녕하세요. MediSim Agent입니다.\n\n무엇을 분석해 드릴까요?\n예: "마포구 응급의료 취약지 분석"',
};

export default function AIAgentWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const key = Object.keys(MOCK_REPLIES).find((k) => text.includes(k));
      const reply = key
        ? MOCK_REPLIES[key]
        : `"${text}"에 대한 분석 기능은 준비 중입니다. 마포구, 서울, 치매, 고혈압 등의 키워드를 사용해보세요.`;
      setMessages((prev) => [...prev, { role: 'agent', text: reply }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* 대화창 */}
      <div className={clsx(
        'w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right',
        open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none',
      )}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-100">MediSim Agent</p>
              <p className="text-[10px] text-emerald-400">● 온라인</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
            <ChevronDown size={16} />
          </button>
        </div>

        {/* 메시지 목록 */}
        <div className="h-52 overflow-y-auto p-3 space-y-2.5 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={clsx(
                'max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-line',
                msg.role === 'agent'
                  ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                  : 'bg-cyan-600 text-white rounded-tr-sm',
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-slate-800 px-3 py-2 rounded-xl rounded-tl-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 입력창 */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl border border-slate-700/60 px-3 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="p-1 text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 토글 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300',
          'bg-gradient-to-br from-cyan-500 to-violet-600 text-white',
          'hover:scale-110 hover:shadow-cyan-500/40',
          open && 'rotate-180',
        )}
        aria-label="AI 에이전트 열기"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  );
}
