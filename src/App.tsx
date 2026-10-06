/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TopicRankChecker } from './components/TopicRankChecker';
import { ChannelInspector } from './components/ChannelInspector';
import { VideoInspector } from './components/VideoInspector';
import { SoraStudio } from './components/SoraStudio';
import { ServerlessHub } from './components/ServerlessHub';
import { KeyModal } from './components/KeyModal';
import { getStoredKeyId } from './services/api';
import { Youtube, Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'rank' | 'channel' | 'video' | 'sora' | 'api'>('rank');
  const [targetHandle, setTargetHandle] = useState<string>('mkbhd');
  const [targetVideoId, setTargetVideoId] = useState<string>('dQw4w9WgXcQ');
  const [targetTopic, setTargetTopic] = useState<string>('Technology & AI');
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [keyModalOpen, setKeyModalOpen] = useState<boolean>(false);

  const checkKey = () => {
    setHasKey(Boolean(getStoredKeyId()));
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleInspectChannel = (handle: string) => {
    setTargetHandle(handle);
    setActiveTab('channel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectVideo = (videoId: string) => {
    setTargetVideoId(videoId);
    setActiveTab('video');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateSora = (topic: string) => {
    setTargetTopic(topic);
    setActiveTab('sora');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-rose-500 selection:text-white flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasKey={hasKey}
        onOpenKeyModal={() => setKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'rank' && (
          <TopicRankChecker
            onInspectChannel={handleInspectChannel}
            onInspectVideo={handleInspectVideo}
            onGenerateSora={handleGenerateSora}
            hasKey={hasKey}
            onOpenKeyModal={() => setKeyModalOpen(true)}
          />
        )}

        {activeTab === 'channel' && (
          <ChannelInspector
            initialHandle={targetHandle}
            hasKey={hasKey}
            onOpenKeyModal={() => setKeyModalOpen(true)}
          />
        )}

        {activeTab === 'video' && (
          <VideoInspector
            initialVideoId={targetVideoId}
            hasKey={hasKey}
            onOpenKeyModal={() => setKeyModalOpen(true)}
          />
        )}

        {activeTab === 'sora' && (
          <SoraStudio initialTopic={targetTopic} />
        )}

        {activeTab === 'api' && (
          <ServerlessHub
            hasKey={hasKey}
            onKeyChange={checkKey}
          />
        )}
      </main>

      {/* Modal for Google KeyId */}
      <KeyModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        onKeySaved={checkKey}
      />

      {/* Vibrant Footer */}
      <footer className="mt-auto border-t border-rose-100 bg-white/80 backdrop-blur-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <Youtube className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800">Youtube experts</span>
            <span>·</span>
            <span>Google Data API v3 Topic Rank Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Required Header: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">KeyId: &lt;Google_KEY_ID&gt;</code>
            </span>
            <span>·</span>
            <span>Serverless routes mounted in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/api</code></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
