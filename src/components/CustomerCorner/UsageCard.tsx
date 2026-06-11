import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Activity } from 'lucide-react';
import type { UsageData, UsageWindow } from '@/types/authTypes';
import { formatGb } from '@/utils/customerZone';

interface UsageCardProps {
  usage: UsageData;
}

const UsageCard: React.FC<UsageCardProps> = ({ usage }) => {
  const { t } = useLanguage();
  const { font } = useFont();

  const windows: { key: string; label: string; data: UsageWindow }[] = [
    { key: 'lastWeek', label: t('customerCorner.usage.lastWeek'), data: usage.lastWeek },
    { key: 'lastMonth', label: t('customerCorner.usage.lastMonth'), data: usage.lastMonth },
    { key: 'last3Months', label: t('customerCorner.usage.last3Months'), data: usage.last3Months },
  ];

  // Scale the bars relative to the largest value shown, so they read at a glance.
  const maxGb = Math.max(
    1,
    ...windows.flatMap((w) => [w.data.downloadGb ?? 0, w.data.uploadGb ?? 0])
  );
  const pct = (v: number) => `${Math.min(100, Math.round(((v ?? 0) / maxGb) * 100))}%`;

  return (
    <Card className="shadow-sm md:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg text-gray-900 flex items-center gap-2 ${font}`}>
          <Activity className="w-5 h-5 text-coolnet-purple" />
          {t('customerCorner.usage.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-3 gap-4">
          {windows.map((w) => (
            <div key={w.key} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-4">
              <p className={`text-sm font-semibold text-gray-700 ${font}`}>{w.label}</p>

              {/* Download */}
              <Metric
                icon={<Download className="w-4 h-4 text-green-600" />}
                iconBg="bg-green-100"
                barColor="bg-green-500"
                label={t('customerCorner.usage.download')}
                value={formatGb(w.data.downloadGb)}
                width={pct(w.data.downloadGb)}
                font={font}
              />

              {/* Upload */}
              <Metric
                icon={<Upload className="w-4 h-4 text-blue-600" />}
                iconBg="bg-blue-100"
                barColor="bg-blue-500"
                label={t('customerCorner.usage.upload')}
                value={formatGb(w.data.uploadGb)}
                width={pct(w.data.uploadGb)}
                font={font}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface MetricProps {
  icon: React.ReactNode;
  iconBg: string;
  barColor: string;
  label: string;
  value: string;
  width: string;
  font: string;
}

const Metric: React.FC<MetricProps> = ({ icon, iconBg, barColor, label, value, width, font }) => (
  <div>
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</span>
        <span className={`text-xs text-gray-500 truncate ${font}`}>{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900 shrink-0" dir="ltr">{value}</span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
      <div className={`h-full rounded-full ${barColor}`} style={{ width }} />
    </div>
  </div>
);

export default UsageCard;
