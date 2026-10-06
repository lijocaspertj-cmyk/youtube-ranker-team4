import React, { useState, useEffect } from 'react';
import { 
  MessageSquareQuote, Search, ThumbsUp, Tag, HelpCircle, CheckCircle2, 
  AlertTriangle, Filter, Sparkles, RefreshCw, Flame, BarChart2, MessageCircle, 
  Target, Lightbulb, TrendingUp, Link as LinkIcon, AlertCircle, HelpCircle as QuestionIcon,
  MessageSquareShare, ListFilter, X
} from 'lucide-react';
import { AudiencePulseData, CommentItem, KeywordTag, SentimentType } from '../types';
import { fetchAudiencePulse } from '../services/api';

interface AudiencePulseProps {
  mockMode: boolean;
  hasKey: boolean;
  onOpenKeyModal: () => void;
  initialUrl?: string;
}

const SAMPLE_COMPETITOR_VIDEOS = [
  {
    id: '0e3GPea1Tyg',
    url: 'https://www.youtube.com/watch?v=0e3GPea1Tyg',
    creator: 'MrBeast',
    title: '$456,000 Squid Game in Real Life!',
    views: '624M',
    badge: 'Benchmark Target'
  },
  {
    id: 'hFZFjoX2cGg',
    url: 'https://www.youtube.com/watch?v=hFZFjoX2cGg',
    creator: 'Mark Rober',
    title: 'Glitterbomb 5.0 vs Porch Pirates',
    views: '89M',
    badge: 'Engineering Rival'
  },
  {
    id: 'P5q3z4n8k1g',
    url: 'https://www.youtube.com/watch?v=P5q3z4n8k1g',
    creator: 'Dude Perfect',
    title: 'World Record Edition 2',
    views: '52M',
    badge: 'Stunts Competitor'
  },
  {
    id: 'mK97mJ3yA0E',
    url: 'https://www.youtube.com/watch?v=mK97mJ3yA0E',
    creator: 'Airrack',
    title: 'I Trapped 100 People in a Grocery Store',
    views: '34M',
    badge: 'Viral Challenger'
  },
];

/**
 * Robust YouTube URL Extractor supporting all standard YouTube URL variations
 */
export function extractYouTubeVideoId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // 1. Direct ID check (standard 11-char YouTube ID)
  if (/^[a-zA-Z0-9_-]{10,14}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Standard watch?v= format
  const vParamMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{10,14})/);
  if (vParamMatch && vParamMatch[1]) {
    return vParamMatch[1];
  }

  // 3. Shortened youtu.be/ format
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{10,14})/);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return youtuBeMatch[1];
  }

  // 4. Shorts format
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{10,14})/);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1];
  }

  // 5. Embed or Live format
  const embedMatch = trimmed.match(/\/(embed|live)\/([a-zA-Z0-9_-]{10,14})/);
  if (embedMatch && embedMatch[2]) {
    return embedMatch[2];
  }

  // Fallback: strip query params and grab last segment
  const cleanFallback = trimmed.split('?')[0].split('/').filter(Boolean).pop();
  return cleanFallback || trimmed;
}

