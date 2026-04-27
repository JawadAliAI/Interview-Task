export interface Snippet {
  id: number;
  title: string;
  body: string;
  category: string;
  tags: string[];
  created_at: string;
}

export interface DraftRequest {
  customerMessage: string;
}

export interface DraftResponse {
  draftReply: string;
  snippetIdsUsed: number[];
  snippetsUsed: { id: number; title: string }[];
  model: string;
  latencyMs: number;
}

export interface SnippetsResponse {
  snippets: Snippet[];
}

export interface ApiError {
  error: string;
  code: string;
}
