import { useState, useEffect, useRef } from 'react';
import { generateDraft } from './api/client';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import type { ChatMessage } from './types/chat';

const STORAGE_KEY = 'sra_chat_history';

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]) {
  const persistent = messages.filter((m) => m.role !== 'loading');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistent));
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    const loadingMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'loading',
      content: '',
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await generateDraft(text);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.draftReply,
        meta: {
          snippetsUsed: result.snippetsUsed,
          latencyMs: result.latencyMs,
          model: result.model,
        },
      };
      setMessages((prev) => [...prev.filter((m) => m.role !== 'loading'), assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'error',
        content: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev.filter((m) => m.role !== 'loading'), errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#f3f4f6',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#1e40af',
          color: '#fff',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>Support Reply Assistant</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '1px' }}>
            Internal tool — drafts require human review before sending
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            Clear history
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ maxWidth: '720px', width: '100%', margin: '0 auto', flex: 1 }}>
          {messages.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: '#9ca3af',
                marginTop: '80px',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
              <p style={{ margin: 0, fontWeight: 600, color: '#6b7280' }}>
                Paste a customer message to get started
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '0.82rem' }}>
                Try: "I was charged twice for order #4421"
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ maxWidth: '720px', width: '100%', margin: '0 auto', flexShrink: 0 }}>
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          loading={loading}
        />
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
