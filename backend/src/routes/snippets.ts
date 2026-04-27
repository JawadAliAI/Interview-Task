import { Router, Request, Response } from 'express';
import db from '../db/client';
import type { Snippet } from '../types/shared';

const router = Router();

interface DbSnippetRow {
  id: number;
  title: string;
  body: string;
  category: string;
  tags: string;
  created_at: string;
}

function rowToSnippet(row: DbSnippetRow): Snippet {
  return { ...row, tags: JSON.parse(row.tags) as string[] };
}

router.get('/', (req: Request, res: Response): void => {
  const { q, category } = req.query as { q?: string; category?: string };

  let rows: DbSnippetRow[];

  if (q) {
    const pattern = `%${q}%`;
    rows = db
      .prepare(
        `SELECT * FROM snippets
         WHERE (title LIKE ? OR body LIKE ? OR tags LIKE ?)
         ${category ? 'AND category = ?' : ''}
         ORDER BY id`,
      )
      .all(...(category ? [pattern, pattern, pattern, category] : [pattern, pattern, pattern])) as DbSnippetRow[];
  } else if (category) {
    rows = db
      .prepare('SELECT * FROM snippets WHERE category = ? ORDER BY id')
      .all(category) as DbSnippetRow[];
  } else {
    rows = db.prepare('SELECT * FROM snippets ORDER BY id').all() as DbSnippetRow[];
  }

  res.json({ snippets: rows.map(rowToSnippet) });
});

export default router;
