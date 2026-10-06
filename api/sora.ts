import { Request, Response } from 'express';

interface SoraJobRequest {
  prompt?: string;
  topic?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  durationSeconds?: number;
  quality?: 'standard' | 'hd';
}

export default async function soraHandler(req: Request, res: Response) {
  const method = req.method;
  const incomingKey = (req.headers['keyid'] as string) || (req.headers['x-goog-api-key'] as string) || process.env.GOOGLE_KEY_ID || '';

  if (method === 'GET') {
    return res.status(200).json({
      service: 'Sora AI Video Service / YouTube Video Companion',
      status: 'active',
      capabilities: [
        'topic-to-video-script',
        'youtube-short-visual-prompts',
        'sora-simulation-job-runner',
        'media-aspect-ratio-formatting'
      ],
      keyConfigured: Boolean(incomingKey),
      instructions: 'Submit POST with { prompt, topic, aspectRatio, durationSeconds } to initiate video scene planning.'
    });
  }

  if (method === 'POST') {
    const { prompt, topic, aspectRatio = '16:9', durationSeconds = 15, quality = 'hd' }: SoraJobRequest = req.body || {};
    
    if (!prompt && !topic) {
      return res.status(400).json({
        error: 'Missing required field: please provide "prompt" or "topic".'
      });
    }

    const videoTopic = topic || prompt || 'YouTube Trending Content';
    const jobId = 'sora_' + Math.random().toString(36).substring(2, 10);

    return res.status(200).json({
      jobId,
      status: 'completed',
      topic: videoTopic,
      aspectRatio,
      durationSeconds,
      quality,
      scenes: [
        {
          timestamp: '00:00 - 00:04',
          visualPrompt: `High energy intro shot establishing ${videoTopic}, ultra-realistic lighting, 4K crisp detail, dynamic camera dolly zoom.`,
          narrationPacing: 'Catchy hook to maximize 5-second retention'
        },
        {
          timestamp: '00:04 - 00:10',
          visualPrompt: `Close-up demonstration focusing on core value of ${videoTopic}, cinematic bokeh background, vibrant saturated colors.`,
          narrationPacing: 'Core problem breakdown and expert insight'
        },
        {
          timestamp: '00:10 - 00:15',
          visualPrompt: `Smooth concluding sequence with call to action graphics for channel subscriptions, bright contrast and clean aesthetic.`,
          narrationPacing: 'Closing takeaway and next video teaser'
        }
      ],
      keyConfigured: Boolean(incomingKey),
      generatedAt: new Date().toISOString()
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
