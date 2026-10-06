import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.ts';
import soraHandler from './api/sora.ts';
import { getVideoStatsHandler, getChannelStatsHandler, getTopicRankHandler } from './api/youtube.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // API Endpoints in /api
  app.all('/api/health', (req: Request, res: Response) => healthHandler(req, res));
  app.all('/api/sora', (req: Request, res: Response) => soraHandler(req, res));
  
  // YouTube Endpoints
  app.get('/api/youtube/video', (req: Request, res: Response) => getVideoStatsHandler(req, res));
  app.get('/api/youtube/videos', (req: Request, res: Response) => getVideoStatsHandler(req, res));
  app.get('/api/youtube/channel', (req: Request, res: Response) => getChannelStatsHandler(req, res));
  app.get('/api/youtube/channels', (req: Request, res: Response) => getChannelStatsHandler(req, res));
  app.get('/api/youtube/rank', (req: Request, res: Response) => getTopicRankHandler(req, res));
  app.get('/api/youtube/search', (req: Request, res: Response) => getTopicRankHandler(req, res));

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
