import { useRef, KeyboardEvent } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  loading: boolean;
}

export function ChatInput({ value, onChange, onSend, loading }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim().length >= 10) onSend();
    }
  }

  const canSend = !loading && value.trim().length >= 10;

  return (
    <div
      style={{
        borderTop: '1px solid #e5e7eb',
        padding: '12px 16px',
        background: '#fff',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
      }}
    >
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        disabled={loading}
        placeholder="Paste customer message… (Enter to send, Shift+Enter for newline)"
        style={{
          flex: 1,
          padding: '10px 14px',
          border: '1px solid #d1d5db',
          borderRadius: '22px',
          resize: 'none',
          fontSize: '0.92rem',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          maxHeight: '120px',
          overflowY: 'auto',
          outline: 'none',
          backgroundColor: loading ? '#f9fafb' : '#fff',
        }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = 'auto';
          el.style.height = Math.min(el.scrollHeight, 120) + 'px';
        }}
      />
      <button
        onClick={onSend}
        disabled={!canSend}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: canSend ? '#2563eb' : '#d1d5db',
          color: '#fff',
          fontSize: '1.1rem',
          cursor: canSend ? 'pointer' : 'not-allowed',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
        }}
        aria-label="Send"
      >
        ↑
      </button>
    </div>
  );
}
