import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone, Check, Sparkles } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install, markAsDownloaded } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already downloaded/installed, completely suppress and do NOT show the download option
  if (isInstalled) {
    return null;
  }

  const handleDownloadClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      const success = await install();
      setIsInstalling(false);
      if (success) return;
    }
    // If deferred prompt is not directly available, show the helper guide
    setShowGuide(true);
  };

  return (
    <>
      <button
        onClick={handleDownloadClick}
        className="flex-shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer ring-1 ring-emerald-400/40"
        title="Download SkyCast App for Android"
      >
        {/* Android Robot SVG Icon */}
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.997-3.459a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.1 12 8.1c-1.8533 0-3.5902.3116-5.1365.8499L4.8412 5.447a.4162.4162 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.997 3.459C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
        </svg>
        <span>Download App {isAndroid ? '(Android)' : ''}</span>
      </button>

      {/* Android & Mobile App Installation Modal */}
      {showGuide && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#09152b] border border-[#D8E4ED] dark:border-emerald-500/40 p-5 sm:p-6 shadow-2xl text-[#172B3A] dark:text-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#D8E4ED] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#172B3A] dark:text-white">Download SkyCast Android App</h3>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-normal">Free • Instant Offline • No PlayStore Login</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-xl hover:bg-[#F4F8FC] dark:hover:bg-slate-800 text-[#687D8F] hover:text-[#172B3A] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#172B3A] dark:text-slate-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">1</span>
                <span>Open in <strong>Chrome</strong> or your Android Browser. Tap the <strong>three dots (⋮)</strong> at the top right.</span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00AFCB] text-white flex items-center justify-center font-bold text-[11px]">2</span>
                <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-[11px]">3</span>
                <span>Tap <strong>Install</strong>. SkyCast will download and launch with full offline capabilities!</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowGuide(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Now (1-Tap Install)</span>
                </button>
              )}

              <button
                onClick={() => {
                  markAsDownloaded();
                  setShowGuide(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#F4F8FC] hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#172B3A] dark:text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-[#D8E4ED] dark:border-slate-700"
              >
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>I Have Installed The App</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

