import React, { useState, useEffect } from 'react';
import { Video, Search, Eye, ThumbsUp, MessageSquare, Calendar, ExternalLink, RefreshCw, Copy, CheckCircle, Code, ShieldCheck } from 'lucide-react';
import { VideoItem } from '../types';
import { fetchVideoStats } from '../services/api';

interface VideoInspectorProps {
  initialVideoId?: string;
  hasKey: boolean;
  onOpenKeyModal: () => void;
}

const SAMPLE_VIDEOS = [
  { label: 'Never Gonna Give You Up', id: 'dQw4w9WgXcQ' },
  { label: 'Me at the zoo (1st YouTube Video)', id: 'jNQXAC9IVRw' },
  { label: 'Gangnam Style', id: '9bZkp7q19f0' },
  { label: 'MrBeast $456,000 Squid Game', id: '08lXfZfS_94' }
];

export const VideoInspector: React.FC<VideoInspectorProps> = ({
  initialVideoId = 'dQw4w9WgXcQ',
  hasKey,
  onOpenKeyModal
}) => {
  const [videoIdInput, setVideoIdInput] = useState(initialVideoId);
  const [videoData, setVideoData] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<string>('');
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  // Extract ID if user pastes full YouTube URL
  const extractVideoId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes('youtube.com/watch')) {
      try {
        const url = new URL(trimmed);
        return url.searchParams.get('v') || trimmed;
      } catch {
        return trimmed;
      }
    }
    if (trimmed.includes('youtu.be/')) {
      const parts = trimmed.split('youtu.be/');
      return parts[1]?.split('?')[0] || trimmed;
    }
    return trimmed;
  };

  const fetchVideo = async (targetId: string) => {
    const cleanId = extractVideoId(targetId);
    if (!cleanId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchVideoStats(cleanId);
      if (res.items && res.items.length > 0) {
        setVideoData(res.items[0]);
      } else {
        setVideoData(null);
        setError(`No video found with ID: ${cleanId}`);
      }
      setRawResponse(res.raw || res);
      setIsLiveApi(res.source === 'google-api');
      setActiveEndpoint(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${encodeURIComponent(cleanId)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch video statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialVideoId) {
      setVideoIdInput(initialVideoId);
      fetchVideo(initialVideoId);
    }
  }, [initialVideoId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideo(videoIdInput);
  };

  const copyEndpoint = () => {
    if (!activeEndpoint) return;
    navigator.clipboard.writeText(activeEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (numStr?: string | number) => {
    if (!numStr) return '0';
    const n = typeof numStr === 'string' ? parseInt(numStr, 10) : numStr;
    if (isNaN(n)) return '0';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const viewCount = videoData ? parseInt(videoData.statistics.viewCount || '0', 10) : 0;
  const likeCount = videoData ? parseInt(videoData.statistics.likeCount || '0', 10) : 0;
  const commentCount = videoData ? parseInt(videoData.statistics.commentCount || '0', 10) : 0;
  const likeRate = viewCount > 0 ? ((likeCount / viewCount) * 100).toFixed(2) : '0';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
              <Video className="w-3.5 h-3.5" />
              <span>Google API: 1 Unit Video Stats Endpoint</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">YouTube Single Video Stats</h1>
            <p className="text-sm text-indigo-100 font-medium mt-1">
              Calls <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs">/v3/videos?part=snippet,statistics&id=VIDEO_ID</code> with <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs">KeyId</code> header.
            </p>
          </div>

          <button
            onClick={onOpenKeyModal}
            className={`self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              hasKey
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-white text-indigo-800 hover:bg-indigo-50 shadow-md'
            }`}
          >
            {hasKey ? 'Google KeyId Active' : 'Enter Google KeyId'}
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={videoIdInput}
              onChange={(e) => setVideoIdInput(e.target.value)}
              placeholder="Paste YouTube Video ID or URL (e.g. dQw4w9WgXcQ)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-white/40 shadow-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-slate-950 text-white font-bold text-sm hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4 text-violet-400" />}
            <span>Pull Video Stats</span>
          </button>
        </form>

        {/* Sample Videos */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-semibold">
          <span className="text-indigo-200">Popular Examples:</span>
          {SAMPLE_VIDEOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setVideoIdInput(item.id);
                fetchVideo(item.id);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* API Endpoint Inspector bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Endpoint Called:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isLiveApi ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isLiveApi ? 'Live Google API' : 'Preview Mode'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              {showJson ? 'Hide Raw JSON' : 'View Raw JSON'}
            </button>
            <button
              onClick={copyEndpoint}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy URL'}
            </button>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
          <code>{activeEndpoint || `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIdInput}`}</code>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>HTTP Request Header: <strong className="text-slate-800">KeyId: {hasKey ? '&lt;Google_KEY_ID_PROVIDED&gt;' : '&lt;NOT_CONFIGURED&gt;'}</strong></span>
        </div>
      </div>

      {showJson && rawResponse && (
        <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-xs max-h-72 overflow-y-auto">
          <pre>{JSON.stringify(rawResponse, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Video Statistics Display */}
      {videoData && (
        <div className="bg-white rounded-3xl border border-violet-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Thumbnail */}
            <div className="md:col-span-5 relative group overflow-hidden rounded-2xl border border-slate-200 shadow-md">
              <img
                src={
                  videoData.snippet.thumbnails.maxres?.url ||
                  videoData.snippet.thumbnails.high?.url ||
                  videoData.snippet.thumbnails.medium?.url ||
                  videoData.snippet.thumbnails.default?.url
                }
                alt={videoData.snippet.title}
                className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <a
                href={`https://www.youtube.com/watch?v=${videoData.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-bold text-xs"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Video Details */}
            <div className="md:col-span-7 space-y-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[11px] font-bold">
                {videoData.snippet.channelTitle}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {videoData.snippet.title}
              </h2>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {videoData.snippet.description || 'No video description available.'}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                <Calendar className="w-3.5 h-3.5 text-violet-500" />
                <span>Uploaded {new Date(videoData.snippet.publishedAt).toLocaleDateString()}</span>
                <span>·</span>
                <span className="font-mono text-[11px]">ID: {videoData.id}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100/50 border border-blue-200">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Views</span>
                <Eye className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-blue-950">{formatNumber(viewCount)}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {viewCount.toLocaleString()} plays
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100/50 border border-rose-200">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Likes Count</span>
                <ThumbsUp className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-rose-950">{formatNumber(likeCount)}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {likeRate}% like rate
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100/50 border border-amber-200">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Comments</span>
                <MessageSquare className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-amber-950">{formatNumber(commentCount)}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {commentCount.toLocaleString()} community discussions
              </p>
            </div>
          </div>

          {/* Tags */}
          {videoData.snippet.tags && videoData.snippet.tags.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Video Tags & Keywords</span>
              <div className="flex flex-wrap gap-1.5">
                {videoData.snippet.tags.slice(0, 14).map((tag, i) => (
                  <span key={i} className="text-xs text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
