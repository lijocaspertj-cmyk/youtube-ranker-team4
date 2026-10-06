import { ChannelRankEntry, ChannelItem, VideoItem, HealthResponse, SoraResponse, AudiencePulseData, NicheSearchResponse } from '../types';

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

export function getStoredMockMode(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('pulsetube_mock_mode');
  // default to Mock Data Mode = true so users can immediately test without needing to paste a key
  return stored !== null ? stored === 'true' : true;
}

export function setStoredMockMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pulsetube_mock_mode', enabled ? 'true' : 'false');
}

function getRequestHeaders(customKey?: string, isMockMode?: boolean): HeadersInit {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  const mock = isMockMode !== undefined ? isMockMode : getStoredMockMode();
  if (!mock) {
    const key = (customKey !== undefined ? customKey : getStoredKeyId()).trim();
    if (key) {
      headers['KeyId'] = key;
    }
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
 */
export async function fetchVideoStats(videoId: string, customKey?: string, isMock?: boolean): Promise<{
  source: string;
  items: VideoItem[];
  raw?: any;
  error?: string;
  details?: any;
}> {
  const cleanId = videoId.trim();
  const res = await fetch(`/api/youtube/video?id=${encodeURIComponent(cleanId)}`, {
    headers: getRequestHeaders(customKey, isMock),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.details?.error?.message || `Failed to fetch video stats (${res.status})`);
  }
  return data;
}

/**
 * YouTube - a channel's numbers (1 unit)
 */
export async function fetchChannelStats(identifier: string, isHandle: boolean = true, customKey?: string, isMock?: boolean): Promise<{
  source: string;
  items: ChannelItem[];
  raw?: any;
  error?: string;
  details?: any;
}> {
  const cleanId = identifier.trim().replace(/^@/, '');
  const queryParam = isHandle ? `handle=${encodeURIComponent(cleanId)}` : `id=${encodeURIComponent(cleanId)}`;
  const res = await fetch(`/api/youtube/channel?${queryParam}`, {
    headers: getRequestHeaders(customKey, isMock),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.details?.error?.message || `Failed to fetch channel stats (${res.status})`);
  }
  return data;
}

/**
 * YouTube Topic Keyword Rank Checker
 */
export async function fetchTopicRankings(topic: string, customKey?: string, isMock?: boolean): Promise<{
  source: string;
  query: string;
  totalRanked: number;
  rankings: ChannelRankEntry[];
}> {
  const res = await fetch(`/api/youtube/rank?q=${encodeURIComponent(topic.trim())}`, {
    headers: getRequestHeaders(customKey, isMock),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch topic rank (${res.status})`);
  }
  return data;
}

/**
 * Feature 2: "Audience Pulse" & Sentiment Analysis
 */
export async function fetchAudiencePulse(videoId: string, customKey?: string, isMock?: boolean): Promise<AudiencePulseData> {
  const cleanId = videoId.trim();
  const res = await fetch(`/api/youtube/comments?videoId=${encodeURIComponent(cleanId)}`, {
    headers: getRequestHeaders(customKey, isMock),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to fetch comments & audience pulse (${res.status})`);
  }
  return data;
}

/**
 * Feature 3: On-Demand Niche Search
 */
export async function fetchNicheMarketResults(query: string, customKey?: string, isMock?: boolean): Promise<NicheSearchResponse> {
  const cleanQ = query.trim();
  const res = await fetch(`/api/youtube/niche-search?q=${encodeURIComponent(cleanQ)}`, {
    headers: getRequestHeaders(customKey, isMock),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to search niche market (${res.status})`);
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
