import React from 'react';
import { X, Zap, Check, ShieldCheck, Sparkles, Building2, Rocket } from 'lucide-react';

interface CreditUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: 'pro' | 'agency') => void;
  onAddDemoCredits: () => void;
}

export const CreditUpgradeModal: React.FC<CreditUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  onAddDemoCredits,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-rose-500/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Upgrade Your Search Tier
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            Unlock high-frequency topic scraping, niche market intelligence, and unthrottled audience pulse audits.
          </p>
        </div>

        {/* 2 Tiers: $29 Pro vs $99 Agency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Pro Tier ($29) */}
          <div className="p-6 rounded-2xl border-2 border-rose-500 bg-rose-50/30 flex flex-col justify-between space-y-4 relative">
            <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase">
                <Rocket className="w-4 h-4" />
                <span>Pro Plan</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">$29</span>
                <span className="text-xs text-slate-500 font-bold">/ month</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                Designed for independent YouTube creators and boutique marketing strategists.
              </p>

              <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>100 Monthly Market Search Credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time Sentiment Scraping</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Engagement Score Heatmaps</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Standard API Priority</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onUpgrade('pro')}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
            >
              Upgrade to Pro ($29/mo)
            </button>
          </div>

          {/* Agency Tier ($99) */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase">
                <Building2 className="w-4 h-4" />
                <span>Agency Plan</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">$99</span>
                <span className="text-xs text-slate-500 font-bold">/ month</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-medium">
                For growth agencies managing multiple creator rosters and client benchmarking.
              </p>

              <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unlimited Market Search Credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Multi-seat Team Workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Automated Competitor Spike Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>One-Click CSV / PDF Export</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onUpgrade('agency')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Upgrade to Agency ($99/mo)
            </button>
          </div>

        </div>

        {/* Demo Test Helper */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Reviewing or testing the applet? Add demo credits instantly.</span>
          </div>
          <button
            onClick={onAddDemoCredits}
            className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors cursor-pointer shrink-0"
          >
            +10 Demo Search Credits
          </button>
        </div>

      </div>
    </div>
  );
};
