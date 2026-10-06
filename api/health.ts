import { Request, Response } from 'express';

export default async function healthHandler(req: Request, res: Response) {
  const incomingKey = (req.headers['keyid'] as string) || (req.headers['x-goog-api-key'] as string) || process.env.GOOGLE_KEY_ID || '';
  
  res.status(200).json({
    status: 'healthy',
    service: 'Youtube experts API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    keyConfigured: Boolean(incomingKey),
    endpoints: [
      {
        path: '/api/health',
        method: 'GET',
        description: 'Service health check and connection status'
      },
      {
        path: '/api/sora',
        method: 'GET/POST',
        description: 'Sora video generator & AI media endpoint'
      },
      {
        path: '/api/youtube/video',
        method: 'GET',
        params: ['id'],
        description: 'Get YouTube video statistics (https://www.googleapis.com/youtube/v3/videos)'
      },
      {
        path: '/api/youtube/channel',
        method: 'GET',
        params: ['handle', 'id'],
        description: "Get YouTube channel statistics (https://www.googleapis.com/youtube/v3/channels)"
      },
      {
        path: '/api/youtube/rank',
        method: 'GET',
        params: ['q'],
        description: 'Rank YouTube channels for a given topic keyword'
      }
    ]
  });
}
