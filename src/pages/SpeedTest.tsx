import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, ArrowDown, ArrowUp, RotateCcw, Share2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSEO } from '@/hooks/use-seo';
import { useSpeedTest } from '@/hooks/useSpeedTest';
import { useToast } from '@/hooks/use-toast';
import SpeedTestGauge from '@/components/SpeedTestGauge';

const SpeedTest: React.FC = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const { isRunning, progress, results, error, startTest, stopTest } = useSpeedTest();
  const { toast } = useToast();

  useSEO({
    title: t('speedTest.seoTitle'),
    description: t('speedTest.seoDescription'),
    keywords: t('speedTest.seoKeywords'),
  });

  const getCurrentSpeed = (): number | null => {
    if (progress.currentSpeed) return progress.currentSpeed;
    if (progress.phase === 'complete') return results.downloadSpeed;
    return null;
  };

  const isComplete = progress.phase === 'complete';
  const isActive = isRunning || progress.phase === 'latency';

  const handleShare = () => {
    const text = `${t('speedTest.share.text')}\n⬇ ${t('speedTest.download')}: ${results.downloadSpeed ?? '--'} Mbps\n⬆ ${t('speedTest.upload')}: ${results.uploadSpeed ?? '--'} Mbps\n● ${t('speedTest.ping')}: ${results.latency ?? '--'} ms`;
    navigator.clipboard.writeText(text);
    toast({
      title: t('speedTest.share.copied'),
      description: t('speedTest.share.copiedDescription'),
    });
  };

  const getPhaseLabel = () => {
    switch (progress.phase) {
      case 'latency': return t('speedTest.testing.ping');
      case 'download': return t('speedTest.testing.download');
      case 'upload': return t('speedTest.testing.upload');
      default: return '';
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen pt-16"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #1a1035 0%, #0d0a1a 50%, #080612 100%)',
      }}
    >
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Phase indicator */}
        <div className="text-center h-10 flex items-center justify-center mt-4">
          <AnimatePresence mode="wait">
            {isActive && (
              <motion.div
                key={progress.phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2"
              >
                <span className="inline-block w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: progress.phase === 'upload' ? '#7c4dff' : '#ff6b35' }}
                />
                <span className="text-sm font-medium text-white/50 uppercase tracking-widest">
                  {getPhaseLabel()}
                </span>
              </motion.div>
            )}
            {isComplete && (
              <motion.span
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-white/30 uppercase tracking-widest"
              >
                {t('speedTest.complete')}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Gauge */}
        <div className="flex justify-center py-4">
          <SpeedTestGauge
            value={getCurrentSpeed()}
            maxValue={500}
            phase={progress.phase}
            onStart={() => startTest()}
          />
        </div>

        {/* Stop button while running */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center -mt-2 mb-4"
            >
              <button
                onClick={() => stopTest()}
                className="text-xs text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors"
              >
                {t('speedTest.stop')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-red-400 text-sm mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Results panel — always visible, updates live */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto"
        >
          {/* Main results row: Download / Upload */}
          <div className="grid grid-cols-2 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
            {/* Download */}
            <div className="p-6 flex flex-col items-center gap-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2">
                <ArrowDown className="w-4 h-4" style={{ color: '#ff6b35' }} />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t('speedTest.download')}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tabular-nums"
                  style={{
                    color: results.downloadSpeed !== null ? '#ff6b35' : 'rgba(255,255,255,0.15)',
                    textShadow: results.downloadSpeed !== null ? '0 0 20px rgba(255,107,53,0.2)' : 'none',
                  }}
                >
                  {results.downloadSpeed !== null ? results.downloadSpeed : '--'}
                </span>
                <span className="text-xs font-medium text-white/25">Mbps</span>
              </div>
            </div>

            {/* Upload */}
            <div className="p-6 flex flex-col items-center gap-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2">
                <ArrowUp className="w-4 h-4" style={{ color: '#7c4dff' }} />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t('speedTest.upload')}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tabular-nums"
                  style={{
                    color: results.uploadSpeed !== null ? '#7c4dff' : 'rgba(255,255,255,0.15)',
                    textShadow: results.uploadSpeed !== null ? '0 0 20px rgba(124,77,255,0.2)' : 'none',
                  }}
                >
                  {results.uploadSpeed !== null ? results.uploadSpeed : '--'}
                </span>
                <span className="text-xs font-medium text-white/25">Mbps</span>
              </div>
            </div>
          </div>

          {/* Secondary results: Ping */}
          <div className="mt-3 flex justify-center">
            <div
              className="flex items-center gap-4 px-6 py-3 rounded-xl border border-white/[0.06]"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Ping
                </span>
              </div>
              <span className="text-lg font-bold tabular-nums text-white/70">
                {results.latency !== null ? results.latency : '--'}
              </span>
              <span className="text-xs text-white/25">ms</span>
            </div>
          </div>
        </motion.div>

        {/* Action buttons after completion */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center gap-4 mt-8"
            >
              <button
                onClick={() => startTest()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all hover:bg-white/5"
              >
                <RotateCcw className="w-4 h-4" />
                {t('speedTest.button.retest')}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all hover:bg-white/5"
              >
                <Share2 className="w-4 h-4" />
                {t('speedTest.button.share')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Powered by / info footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-xs text-white/15">
            {t('speedTest.info.description3')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeedTest;
