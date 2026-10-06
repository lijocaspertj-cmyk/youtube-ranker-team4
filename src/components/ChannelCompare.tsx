import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Users, Eye, Video, Trophy, Sparkles, Plus, Trash2, RefreshCw, BarChart2, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import { ChannelItem } from '../types';
import { fetchChannelStats } from '../services/api';

interface ChannelCompareProps {
  hasKey: boolean;
  onOpenKeyModal: () => void;
  onInspectChannel: (handle: string) => void;
}

interface ChannelCompareData {
  handle: string;
  data: ChannelItem | null;
  loading: boolean;
  error: string | null;
}

const PRESET_MATCHUPS = [
  {
    title: 'Tech Kings',
    handles: ['mkbhd', 'Mrwhosetheboss', 'LinusTechTips'],
    color: 'from-blue-600 to-indigo-600'
  },
  {
    title: 'AI & Dev Titans',
    handles: ['fireship', 'lexfridman'],
    color: 'from-violet-600 to-purple-600'
  },
  {
    title: 'Science & Education',
    handles: ['veritasium', 'TwoMinutePapers'],
    color: 'from-amber-500 to-rose-500'
  },
  {
    title: 'Fitness Science',
    handles: ['athleanx', 'JeffNippard'],
    color: 'from-emerald-600 to-teal-600'
  }
];

