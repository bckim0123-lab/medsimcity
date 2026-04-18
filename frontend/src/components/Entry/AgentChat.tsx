'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface Message {
  role: 'agent' | 'user';
  text: string;
  json?: string;
}

// Mock response logic based on system prompt
function getReply(text: string): { text: string; json?: string } {
  const t = text.toLowerCase();

  if (t.includes('\uC18C\uC544\uACFC') || t.includes('\uC57C\uAC04') || t.includes('\uCD94\uAC00') || t.includes('\uC2DC\uBBAC')) {
    return {
      text: '\uD655\uC778\uD558\uACA0\uC2B5\uB2C8\uB2E4. \uC815\uCC45 \uC2DC\uBBAC\uB808\uC774\uC158 \uC2DC\uC791 \uC804 \uD30C\uB77C\uBBF8\uD130\uB97C \uBD84\uC11D\uD569\uB2C8\uB2E4.\n\uD574\uB2F9 \uC9C0\uC5ED\uC758 \uC778\uAD6C \uBD84\uD3EC, \uD604\uC7AC \uC758\uB8CC \uC778\uD504\uB77C, \uC751\uAE09 \uC218\uC694\uB97C \uB85C\uB4DC\uD558\uACE0 \uC2DC\uBBAC\uB808\uC774\uC158\uC744 \uC218\uD589\uD569\uB2C8\uB2E4.',
      json: JSON.stringify({
        service: 'POLICY_SIMCITY',
        action: 'RUN_SIMULATION',
        params: {
          region: t.includes('\uB9C8\uD3EC') ? '\uB9C8\uD3EC\uAD6C' : '\uC11C\uC6B8',
          policy_change: 'ADD_NIGHT_PEDIATRICS',
          value: 2,
          time_horizon: '5_YEARS',
        },
      }, null, 2),
    };
  }

  if (t.includes('\uACF5\uBC31') || t.includes('\uBD84\uC11D') || t.includes('\uC785\uC9C0')) {
    return {
      text: '\uBD84\uC11D\uC744 \uC2DC\uC791\uD569\uB2C8\uB2E4. \uD574\uB2F9 \uC9C0\uC5ED\uC758 \uC758\uB8CC\uACF5\uBC31 \uC9C0\uC218\uB97C \uC2E4\uC2DC\uAC04 \uC5F0\uC0B0\uD558\uACE0, \uB9DE\uCDA4\uD615 \uC9C0\uB3C4 \uC2DC\uAC01\uD654 \uACB0\uACFC\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4.\n\uC785\uC9C0\uBD84\uC11D \uBA54\uB274\uC5D0\uC11C \uC870\uAC74\uC744 \uC120\uD0DD\uD558\uC2DC\uBA74 \uCCB4\uACC4\uC801 \uBD84\uC11D\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4.',
      json: JSON.stringify({
        service: 'GAP_ANALYSIS',
        action: 'ANALYZE_REGION',
        params: {
          region: '\uC11C\uC6B8\uC2DC',
          facility_type: 'all',
          disease_type: 'all',
        },
      }, null, 2),
    };
  }

  if (t.includes('\uC218\uAC00') || t.includes('\uC9C8\uD658') || t.includes('\uC9C4\uB8CC')) {
    return {
      text: '\uC218\uAC00 \uBC0F \uC9C8\uD658\uBCC4 \uBD84\uC11D \uBAA8\uB4C8\uC744 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4.\n\uD604\uC7AC HIRA \uC218\uAC00 \uB370\uC774\uD130 \uAE30\uBC18\uC73C\uB85C \uC9C8\uD658\uBCC4 \uCD5C\uC801 \uC9C4\uB8CC \uACBD\uB85C \uBD84\uC11D \uAE30\uB2A5\uC744 \uD655\uC7A5\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.',
      json: JSON.stringify({
        service: 'COST_PROTOCOL',
        action: 'ANALYZE_DISEASE',
        params: {
          disease: t.includes('\uB2F9\uB1CC') ? 'diabetes' : t.includes('\uACE0\uD601\uC555') ? 'hypertension' : 'general',
          analysis_type: 'optimal_pathway',
        },
      }, null, 2),
    };
  }

  if (t.includes('hira') || t.includes('\uC790\uC728') || t.includes('\ucf54\ub529') || t.includes('\uB370\uC774\uD130')) {
    return {
      text: '\uC11C\uBE44\uC2A4 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4. Auto-HIRA \uBAA8\uB4C8\uC774 \uB300\uAE30\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.\n\uC785\uC9C0 \uBD84\uC11D \uAE30\uB2A5\uC740 \uC9C0\uAE08 \uBC14\uB85C \uC0AC\uC6A9 \uAC00\uB2A5\uD569\uB2C8\uB2E4.',
      json: JSON.stringify({
        service: 'AUTO_HIRA',
        action: 'GENERATE_CODE',
        params: {
          query: text,
          output_format: 'python_pandas',
        },
      }, null, 2),
    };
  }

  return {
    text: '\uC785\uB825\uD558\uC2E0 \uB0B4\uC6A9\uC744 \uBD84\uC11D\uD569\uB2C8\uB2E4. \uD558\uC704 \uC5D0\uC774\uC804\uD2B8\uB97C \uD638\uCD9C\uD558\uC5EC \uB370\uC774\uD130\uB97C \uC5F0\uC0B0\uD558\uACA0\uC2B5\uB2C8\uB2E4.\n\uC544\uB798 \uC608\uC2DC \uC9C8\uBB38\uC744 \uCC38\uACE0\uD558\uC2DC\uAC70\uB098 \uB354 \uC790\uC138\uD55C \uB0B4\uC6A9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
  };
}

