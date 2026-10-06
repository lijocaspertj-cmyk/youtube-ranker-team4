import React, { useState, useEffect } from 'react';
import { Users, Eye, Video, Plus, Trash2, RefreshCw, BarChart3, Trophy, Sparkles, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { ChannelItem } from '../types';
import { fetchChannelStats } from '../services/api';

interface ChannelBenchmarkProps {
  mockMode: boolean;
  hasKey: boolean;
  onOpenKeyModal: () => void;
}

interface ChannelCardData {
  handle: string;
  data: ChannelItem | null;
  loading: boolean;
  error: string | null;
}

const PRESET_BENCHMARKS = [
  { label: '@mkbhd vs @mrbeast', handles: ['mkbhd', 'mrbeast'] },
  { label: '@veritasium vs @LinusTechTips', handles: ['veritasium', 'LinusTechTips'] },
  { label: '@fireship vs @lexfridman', handles: ['fireship', 'lexfridman'] },
  { label: '@athleanx vs @JeffNippard', handles: ['athleanx', 'JeffNippard'] },
];

export const ChannelBenchmark: React.FC<ChannelBenchmarkProps> = ({
  mockMode,
  hasKey,
  onOpenKeyModal,
}) => {
  const [channels, setChannels] = useState<ChannelCardData[]>([
    { handle: 'mkbhd', data: null, loading: false, error: null },
    { handle: 'mrbeast', data: null, loading: false, error: null },
  ]);
  const [handleInput, setHandleInput] = useState('');
  const [chartView, setChartView] = useState<'both' | 'views' | 'efficiency'>('both');

  const loadChannel = async (index: number, handle: string) => {
    const clean = handle.trim().replace(/^@/, '');
    if (!clean) return;

    setChannels(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], handle: clean, loading: true, error: null };
      }
      return next;
    });

    try {
      const res = await fetchChannelStats(clean, true, undefined, mockMode);
      if (res.items && res.items.length > 0) {
        setChannels(prev => {
          const next = [...prev];
          if (next[index]) {
            next[index] = { ...next[index], data: res.items[0], loading: false, error: null };
          }
          return next;
        });
      } else {
        setChannels(prev => {
          const next = [...prev];
          if (next[index]) {
            next[index] = { ...next[index], data: null, loading: false, error: 'Channel not found' };
          }
          return next;
        });
      }
    } catch (err: any) {
      setChannels(prev => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { ...next[index], data: null, loading: false, error: err.message || 'Fetch failed' };
        }
        return next;
      });
    }
  };

  const loadPreset = (handlesList: string[]) => {
    const initial: ChannelCardData[] = handlesList.map(h => ({
      handle: h,
      data: null,
      loading: true,
      error: null
    }));
    setChannels(initial);
    handlesList.forEach((h, idx) => {
      loadChannel(idx, h);
    });
  };

  useEffect(() => {
    loadPreset(['mkbhd', 'mrbeast']);
  }, [mockMode]);

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = handleInput.trim().replace(/^@/, '');
    if (!clean) return;
    if (channels.length >= 4) return;

    const newIdx = channels.length;
    setChannels(prev => [...prev, { handle: clean, data: null, loading: true, error: null }]);
    setHandleInput('');
    loadChannel(newIdx, clean);
  };

  const handleRemoveChannel = (index: number) => {
    if (channels.length <= 2) return;
    setChannels(prev => prev.filter((_, i) => i !== index));
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

  // Channel Metrics & Leaders
  const loadedList = channels.filter(c => c.data !== null);
  const maxSubs = Math.max(...loadedList.map(c => parseInt(c.data!.statistics.subscriberCount || '0', 10)), 0);
  const maxViews = Math.max(...loadedList.map(c => parseInt(c.data!.statistics.viewCount || '0', 10)), 0);
  const maxVideos = Math.max(...loadedList.map(c => parseInt(c.data!.statistics.videoCount || '0', 10)), 0);
  const maxAvgViews = Math.max(...loadedList.map(c => {
    const v = parseInt(c.data!.statistics.viewCount || '0', 10);
    const count = parseInt(c.data!.statistics.videoCount || '1', 10);
    return Math.round(v / Math.max(1, count));
  }), 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 p-6 sm:p-10 text-white shadow-xl shadow-rose-600/15">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3 border border-white/20">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Feature 1: Direct Channel Health Benchmarking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Direct Channel Health Benchmarking
          </h1>
          <p className="mt-2 text-sm sm:text-base text-rose-100 font-medium">
            Side-by-side comparison matrix evaluating Subscriber Reach, Total Views, Video Uploads, and calculated Average View Efficiency (Total Views / Total Videos).
          </p>

          {/* Quick Presets */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-rose-200">Preset Matchups:</span>
            {PRESET_BENCHMARKS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(preset.handles)}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Input Bar to Add Channels */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-800">Compare Channels ({channels.length}/4)</span>
            {mockMode && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                Mock Mode Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Type any creator handle with or without @ (e.g. @mkbhd, @mrbeast, @veritasium)
          </p>
        </div>

        {channels.length < 4 ? (
          <form onSubmit={handleAddChannel} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">@</span>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="mkbhd, mrbeast..."
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Channel</span>
            </button>
          </form>
        ) : (
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            Max 4 channels reached
          </span>
        )}
      </div>

      {/* Side-by-Side Comparison Matrix / Cards */}
      <div className={`grid grid-cols-1 ${channels.length === 2 ? 'md:grid-cols-2' : channels.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6`}>
        {channels.map((chan, idx) => {
          const subs = chan.data ? parseInt(chan.data.statistics.subscriberCount || '0', 10) : 0;
          const views = chan.data ? parseInt(chan.data.statistics.viewCount || '0', 10) : 0;
          const videos = chan.data ? parseInt(chan.data.statistics.videoCount || '0', 10) : 0;
          const avgViews = videos > 0 ? Math.round(views / videos) : 0;

          const isSubLeader = maxSubs > 0 && subs === maxSubs;
          const isViewLeader = maxViews > 0 && views === maxViews;
          const isEfficiencyLeader = maxAvgViews > 0 && avgViews === maxAvgViews;

          return (
            <div
              key={idx}
              className="relative bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Label, Leader tags & Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wide">
                      Channel #{idx + 1}
                    </span>
                    {isEfficiencyLeader && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-emerald-600" />
                        Top Efficiency
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => loadChannel(idx, chan.handle)}
                      title="Refresh Channel"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${chan.loading ? 'animate-spin text-rose-500' : ''}`} />
                    </button>
                    {channels.length > 2 && (
                      <button
                        onClick={() => handleRemoveChannel(idx)}
                        title="Remove Channel"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Identity: Avatar, Channel Title, Handle */}
                {chan.loading ? (
                  <div className="py-14 flex flex-col items-center justify-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mb-2" />
                    <span className="text-xs font-bold">Fetching @{chan.handle}...</span>
                  </div>
                ) : chan.error ? (
                  <div className="py-10 text-center text-red-500 text-xs">
                    <p className="font-bold">Failed to load @{chan.handle}</p>
                    <p className="mt-1">{chan.error}</p>
                    <button
                      onClick={() => loadChannel(idx, chan.handle)}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-bold text-xs cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                ) : chan.data ? (
                  <>
                    <div className="flex items-center gap-3.5 mb-5">
                      <img
                        src={chan.data.snippet.thumbnails.high?.url || chan.data.snippet.thumbnails.medium?.url || chan.data.snippet.thumbnails.default?.url}
                        alt={chan.data.snippet.title}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                      />
                      <div className="overflow-hidden">
                        <h3 className="font-black text-base text-slate-900 truncate">
                          {chan.data.snippet.title}
                        </h3>
                        <p className="text-xs text-rose-600 font-bold truncate">
                          {chan.data.snippet.customUrl || `@${chan.handle}`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Joined {new Date(chan.data.snippet.publishedAt).getFullYear()}
                        </p>
                      </div>
                    </div>

                    {/* Matrix Metrics */}
                    <div className="space-y-3">
                      
                      {/* Metric 1: Subscriber Count */}
                      <div className={`p-3.5 rounded-2xl border transition-all ${isSubLeader ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-500 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-rose-500" />
                            Subscriber Count
                          </span>
                          {isSubLeader && (
                            <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              👑 Top Subs
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-black text-slate-900">{formatNumber(subs)}</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                          <div
                            className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${maxSubs > 0 ? (subs / maxSubs) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 2: Total View Count */}
                      <div className={`p-3.5 rounded-2xl border transition-all ${isViewLeader ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-500 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
                            Total View Count
                          </span>
                          {isViewLeader && (
                            <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              👑 Most Views
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-black text-slate-900">{formatNumber(views)}</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${maxViews > 0 ? (views / maxViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 3: Total Video Uploads */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-500 flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-violet-500" />
                            Total Video Uploads
                          </span>
                        </div>
                        <p className="text-xl font-black text-slate-900">{videos.toLocaleString()} videos</p>
                      </div>

                      {/* Metric 4: Calculated Metric (Average Views per Video) */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        isEfficiencyLeader ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400/20' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            Avg Views / Video
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            Total Views / Videos
                          </span>
                        </div>
                        <p className="text-2xl font-black text-emerald-700">{formatNumber(avgViews)}</p>
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">
                          {avgViews > 1_000_000 ? 'Viral scale per release' : 'Solid audience consistency'}
                        </p>
                      </div>

                    </div>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual: Bar Chart Comparing Total Views & Average View Efficiency */}
      {loadedList.length >= 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                <BarChart3 className="w-4 h-4" />
                <span>Visual Comparison Matrix</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Channel Volume vs Average View Efficiency
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmark Total Views (Lifetime Reach) alongside Average Views per Video (Publishing Efficiency).
              </p>
            </div>

            {/* Chart toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setChartView('both')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartView === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dual Metrics
              </button>
              <button
                type="button"
                onClick={() => setChartView('views')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartView === 'views' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Total Views
              </button>
              <button
                type="button"
                onClick={() => setChartView('efficiency')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartView === 'efficiency' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Avg Views / Video
              </button>
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="space-y-6 pt-2">
            {loadedList.map((chan, idx) => {
              const views = parseInt(chan.data!.statistics.viewCount || '0', 10);
              const videos = parseInt(chan.data!.statistics.videoCount || '1', 10);
              const avg = Math.round(views / Math.max(1, videos));

              const viewsPct = maxViews > 0 ? (views / maxViews) * 100 : 0;
              const efficiencyPct = maxAvgViews > 0 ? (avg / maxAvgViews) * 100 : 0;

              return (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={chan.data!.snippet.thumbnails.default?.url}
                        alt={chan.data!.snippet.title}
                        className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-black text-sm text-slate-900">{chan.data!.snippet.title}</span>
                        <span className="ml-2 text-xs text-slate-500 font-mono">@{chan.handle}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        {formatNumber(views)} views
                      </span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {formatNumber(avg)} avg/video
                      </span>
                    </div>
                  </div>

                  {/* Bars container */}
                  <div className="space-y-2">
                    {/* Total Views Bar */}
                    {(chartView === 'both' || chartView === 'views') && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                            Total Views Benchmark
                          </span>
                          <span className="font-mono text-slate-700">{viewsPct.toFixed(1)}% of max</span>
                        </div>
                        <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${Math.max(4, viewsPct)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Efficiency Bar */}
                    {(chartView === 'both' || chartView === 'efficiency') && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                            Average Views per Video (Efficiency)
                          </span>
                          <span className="font-mono text-slate-700">{efficiencyPct.toFixed(1)}% of max</span>
                        </div>
                        <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${Math.max(4, efficiencyPct)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Efficiency Key Insight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-extrabold text-emerald-950">Calculated Efficiency Takeaway: </span>
              {loadedList.length >= 2 && (
                <span>
                  <strong>{loadedList.reduce((prev, curr) => {
                    const prevAvg = parseInt(prev.data!.statistics.viewCount || '0', 10) / Math.max(1, parseInt(prev.data!.statistics.videoCount || '1', 10));
                    const currAvg = parseInt(curr.data!.statistics.viewCount || '0', 10) / Math.max(1, parseInt(curr.data!.statistics.videoCount || '1', 10));
                    return currAvg > prevAvg ? curr : prev;
                  }).data!.snippet.title}</strong>{' '}
                  achieves the highest view efficiency per upload, generating more views per piece of content published.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
