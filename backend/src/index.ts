import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db/client';
import snippetsRouter from './routes/snippets';
import draftsRouter from './routes/drafts';
import { errorHandler } from './middleware/errorHandler';
import logger from './logger';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ status: 'ok', db: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'error', timestamp: new Date().toISOString() });
  }
});

app.use('/api/snippets', snippetsRouter);
app.use('/api/drafts', draftsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ event: 'server_start', port: PORT }, `Server running on port ${PORT}`);
});