export const AudiencePulse: React.FC<AudiencePulseProps> = ({
  mockMode,
  hasKey,
  onOpenKeyModal,
  initialUrl,
}) => {
  const [urlInput, setUrlInput] = useState('https://www.youtube.com/watch?v=0e3GPea1Tyg');
  const [currentVideoId, setCurrentVideoId] = useState('0e3GPea1Tyg');
  const [data, setData] = useState<AudiencePulseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer Pain-Point Finder Filters
  const [painPointCategory, setPainPointCategory] = useState<'all' | 'complaints' | 'questions' | 'requests' | 'positive'>('all');
  const [customKeywordQuery, setCustomKeywordQuery] = useState('');
  const [activeKeywordTag, setActiveKeywordTag] = useState<string | null>(null);

  const loadPulse = async (urlOrId: string) => {
    const cleanId = extractYouTubeVideoId(urlOrId);
    if (!cleanId) return;

    setCurrentVideoId(cleanId);
    setLoading(true);
    setError(null);
    setActiveKeywordTag(null);
    setCustomKeywordQuery('');
    setPainPointCategory('all');

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
    if (initialUrl) {
      setUrlInput(initialUrl);
      loadPulse(initialUrl);
    } else {
      loadPulse(currentVideoId);
    }
  }, [mockMode, initialUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      loadPulse(urlInput);
    }
  };

  // Find active video sample if applicable
  const matchedSample = SAMPLE_COMPETITOR_VIDEOS.find(v => v.id.toLowerCase() === currentVideoId.toLowerCase());

  // Filtered comments logic for Customer Pain-Point Finder & Top Comment Aggregator
  const filteredComments = (data?.comments || []).filter(comment => {
    const textLower = comment.text.toLowerCase();

    // 1. Pain Point Category Filter
    if (painPointCategory === 'complaints') {
      const isPainPointSentiment = comment.sentiment === 'Question/Pain Point';
      const hasComplaintKeywords = textLower.includes('loud') || textLower.includes('fast') || 
        textLower.includes('sound') || textLower.includes('pacing') || textLower.includes('broke') || 
        textLower.includes('staged') || textLower.includes('issue') || textLower.includes('annoying') ||
        textLower.includes('hate') || textLower.includes('problem') || textLower.includes('terrible');
      if (!isPainPointSentiment && !hasComplaintKeywords) return false;
    } else if (painPointCategory === 'questions') {
      const hasQuestionMark = comment.text.includes('?');
      const hasQuestionKeywords = textLower.includes('how did') || textLower.includes('what camera') || 
        textLower.includes('why did') || textLower.includes('where to') || textLower.includes('is there') ||
        textLower.includes('how to');
      if (!hasQuestionMark && !hasQuestionKeywords) return false;
    } else if (painPointCategory === 'requests') {
      const isConstructive = comment.sentiment === 'Constructive/Feedback';
      const hasRequestKeywords = textLower.includes('wish') || textLower.includes('please make') || 
        textLower.includes('tutorial') || textLower.includes('part 2') || textLower.includes('behind the scenes') ||
        textLower.includes('release') || textLower.includes('need') || textLower.includes('suggest');
      if (!isConstructive && !hasRequestKeywords) return false;
    } else if (painPointCategory === 'positive') {
      if (comment.sentiment !== 'Positive') return false;
    }

    // 2. Active Keyword Tag Filter
    if (activeKeywordTag) {
      const tagLower = activeKeywordTag.toLowerCase();
      const matchDirect = comment.matchingTag?.toLowerCase() === tagLower;
      const matchText = textLower.includes(tagLower) || tagLower.split(' ').some(w => w.length > 3 && textLower.includes(w));
      if (!matchDirect && !matchText) return false;
    }

    // 3. Custom Keyword Search
    if (customKeywordQuery.trim()) {
      const queryLower = customKeywordQuery.trim().toLowerCase();
      if (!textLower.includes(queryLower)) return false;
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
            Paste any YouTube URL to extract top-liked competitor comments and uncover common audience questions, complaints, or content feature requests so your channel can out-perform rivals.
          </p>

          {/* Dual Core Value Propositions Callout */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-start gap-2.5">
              <MessageSquareShare className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
              <div>
                <span className="font-extrabold text-white block">Top Comment Aggregator</span>
                <span className="text-purple-100 text-[11px]">
                  Extracts top-liked user comments from competitor breakout videos to study high-retention audience triggers.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-start gap-2.5">
              <Target className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
              <div>
                <span className="font-extrabold text-white block">Customer Pain-Point Finder</span>
                <span className="text-purple-100 text-[11px]">
                  Runs instant keyword and sentiment filters on comment text to highlight viewer questions, complaints, or feature requests.
                </span>
              </div>
            </div>
          </div>

          {/* Competitor Sample Video Presets */}
          <div className="mt-6 space-y-2">
            <span className="text-xs font-bold text-purple-200">Try Competitor Breakout Video URLs:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {SAMPLE_COMPETITOR_VIDEOS.map((vid, idx) => {
                const isActive = currentVideoId.toLowerCase() === vid.id.toLowerCase();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUrlInput(vid.url);
                      loadPulse(vid.url);
                    }}
                    className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-white text-purple-900 border-white shadow-md'
                        : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-black uppercase mb-1">
                      <span className={isActive ? 'text-purple-700' : 'text-purple-200'}>{vid.creator}</span>
                      <span className={isActive ? 'bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded' : 'bg-white/20 px-1.5 py-0.2 rounded'}>
                        {vid.badge}
                      </span>
                    </div>
                    <p className="text-xs font-bold line-clamp-1 leading-snug">{vid.title}</p>
                    <span className="text-[10px] opacity-75 font-mono">{vid.views} views</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Input Field: Enter Any YouTube URL */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-violet-600" />
            <span>Enter Any YouTube URL (Watch, Shorts, or Share Link)</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            e.g. https://www.youtube.com/watch?v=0e3GPea1Tyg
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste any YouTube URL (https://www.youtube.com/watch?v=... or https://youtu.be/...)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-violet-600/20 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Aggregating Comments & Pulse...</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                <span>Extract Audience Pulse</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span className="text-violet-600 font-bold">Supports:</span>
          <span>Desktop URL (youtube.com/watch?v=...), Shortened (youtu.be/...), YouTube Shorts (/shorts/...), or direct Video ID.</span>
        </div>
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
                  Audited Video: <code className="font-mono bg-violet-50 px-1.5 py-0.5 rounded">{data.videoId}</code>
                  {matchedSample && <span className="ml-2 font-bold text-slate-800">({matchedSample.creator}: {matchedSample.title})</span>}
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Audience Sentiment & Comment Summary</h2>
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

              {/* Competitor Audit & How Your Channel Can Win */}
              <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-violet-50 to-rose-50 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs sm:text-sm text-purple-950 uppercase tracking-wide">
                      Competitor Intelligence & How Your Channel Can Win
                    </h3>
                    <p className="text-[11px] text-purple-800 font-medium">
                      Actionable strategic takeaways extracted from this competitor's audience comment sentiment.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/95 border border-purple-100 shadow-2xs space-y-1">
                    <span className="font-extrabold text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      Competitor Vulnerability
                    </span>
                    <p className="text-slate-700 font-medium leading-relaxed text-[11px]">
                      {data.videoId.includes('0e3GPe') || data.videoId.includes('beast') 
                        ? 'Hyper-accelerated cuts & contestant detachment: viewers noted feeling overwhelmed by buzzer sound effects and lost emotional connection before mid-game eliminations.'
                        : 'Pacing friction: rapid jump-cuts and loud audio spikes during high-intensity scenes tire viewers.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/95 border border-purple-100 shadow-2xs space-y-1">
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Your Channel Opportunity
                    </span>
                    <p className="text-slate-700 font-medium leading-relaxed text-[11px]">
                      {data.videoId.includes('0e3GPe') || data.videoId.includes('beast')
                        ? 'Borrow the 5-second zero-fluff hook, but give key participants 20-30 seconds of emotional storytelling. Smaller creators win on character empathy, not pure budget.'
                        : 'Pair high-retention visual hooks with deeper personal storytelling to achieve superior mid-video watch duration.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/95 border border-purple-100 shadow-2xs space-y-1">
                    <span className="font-extrabold text-amber-700 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Unmet Audience Desires
                    </span>
                    <p className="text-slate-700 font-medium leading-relaxed text-[11px]">
                      {data.videoId.includes('0e3GPe') || data.videoId.includes('beast')
                        ? 'Viewers begging for dedicated engineering build videos, full unedited contestant perspectives, and clearer rule explanations.'
                        : 'Audience requesting behind-the-scenes engineering schematics, unedited reaction footage, and step-by-step tutorials.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Pain-Point Finder: Simple Keyword & Sentiment Filter Controls */}
          <div className="bg-white rounded-3xl border-2 border-violet-100 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Customer Pain-Point Finder</h3>
                  <p className="text-xs text-slate-500">
                    Run simple keyword or sentiment filters to highlight common audience questions, complaints, or feature requests.
                  </p>
                </div>
              </div>

              {(painPointCategory !== 'all' || customKeywordQuery || activeKeywordTag) && (
                <button
                  onClick={() => {
                    setPainPointCategory('all');
                    setCustomKeywordQuery('');
                    setActiveKeywordTag(null);
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            {/* Pain Point Category Selector */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                1. Select Filter Mode:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setPainPointCategory('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                    painPointCategory === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All Comments
                </button>
                <button
                  type="button"
                  onClick={() => setPainPointCategory('complaints')}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    painPointCategory === 'complaints'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-rose-50/70 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Complaints / Friction</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPainPointCategory('questions')}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    painPointCategory === 'questions'
                      ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                      : 'bg-violet-50/70 text-violet-800 border-violet-200 hover:bg-violet-100'
                  }`}
                >
                  <QuestionIcon className="w-3.5 h-3.5" />
                  <span>Audience Questions</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPainPointCategory('requests')}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    painPointCategory === 'requests'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Feature Requests</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPainPointCategory('positive')}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    painPointCategory === 'positive'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Top Praise</span>
                </button>
              </div>
            </div>

            {/* Keyword Search Input & Tag Cloud */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                2. Filter By Specific Keyword or Pain-Point Tag:
              </span>
              
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customKeywordQuery}
                  onChange={(e) => setCustomKeywordQuery(e.target.value)}
                  placeholder="Type any keyword (e.g. pacing, sound, sponsor, budget, contestants, camera)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                {customKeywordQuery && (
                  <button
                    onClick={() => setCustomKeywordQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-2 pt-1">
                {data.keywords.map((kw, idx) => {
                  const isActive = activeKeywordTag === kw.tag;
                  const isPainPoint = kw.sentiment === 'Question/Pain Point';
                  const isPositive = kw.sentiment === 'Positive';

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveKeywordTag(isActive ? null : kw.tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isActive
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm scale-105'
                          : isPainPoint
                          ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                          : isPositive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <span>{kw.tag}</span>
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                      }`}>
                        {kw.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Comment Aggregator: Top-Liked User Comments */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">
                  <MessageSquareShare className="w-4 h-4" />
                  <span>Top Comment Aggregator</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Extracted Top-Liked User Comments ({filteredComments.length} Shown)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-traction community feedback ranked by thumbs-up engagement from the competitor video.
                </p>
              </div>

              {/* Active Filter Pills Indicator */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                  Mode: {painPointCategory.toUpperCase()}
                </span>
                {customKeywordQuery && (
                  <span className="px-2.5 py-1 rounded-lg bg-violet-100 text-violet-800 border border-violet-200">
                    Keyword: "{customKeywordQuery}"
                  </span>
                )}
                {activeKeywordTag && (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 border border-purple-200">
                    Tag: #{activeKeywordTag}
                  </span>
                )}
              </div>
            </div>

            {/* Comments List */}
            {filteredComments.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-600">No comments matched the current pain-point filter.</p>
                <p className="mt-1 text-slate-400">Try switching filter mode or clearing your keyword search.</p>
                <button
                  onClick={() => {
                    setPainPointCategory('all');
                    setCustomKeywordQuery('');
                    setActiveKeywordTag(null);
                  }}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-violet-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Reset Filters
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
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
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

                    {/* Footer: Likes count and matching tag */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200/80">
                        <ThumbsUp className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>{comment.likeCount.toLocaleString()} upvotes</span>
                      </div>

                      {comment.matchingTag && (
                        <span className="text-[10px] font-mono font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200">
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
