import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Activity } from 'lucide-react';
import type { UsageData, UsageWindow } from '@/types/authTypes';

interface UsageCardProps {
  usage: UsageData;
}

const formatGb = (gb: number): string => {
  if (gb >= 1024) return `${(gb / 1024).toFixed(2)} TB`;
  return `${(gb ?? 0).toFixed(2)} GB`;
};

const UsageCard: React.FC<UsageCardProps> = ({ usage }) => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar';

  const windows: { key: string; label: string; data: UsageWindow }[] = [
    { key: 'lastWeek', label: t('customerCorner.usage.lastWeek'), data: usage.lastWeek },
    { key: 'lastMonth', label: t('customerCorner.usage.lastMonth'), data: usage.lastMonth },
    { key: 'last3Months', label: t('customerCorner.usage.last3Months'), data: usage.last3Months },
  ];

  return (
    <Card className="shadow-sm md:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ${font}`}>
          <Activity className="w-5 h-5 text-coolnet-purple" />
          {t('customerCorner.usage.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-3 gap-4">
          {windows.map((w) => (
            <div key={w.key} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <p className={`text-sm font-medium text-gray-500 mb-3 ${isRTL ? 'text-right' : ''} ${font}`}>
                {w.label}
              </p>

              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Download className="w-4 h-4 text-green-600" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className={`text-xs text-gray-500 ${font}`}>{t('customerCorner.usage.download')}</p>
                  <p className="text-gray-900 font-semibold" dir="ltr">{formatGb(w.data.downloadGb)}</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-blue-600" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className={`text-xs text-gray-500 ${font}`}>{t('customerCorner.usage.upload')}</p>
                  <p className="text-gray-900 font-semibold" dir="ltr">{formatGb(w.data.uploadGb)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageCard;
