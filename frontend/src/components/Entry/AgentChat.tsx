'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Sparkles, ChevronRight, AlertCircle, Zap } from 'lucide-react';
import { clsx } from 'clsx';

interface Message {
  role: 'agent' | 'user';
  text: string;
  json?: string;
  streaming?: boolean;
}

// Fallback mock logic when API is not configured
function getMockReply(text: string): { text: string; json?: string } {
  const t = text.toLowerCase();

  if (t.includes('\uC18C\uC544\uACFC') || t.includes('\uC57C\uAC04') || t.includes('\uCD94\uAC00') || t.includes('\uC2DC\uBBA4\uB808')) {
    return {
      text: '\uD655\uC778\uD558\uACA0\uC2B5\uB2C8\uB2E4. \uC815\uCC45 \uC2DC\uBBA4\uB808\uC774\uC158 \uC2DC\uC791 \uC804 \uD30C\uB77C\uBBF8\uD130\uB97C \uBD84\uC11D\uD569\uB2C8\uB2E4.\n\uD574\uB2F9 \uC9C0\uC5ED\uC758 \uC778\uAD6C \uBD84\uD3EC, \uD604\uC7AC \uC758\uB8CC \uC778\uD504\uB77C, \uC751\uAE09 \uC218\uC694\uB97C \uB85C\uB4DC\uD558\uACE0 \uC2DC\uBBA4\uB808\uC774\uC158\uC744 \uC218\uD589\uD569\uB2C8\uB2E4.',
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
      text: '\uBD84\uC11D\uC744 \uC2DC\uC791\uD569\uB2C8\uB2E4. \uD574\uB2F9 \uC9C0\uC5ED\uC758 \uC758\uB8CC\uACF5\uBC31 \uC9C0\uC218\uB97C \uC2E4\uC2DC\uAC04 \uC5F0\uC0B0\uD558\uACE0 \uB9DE\uCDA4\uD615 \uC9C0\uB3C4 \uC2DC\uAC01\uD654 \uACB0\uACFC\uB97C \uC81C\uACF5\uD569\uB2C8\uB2E4.',
      json: JSON.stringify({
        service: 'GAP_ANALYSIS',
        action: 'ANALYZE_REGION',
        params: { region: '\uC11C\uC6B8\uC2DC', facility_type: 'all' },
      }, null, 2),
    };
  }

  if (t.includes('\uC218\uAC00') || t.includes('\uC9C8\uD658') || t.includes('\uC9C4\uB8CC')) {
    return {
      text: '\uC218\uAC00 \uBC0F \uC9C8\uD658\uBCC4 \uBD84\uC11D \uBAA8\uB4C8\uC744 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4.\nHIRA \uC218\uAC00 \uB370\uC774\uD130 \uAE30\uBC18\uC73C\uB85C \uC9C8\uD658\uBCC4 \uCD5C\uC801 \uC9C4\uB8CC \uACBD\uB85C \uBD84\uC11D \uAE30\uB2A5\uC744 \uD655\uC7A5\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.',
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
      text: 'Auto-HIRA \uBAA8\uB4C8\uC774 \uB300\uAE30\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.\n\uC790\uC5F0\uC5B4\uB85C HIRA \uC218\uAC00 \uBC0F \uCCAD\uAD6C \uB370\uC774\uD130\uB97C \uC870\uD68C\uD558\uACE0 Python \uCF54\uB4DC\uB97C \uC790\uB3D9 \uC0DD\uC131\uD569\uB2C8\uB2E4.',
      json: JSON.stringify({
        service: 'AUTO_HIRA',
        action: 'GENERATE_CODE',
        params: { query: text, output_format: 'python_pandas' },
      }, null, 2),
    };
  }

  return {
    text: '\uC785\uB825\uD558\uC2E0 \uB0B4\uC6A9\uC744 \uBD84\uC11D\uD569\uB2C8\uB2E4. \uD558\uC704 \uC5D0\uC774\uC804\uD2B8\uB97C \uD638\uCD9C\uD558\uC5EC \uB370\uC774\uD130\uB97C \uC5F0\uC0B0\uD558\uACA0\uC2B5\uB2C8\uB2E4.\n\uC544\uB798 \uC608\uC2DC \uC9C8\uBB38\uC744 \uCC38\uACE0\uD558\uC2DC\uAC70\uB098 \uB354 \uC790\uC138\uD55C \uB0B4\uC6A9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
  };
}

