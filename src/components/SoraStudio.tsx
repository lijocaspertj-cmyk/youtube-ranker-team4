import React, { useState } from 'react';
import { Sparkles, Video, Clapperboard, Clock, Play, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { SoraResponse } from '../types';
import { generateSoraScenes } from '../services/api';

interface SoraStudioProps {
  initialTopic?: string;
}

export const SoraStudio: React.FC<SoraStudioProps> = ({ initialTopic = 'Tech Gadgets 2026' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [prompt, setPrompt] = useState(`Create a high-energy YouTube Short explaining the future of ${initialTopic} with photorealistic cinematic visuals.`);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoraResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateSoraScenes(prompt, topic);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to process Sora video plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            <span>Serverless Video AI Studio (/api/sora.ts)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Sora AI Storyboard Generator</h1>
          <p className="text-sm text-orange-100 font-medium mt-1">
            Generate viral high-retention video prompt sequences for YouTube Shorts & Videos directly using your serverless <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs">/api/sora</code> endpoint.
          </p>
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleGenerate} className="mt-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-orange-100 uppercase tracking-wider block mb-1">
                Target Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setPrompt(`Create a high-energy YouTube Short explaining the future of ${e.target.value} with photorealistic cinematic visuals.`);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-white text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-orange-100 uppercase tracking-wider block mb-1">
                Video Prompt
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs sm:text-sm hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 shadow-md"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-amber-400" />}
            <span>Dispatch to /api/sora</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-white rounded-3xl border border-amber-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">Job: {result.jobId}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  {result.status}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">{result.topic}</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {result.durationSeconds}s runtime
              </span>
              <span>·</span>
              <span className="font-semibold">{result.aspectRatio}</span>
              <span>·</span>
              <span className="font-bold text-amber-600 uppercase">{result.quality}</span>
            </div>
          </div>

          {/* Scenes Timeline */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-orange-500" />
              <span>Storyboard Sequence & Pacing</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {result.scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/50 to-orange-50/30 border border-amber-100 flex flex-col sm:flex-row sm:items-start gap-4"
                >
                  <div className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-500 text-white font-mono text-xs font-bold text-center">
                    Scene #{idx + 1}
                    <div className="text-[10px] opacity-90">{scene.timestamp}</div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      "{scene.visualPrompt}"
                    </p>
                    <p className="text-xs text-orange-700 font-medium">
                      Pacing: {scene.narrationPacing}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
