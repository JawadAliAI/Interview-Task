import type { DraftResponse, SnippetsResponse } from '../types/shared';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unexpected error', code: 'UNKNOWN' }));
    throw new Error((body as { error: string }).error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function generateDraft(customerMessage: string): Promise<DraftResponse> {
  const res = await fetch(`${API_BASE}/api/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerMessage }),
  });
  return handleResponse<DraftResponse>(res);
}

export async function getSnippets(q?: string): Promise<SnippetsResponse> {
  const url = new URL(`${API_BASE}/api/snippets`);
  if (q) url.searchParams.set('q', q);
  const res = await fetch(url.toString());
  return handleResponse<SnippetsResponse>(res);
}
