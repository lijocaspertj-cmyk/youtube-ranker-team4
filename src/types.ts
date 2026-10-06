export interface ChannelStatistics {
  viewCount: string;
  subscriberCount: string;
  hiddenSubscriberCount?: boolean;
  videoCount: string;
}

export interface ChannelSnippet {
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  country?: string;
}

export interface ChannelItem {
  id: string;
  kind?: string;
  snippet: ChannelSnippet;
  statistics: ChannelStatistics;
}

export interface VideoStatistics {
  viewCount: string;
  likeCount?: string;
  dislikeCount?: string;
  favoriteCount?: string;
  commentCount?: string;
}

export interface VideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
    maxres?: { url: string };
  };
  channelTitle: string;
  tags?: string[];
  categoryId?: string;
}

export interface VideoItem {
  id: string;
  snippet: VideoSnippet;
  statistics: VideoStatistics;
}

export interface ChannelRankEntry {
  rank: number;
  handle: string;
  channelId: string;
  title: string;
  description: string;
  customUrl?: string;
  avatar: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  engagementScore: number;
  category: string;
  rankMovement?: 'up' | 'down' | 'steady';
  topVideo?: {
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    thumbnail: string;
    publishedAt: string;
  };
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  keyConfigured: boolean;
  endpoints: Array<{
    path: string;
    method: string;
    description: string;
  }>;
}

export interface SoraScene {
  timestamp: string;
  visualPrompt: string;
  narrationPacing: string;
}

export interface SoraResponse {
  jobId: string;
  status: string;
  topic: string;
  aspectRatio: string;
  durationSeconds: number;
  quality: string;
  scenes: SoraScene[];
  keyConfigured: boolean;
  generatedAt: string;
}
