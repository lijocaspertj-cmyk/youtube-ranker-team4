import React, { useState, useEffect } from 'react';
import { 
  Search, Zap, AlertCircle, Sparkles, TrendingUp, Calendar, Eye, 
  ThumbsUp, MessageSquare, ShieldAlert, ArrowUpRight, CheckCircle2, 
  Clock, MessageSquareQuote, Flame, ArrowRight, Video, Target
} from 'lucide-react';
import { NicheVideoResult } from '../types';
import { fetchNicheMarketResults } from '../services/api';

interface NicheExplorerProps {
  mockMode: boolean;
  hasKey: boolean;
  onOpenKeyModal: () => void;
  searchCredits: number;
  onConsumeCredit: () => boolean; // returns false if 0 credits
  onOpenUpgradeModal: () => void;
  onSimulateZeroCredits: () => void;
  onResetCredits: () => void;
  onAnalyzeSentiment: (videoId: string, videoUrl?: string) => void;
}

const TRENDING_TOPICS = [
  'AI Productivity Tools',
  'Micro SaaS Growth',
  'Mechanical Keyboards',
  'MrBeast Challenge Clones',
  'Personal Finance Hacks',
  'No-Code Automations'
];

export const NicheExplorer: React.FC<NicheExplorerProps> = ({
  mockMode,
  hasKey,
  onOpenKeyModal,
  searchCredits,
  onConsumeCredit,
  onOpenUpgradeModal,
  onSimulateZeroCredits,
  onResetCredits,
  onAnalyzeSentiment,
}) => {
  const [searchInput, setSearchInput] = useState('AI Productivity Tools');
  const [currentQuery, setCurrentQuery] = useState('AI Productivity Tools');
  const [results, setResults] = useState<NicheVideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    // Check credit gating mechanism
    const allowed = onConsumeCredit();
    if (!allowed) {
      onOpenUpgradeModal();
      return;
    }

    setCurrentQuery(q);
    setLoading(true);
    setError(null);

    try {
      const res = await fetchNicheMarketResults(q, undefined, mockMode);
      setResults(res.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search niche market');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(currentQuery);
  }, [mockMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchInput);
  };

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 6.0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/95 text-white shadow-md border border-emerald-400/80 backdrop-blur-md">
          <TrendingUp className="w-3.5 h-3.5 text-white" />
          <span>High Engagement {score}%</span>
        </span>
      );
    }
    if (score >= 3.0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-amber-500/95 text-white shadow-md border border-amber-400/80 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Moderate Engagement {score}%</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-slate-800/90 text-white shadow-md border border-slate-700 backdrop-blur-md">
        <span>Standard Engagement {score}%</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 p-6 sm:p-10 text-white shadow-xl shadow-amber-500/15">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3 border border-white/20">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Feature 3: On-Demand Niche Search (Gated Feature)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Market & Topic Explorer
          </h1>
          <p className="mt-2 text-sm sm:text-base text-amber-100 font-medium">
            Discover breakout competitor videos in your niche. Benchmark calculated Audience Engagement Scores ((Likes + Comments) / Views) and immediately send video candidates to Audience Pulse for deep sentiment extraction.
          </p>

          {/* Trending Suggestions */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-amber-200">Trending Niches:</span>
            {TRENDING_TOPICS.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchInput(topic);
                  performSearch(topic);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Gating Mechanism Alert Banner when credits == 0 */}
      {searchCredits === 0 ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-sm">Monthly Search Credits Depleted (0/20 Left)</p>
              <p className="text-xs text-rose-100 font-medium">
                You have exhausted your included search credits. Upgrade to continue exploring topics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              onClick={onOpenUpgradeModal}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-extrabold transition-all shadow-xs cursor-pointer"
            >
              Upgrade ($29 Pro / $99 Agency)
            </button>
            <button
              onClick={onResetCredits}
              className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Reset to 18 Credits
            </button>
          </div>
        </div>
      ) : (
        /* Status Bar when credits are active with test button */
        <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold">
            <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>Active Quota: {searchCredits}/20 Searches Available</span>
            <span className="text-amber-500">·</span>
            <span className="text-amber-700 font-medium hidden sm:inline">Each search consumes 1 credit</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSimulateZeroCredits}
              title="Test the gating modal and banner"
              className="px-2.5 py-1 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-950 font-bold text-[11px] cursor-pointer"
            >
              Simulate 0 Credits (Test Gating)
            </button>
          </div>
        </div>
      )}

      {/* Search Bar labeled "Market & Topic Explorer" */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
          Market & Topic Explorer
        </label>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search niche market or topic (e.g. AI tools, SaaS marketing, viral challenge)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? (
              <span>Exploring Market...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search Niche Market</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Results Grid: 2- or 3-Column Responsive Card Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Top 10 Niche Results for:</span>
              <span className="text-amber-600">"{currentQuery}"</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked with verified thumbnails, duration overlays, computed Engagement Scores, and direct sentiment inspection.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 self-start sm:self-auto bg-slate-100 px-3 py-1 rounded-lg">
            Showing Top {results.length} Videos
          </span>
        </div>

        {results.length === 0 && !loading ? (
          <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
            <p className="font-bold">No results found for "{currentQuery}".</p>
          </div>
        ) : (
          /* Responsive 2- or 3-column card grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item, idx) => {
              const videoId = item.id || `niche_${idx + 1}`;
              const videoUrl = item.videoUrl || `https://www.youtube.com/watch?v=${videoId}`;
              const duration = item.duration || '14:28';

              return (
                <div
                  key={item.id || idx}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* 1. Video Thumbnail & Duration Overlay */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Rank tag top-left */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-black shadow-xs">
                        #{idx + 1}
                      </span>

                      {/* Prominent Engagement Score Badge top-right */}
                      <div className="absolute top-3 right-3">
                        {getEngagementBadge(item.engagementScore)}
                      </div>

                      {/* Video Duration Badge Overlay bottom-right */}
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-xs text-white text-[11px] font-mono font-bold tracking-wider shadow-sm">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>{duration}</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Details */}
                    <div className="p-5 space-y-4">
                      
                      {/* Video Title */}
                      <h3 className="font-black text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                        {item.title}
                      </h3>

                      {/* Channel Name & Publish Date */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                        <span className="font-extrabold text-slate-800 truncate max-w-[170px]">
                          {item.channelTitle}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0">
                          <Calendar className="w-3 h-3" />
                          {item.publishedAt}
                        </span>
                      </div>

                      {/* 2. Key Stats: View count, publish date, like count, comment count */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">
                            Views
                          </span>
                          <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center justify-center gap-1 mt-0.5">
                            <Eye className="w-3 h-3 text-amber-500" />
                            {formatNumber(item.views)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">
                            Likes
                          </span>
                          <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center justify-center gap-1 mt-0.5">
                            <ThumbsUp className="w-3 h-3 text-rose-500" />
                            {formatNumber(item.likes)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block">
                            Comments
                          </span>
                          <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center justify-center gap-1 mt-0.5">
                            <MessageSquare className="w-3 h-3 text-violet-500" />
                            {formatNumber(item.comments)}
                          </span>
                        </div>
                      </div>

                      {/* Calculated Metric Formula Callout */}
                      <div className="text-[10px] font-mono text-slate-500 bg-amber-50/70 px-2.5 py-1.5 rounded-xl border border-amber-200/80 flex items-center justify-between">
                        <span>Score: (Likes + Comments) / Views</span>
                        <span className="font-bold text-amber-950">
                          {item.engagementScore}%
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* 3. Quick Action Button: "Analyze Sentiment" */}
                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => onAnalyzeSentiment(videoId, videoUrl)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-sm shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer group/btn"
                    >
                      <MessageSquareQuote className="w-4 h-4 text-violet-200" />
                      <span>Analyze Sentiment</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
