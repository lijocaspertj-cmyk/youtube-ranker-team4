import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getStoredKeyId, setStoredKeyId } from '../services/api';

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const KeyModal: React.FC<KeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [keyInput, setKeyInput] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getStoredKeyId());
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredKeyId(keyInput);
    onKeySaved();
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setKeyInput('');
    setStoredKeyId('');
    onKeySaved();
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Google KeyId</h3>
            <p className="text-xs text-slate-500 font-medium">YouTube Data API Authentication</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          As instructed, no keys are hardcoded. Enter your Google KeyId or YouTube API Key below. All outgoing serverless requests will transmit the required header:
          <span className="block font-mono bg-slate-100 text-slate-800 p-2 rounded-lg mt-1 text-[11px] font-bold">
            KeyId: &lt;Google_KEY_ID&gt;
          </span>
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Google KeyId / API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="e.g. AIzaSy..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
            >
              Clear Key
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save KeyId</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
