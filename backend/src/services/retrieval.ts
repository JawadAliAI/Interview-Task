import db from '../db/client';
import type { Snippet } from '../types/shared';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'i', 'my', 'me', 'was', 'are',
  'be', 'have', 'has', 'had', 'do', 'did', 'not', 'no', 'so', 'if', 'this',
  'that', 'we', 'you', 'he', 'she', 'they', 'what', 'when', 'how', 'can',
  'would', 'could', 'should', 'will', 'just', 'been', 'very', 'get', 'got',
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 8);
}

interface DbSnippetRow {
  id: number;
  title: string;
  body: string;
  category: string;
  tags: string;
  created_at: string;
}

function rowToSnippet(row: DbSnippetRow): Snippet {
  return {
    ...row,
    tags: JSON.parse(row.tags) as string[],
  };
}

export function retrieveSnippets(customerMessage: string): Snippet[] {
  const keywords = extractKeywords(customerMessage);

  if (keywords.length === 0) return [];

  const matchCount = new Map<number, { snippet: Snippet; count: number }>();

  for (const kw of keywords) {
    const pattern = `%${kw}%`;
    const rows = db
      .prepare(
        `SELECT * FROM snippets
         WHERE title LIKE ? OR body LIKE ? OR tags LIKE ?`,
      )
      .all(pattern, pattern, pattern) as DbSnippetRow[];

    for (const row of rows) {
      const existing = matchCount.get(row.id);
      if (existing) {
        existing.count += 1;
      } else {
        matchCount.set(row.id, { snippet: rowToSnippet(row), count: 1 });
      }
    }
  }

  return Array.from(matchCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((e) => e.snippet);
}