const INIT_MSG: Message = {
  role: 'agent',
  text: '\uC548\uB155\uD558\uC138\uC694. MediSim \uC624\uCF00\uC2A4\uD2B8\uB808\uC774\uC158 \uC5D0\uC774\uC804\uD2B8\uC785\uB2C8\uB2E4.\n\n\uC800\uB294 HIRA, NHIS, KOSIS \uB370\uC774\uD130\uB97C \uC5F0\uB3D9\uD558\uC5EC \uC758\uB8CC \uACF5\uBC31 \uBD84\uC11D, \uC815\uCC45 \uC2DC\uBBAC\uB808\uC774\uC158, \uC218\uAC00 \uBD84\uC11D\uC744 \uC218\uD589\uD558\uB294 \uC5D0\uC774\uC804\uD2B8\uC785\uB2C8\uB2E4.\n\n\uC790\uC5F0\uC5B4\uB85C \uC9C8\uBB38\uD558\uC138\uC694.',
};

const EXAMPLES = [
  '\uB9C8\uD3EC\uAD6C\uC5D0 \uC57C\uAC04 \uC18C\uC544\uACFC 2\uAC1C \uCD94\uAC00\uD558\uBA74 5\uB144 \uB4A4 \uC751\uAE09\uC2E4 \uACFC\uBC00\uB3C4\uAC00 \uC5B4\uB5BB\uAC8C \uB3FC?',
  '\uC11C\uC6B8\uC2DC \uACE0\uD601\uC555 \uC720\uBCD1\uB960 \uB192\uC740 \uC9C0\uC5ED\uC758 \uC758\uB8CC\uACF5\uBC31 \uBD84\uC11D',
  '\uB2F9\uB1CC \uC804\uBB38 \uD074\uB9AC\uB2C9 \uC811\uADFC\uC131 \uBD84\uC11D',
];

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([INIT_MSG]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || typing) return;
    setMessages((prev) => [...prev, { role: 'user', text: t }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = getReply(t);
      setMessages((prev) => [...prev, { role: 'agent', ...reply }]);
      setTyping(false);
    }, 900 + Math.random() * 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">MediSim {'\uC624\uCF00\uC2A4\uD2B8\uB808\uC774\uC158 \uC5D0\uC774\uC804\uD2B8'}</p>
            <p className="text-[11px] text-emerald-400">{'\u25CF \uC628\uB77C\uC778'} &middot; HIRA · NHIS · KOSIS</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
          <Sparkles size={10} className="text-violet-400" />
          <span>AI Orchestration Agent</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'agent' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                  <Bot size={11} className="text-white" />
                </div>
              )}
              <div className="max-w-[80%] space-y-2">
                <div className={clsx(
                  'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
                  msg.role === 'agent'
                    ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                    : 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-tr-sm',
                )}>
                  {msg.text}
                </div>
                {msg.json && (
                  <div className="bg-slate-950 border border-slate-700/60 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 font-mono mb-1.5">// Agent Action JSON</p>
                    <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {msg.json}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <Bot size={11} className="text-white" />
              </div>
              <div className="bg-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Example chips */}
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => send(ex)}
              disabled={typing}
              className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/40 hover:text-cyan-400 px-2.5 py-1 rounded-full transition-all disabled:opacity-40"
            >
              <ChevronRight size={9} />
              {ex.length > 28 ? ex.slice(0, 28) + '...' : ex}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl border border-slate-700/60 focus-within:border-cyan-500/50 transition-colors px-4 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={'\uC790\uC5F0\uC5B4\uB85C \uC9C8\uBB38\uD558\uC138\uC694... \uC608) \uB9C8\uD3EC\uAD6C \uC18C\uC544\uACFC \uACF5\uBC31 \uBD84\uC11D'}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-600 text-white flex items-center justify-center transition-all"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-[10px] text-slate-700 mt-2 text-center">
            HIRA · NHIS · KOSIS {'\uB370\uC774\uD130 \uAE30\uBC18 \uC2DC\uBBAC\uB808\uC774\uC158 \uD5A5\uBC84 \uC5D0\uC774\uC804\uD2B8 \u2014 \uBB34\uB8CC \uB370\uBAA8 \uBC84\uC804'}
          </p>
        </div>
      </div>
    </div>
  );
}
