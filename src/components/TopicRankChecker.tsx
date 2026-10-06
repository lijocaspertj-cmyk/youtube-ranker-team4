import React, { useState, useEffect } from 'react';
import { Search, Trophy, ArrowUpRight, ArrowDownRight, Minus, Eye, Video, Sparkles, TrendingUp, BarChart3, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { ChannelRankEntry } from '../types';
import { fetchTopicRankings } from '../services/api';

interface TopicRankCheckerProps {
  onInspectChannel: (handle: string) => void;
  onInspectVideo: (videoId: string) => void;
  onGenerateSora: (topic: string) => void;
  hasKey: boolean;
  onOpenKeyModal: () => void;
}

const POPULAR_TOPICS = [
  { label: 'Technology', value: 'tech', color: 'from-blue-500 to-indigo-600' },
  { label: 'AI & Robotics', value: 'ai', color: 'from-violet-500 to-purple-600' },
  { label: 'Gaming', value: 'gaming', color: 'from-emerald-500 to-teal-600' },
  { label: 'Fitness & Health', value: 'fitness', color: 'from-rose-500 to-pink-600' },
  { label: 'Coding & Dev', value: 'coding', color: 'from-amber-500 to-orange-600' },
  { label: 'Finance & Stocks', value: 'finance', color: 'from-cyan-500 to-blue-600' },
  { label: 'Science', value: 'science', color: 'from-fuchsia-500 to-rose-600' },
];

export const TopicRankChecker: React.FC<TopicRankCheckerProps> = ({
  onInspectChannel,
  onInspectVideo,
  onGenerateSora,
  hasKey,
  onOpenKeyModal
}) => {
  const [topicInput, setTopicInput] = useState('tech');
  const [currentTopic, setCurrentTopic] = useState('tech');
  const [rankings, setRankings] = useState<ChannelRankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelRankEntry | null>(null);

  const loadRankings = async (topicToSearch: string) => {
    if (!topicToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTopicRankings(topicToSearch);
      setRankings(data.rankings);
      setCurrentTopic(topicToSearch);
      setIsLiveApi(data.source === 'google-api');
      if (data.rankings.length > 0) {
        setSelectedChannel(data.rankings[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to rank channels for this topic.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings('tech');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicInput.trim()) {
      loadRankings(topicInput.trim());
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Aggregated topic stats
  const totalSubscribers = rankings.reduce((acc, curr) => acc + curr.subscriberCount, 0);
  const totalViews = rankings.reduce((acc, curr) => acc + curr.viewCount, 0);
  const avgEngagement = rankings.length > 0 
    ? Math.round(rankings.reduce((acc, curr) => acc + curr.engagementScore, 0) / rankings.length)
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner - Bright & Colorful */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 p-8 sm:p-10 text-white shadow-xl shadow-rose-500/15">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Real-time YouTube Data API v3 Rank Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4 drop-shadow-sm">
            Topic Keyword Rank Checker
          </h1>
          <p className="text-base sm:text-lg text-rose-50 font-medium leading-relaxed mb-6">
            Enter any topic keyword to calculate YouTube creator rankings, inspect real channel statistics, and track audience reach in seconds.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Enter topic keyword (e.g. tech, coding, ai, fitness, gaming)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-medium text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-white/40 shadow-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm sm:text-base hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Check Rank</span>
                </>
              )}
            </button>
          </form>

          {/* Quick topic pills */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <span className="text-xs font-semibold text-rose-100 mr-1">Trending Topics:</span>
            {POPULAR_TOPICS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setTopicInput(item.value);
                  loadRankings(item.value);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTopic.toLowerCase() === item.value.toLowerCase()
                    ? 'bg-white text-rose-700 shadow-md scale-105'
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connection Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isLiveApi ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-xs font-bold text-slate-800">
            {isLiveApi ? 'Live Google YouTube API v3 Active' : 'Topic Ranking Engine (Preview & Verified Channels)'}
          </span>
          <span className="hidden sm:inline text-xs text-slate-500">·</span>
          <span className="hidden sm:inline text-xs text-slate-600">
            {isLiveApi ? 'Headers: KeyId delivered directly to Google endpoints' : 'To query your own custom Google quota live, enter your Google KeyId'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!hasKey && (
            <button
              onClick={onOpenKeyModal}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Add Google KeyId
            </button>
          )}
          <button
            onClick={() => loadRankings(currentTopic)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs transition-all cursor-pointer"
            title="Refresh Rankings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Highlights Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Topic Keyword</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 capitalize">{currentTopic}</p>
          <p className="text-xs text-slate-500 mt-1">{rankings.length} authority channels ranked</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Audience Reach</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatNumber(totalSubscribers)}</p>
          <p className="text-xs text-slate-500 mt-1">Combined subscriber count</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Video Views</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatNumber(totalViews)}</p>
          <p className="text-xs text-slate-500 mt-1">Aggregated video views</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Topic Engagement Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{avgEngagement} / 100</p>
          <p className="text-xs text-slate-500 mt-1">High retention and like-to-view index</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Main Leaderboard & Channel Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Rank Leaderboard */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Rankings for "{currentTopic}"</h2>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                Top {rankings.length}
              </span>
            </div>
            <span className="text-xs text-slate-500">Sorted by authority & subscriber volume</span>
          </div>

          <div className="space-y-3">
            {rankings.map((channel) => {
              const isSelected = selectedChannel?.channelId === channel.channelId;
              const rankColor =
                channel.rank === 1
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-amber-500/30'
                  : channel.rank === 2
                  ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-900'
                  : channel.rank === 3
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                  : 'bg-slate-100 text-slate-700';

              return (
                <div
                  key={channel.channelId}
                  onClick={() => setSelectedChannel(channel)}
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-rose-400 ring-2 ring-rose-300/40 shadow-lg'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-xs hover:border-rose-200'
                  }`}
                >
                  {/* Left: Rank & Channel Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-sm shrink-0 ${rankColor}`}>
                      #{channel.rank}
                    </div>

                    <img
                      src={channel.avatar}
                      alt={channel.title}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-red-600 transition-colors">
                          {channel.title}
                        </h3>
                        {channel.rankMovement === 'up' && (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <ArrowUpRight className="w-3 h-3" />
                            Up
                          </span>
                        )}
                        {channel.rankMovement === 'down' && (
                          <span className="inline-flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            <ArrowDownRight className="w-3 h-3" />
                            Down
                          </span>
                        )}
                        {channel.rankMovement === 'steady' && (
                          <span className="inline-flex items-center text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Minus className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-rose-600 font-semibold">@{channel.handle}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-md mt-0.5">
                        {channel.description || 'Verified YouTube Creator'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Key Channel Stats */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 mt-4 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Subscribers
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {formatNumber(channel.subscriberCount)}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Total Views
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {formatNumber(channel.viewCount)}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Videos
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {channel.videoCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="hidden sm:block text-right">
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Score
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-black bg-rose-50 text-rose-700">
                        {channel.engagementScore}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Channel Spotlight Details */}
        <div className="lg:col-span-4">
          {selectedChannel ? (
            <div className="sticky top-24 bg-white rounded-3xl border border-rose-100 p-6 shadow-lg space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedChannel.avatar}
                    alt={selectedChannel.title}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-200 shadow-sm"
                  />
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase mb-1">
                      Rank #{selectedChannel.rank} in {currentTopic}
                    </span>
                    <h3 className="font-black text-lg text-slate-900 leading-snug">
                      {selectedChannel.title}
                    </h3>
                    <p className="text-xs text-rose-600 font-bold">@{selectedChannel.handle}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {selectedChannel.description || 'No description provided.'}
              </p>

              {/* Statistics grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-500 uppercase">Subscribers</span>
                  <p className="text-lg font-black text-rose-950 mt-0.5">
                    {formatNumber(selectedChannel.subscriberCount)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {selectedChannel.subscriberCount.toLocaleString()} exact
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Total Views</span>
                  <p className="text-lg font-black text-amber-950 mt-0.5">
                    {formatNumber(selectedChannel.viewCount)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {selectedChannel.viewCount.toLocaleString()} exact
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Uploads</span>
                  <p className="text-lg font-black text-blue-950 mt-0.5">
                    {selectedChannel.videoCount.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">Published videos</span>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Avg Views/Video</span>
                  <p className="text-lg font-black text-emerald-950 mt-0.5">
                    {formatNumber(Math.round(selectedChannel.viewCount / Math.max(1, selectedChannel.videoCount)))}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">Per video impact</span>
                </div>
              </div>

              {/* Top Video Showcase if available */}
              {selectedChannel.topVideo && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      Featured Top Video
                    </span>
                    <button
                      onClick={() => onInspectVideo(selectedChannel.topVideo!.id)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      Inspect Video
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="group relative rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={selectedChannel.topVideo.thumbnail}
                      alt={selectedChannel.topVideo.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                      <p className="text-xs font-bold line-clamp-1">{selectedChannel.topVideo.title}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-300 mt-1">
                        <span>{formatNumber(selectedChannel.topVideo.views)} views</span>
                        <span>·</span>
                        <span>{formatNumber(selectedChannel.topVideo.likes)} likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onInspectChannel(selectedChannel.handle)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4" />
                  Inspect @{selectedChannel.handle} Numbers (Google API)
                </button>
                <button
                  onClick={() => onGenerateSora(currentTopic)}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Plan Sora Video for "{currentTopic}"
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Select a channel to view in-depth statistics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
