'use client';

import { useState, useRef, useEffect } from 'react';

interface Message { role: 'user' | 'assistant'; content: string }

export default function TopicChat({ topicId }: { topicId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, messages: newMessages }),
    });

    if (!res.body) { setLoading(false); return; }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let reply = '';
    setMessages(m => [...m, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      reply += decoder.decode(value, { stream: true });
      setMessages(m => {
        const updated = [...m];
        updated[updated.length - 1] = { role: 'assistant', content: reply };
        return updated;
      });
    }
    setLoading(false);
  }

  const STARTERS = ['Explain the core concept in plain English', 'Quiz me on this topic', 'How does this apply to FundsIndia?', 'What should I focus on first?'];

  return (
    <div className="border border-[#E8E4DE] rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-[#FAF8F5] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">💬</span>
          <span className="text-sm font-semibold text-[#1C1C1A]">Ask Claude about this topic</span>
          {messages.length > 0 && (
            <span className="text-xs text-[#9B9590]">· {messages.filter(m => m.role === 'user').length} messages</span>
          )}
        </div>
        <svg className={`w-4 h-4 text-[#9B9590] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-[#E8E4DE] bg-white">
          {/* Starter prompts */}
          {messages.length === 0 && (
            <div className="px-5 pt-4 pb-2 flex flex-wrap gap-2">
              {STARTERS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setInput(s); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#E8E4DE] text-[#4A4540] hover:border-[#9B9590] hover:bg-[#FAF8F5] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="px-5 py-4 max-h-80 overflow-y-auto space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="shrink-0 w-6 h-6 rounded-full bg-[#1C1C1A] flex items-center justify-center text-[10px] text-white font-bold mt-0.5">C</div>
                  )}
                  <div
                    className={`max-w-[85%] text-sm leading-relaxed rounded-2xl px-3.5 py-2.5 prose-chat ${
                      m.role === 'user'
                        ? 'bg-[#1C1C1A] text-white rounded-tr-sm'
                        : 'bg-[#F5F2EE] text-[#1C1C1A] rounded-tl-sm'
                    }`}
                    dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br>') }}
                  />
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#1C1C1A] flex items-center justify-center text-[10px] text-white font-bold mt-0.5">C</div>
                  <div className="bg-[#F5F2EE] rounded-2xl rounded-tl-sm px-3.5 py-3 flex gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#9B9590] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input */}
          <div className="px-5 pb-4 pt-2 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ask anything about this topic…"
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] text-[#1C1C1A] placeholder-[#9B9590] focus:outline-none focus:ring-2 focus:ring-[#E8E4DE] transition"
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-[#1C1C1A] text-white text-sm font-medium rounded-xl disabled:opacity-40 hover:bg-[#333] active:scale-[0.98] transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
