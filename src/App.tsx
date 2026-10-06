/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChannelBenchmark } from './components/ChannelBenchmark';
import { AudiencePulse } from './components/AudiencePulse';
import { NicheExplorer } from './components/NicheExplorer';
import { KeyModal } from './components/KeyModal';
import { CreditUpgradeModal } from './components/CreditUpgradeModal';
import { getStoredKeyId, getStoredMockMode, setStoredMockMode } from './services/api';
import { Activity, ShieldCheck, Zap, Layers, BarChart3, MessageSquareQuote, Search } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<'benchmark' | 'pulse' | 'niche' | 'all'>('benchmark');
  const [mockMode, setMockMode] = useState<boolean>(true);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [keyModalOpen, setKeyModalOpen] = useState<boolean>(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  
  // Credit Gating: starts at 18/20 Search Credits Left
  const [searchCredits, setSearchCredits] = useState<number>(18);
  const [maxCredits, setMaxCredits] = useState<number>(20);

  const checkKey = () => {
    setHasKey(Boolean(getStoredKeyId()));
  };

  useEffect(() => {
    checkKey();
    setMockMode(getStoredMockMode());
  }, []);

  const handleToggleMockMode = (mock: boolean) => {
    setMockMode(mock);
    setStoredMockMode(mock);
  };

  const handleConsumeCredit = (): boolean => {
    if (searchCredits <= 0) {
      setUpgradeModalOpen(true);
      return false;
    }
    setSearchCredits(prev => Math.max(0, prev - 1));
    return true;
  };

  const handleSimulateZeroCredits = () => {
    setSearchCredits(0);
  };

  const handleResetCredits = () => {
    setSearchCredits(18);
  };

  const handleUpgradeTier = (tier: 'pro' | 'agency') => {
    if (tier === 'pro') {
      setSearchCredits(100);
      setMaxCredits(100);
    } else {
      setSearchCredits(999);
      setMaxCredits(999);
    }
    setUpgradeModalOpen(false);
  };

  const handleAddDemoCredits = () => {
    setSearchCredits(prev => prev + 10);
    setUpgradeModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-500 selection:text-white flex flex-col">
      {/* 1. Top Navigation Bar */}
      <Header
        activeSection={activeSection === 'all' ? 'benchmark' : activeSection}
        setActiveSection={setActiveSection}
        mockMode={mockMode}
        onToggleMockMode={handleToggleMockMode}
        hasKey={hasKey}
        onOpenKeyModal={() => setKeyModalOpen(true)}
        searchCredits={searchCredits}
        maxCredits={maxCredits}
        onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Section View Mode Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveSection('benchmark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'benchmark'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>1. Channel Benchmarking</span>
            </button>
            <button
              onClick={() => setActiveSection('pulse')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'pulse'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>2. Audience Pulse</span>
            </button>
            <button
              onClick={() => setActiveSection('niche')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'niche'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>3. Market Explorer</span>
            </button>
          </div>

          <button
            onClick={() => setActiveSection(activeSection === 'all' ? 'benchmark' : 'all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
              activeSection === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{activeSection === 'all' ? 'Showing All 3 Sections' : 'View All 3 in Single Feed'}</span>
          </button>
        </div>

        {/* Section 1: Feature 1: Direct Channel Health Benchmarking (Main View) */}
        {(activeSection === 'benchmark' || activeSection === 'all') && (
          <section id="section-benchmark" className="mb-12">
            <ChannelBenchmark
              mockMode={mockMode}
              hasKey={hasKey}
              onOpenKeyModal={() => setKeyModalOpen(true)}
            />
          </section>
        )}

        {/* Section 2: Feature 2: "Audience Pulse" & Sentiment Analysis */}
        {(activeSection === 'pulse' || activeSection === 'all') && (
          <section id="section-pulse" className="mb-12">
            <AudiencePulse
              mockMode={mockMode}
              hasKey={hasKey}
              onOpenKeyModal={() => setKeyModalOpen(true)}
            />
          </section>
        )}

        {/* Section 3: Feature 3: On-Demand Niche Search (Gated Feature) */}
        {(activeSection === 'niche' || activeSection === 'all') && (
          <section id="section-niche" className="mb-12">
            <NicheExplorer
              mockMode={mockMode}
              hasKey={hasKey}
              onOpenKeyModal={() => setKeyModalOpen(true)}
              searchCredits={searchCredits}
              onConsumeCredit={handleConsumeCredit}
              onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
              onSimulateZeroCredits={handleSimulateZeroCredits}
              onResetCredits={handleResetCredits}
            />
          </section>
        )}

      </main>

      {/* Google KeyId Configuration Modal */}
      <KeyModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        onKeySaved={checkKey}
      />

      {/* Credit Tier Upgrade Modal ($29 Pro / $99 Agency) */}
      <CreditUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={handleUpgradeTier}
        onAddDemoCredits={handleAddDemoCredits}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-xs py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-black text-slate-800">ExpertTube</span>
            <span>·</span>
            <span>Channel Health & Competitor Audience Sentiment Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Pro Plan — {searchCredits}/{maxCredits} Credits Left</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{mockMode ? 'Mock Mode Enabled' : (hasKey ? 'Live API Key Connected' : 'Live Key Pending')}</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
