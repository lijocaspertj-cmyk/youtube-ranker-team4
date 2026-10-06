import React from 'react';
import { Youtube, Key, Radio, Sparkles, Video, Users, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'rank' | 'channel' | 'video' | 'sora' | 'api';
  setActiveTab: (tab: 'rank' | 'channel' | 'video' | 'sora' | 'api') => void;
  hasKey: boolean;
  onOpenKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasKey,
  onOpenKeyModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('rank')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Youtube className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                  Youtube experts
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                  RANK ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Topic Keyword Analyzer & Channel Intelligence</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('rank')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'rank'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4" />
              Rank by Topic
            </button>
            <button
              onClick={() => setActiveTab('channel')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'channel'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Radio className="w-4 h-4" />
              Channel Numbers
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'video'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Video className="w-4 h-4" />
              Video Stats
            </button>
            <button
              onClick={() => setActiveTab('sora')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'sora'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Sora AI Lab
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'api'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span className="font-mono text-[11px] font-bold">/api</span>
              Serverless Hub
            </button>
          </nav>

          {/* Key ID Configuration Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenKeyModal}
              className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                hasKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-xs'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              {hasKey ? (
                <>
                  <span className="hidden sm:inline">KeyId Connected</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </>
              ) : (
                <>
                  <span>Google KeyId</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('rank')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
              activeTab === 'rank' ? 'bg-red-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Rank by Topic
          </button>
          <button
            onClick={() => setActiveTab('channel')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
              activeTab === 'channel' ? 'bg-rose-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Channel Numbers
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
              activeTab === 'video' ? 'bg-violet-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Video Stats
          </button>
          <button
            onClick={() => setActiveTab('sora')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
              activeTab === 'sora' ? 'bg-amber-500 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Sora AI Lab
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
              activeTab === 'api' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Serverless Hub
          </button>
        </div>
      </div>
    </header>
  );
};
