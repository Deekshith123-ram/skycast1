import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Check, Smartphone, ShieldCheck, FileDown, ExternalLink } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isAndroid, install, markAsDownloaded } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  // If already downloaded/installed, completely suppress
  if (isInstalled) {
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

  const handleDownloadClick = async () => {
    // 1. Immediately initiate APK file download
    triggerApkDownload();
    // 2. Open guidance modal explaining how to open the downloaded APK and install it
    setShowGuide(true);
  };

  return (
    <>
      <button
        onClick={handleDownloadClick}
        className="flex-shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer ring-1 ring-emerald-400/40"
        title="Download SkyCast App APK for Android"
      >
        {/* Android Robot SVG Icon */}
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.997-3.459a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.1 12 8.1c-1.8533 0-3.5902.3116-5.1365.8499L4.8412 5.447a.4162.4162 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.997 3.459C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
        </svg>
        <span>Download APK</span>
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
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Standalone APK • Offline Ready • v2.5</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-xl hover:bg-[#F4F8FC] dark:hover:bg-slate-800 text-[#687D8F] hover:text-[#172B3A] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Download Status Banner */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {downloadStarted ? 'Downloading SkyCast-Weather-v2.5.apk' : 'Ready to Download APK'}
                </span>
                <p className="text-[11px] text-[#526779] dark:text-slate-400 mt-0.5">Package: com.skycast.karnataka.weather (.apk)</p>
              </div>
            </div>

            {/* Steps to Install APK */}
            <div className="mt-3.5 space-y-2.5 text-xs text-[#172B3A] dark:text-slate-300">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px]">1</span>
                <span>Open the downloaded <strong>SkyCast-Weather-v2.5.apk</strong> from your notification bar or <strong>Downloads</strong> folder.</span>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00AFCB] text-white flex items-center justify-center font-bold text-[11px]">2</span>
                <span>If prompted, tap <strong>Settings</strong> and enable <strong>Allow from this source</strong> (Install unknown apps).</span>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-[11px]">3</span>
                <span>Tap <strong>Install</strong>. SkyCast opens as a true standalone Android app with full offline weather telemetry!</span>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={triggerApkDownload}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                <span>Re-Download APK File (SkyCast-Weather-v2.5.apk)</span>
              </button>

              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowGuide(false);
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
                  setShowGuide(false);
                }}
                className="w-full py-2 rounded-xl bg-[#F4F8FC] hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#172B3A] dark:text-slate-200 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-[#D8E4ED] dark:border-slate-700"
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

