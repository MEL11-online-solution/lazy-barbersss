import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { chatbotApi } from '../../api';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hey! 👋 I'm LazyBot. How can I help you today?",
      quickActions: [
        { label: 'Book a cut',  action: 'navigate', payload: { path: '/booking' } },
        { label: 'Services',    action: 'navigate', payload: { path: '/services' } },
        { label: 'Hours',       action: 'intent',   payload: { intent: 'hours' } },
        { label: 'Location',    action: 'intent',   payload: { intent: 'location' } },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [, navigate] = useLocation();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function send(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || busy) return;
    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setInput('');
    setBusy(true);
    try {
      const r = await chatbotApi.message(trimmed);
      setMessages((m) => [...m, { role: 'bot', text: r.reply, quickActions: r.quick_actions || [] }]);
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, something went wrong. Try again?' }]);
    } finally {
      setBusy(false);
    }
  }

  function handleQuickAction(qa) {
    if (qa.action === 'navigate' && qa.payload?.path) {
      navigate(qa.payload.path);
      setOpen(false);
    } else if (qa.action === 'intent' && qa.payload?.intent) {
      const map = {
        hours:    'What are your opening hours?',
        location: 'Where are you located?',
        services: 'What services do you offer?',
        prices:   'How much do services cost?',
      };
      send(map[qa.payload.intent] || qa.label);
    } else if (qa.action === 'book_service' && qa.payload?.service_id) {
      navigate('/booking');
      setOpen(false);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chatbot-pulse fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-pink-500 hover:bg-pink-600 keep-white text-2xl shadow-glow flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          aria-label="Open chat"
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="chatbot-slide-up fixed bottom-6 right-6 z-40 w-[92vw] max-w-sm flex flex-col overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
          style={{ height: 'min(70vh, 580px)', backgroundColor: 'var(--lb-bg-card)', border: '1px solid var(--lb-border)' }}
        >
          {/* Header — always pink/brand */}
          <div className="bg-pink-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div>
              <p className="keep-white font-display tracking-wider uppercase text-sm">LazyBot</p>
              <p className="keep-white text-xs opacity-80">Online — Lazy Barbers AI Assistant</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="keep-white opacity-80 hover:opacity-100 transition-opacity focus:outline-none"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ backgroundColor: 'var(--lb-bg)' }}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user'
                      ? 'bg-pink-500 keep-white rounded-br-sm'
                      : 'rounded-bl-sm'
                  }`}
                  style={m.role === 'bot' ? {
                    backgroundColor: 'var(--lb-bg-card)',
                    border: '1px solid var(--lb-border)',
                    color: 'var(--lb-text)',
                  } : undefined}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  {m.role === 'bot' && m.quickActions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {m.quickActions.map((qa, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(qa)}
                          className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-pink-500 hover:text-white hover:border-pink-500"
                          style={{ borderColor: 'var(--lb-border-input)', color: 'var(--lb-text-muted)' }}
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {busy && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
                  style={{ backgroundColor: 'var(--lb-bg-card)', border: '1px solid var(--lb-border)' }}
                >
                  <span className="bounce-dot w-2 h-2 rounded-full bg-pink-400 inline-block" />
                  <span className="bounce-dot w-2 h-2 rounded-full bg-pink-400 inline-block" />
                  <span className="bounce-dot w-2 h-2 rounded-full bg-pink-400 inline-block" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex gap-2 p-3 flex-shrink-0"
            style={{ borderTop: '1px solid var(--lb-border)', backgroundColor: 'var(--lb-bg-card)' }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="form-input flex-1 rounded-full text-sm py-2"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="btn-primary btn-sm rounded-full w-10 h-10 flex items-center justify-center p-0"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
