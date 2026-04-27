interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function MessageInput({ value, onChange, onSubmit, loading }: Props) {
  return (
    <section style={{ marginBottom: '1.5rem' }}>
      <label
        htmlFor="customer-message"
        style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}
      >
        Customer Message
      </label>
      <textarea
        id="customer-message"
        rows={6}
        placeholder="Paste customer message here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          fontSize: '0.95rem',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          resize: 'vertical',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          backgroundColor: loading ? '#f9fafb' : '#fff',
        }}
      />
      <button
        onClick={onSubmit}
        disabled={loading || value.trim().length < 10}
        style={{
          marginTop: '0.75rem',
          padding: '0.6rem 1.4rem',
          backgroundColor: loading || value.trim().length < 10 ? '#9ca3af' : '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: loading || value.trim().length < 10 ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Generating…' : 'Generate Draft'}
      </button>
    </section>
  );
}
