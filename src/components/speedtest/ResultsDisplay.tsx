import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import SpeedGauge from '../SpeedGauge';
import { TestResults, TestType } from '@/utils/speedTestCore';
import { COOLNET_COLORS } from '@/constants/colors';

interface ResultsDisplayProps {
  results: TestResults;
  currentSpeed: number | null;
  testType: TestType;
  isRunning: boolean;
  onRunAgain: () => void;
}

/**
 * Component to display speed test results and gauge
 */
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  currentSpeed,
  testType,
  isRunning,
  onRunAgain
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Gauge display with mobile responsiveness */}
      <div className="flex flex-col items-center justify-center py-4">
        <SpeedGauge 
          value={currentSpeed} 
          maxValue={1000} 
          unit="Mbps"
          testType={testType}
          animate={true}
          size={window.innerWidth < 640 ? "md" : "lg"}
        />
      </div>
      
      {/* Results cards with animation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-4">
        <ResultCard
          label={t('speedTest.downloadSpeed')}
          value={results.download}
          unit="Mbps"
          color={COOLNET_COLORS.purple.DEFAULT}
          delay={0.1}
        />

        <ResultCard
          label={t('speedTest.uploadSpeed')}
          value={results.upload}
          unit="Mbps"
          color={COOLNET_COLORS.orange.DEFAULT}
          delay={0.2}
        />

        <ResultCard
          label={t('speedTest.ping')}
          value={results.ping}
          unit="ms"
          color={COOLNET_COLORS.purple.DEFAULT}
          delay={0.3}
        />

        <ResultCard
          label={t('speedTest.jitter')}
          value={results.jitter}
          unit="ms"
          color={COOLNET_COLORS.orange.DEFAULT}
          delay={0.4}
        />
      </div>
      
      {/* Run again button */}
      {!isRunning && results.download !== null && (
        <div className="text-center pt-4">
          <Button
            size="lg"
            variant="outline"
            className="border-coolnet-purple text-coolnet-purple hover:bg-coolnet-purple hover:text-white transition-all duration-300"
            onClick={onRunAgain}
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('speedTest.runAgain')}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

// Helper component for individual result cards
interface ResultCardProps {
  label: string;
  value: number | null;
  unit: string;
  color: string;
  delay: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ label, value, unit, color, delay }) => {
  return (
    <motion.div
      className="bg-white p-4 rounded-xl shadow-md border border-gray-200 text-center flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-xl md:text-2xl font-bold" style={{ color }}>
        {value !== null ? `${value} ${unit}` : '--'}
      </div>
    </motion.div>
  );
};

export default ResultsDisplay;