import React, { useState } from 'react';
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed and running in standalone mode, hide button
  if (isInstalled) return null;

  const handleInstall = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setShowGuide(false);
        return;
      }
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        onClick={handleInstall}
        className="water-droplet-btn flex-shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-md cursor-pointer"
        title="Install SkyCast on this device"
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>

      {showGuide && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowGuide(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#09152b] border border-[#D8E4ED] dark:border-emerald-500/40 p-5 sm:p-6 shadow-2xl text-[#172B3A] dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8E4ED] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-display text-base font-bold">Install SkyCast</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-[#687D8F] hover:text-[#172B3A] dark:hover:text-white"
                aria-label="Close install guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAndroid ? (
              <div className="mt-4 space-y-3 text-sm text-[#526779] dark:text-slate-300">
                <p className="font-medium text-[#172B3A] dark:text-slate-200">To install SkyCast from Chrome on Android:</p>
                <ol className="list-decimal pl-5 space-y-2 text-xs">
                  <li>Open this website in <strong>Google Chrome</strong>.</li>
                  <li>Tap the Chrome menu (<strong>⋮</strong>).</li>
                  <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then confirm.</li>
                </ol>
                <p className="text-[11px] text-[#526779] dark:text-slate-400">
                  Updates deploy automatically whenever a new version is published.
                </p>
              </div>
            ) : isIOS ? (
              <div className="mt-4 space-y-3 text-sm text-[#526779] dark:text-slate-300">
                <p className="font-medium text-[#172B3A] dark:text-slate-200">To install SkyCast on iPhone or iPad:</p>
                <ol className="list-decimal pl-5 space-y-2 text-xs">
                  <li>Open SkyCast in <strong>Safari</strong>.</li>
                  <li>Tap the <Share className="inline w-3.5 h-3.5 mx-0.5 text-[#00AFCB]" /> <strong>Share</strong> button.</li>
                  <li>Scroll and choose <strong>Add to Home Screen</strong>.</li>
                </ol>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-[#526779] dark:text-slate-300">
                <p className="font-medium text-[#172B3A] dark:text-slate-200">In Chrome or Edge on Windows / Computer:</p>
                <ol className="list-decimal pl-5 space-y-2 text-xs">
                  <li>Look for the <strong>Install</strong> icon in the browser address bar (top right).</li>
                  <li>Or open the browser menu (<strong>⋮</strong> or <strong>⋯</strong>) &rarr; <strong>Apps</strong> / <strong>Install SkyCast</strong>.</li>
                  <li>Confirm installation to add SkyCast to your desktop and taskbar.</li>
                </ol>
                <p className="flex items-center gap-1.5 text-[11px] text-[#526779] dark:text-slate-400">
                  <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Runs as a standalone desktop app with automatic background updates.</span>
                </p>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
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

