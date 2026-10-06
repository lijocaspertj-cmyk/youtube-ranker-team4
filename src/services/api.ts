import { ChannelRankEntry, ChannelItem, VideoItem, HealthResponse, SoraResponse } from '../types';

export function getStoredKeyId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('youtube_experts_key_id') || '';
}

export function setStoredKeyId(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key) {
    localStorage.removeItem('youtube_experts_key_id');
  } else {
    localStorage.setItem('youtube_experts_key_id', key.trim());
  }
}

function getRequestHeaders(customKey?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  const key = (customKey !== undefined ? customKey : getStoredKeyId()).trim();
  if (key) {
    // User requirement: "All requests need the header: KeyId: <Google_KEY_ID>"
    headers['KeyId'] = key;
  }
  return headers;
}

/**
 * Checks backend health and serverless connection
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health', {
    headers: getRequestHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Health check returned status ${res.status}`);
  }
  return res.json();
}

/**
 * YouTube - stats for one video (1 unit)
 * https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=VIDEO_ID
 */
export async function fetchVideoStats(videoId: string, customKey?: string): Promise<{
  source: string;
  items: VideoItem[];
  raw?: any;
  error?: string;
  details?: any;
}> {
  const cleanId = videoId.trim();
  const res = await fetch(`/api/youtube/video?id=${encodeURIComponent(cleanId)}`, {
    headers: getRequestHeaders(customKey),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.details?.error?.message || `Failed to fetch video stats (${res.status})`);
  }
  return data;
}

/**
 * YouTube - a channel's numbers (1 unit)
 * https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=SOME_HANDLE
 */
export async function fetchChannelStats(identifier: string, isHandle: boolean = true, customKey?: string): Promise<{
  source: string;
  items: ChannelItem[];
  raw?: any;
  error?: string;
  details?: any;
}> {
  const cleanId = identifier.trim().replace(/^@/, '');
  const queryParam = isHandle ? `handle=${encodeURIComponent(cleanId)}` : `id=${encodeURIComponent(cleanId)}`;
  const res = await fetch(`/api/youtube/channel?${queryParam}`, {
    headers: getRequestHeaders(customKey),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.details?.error?.message || `Failed to fetch channel stats (${res.status})`);
  }
  return data;
}

/**
 * YouTube Topic Keyword Rank Checker
 * Takes in topic keyword and queries channels statistics
 */
export async function fetchTopicRankings(topic: string, customKey?: string): Promise<{
  source: string;
  query: string;
  totalRanked: number;
  rankings: ChannelRankEntry[];
}> {
  const res = await fetch(`/api/youtube/rank?q=${encodeURIComponent(topic.trim())}`, {
    headers: getRequestHeaders(customKey),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch topic rank (${res.status})`);
  }
  return data;
}

/**
 * Sora endpoint test & video scene generator
 */
export async function generateSoraScenes(prompt: string, topic?: string): Promise<SoraResponse> {
  const res = await fetch('/api/sora', {
    method: 'POST',
    headers: {
      ...getRequestHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, topic })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate Sora scene sequence');
  }
  return data;
}
