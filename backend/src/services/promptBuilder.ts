import type { Snippet } from '../types/shared';

export function buildPrompt(customerMessage: string, snippets: Snippet[]): string {
  const snippetContext = snippets
    .map((s) => `[${s.title}]\n${s.body}`)
    .join('\n\n---\n\n');

  return `You are a helpful customer support assistant. Your job is to write a polite, professional draft reply to a customer message.

IMPORTANT: Base your reply ONLY on the policy information provided below. Do not invent policies or make promises not covered in the context.

POLICY CONTEXT:
${snippetContext}

CUSTOMER MESSAGE:
${customerMessage}

Write a draft reply. Be concise (under 120 words), warm, and professional. Start directly with the reply — no preamble like "Here is a draft".`;
}
