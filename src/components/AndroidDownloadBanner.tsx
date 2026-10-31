import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Smartphone, ShieldCheck, Zap, FileDown, Check } from 'lucide-react';

export const AndroidDownloadBanner: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, install, markAsDownloaded } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('skycast_banner_dismissed') === 'true';
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);

  // If already installed/downloaded or dismissed locally, do NOT show
  if (isInstalled || dismissed) {
    return null;
  }

  const triggerApkDownload = () => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = '/downloads/SkyCast-Weather-v2.5.apk';
    link.setAttribute('download', 'SkyCast-Weather-v2.5.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInstallClick = async () => {
    triggerApkDownload();
    setShowModal(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('skycast_banner_dismissed', 'true');
  };

  return (
    <>
      <div className="w-full rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#062638] to-slate-900 border border-emerald-500/40 p-3.5 sm:p-4 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
        {/* Glow decorative accent */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex-shrink-0">
            {/* Android Icon */}
            <svg className="w-6 h-6 fill-current text-emerald-400" viewBox="0 0 24 24">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.997-3.459a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.1 12 8.1c-1.8533 0-3.5902.3116-5.1365.8499L4.8412 5.447a.4162.4162 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.997 3.459C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-sm font-bold text-white tracking-tight">
                Download SkyCast App for Android
              </h4>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                APK v2.5
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-normal">
              Download the standalone Android APK package. Install directly on your device with instant live cloud maps and offline forecast telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center z-10">
          <button
            onClick={handleInstallClick}
            className="water-droplet-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-emerald-300 font-bold text-xs shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download APK</span>
          </button>

          <button
            onClick={handleDismiss}
            className="water-droplet-btn p-2 rounded-full text-slate-400 hover:text-white cursor-pointer"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Helper guide modal if prompt is not triggered immediately */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#09152b] border border-[#D8E4ED] dark:border-emerald-500/40 p-6 shadow-2xl text-[#172B3A] dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8E4ED] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-display text-base font-bold text-[#172B3A] dark:text-white">SkyCast Android Package (.apk)</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[#687D8F] hover:text-[#172B3A] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {downloadStarted ? 'Downloading SkyCast-Weather-v2.5.apk...' : 'Ready to Download'}
                </span>
                <p className="text-[11px] text-[#526779] dark:text-slate-400 mt-0.5">Standalone Android Package Installer file</p>
              </div>
            </div>

            <div className="mt-3.5 space-y-2 text-xs text-[#172B3A] dark:text-slate-200">
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800 flex items-start gap-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">1.</span>
                <span>Open <strong>SkyCast-Weather-v2.5.apk</strong> in your notifications or phone <strong>Downloads</strong> folder.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800 flex items-start gap-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">2.</span>
                <span>If asked to allow install from unknown sources, tap <strong>Settings</strong> & enable <strong>Allow</strong>.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800 flex items-start gap-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">3.</span>
                <span>Tap <strong>Install</strong>. SkyCast will install as a native standalone app!</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={triggerApkDownload}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                <span>Download APK Again</span>
              </button>

              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#00AFCB]/15 hover:bg-[#00AFCB]/25 text-[#00AFCB] dark:text-cyan-300 border border-[#00AFCB]/30 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Or Install as Web App (Direct)</span>
                </button>
              )}
              <button
                onClick={() => {
                  markAsDownloaded();
                  setShowModal(false);
                }}
                className="w-full py-2 rounded-xl bg-[#F4F8FC] hover:bg-slate-200 dark:bg-slate-800 text-[#172B3A] dark:text-slate-200 font-semibold text-xs transition cursor-pointer border border-[#D8E4ED] dark:border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>I've Installed The App</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
