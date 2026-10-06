import React, { useState, useEffect } from 'react';
import { Terminal, Shield, CheckCircle2, AlertTriangle, RefreshCw, Key, Server, Copy, Check, ExternalLink, Code2 } from 'lucide-react';
import { HealthResponse } from '../types';
import { fetchHealth, getStoredKeyId, setStoredKeyId } from '../services/api';

interface ServerlessHubProps {
  hasKey: boolean;
  onKeyChange: () => void;
}

export const ServerlessHub: React.FC<ServerlessHubProps> = ({ hasKey, onKeyChange }) => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealthData(data);
    } catch (err: any) {
      setError(err.message || 'Health check failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setKeyInput(getStoredKeyId());
    loadHealth();
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredKeyId(keyInput);
    onKeyChange();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    loadHealth();
  };

  const handleClearKey = () => {
    setKeyInput('');
    setStoredKeyId('');
    onKeyChange();
    loadHealth();
  };

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sampleCurlVideo = `curl -X GET "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=dQw4w9WgXcQ" \\
  -H "KeyId: ${keyInput || 'YOUR_GOOGLE_KEY_ID'}"`;

  const sampleCurlChannel = `curl -X GET "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=mkbhd" \\
  -H "KeyId: ${keyInput || 'YOUR_GOOGLE_KEY_ID'}"`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-xl shadow-blue-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
              <Server className="w-3.5 h-3.5 text-cyan-200" />
              <span>Project Root `/api` Serverless Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Serverless Connection & Endpoints</h1>
            <p className="text-sm text-blue-100 font-medium mt-1">
              Google YouTube Data API proxy with automatic <code className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-xs">KeyId</code> header injection.
            </p>
          </div>

          <button
            onClick={loadHealth}
            disabled={loading}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Ping /api/health</span>
          </button>
        </div>
      </div>

      {/* Key ID Configuration Card */}
      <div className="bg-white rounded-3xl border border-blue-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Google KeyId Configuration</h2>
              <p className="text-xs text-slate-500">
                Keys are never hardcoded. Enter manually here or provide via <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">GOOGLE_KEY_ID</code> env variable.
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${hasKey ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {hasKey ? 'KeyId Loaded' : 'No Key Set (Preview Active)'}
          </span>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Google Key ID / YouTube API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste your Google KeyId here (e.g. AIzaSy...)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Every request sent to Google will attach header: <strong className="font-mono text-slate-700">KeyId: &lt;Google_KEY_ID&gt;</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Save & Apply KeyId</span>
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Clear Key
              </button>
            )}
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                Key successfully stored!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Registered Endpoints from /api/health */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Active Serverless Endpoints</h2>
              <p className="text-xs text-slate-500">Root folder: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">/api/</code></p>
            </div>
          </div>
          {healthData && (
            <span className="text-xs font-mono text-slate-400">
              Uptime: {healthData.uptimeSeconds}s
            </span>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {healthData?.endpoints.map((ep, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-100 text-blue-800">
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {ep.path}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{ep.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Live Ready
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Snippets for Google API Verification */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Google API Request Header Verification</h2>
            <p className="text-xs text-slate-500">
              Confirming implementation of <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">KeyId: &lt;Google_KEY_ID&gt;</code>
            </p>
          </div>
        </div>

        {/* Video cURL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>1. YouTube Video Stats (1 unit)</span>
            <button
              onClick={() => copyCode(sampleCurlVideo, 1)}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedIndex === 1 ? 'Copied' : 'Copy cURL'}
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto">
            <pre>{sampleCurlVideo}</pre>
          </div>
        </div>

        {/* Channel cURL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>2. YouTube Channel Numbers (1 unit)</span>
            <button
              onClick={() => copyCode(sampleCurlChannel, 2)}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedIndex === 2 ? 'Copied' : 'Copy cURL'}
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto">
            <pre>{sampleCurlChannel}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
