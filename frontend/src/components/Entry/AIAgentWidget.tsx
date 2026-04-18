'use client';

import { useState } from 'react';
import { X, Send, Bot, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface Message {
  role: 'agent' | 'user';
  text: string;
}

const MOCK_REPLIES: Record<string, string> = {
  '\uB9C8\uD3EC\uAD6C': '\uB9C8\uD3EC\uAD6C\uC758 \uC751\uAE09\uC758\uB8CC \uCDE8\uC57D\uC9C0\uB97C \uBD84\uC11D\uD569\uB2C8\uB2E4. \uD604\uC7AC \uBC18\uACBD 2km \uC774\uB0B4 \uC751\uAE09\uC2E4\uC774 \uC5C6\uB294 \uACA9\uC790\uAC00 \uC804\uCCB4\uC758 12%\uB85C \uB098\uD0C0\uB0AC\uC2B5\uB2C8\uB2E4.',
  '\uC11C\uC6B8': '\uC11C\uC6B8\uC2DC \uC804\uCCB4 \uC758\uB8CC \uACF5\uBC31 \uD604\uD669\uC744 \uB85C\uB4DC\uD569\uB2C8\uB2E4. \uC790\uCE58\uAD6C\uBCC4 \uC758\uC6D0 \uC218 \uD3B8\uCC28\uAC00 \uCD5C\uB300 4.3\uBC30\uB85C \uD655\uC778\uB429\uB2C8\uB2E4.',
  '\uCE58\uB9E4': '\uCE58\uB9E4 \uAD00\uB828 \uC758\uB8CC\uAE30\uAD00 \uBD84\uD3EC\uB97C \uBD84\uC11D\uD569\uB2C8\uB2E4. \uCE58\uB9E4\uC548\uC2EC\uC13C\uD130 25\uAC1C\uC18C\uC640 \uC804\uBB38 \uCE58\uB8CC \uAE30\uAD00\uC758 \uC811\uADFC\uC131\uC744 \uC9C0\uB3C4\uC5D0 \uD45C\uC2DC\uD558\uACA0\uC2B5\uB2C8\uB2E4.',
  '\uACE0\uD601\uC555': '\uACE0\uD601\uC555 \uC720\uBCD1\uB960\uC774 \uB192\uC740 65\uC138 \uC774\uC0C1 \uC778\uAD6C \uBC00\uC9D1 \uC9C0\uC5ED\uC744 \uD544\uD130\uB9C1\uD569\uB2C8\uB2E4.',
  '\uB2F9\uB1CC': '\uB2F9\uB1CC \uC804\uBB38 \uD074\uB9AC\uB2C9 \uC811\uADFC\uC131 \uBD84\uC11D\uC744 \uC2DC\uC791\uD569\uB2C8\uB2E4. \uB3C4\uBCF4 20\uBD84 \uC774\uB0B4 \uB2F9\uB1CC \uC804\uBB38\uC758 \uBD80\uC7AC \uC9C0\uC5ED\uC774 \uC11C\uC6B8 \uAE30\uC900 23%\uC785\uB2C8\uB2E4.',
};

const INITIAL_MESSAGE: Message = {
  role: 'agent',
  text: '\uC548\uB155\uD558\uC138\uC694. MediSim AI \uB3C4\uC6B0\uBBF8\uC785\uB2C8\uB2E4.\n\n\uBB34\uC5C7\uC744 \uBD84\uC11D\uD574 \uB4DC\uB9B4\uAE4C\uC694?\n\uC608: \"\uB9C8\uD3EC\uAD6C \uC751\uAE09\uC758\uB8CC \uCDE8\uC57D\uC9C0 \uBD84\uC11D\"',
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
        : `"${text}"\uC5D0 \uB300\uD55C \uBD84\uC11D \uAE30\uB2A5\uC740 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4. \uB9C8\uD3EC\uAD6C, \uC11C\uC6B8, \uCE58\uB9E4, \uACE0\uD601\uC555 \uB4F1\uC758 \uD0A4\uC6CC\uB4DC\uB97C \uC0AC\uC6A9\uD574\uBCF4\uC138\uC694.`;
      setMessages((prev) => [...prev, { role: 'agent', text: reply }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
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
              <p className="text-xs font-semibold text-slate-100">AI \uB3C4\uC6B0\uBBF8</p>
              <p className="text-[10px] text-emerald-400">\u25CF \uC628\uB77C\uC778</p>
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
              placeholder={'\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD558\uC138\uC694\u2026'}
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

      {/* 토글 버튼 + 라벨 */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => setOpen((v) => !v)}
          className={clsx(
            'w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300',
            'bg-gradient-to-br from-cyan-500 to-violet-600 text-white',
            'hover:scale-110 hover:shadow-cyan-500/40',
            open && 'rotate-180',
          )}
          aria-label="AI \uB3C4\uC6B0\uBBF8 \uC5F4\uAE30"
        >
          {open ? <X size={20} /> : <Bot size={20} />}
        </button>
        {!open && (
          <span className="text-[10px] font-medium text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700/50 whitespace-nowrap">
            AI \uB3C4\uC6B0\uBBF8
          </span>
        )}
      </div>
    </div>
  );
}
