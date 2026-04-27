import type { DraftResponse } from '../types/shared';

interface Props {
  result: DraftResponse;
}

export function DraftResult({ result }: Props) {
  return (
    <section style={{ marginTop: '1.5rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Draft Reply</h2>
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '6px',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
          fontSize: '0.95rem',
        }}
      >
        {result.draftReply}
      </div>

      <p
        style={{
          marginTop: '0.5rem',
          fontSize: '0.85rem',
          color: '#92400e',
          backgroundColor: '#fef3c7',
          padding: '0.4rem 0.75rem',
          borderRadius: '4px',
          display: 'inline-block',
        }}
      >
        ⚠️ This is a draft. Human review required before sending.
      </p>

      {result.snippetsUsed.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Snippets used:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#374151' }}>
            {result.snippetsUsed.map((s) => (
              <li key={s.id}>
                {s.title} <span style={{ color: '#9ca3af' }}>(id: {s.id})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
        Model: {result.model} | {result.latencyMs}ms
      </p>
    </section>
  );
}