const INIT_MSG: Message = {
  role: 'agent',
  text: '\uC548\uB155\uD558\uC138\uC694. MediSim \uC624\uCF00\uC2A4\uD2B8\uB808\uC774\uC158 \uC5D0\uC774\uC804\uD2B8\uC785\uB2C8\uB2E4.\n\nHIRA, NHIS, KOSIS \uB370\uC774\uD130\uB97C \uC5F0\uB3D9\uD558\uC5EC \uC758\uB8CC \uACF5\uBC31 \uBD84\uC11D, \uC815\uCC45 \uC2DC\uBBA4\uB808\uC774\uC158, \uC218\uAC00 \uBD84\uC11D\uC744 \uC218\uD589\uD558\uB294 \uC5D0\uC774\uC804\uD2B8\uC785\uB2C8\uB2E4.\n\uC790\uC5F0\uC5B4\uB85C \uC9C8\uBB38\uD558\uC138\uC694.',
};

const EXAMPLES = [
  '\uB9C8\uD3EC\uAD6C\uC5D0 \uC57C\uAC04 \uC18C\uC544\uACFC 2\uAC1C \uCD94\uAC00\uD558\uBA74 5\uB144 \uB4A4 \uC751\uAE09\uC2E4 \uACFC\uBC00\uB3C4\uAC00 \uC5B4\uB5BB\uAC8C \uB3FC?',
  '\uC11C\uC6B8\uC2DC \uACE0\uD601\uC555 \uC720\uBCD1\uB960 \uB192\uC740 \uC9C0\uC5ED \uC758\uB8CC\uACF5\uBC31 \uBD84\uC11D',
  '\uB2F9\uB1CC \uC804\uBB38 \uD074\uB9AC\uB2C9 \uC811\uADFC\uC131 \uBD84\uC11D',
];

