import type { ChatMessage } from '../types/chat';

interface Props {
  message: ChatMessage;
}

export function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <div
          style={{
            background: '#2563eb',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '18px 18px 4px 18px',
            maxWidth: '72%',
            fontSize: '0.92rem',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            padding: '12px 16px',
            borderRadius: '18px 18px 18px 4px',
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#9ca3af',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (message.role === 'error') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '18px 18px 18px 4px',
            maxWidth: '72%',
            fontSize: '0.9rem',
            lineHeight: 1.5,
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // assistant
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '4px' }}>
      <div style={{ maxWidth: '72%' }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            padding: '10px 14px',
            borderRadius: '18px 18px 18px 4px',
            fontSize: '0.92rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
        {message.meta && (
          <div
            style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              marginTop: '4px',
              paddingLeft: '4px',
            }}
          >
            {message.meta.snippetsUsed.length > 0 && (
              <span>via: {message.meta.snippetsUsed.map((s) => s.title).join(', ')} · </span>
            )}
            <span>{message.meta.latencyMs}ms</span>
          </div>
        )}
        <p
          style={{
            fontSize: '0.72rem',
            color: '#d97706',
            margin: '3px 0 12px 4px',
          }}
        >
          ⚠ Draft — review before sending
        </p>
      </div>
    </div>
  );
}
