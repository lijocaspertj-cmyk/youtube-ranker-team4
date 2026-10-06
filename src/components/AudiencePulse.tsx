import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Search, ThumbsUp, Tag, HelpCircle, CheckCircle2, AlertTriangle, Filter, Sparkles, RefreshCw, Flame, BarChart2, MessageCircle } from 'lucide-react';
import { AudiencePulseData, CommentItem, KeywordTag, SentimentType } from '../types';
import { fetchAudiencePulse } from '../services/api';

interface AudiencePulseProps {
  mockMode: boolean;
  hasKey: boolean;
  onOpenKeyModal: () => void;
}

const SAMPLE_VIDEOS = [
  { id: 'dQw4w9WgXcQ', title: 'Tech Review & Product Reveal' },
  { id: 'video_ai_1', title: 'AI Developer Framework & Demo' },
  { id: 'video_tech_2', title: 'Consumer Gadgets Benchmark' },
  { id: 'video_fit_1', title: 'Science-Based Fitness Breakdown' },
];

export const AudiencePulse: React.FC<AudiencePulseProps> = ({
  mockMode,
  hasKey,
  onOpenKeyModal,
}) => {
  const [videoIdInput, setVideoIdInput] = useState('dQw4w9WgXcQ');
  const [currentVideoId, setCurrentVideoId] = useState('dQw4w9WgXcQ');
  const [data, setData] = useState<AudiencePulseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sentimentFilter, setSentimentFilter] = useState<'All' | SentimentType>('All');
  const [activeKeywordTag, setActiveKeywordTag] = useState<string | null>(null);

  const cleanVideoId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes('v=')) {
      const match = trimmed.match(/[?&]v=([^&]+)/);
      if (match && match[1]) return match[1];
    }
    if (trimmed.includes('youtu.be/')) {
      const match = trimmed.match(/youtu\.be\/([^?&]+)/);
      if (match && match[1]) return match[1];
    }
    return trimmed;
  };

  const loadPulse = async (vid: string) => {
    const cleanId = cleanVideoId(vid);
    if (!cleanId) return;

    setCurrentVideoId(cleanId);
    setLoading(true);
    setError(null);
    setActiveKeywordTag(null);

    try {
      const res = await fetchAudiencePulse(cleanId, undefined, mockMode);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze audience pulse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPulse(currentVideoId);
  }, [mockMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoIdInput.trim()) {
      loadPulse(videoIdInput);
    }
  };

  // Filtered comments
  const filteredComments = (data?.comments || []).filter(c => {
    if (sentimentFilter !== 'All' && c.sentiment !== sentimentFilter) {
      return false;
    }
    if (activeKeywordTag) {
      const tagLower = activeKeywordTag.toLowerCase();
      const textLower = c.text.toLowerCase();
      const matchDirect = c.matchingTag?.toLowerCase() === tagLower;
      const matchText = textLower.includes(tagLower) || tagLower.split(' ').some(w => w.length > 3 && textLower.includes(w));
      return matchDirect || matchText;
    }
    return true;
  });

  const getSentimentBadge = (sentiment: SentimentType) => {
    switch (sentiment) {
      case 'Positive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Positive
          </span>
        );
      case 'Constructive/Feedback':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Constructive / Feedback
          </span>
        );
      case 'Question/Pain Point':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Question / Pain Point
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-rose-600 p-6 sm:p-10 text-white shadow-xl shadow-purple-600/15">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3 border border-white/20">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Feature 2: "Audience Pulse" & Sentiment Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            "Audience Pulse" & Sentiment Analysis
          </h1>
          <p className="mt-2 text-sm sm:text-base text-purple-100 font-medium">
            Inspect any YouTube video to reveal real-time sentiment distribution, recurring customer pain points, feature requests, and top-voted feedback.
          </p>

          {/* Quick Preset Video Chips */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-purple-200">Sample Videos:</span>
            {SAMPLE_VIDEOS.map((vid, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setVideoIdInput(vid.id);
                  loadPulse(vid.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                {vid.title}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Input Field for Video ID */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={videoIdInput}
              onChange={(e) => setVideoIdInput(e.target.value)}
              placeholder="Enter YouTube Video ID (e.g. dQw4w9WgXcQ) or full video URL..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-violet-600/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Pulse...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span>Analyze Audience Pulse</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadPulse(currentVideoId)}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-red-900 font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-8">
          
          {/* Summary Header: Total Comments & Overall Sentiment Ratio */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                  Video ID: <code className="font-mono bg-violet-50 px-1.5 py-0.5 rounded">{data.videoId}</code>
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Audience Sentiment Summary</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Natural Language Sentiment Ratio extracted from community comments.
                </p>
              </div>

              {/* Total Comments Badge */}
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[150px]">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Comments
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {data.totalComments.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Sentiment Ratio Breakdown */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-700">Overall Sentiment Ratio</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    {data.ratio.positive}% Positive
                  </span>
                  <span className="text-amber-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    {data.ratio.neutral || data.ratio.constructive || 14}% Neutral / Feedback
                  </span>
                  <span className="text-rose-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    {data.ratio.negative}% Negative / Pain Point
                  </span>
                </div>
              </div>

              {/* Multi-segment Ratio Bar */}
              <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                <div
                  className="bg-emerald-500 transition-all duration-700"
                  style={{ width: `${data.ratio.positive}%` }}
                  title={`${data.ratio.positive}% Positive`}
                />
                <div
                  className="bg-amber-400 transition-all duration-700"
                  style={{ width: `${data.ratio.neutral || data.ratio.constructive || 14}%` }}
                  title={`${data.ratio.neutral || data.ratio.constructive || 14}% Neutral`}
                />
                <div
                  className="bg-rose-500 transition-all duration-700"
                  style={{ width: `${data.ratio.negative}%` }}
                  title={`${data.ratio.negative}% Negative`}
                />
              </div>

              {/* Stat Cards Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                    <span>Positive Reception</span>
                    <span className="text-emerald-600 bg-white px-2 py-0.5 rounded-md font-mono text-[11px] shadow-2xs">
                      {data.ratio.positive}%
                    </span>
                  </div>
                  <p className="text-lg font-black text-emerald-950">High Praise & Delight</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Top keywords: great explanation, camera quality, production</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
                    <span>Constructive / Neutral</span>
                    <span className="text-amber-600 bg-white px-2 py-0.5 rounded-md font-mono text-[11px] shadow-2xs">
                      {data.ratio.neutral || data.ratio.constructive || 14}%
                    </span>
                  </div>
                  <p className="text-lg font-black text-amber-950">Product Suggestions</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">Top suggestions: feature requests, timestamps, comparisons</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200">
                  <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1">
                    <span>Questions & Pain Points</span>
                    <span className="text-rose-600 bg-white px-2 py-0.5 rounded-md font-mono text-[11px] shadow-2xs">
                      {data.ratio.negative}%
                    </span>
                  </div>
                  <p className="text-lg font-black text-rose-950">Customer Obstacles</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">Top friction: pricing concerns, tutorial requests, bugs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Cloud & Tag List Highlighting Customer Desires / Complaints */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-violet-600" />
                  <span>Keyword Cloud: Top Customer Desires & Pain Points</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any topic tag below to filter and highlight matching comments in the feed.
                </p>
              </div>

              {activeKeywordTag && (
                <button
                  onClick={() => setActiveKeywordTag(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer self-start sm:self-auto"
                >
                  Clear Tag Filter (Showing all)
                </button>
              )}
            </div>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {data.keywords.map((kw, idx) => {
                const isActive = activeKeywordTag === kw.tag;
                const isPainPoint = kw.sentiment === 'Question/Pain Point';
                const isPositive = kw.sentiment === 'Positive';

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveKeywordTag(isActive ? null : kw.tag)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      isActive
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm scale-105'
                        : isPainPoint
                        ? 'bg-rose-50/70 text-rose-800 border-rose-200 hover:bg-rose-100'
                        : isPositive
                        ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <span>{kw.tag}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {kw.count} mentions
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Comment Feed */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-violet-600" />
                  <span>Interactive Comment Feed</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top-liked comments tagged with automated sentiment badges.
                  {activeKeywordTag && (
                    <span className="font-bold text-violet-600 ml-1">
                      Filtering by tag: "{activeKeywordTag}"
                    </span>
                  )}
                </p>
              </div>

              {/* Sentiment filter pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto flex-wrap">
                {(['All', 'Positive', 'Constructive/Feedback', 'Question/Pain Point'] as const).map((filterVal) => (
                  <button
                    key={filterVal}
                    onClick={() => setSentimentFilter(filterVal)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      sentimentFilter === filterVal
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filterVal === 'All' ? 'All Comments' : filterVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments List */}
            {filteredComments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <p className="font-bold">No comments matched the current filter.</p>
                <button
                  onClick={() => {
                    setSentimentFilter('All');
                    setActiveKeywordTag(null);
                  }}
                  className="mt-2 text-violet-600 underline font-semibold cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 hover:bg-slate-50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{comment.author}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{comment.publishedAt}</span>
                        </div>
                      </div>

                      {/* Sentiment Badge */}
                      <div className="shrink-0">
                        {getSentimentBadge(comment.sentiment)}
                      </div>
                    </div>

                    {/* Comment text */}
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      {comment.text}
                    </p>

                    {/* Footer: Likes and matching tag */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/50">
                      <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                        <span>{comment.likeCount.toLocaleString()} likes</span>
                      </div>

                      {comment.matchingTag && (
                        <span className="text-[10px] font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          #{comment.matchingTag}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
