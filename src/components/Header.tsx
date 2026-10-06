import React from 'react';
import { Activity, Key, CheckCircle2, Zap, Sliders, Sparkles, BarChart3, MessageSquareQuote, Search, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  activeSection: 'benchmark' | 'pulse' | 'niche';
  setActiveSection: (section: 'benchmark' | 'pulse' | 'niche') => void;
  mockMode: boolean;
  onToggleMockMode: (mock: boolean) => void;
  hasKey: boolean;
  onOpenKeyModal: () => void;
  searchCredits: number;
  maxCredits: number;
  onOpenUpgradeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  setActiveSection,
  mockMode,
  onToggleMockMode,
  hasKey,
  onOpenKeyModal,
  searchCredits,
  maxCredits,
  onOpenUpgradeModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* 1. Brand Logo: PulseTube */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setActiveSection('benchmark')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-500/20">
              <Activity className="w-5 h-5 stroke-[2.5] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 bg-clip-text text-transparent">
                  PulseTube
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  AI Intelligence
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Channel Health, Audience Pulse & Market Explorer</p>
            </div>
          </div>

          {/* 3 Main Sections Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveSection('benchmark')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSection === 'benchmark'
                  ? 'bg-white text-rose-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Channel Benchmarking</span>
            </button>
            <button
              onClick={() => setActiveSection('pulse')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSection === 'pulse'
                  ? 'bg-white text-rose-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>Audience Pulse</span>
            </button>
            <button
              onClick={() => setActiveSection('niche')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeSection === 'niche'
                  ? 'bg-white text-rose-600 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Market Explorer</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-extrabold">Gated</span>
            </button>
          </nav>

          {/* Right Controls: Tier Indicator & Settings Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active Tier Indicator */}
            <button
              onClick={onOpenUpgradeModal}
              title="Click to view subscription tiers"
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                searchCredits > 0
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/80 text-amber-900 hover:border-amber-300 shadow-xs'
                  : 'bg-red-50 border-red-300 text-red-800 animate-pulse'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${searchCredits > 0 ? 'text-amber-600 fill-amber-500' : 'text-red-600 fill-red-500'}`} />
              <span className="font-extrabold hidden sm:inline">
                Pro Plan — {searchCredits}/{maxCredits} Search Credits Left
              </span>
              <span className="font-extrabold sm:hidden">
                {searchCredits}/{maxCredits} Credits
              </span>
            </button>

            {/* Mode Toggle: Mock Data Mode vs Live API Key Mode */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onToggleMockMode(true)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  mockMode
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mock Data
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleMockMode(false);
                  if (!hasKey) {
                    onOpenKeyModal();
                  }
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  !mockMode
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Live API</span>
                {!mockMode && (
                  hasKey ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  )
                )}
              </button>
            </div>

            {/* Key config icon when in Live Mode */}
            {!mockMode && (
              <button
                onClick={onOpenKeyModal}
                title="Configure Google API Key"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  hasKey
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
                }`}
              >
                <Key className="w-4 h-4" />
              </button>
            )}

          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveSection('benchmark')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'benchmark' ? 'bg-rose-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Channel Health</span>
          </button>
          <button
            onClick={() => setActiveSection('pulse')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'pulse' ? 'bg-rose-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Audience Pulse</span>
          </button>
          <button
            onClick={() => setActiveSection('niche')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'niche' ? 'bg-rose-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Market Explorer</span>
          </button>
        </div>
      </div>
    </header>
  );
};
