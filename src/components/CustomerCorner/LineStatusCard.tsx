import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, Power, Loader2, Zap, CalendarClock, CalendarPlus } from 'lucide-react';
import type { UserDetails } from '@/types/authTypes';

interface LineStatusCardProps {
  details: UserDetails;
  onExtendClick: () => void;
  extending: boolean;
}

/** A line is considered expired when paidTill is in the past. */
export function isExpired(paidTill: string | null): boolean {
  if (!paidTill) return false;
  const t = Date.parse(paidTill);
  if (Number.isNaN(t)) return false;
  // Compare against the start of today.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return t < today.getTime();
}

const LineStatusCard: React.FC<LineStatusCardProps> = ({ details, onExtendClick, extending }) => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar';

  const online = details.status === 'online';
  const expired = isExpired(details.paidTill);
  const StatusIcon = online ? Wifi : WifiOff;

  return (
    <Card className="shadow-sm border md:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg text-gray-900 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ${font}`}>
          <Wifi className="w-5 h-5 text-coolnet-purple" />
          {t('customerCorner.dashboard.lineStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex flex-wrap items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Online / offline badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border
            ${online ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <StatusIcon className={`w-4 h-4 ${online ? 'text-green-600' : 'text-gray-500'}`} />
            <span className={`font-semibold ${online ? 'text-green-600' : 'text-gray-500'} ${font}`}>
              {online ? t('customerCorner.dashboard.online') : t('customerCorner.dashboard.offline')}
            </span>
          </div>

          {expired && (
            <Button
              onClick={onExtendClick}
              disabled={extending}
              className={`bg-coolnet-orange hover:bg-coolnet-orange/90 text-white ${font}`}
            >
              {extending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Power className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('customerCorner.dashboard.extend')}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Detail grid */}
        <div className="mt-6 pt-4 border-t border-gray-100 grid sm:grid-cols-3 gap-5">
          <Detail
            icon={<Zap className="w-5 h-5 text-coolnet-purple" />}
            label={t('customerCorner.dashboard.serviceType')}
            value={details.serviceType || '—'}
            isRTL={isRTL}
            font={font}
          />
          <Detail
            icon={<CalendarClock className="w-5 h-5 text-coolnet-purple" />}
            label={t('customerCorner.dashboard.paidTill')}
            value={details.paidTill || '—'}
            valueClass={expired ? 'text-red-600' : 'text-gray-900'}
            ltr
            isRTL={isRTL}
            font={font}
          />
          <Detail
            icon={<CalendarPlus className="w-5 h-5 text-coolnet-purple" />}
            label={t('customerCorner.dashboard.totalExtendDays')}
            value={String(details.totalExtendDays ?? 0)}
            ltr
            isRTL={isRTL}
            font={font}
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface DetailProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  ltr?: boolean;
  isRTL: boolean;
  font: string;
}

const Detail: React.FC<DetailProps> = ({ icon, label, value, valueClass = 'text-gray-900', ltr, isRTL, font }) => (
  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
    <div className="w-10 h-10 bg-coolnet-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className={isRTL ? 'text-right' : ''}>
      <p className={`text-gray-500 text-sm ${font}`}>{label}</p>
      <p className={`font-semibold ${valueClass} ${font}`} dir={ltr ? 'ltr' : undefined}>{value}</p>
    </div>
  </div>
);

export default LineStatusCard;