type ApiStatus = 'unknown' | 'live' | 'mock';

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([INIT_MSG]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>('unknown');
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const send = useCallback(async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || busy) return;

    const userMsg: Message = { role: 'user', text: t };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setBusy(true);

    // Pass only text (not json display) as history
    const history = messages.map(({ role, text: msgText }) => ({ role, text: msgText }));

    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: t, history }),
        signal: controller.signal,
      });

      if (res.status === 503) {
        // No API key — fall back to mock
        setApiStatus('mock');
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 300));
        const reply = getMockReply(t);
        setMessages((prev) => [...prev, { role: 'agent', ...reply }]);
        setBusy(false);
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setApiStatus('live');

      // Stream the response
      const agentIdx = messages.length + 1; // after the user message we just added
      setMessages((prev) => [...prev, { role: 'agent', text: '', streaming: true }]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const snapshot = accumulated;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: 'agent', text: snapshot, streaming: true };
            return next;
          });
        }
      }

      // Extract JSON blocks from the final text if present
      const jsonMatch = accumulated.match(/```json\s*([\s\S]+?)```/);
      const jsonBlock = jsonMatch
        ? (() => {
            try {
              return JSON.stringify(JSON.parse(jsonMatch[1]), null, 2);
            } catch {
              return jsonMatch[1].trim();
            }
          })()
        : undefined;

      const cleanText = jsonBlock
        ? accumulated.replace(/```json[\s\S]+?```/, '').trim()
        : accumulated;

      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'agent',
          text: cleanText,
          json: jsonBlock,
          streaming: false,
        };
        return next;
      });

      void agentIdx; // suppress lint warning
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setApiStatus('mock');
      const reply = getMockReply(t);
      setMessages((prev) => {
        // If a streaming placeholder was added, replace it; otherwise append
        const last = prev[prev.length - 1];
        if (last?.streaming) {
          return [...prev.slice(0, -1), { role: 'agent', ...reply }];
        }
        return [...prev, { role: 'agent', ...reply }];
      });
    } finally {
      setBusy(false);
    }
  }, [input, busy, messages]);

  const statusColor = apiStatus === 'live' ? 'text-emerald-400' : apiStatus === 'mock' ? 'text-amber-400' : 'text-slate-500';
  const statusLabel = apiStatus === 'live' ? '\uC628\uB77C\uC778 (GPT-4o)' : apiStatus === 'mock' ? '\uB370\uBAA8 \uBAA8\uB4DC' : '\uC5F0\uB839 \uC911...';

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">
              MediSim {'\uC624\uCF00\uC2A4\uD2B8\uB808\uC774\uC158 \uC5D0\uC774\uC804\uD2B8'}
            </p>
            <p className={clsx('text-[11px]', statusColor)}>
              {'\u25CF'} {statusLabel} &middot; HIRA · NHIS · KOSIS
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
          {apiStatus === 'live' ? (
            <Zap size={10} className="text-cyan-400" />
          ) : (
            <Sparkles size={10} className="text-violet-400" />
          )}
          <span>AI Orchestration Agent</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="h-72 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'agent' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-1 mr-2">
                  <Bot size={11} className="text-white" />
                </div>
              )}
              <div className="max-w-[82%] space-y-2">
                <div className={clsx(
                  'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
                  msg.role === 'agent'
                    ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                    : 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-tr-sm',
                )}>
                  {msg.text}
                  {msg.streaming && (
                    <span className="inline-block w-1 h-3.5 ml-0.5 bg-cyan-400 animate-pulse rounded-sm align-middle" />
                  )}
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
          {busy && !messages[messages.length - 1]?.streaming && (
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <Bot size={11} className="text-white" />
              </div>
              <div className="bg-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((j) => (
                    <div
                      key={j}
                      className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${j * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* No-API-key warning */}
        {apiStatus === 'mock' && (
          <div className="mx-4 mb-2 flex items-center gap-2 bg-amber-950/40 border border-amber-800/40 rounded-xl px-3 py-2">
            <AlertCircle size={12} className="text-amber-400 flex-shrink-0" />
            <p className="text-[11px] text-amber-300">
              {'\uB370\uBAA8 \uBAA8\uB4DC \uC911 \u2014 OPENAI_API_KEY\uB97C Vercel \uD658\uACBD\uBCC0\uC218\uC5D0 \uCD94\uAC00\uD558\uBA74 \uC2E4\uC81C GPT-4o\uB85C \uC2E4\uD589\uB429\uB2C8\uB2E4.'}
            </p>
          </div>
        )}

        {/* Example chips */}
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => send(ex)}
              disabled={busy}
              title={ex}
              className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/40 hover:text-cyan-400 px-2.5 py-1 rounded-full transition-all disabled:opacity-40"
            >
              <ChevronRight size={9} />
              {ex.length > 26 ? ex.slice(0, 26) + '…' : ex}
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
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={'\uC790\uC5F0\uC5B4\uB85C \uC9C8\uBB38\uD558\uC138\uC694\u2026  \uC608) \uB9C8\uD3EC\uAD6C \uC18C\uC544\uACFC \uACF5\uBC31 \uBD84\uC11D'}
              disabled={busy}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none disabled:opacity-60"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || busy}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-600 text-white flex items-center justify-center transition-all"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-[10px] text-slate-700 mt-2 text-center">
            HIRA · NHIS · KOSIS {'\uB370\uC774\uD130 \uAE30\uBC18 \uC2DC\uBBA4\uB808\uC774\uC158 \uD5A5\uBC84 \uC5D0\uC774\uC804\uD2B8 \u2014 \uBB34\uB8CC \uB370\uBAA8 \uBC84\uC804'}
          </p>
        </div>
      </div>
    </div>
  );
}
