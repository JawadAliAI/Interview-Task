import { Router, Request, Response, NextFunction } from 'express';
import { validate, draftRequestSchema } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import { retrieveSnippets } from '../services/retrieval';
import { buildPrompt } from '../services/promptBuilder';
import { callLlm } from '../services/llm';
import db from '../db/client';
import logger from '../logger';
import type { DraftRequest, DraftResponse } from '../types/shared';

const router = Router();

router.post(
  '/',
  validate(draftRequestSchema),
  rateLimit,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { customerMessage } = req.body as DraftRequest;

    const truncated = customerMessage.slice(0, 100);
    logger.info({ event: 'draft_request', customerMessage: truncated });

    const snippets = retrieveSnippets(customerMessage);
    const prompt = buildPrompt(customerMessage, snippets);

    const start = Date.now();

    let llmResult: { content: string; model: string };
    try {
      llmResult = await callLlm(prompt);
    } catch (err) {
      next(err);
      return;
    }

    const latencyMs = Date.now() - start;
    const snippetIds = snippets.map((s) => s.id);

    db.prepare(
      `INSERT INTO draft_log (customer_message, draft_reply, snippet_ids, model, latency_ms)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(customerMessage, llmResult.content, JSON.stringify(snippetIds), llmResult.model, latencyMs);

    const response: DraftResponse = {
      draftReply: llmResult.content,
      snippetIdsUsed: snippetIds,
      snippetsUsed: snippets.map((s) => ({ id: s.id, title: s.title })),
      model: llmResult.model,
      latencyMs,
    };

    logger.info({ event: 'draft_success', model: llmResult.model, latencyMs });

    res.json(response);
  },
);

export default router;
