import type { Snippet } from '../types/shared';

interface Props {
  snippets: Snippet[];
}

export function SnippetList({ snippets }: Props) {
  if (snippets.length === 0) return null;

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Playbook Snippets
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {snippets.map((s) => (
          <div
            key={s.id}
            style={{
              padding: '0.75rem 1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: '#f9fafb',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{s.title}</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
              {s.category} · {s.tags.join(', ')}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
