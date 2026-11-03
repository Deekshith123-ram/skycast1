import React, { useState } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const AndroidDownloadBanner: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('skycast_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [showModal, setShowModal] = useState<boolean>(false);

  // If not on Android, already installed as PWA, or dismissed, do not render
  if (!isAndroid || isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    // When the browser prompt hasn't fired yet or is not directly triggerable, show step-by-step guidance
    setShowModal(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('skycast_banner_dismissed', 'true');
    } catch {}
  };

  return (
    <>
      <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#062638] to-slate-900 border border-emerald-500/40 p-3.5 sm:p-4 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
        {/* Glow decorative accent */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-sm font-bold text-white tracking-tight">
                Install SkyCast on your Phone
              </h4>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                PWA Web App
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-normal">
              Install SkyCast to your Home screen for fast offline access and radar telemetry. Updates automatically from the live website.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center z-10">
          <button
            onClick={handleInstallClick}
            className="water-droplet-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-emerald-300 font-bold text-xs shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install App</span>
          </button>

          <button
            onClick={handleDismiss}
            className="water-droplet-btn p-2 rounded-full text-slate-400 hover:text-white cursor-pointer"
            title="Dismiss banner"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* In-app modal for manual Chrome/Android instructions when beforeinstallprompt is not directly available */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#09152b] border border-[#D8E4ED] dark:border-emerald-500/40 p-5 sm:p-6 shadow-2xl text-[#172B3A] dark:text-slate-100">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#D8E4ED] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#172B3A] dark:text-white">Install SkyCast</h3>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Auto-Updating Web App</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-[#F4F8FC] dark:hover:bg-slate-800 text-[#687D8F] hover:text-[#172B3A] dark:hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-[#172B3A] dark:text-slate-300">
              <p className="font-medium text-[#172B3A] dark:text-slate-200">To install SkyCast from Google Chrome on Android:</p>
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">1</span>
                <span>Open this SkyCast website in <strong>Google Chrome</strong>.</span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00AFCB] text-white flex items-center justify-center font-bold text-[11px]">2</span>
                <span>Tap the Chrome menu button (<strong>⋮</strong> in top right).</span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-[11px]">3</span>
                <span>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong> and confirm.</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-[#526779] dark:text-slate-400">
              SkyCast will be added to your home screen and app launcher. Whenever a new version is released on Vercel, the app automatically updates.
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
