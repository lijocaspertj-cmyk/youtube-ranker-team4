import React, { useState, useEffect } from 'react';
import { Search, Radio, CheckCircle, Copy, ExternalLink, RefreshCw, BarChart2, Users, Eye, Video, Calendar, ShieldCheck, Code, ArrowRightLeft } from 'lucide-react';
import { ChannelItem } from '../types';
import { fetchChannelStats } from '../services/api';

interface ChannelInspectorProps {
  initialHandle?: string;
  hasKey: boolean;
  onOpenKeyModal: () => void;
  onCompare?: (handle: string) => void;
}

const SAMPLE_HANDLES = ['mkbhd', 'veritasium', 'fireship', 'Mrwhosetheboss', 'lexfridman', 'LinusTechTips'];

export const ChannelInspector: React.FC<ChannelInspectorProps> = ({
  initialHandle = 'mkbhd',
  hasKey,
  onOpenKeyModal,
  onCompare
}) => {
  const [handleInput, setHandleInput] = useState(initialHandle);
  const [channelData, setChannelData] = useState<ChannelItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<string>('');
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLiveApi, setIsLiveApi] = useState(false);

  const fetchChannel = async (targetHandle: string) => {
    const cleanHandle = targetHandle.trim().replace(/^@/, '');
    if (!cleanHandle) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchChannelStats(cleanHandle, true);
      if (res.items && res.items.length > 0) {
        setChannelData(res.items[0]);
      } else {
        setChannelData(null);
        setError(`No channel found for handle: @${cleanHandle}`);
      }
      setRawResponse(res.raw || res);
      setIsLiveApi(res.source === 'google-api');
      setActiveEndpoint(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${encodeURIComponent(cleanHandle)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch channel statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialHandle) {
      setHandleInput(initialHandle);
      fetchChannel(initialHandle);
    }
  }, [initialHandle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChannel(handleInput);
  };

  const copyEndpoint = () => {
    if (!activeEndpoint) return;
    navigator.clipboard.writeText(activeEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (numStr: string | number) => {
    const n = typeof numStr === 'string' ? parseInt(numStr, 10) : numStr;
    if (isNaN(n)) return '0';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const subscriberCount = channelData ? parseInt(channelData.statistics.subscriberCount || '0', 10) : 0;
  const viewCount = channelData ? parseInt(channelData.statistics.viewCount || '0', 10) : 0;
  const videoCount = channelData ? parseInt(channelData.statistics.videoCount || '0', 10) : 0;
  const avgViewsPerVideo = videoCount > 0 ? Math.round(viewCount / videoCount) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white shadow-xl shadow-rose-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
              <Radio className="w-3.5 h-3.5" />
              <span>Google API: 1 Unit Channel Numbers Endpoint</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">YouTube Channel Statistics</h1>
            <p className="text-sm text-rose-100 font-medium mt-1">
              Direct verification using <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs">/v3/channels?forHandle=SOME_HANDLE</code> with <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs">KeyId</code> header.
            </p>
          </div>

          <button
            onClick={onOpenKeyModal}
            className={`self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              hasKey
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-white text-rose-700 hover:bg-rose-50 shadow-md'
            }`}
          >
            {hasKey ? 'Google KeyId Active' : 'Enter Google KeyId'}
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">@</span>
            <input
              type="text"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              placeholder="Enter YouTube handle (e.g. mkbhd, veritasium)..."
              className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-white/40 shadow-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-slate-950 text-white font-bold text-sm hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 text-rose-400" />}
            <span>Pull Channel Numbers</span>
          </button>
        </form>

        {/* Quick Sample Handles */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-semibold">
          <span className="text-rose-200">Try handles:</span>
          {SAMPLE_HANDLES.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                setHandleInput(h);
                fetchChannel(h);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
            >
              @{h}
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
          <code>{activeEndpoint || `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${handleInput}`}</code>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>HTTP Request Header: <strong className="text-slate-800">KeyId: {hasKey ? '&lt;Google_KEY_ID_PROVIDED&gt;' : '&lt;NOT_CONFIGURED&gt;'}</strong></span>
        </div>
      </div>

      {/* Raw JSON toggle */}
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

      {/* Channel Card Display */}
      {channelData && (
        <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-sm space-y-8">
          {/* Identity Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.medium?.url || channelData.snippet.thumbnails.default?.url}
                alt={channelData.snippet.title}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-rose-100 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900">{channelData.snippet.title}</h2>
                  <span className="p-1 rounded-full bg-red-100 text-red-600" title="Verified Channel">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-sm text-rose-600 font-bold mt-0.5">
                  {channelData.snippet.customUrl || `@${handleInput}`}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {new Date(channelData.snippet.publishedAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className="font-mono text-[11px]">ID: {channelData.id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              {onCompare && (
                <button
                  onClick={() => onCompare(channelData.snippet.customUrl?.replace(/^@/, '') || handleInput)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Compare Channel</span>
                </button>
              )}
              <a
                href={`https://youtube.com/${channelData.snippet.customUrl || '@' + handleInput}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer"
              >
                <span>Open on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Description */}
          {channelData.snippet.description && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Channel Bio
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line line-clamp-3">
                {channelData.snippet.description}
              </p>
            </div>
          )}

          {/* Key Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100/50 border border-rose-200">
              <div className="flex items-center justify-between text-rose-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Subscribers</span>
                <Users className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-rose-950">{formatNumber(subscriberCount)}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {subscriberCount.toLocaleString()} fans
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100/50 border border-amber-200">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Views</span>
                <Eye className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-amber-950">{formatNumber(viewCount)}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {viewCount.toLocaleString()} lifetime views
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100/50 border border-purple-200">
              <div className="flex items-center justify-between text-purple-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Videos Uploaded</span>
                <Video className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-purple-950">{videoCount.toLocaleString()}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Catalog library size</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/50 border border-emerald-200">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Views / Video</span>
                <BarChart2 className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black text-emerald-950">{formatNumber(avgViewsPerVideo)}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Average reach per release</p>
            </div>
          </div>

          {/* Performance Ratios */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-sm text-slate-800">Calculated Channel Health Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">Views-to-Subscriber Ratio</span>
                <span className="font-black text-base text-slate-900">
                  {subscriberCount > 0 ? (viewCount / subscriberCount).toFixed(1) : '0'}x
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Average views per subscriber</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">Upload Consistency Tier</span>
                <span className="font-black text-base text-slate-900">
                  {videoCount > 1000 ? 'Super Creator' : videoCount > 300 ? 'High Frequency' : 'Focused Curated'}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Based on upload catalog volume</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-500 block mb-1">Subscriber Visibility</span>
                <span className="font-black text-base text-emerald-600">
                  {channelData.statistics.hiddenSubscriberCount ? 'Hidden' : 'Publicly Visible'}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Transparency status</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
