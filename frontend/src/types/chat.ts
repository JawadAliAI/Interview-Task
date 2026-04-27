export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error' | 'loading';
  content: string;
  meta?: {
    snippetsUsed: { id: number; title: string }[];
    latencyMs: number;
    model: string;
  };
}