export const ChannelCompare: React.FC<ChannelCompareProps> = ({
  hasKey,
  onOpenKeyModal,
  onInspectChannel
}) => {
  const [channels, setChannels] = useState<ChannelCompareData[]>([
    { handle: 'mkbhd', data: null, loading: false, error: null },
    { handle: 'Mrwhosetheboss', data: null, loading: false, error: null }
  ]);
  const [newHandleInput, setNewHandleInput] = useState('');

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
      const res = await fetchChannelStats(clean, true);
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
          next[index] = { ...next[index], data: null, loading: false, error: err.message || 'Failed to fetch' };
        }
        return next;
      });
    }
  };

  const loadAll = (targetHandles: string[]) => {
    const initial: ChannelCompareData[] = targetHandles.map(h => ({
      handle: h,
      data: null,
      loading: true,
      error: null
    }));
    setChannels(initial);

    targetHandles.forEach((h, idx) => {
      loadChannel(idx, h);
    });
  };

  useEffect(() => {
    loadAll(['mkbhd', 'Mrwhosetheboss']);
  }, []);

  const handleAddChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newHandleInput.trim().replace(/^@/, '');
    if (!clean) return;
    if (channels.length >= 4) return;

    const newIndex = channels.length;
    setChannels(prev => [...prev, { handle: clean, data: null, loading: true, error: null }]);
    setNewHandleInput('');
    loadChannel(newIndex, clean);
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

  // Find leaders across loaded channels
  const loadedChannels = channels.filter(c => c.data !== null);
  const maxSubs = Math.max(...loadedChannels.map(c => parseInt(c.data!.statistics.subscriberCount || '0', 10)), 0);
  const maxViews = Math.max(...loadedChannels.map(c => parseInt(c.data!.statistics.viewCount || '0', 10)), 0);
  const maxVideos = Math.max(...loadedChannels.map(c => parseInt(c.data!.statistics.videoCount || '0', 10)), 0);
  const maxAvgViews = Math.max(...loadedChannels.map(c => {
    const v = parseInt(c.data!.statistics.viewCount || '0', 10);
    const count = parseInt(c.data!.statistics.videoCount || '1', 10);
    return Math.round(v / Math.max(1, count));
  }), 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-fuchsia-600 via-rose-600 to-amber-500 text-white shadow-xl shadow-rose-500/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Head-to-Head Channel Benchmarks</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Channel Numbers Comparison</h1>
            <p className="text-sm sm:text-base text-rose-100 font-medium mt-1">
              Compare 2 to 4 YouTube channels side-by-side using Google API metrics. Identify audience leaders, view share, and content velocity.
            </p>
          </div>

          <button
            onClick={onOpenKeyModal}
            className={`self-start sm:self-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              hasKey
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-white text-rose-700 hover:bg-rose-50'
            }`}
          >
            {hasKey ? 'KeyId Connected' : 'Set Google KeyId'}
          </button>
        </div>

        {/* Preset Matchups */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <span className="text-xs font-bold text-rose-100">Featured Matchups:</span>
          {PRESET_MATCHUPS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => loadAll(preset.handles)}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 flex items-center gap-1.5"
            >
              <span>{preset.title}</span>
              <span className="text-[10px] opacity-80 font-mono">({preset.handles.join(' vs ')})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Channel Input Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span>Comparing {channels.length} Channels</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">Add up to 4 creators to evaluate head-to-head</span>
        </div>

        {channels.length < 4 && (
          <form onSubmit={handleAddChannel} className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">@</span>
              <input
                type="text"
                value={newHandleInput}
                onChange={(e) => setNewHandleInput(e.target.value)}
                placeholder="Add handle (e.g. mrbeast)"
                className="pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 w-48"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        )}
      </div>

      {/* Side-by-Side Channel Cards */}
      <div className={`grid grid-cols-1 ${channels.length === 2 ? 'md:grid-cols-2' : channels.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6`}>
        {channels.map((chan, idx) => {
          const subs = chan.data ? parseInt(chan.data.statistics.subscriberCount || '0', 10) : 0;
          const views = chan.data ? parseInt(chan.data.statistics.viewCount || '0', 10) : 0;
          const videos = chan.data ? parseInt(chan.data.statistics.videoCount || '0', 10) : 0;
          const avgViews = videos > 0 ? Math.round(views / videos) : 0;

          const isSubLeader = maxSubs > 0 && subs === maxSubs;
          const isViewLeader = maxViews > 0 && views === maxViews;
          const isAvgViewLeader = maxAvgViews > 0 && avgViews === maxAvgViews;

          return (
            <div
              key={idx}
              className="relative bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with Remove and Reload */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                      Channel #{idx + 1}
                    </span>
                    {isSubLeader && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-600" />
                        Sub Leader
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => loadChannel(idx, chan.handle)}
                      title="Reload Channel Numbers"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${chan.loading ? 'animate-spin text-rose-500' : ''}`} />
                    </button>
                    {channels.length > 2 && (
                      <button
                        onClick={() => handleRemoveChannel(idx)}
                        title="Remove from comparison"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Identity */}
                {chan.loading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mb-2" />
                    <span className="text-xs font-semibold">Pulling Google stats for @{chan.handle}...</span>
                  </div>
                ) : chan.error ? (
                  <div className="py-8 text-center text-red-500 text-xs">
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
                    <div className="flex items-center gap-3 mb-4">
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

                    {/* Stats Metric Blocks */}
                    <div className="space-y-3 mt-4">
                      {/* Subscribers */}
                      <div className={`p-3 rounded-2xl border transition-all ${isSubLeader ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-500 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-rose-500" />
                            Subscribers
                          </span>
                          {isSubLeader && <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">👑 TOP</span>}
                        </div>
                        <p className="text-2xl font-black text-slate-900">{formatNumber(subs)}</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${maxSubs > 0 ? (subs / maxSubs) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Total Views */}
                      <div className={`p-3 rounded-2xl border transition-all ${isViewLeader ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-500 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
                            Total Views
                          </span>
                          {isViewLeader && <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">👑 TOP</span>}
                        </div>
                        <p className="text-2xl font-black text-slate-900">{formatNumber(views)}</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${maxViews > 0 ? (views / maxViews) * 100 : 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Videos Count */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-500 flex items-center gap-1">
                            <Video className="w-3.5 h-3.5 text-violet-500" />
                            Uploaded Videos
                          </span>
                        </div>
                        <p className="text-xl font-black text-slate-900">{videos.toLocaleString()}</p>
                      </div>

                      {/* Avg Views per Video */}
                      <div className={`p-3 rounded-2xl border transition-all ${isAvgViewLeader ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-500 flex items-center gap-1">
                            <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
                            Avg Views / Video
                          </span>
                          {isAvgViewLeader && <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">⚡ HIGHEST</span>}
                        </div>
                        <p className="text-xl font-black text-slate-900">{formatNumber(avgViews)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Average reach efficiency</p>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Inspect Button */}
              {chan.data && (
                <button
                  onClick={() => onInspectChannel(chan.handle)}
                  className="mt-5 w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Detailed Statistics</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Insights Summary Matrix */}
      {loadedChannels.length >= 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Head-to-Head Leaders & Share Breakdown</h2>
              <p className="text-xs text-slate-500">
                Audience volume breakdown computed from live Google Data endpoints.
              </p>
            </div>
          </div>

          {/* Matrix table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Creator</th>
                  <th className="pb-3">Subscribers</th>
                  <th className="pb-3">Total Views</th>
                  <th className="pb-3">Uploads</th>
                  <th className="pb-3">Avg Views / Upload</th>
                  <th className="pb-3">View-to-Sub Multiple</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {loadedChannels.map((c, idx) => {
                  const s = parseInt(c.data!.statistics.subscriberCount || '0', 10);
                  const v = parseInt(c.data!.statistics.viewCount || '0', 10);
                  const vid = parseInt(c.data!.statistics.videoCount || '0', 10);
                  const avg = vid > 0 ? Math.round(v / vid) : 0;
                  const ratio = s > 0 ? (v / s).toFixed(1) : '0';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-bold flex items-center gap-2">
                        <img
                          src={c.data!.snippet.thumbnails.default?.url}
                          alt={c.data!.snippet.title}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <span className="truncate max-w-[140px]">{c.data!.snippet.title}</span>
                      </td>
                      <td className="py-3 font-bold text-slate-900">{formatNumber(s)}</td>
                      <td className="py-3 font-bold text-slate-900">{formatNumber(v)}</td>
                      <td className="py-3">{vid.toLocaleString()}</td>
                      <td className="py-3 font-bold text-emerald-600">{formatNumber(avg)}</td>
                      <td className="py-3 font-mono font-bold text-rose-600">{ratio}x</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
