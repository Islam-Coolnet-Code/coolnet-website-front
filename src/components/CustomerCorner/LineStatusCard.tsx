import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Wifi,
  WifiOff,
  Power,
  Loader2,
  Zap,
  CalendarClock,
  CalendarPlus,
  Clock,
  Info,
  CheckCircle2,
  ShieldQuestion,
} from 'lucide-react';
import type { UserDetails } from '@/types/authTypes';
import { formatDateNumeric, formatDateTimeNumeric } from '@/utils/customerZone';

interface LineStatusCardProps {
  details: UserDetails;
  onExtendClick: () => void;
  /** Opens the one-time activation request form (used up self-service extends). */
  onRequestExtendClick: () => void;
  extending: boolean;
  requesting: boolean;
}

const LineStatusCard: React.FC<LineStatusCardProps> = ({
  details,
  onExtendClick,
  onRequestExtendClick,
  extending,
  requesting,
}) => {
  const { t } = useLanguage();
  const { font } = useFont();

  // Trust ONLY the upstream `expired` flag. The extend button is hidden unless the
  // account is explicitly expired (the paid_till date can precede the real
  // expiration, so it can't be used as the expiry signal).
  const expired = details.expired === true;
  // An expired line is never presented as online: upstream can still report a
  // lingering `online` session for an expired account, and showing "Connected"
  // next to an expiry notice contradicts the extend/renew call to action.
  // Expiry is its own state rather than a plain "Offline" — it names the reason
  // the line is down, which is what the extend button next to it acts on.
  const online = !expired && details.status === 'online';
  const StatusIcon = online ? Wifi : WifiOff;
  const statusLabel = expired
    ? t('customerCorner.dashboard.expiredStatus')
    : online
      ? t('customerCorner.dashboard.online')
      : t('customerCorner.dashboard.offline');
  const statusTone = expired
    ? { badge: 'bg-red-50 border-red-200', dot: 'bg-red-500', text: 'text-red-600' }
    : online
      ? { badge: 'bg-green-50 border-green-200', dot: 'bg-green-500 animate-pulse', text: 'text-green-600' }
      : { badge: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400', text: 'text-gray-500' };

  // Once the self-service allowance is gone, the only way back online through
  // the site is an approved request — so the button changes rather than
  // disappearing. Eligibility (the 12..20 extend-day window, nothing pending or
  // already granted) is decided upstream: outside it neither button shows and
  // the customer has to renew or call support.
  const request = details.extendRequest;
  const awaitingDecision = request?.status === 'pending';
  const limitReached = details.extendLimitReached === true;
  const showRequestButton = expired && details.canRequestExtend === true && !awaitingDecision;
  const showExtendButton = expired && !limitReached && !awaitingDecision;

  return (
    <Card className="shadow-sm border md:col-span-2 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg text-gray-900 flex items-center gap-2 ${font}`}>
          <Wifi className="w-5 h-5 text-coolnet-purple" />
          {t('customerCorner.dashboard.lineStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Online / offline / expired badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusTone.badge}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${statusTone.dot}`} />
            <StatusIcon className={`w-4 h-4 ${statusTone.text}`} />
            <span className={`font-semibold ${statusTone.text} ${font}`}>{statusLabel}</span>
          </div>

          <p className={`text-sm text-coolnet-purple flex-1 min-w-[12rem] ${font}`}>
            {t('customerCorner.dashboard.lineStatusNote')}
          </p>

          {showExtendButton && (
            <Button
              onClick={onExtendClick}
              disabled={extending}
              className={`bg-coolnet-orange hover:bg-coolnet-orange-dark text-white ${font}`}
            >
              {extending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Power className="w-4 h-4 me-2" />
                  {t('customerCorner.dashboard.extend')}
                </>
              )}
            </Button>
          )}

          {showRequestButton && (
            <Button
              onClick={onRequestExtendClick}
              disabled={requesting}
              className={`bg-coolnet-orange hover:bg-coolnet-orange-dark text-white ${font}`}
            >
              {requesting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldQuestion className="w-4 h-4 me-2" />
                  {t('customerCorner.dashboard.requestExtend')}
                </>
              )}
            </Button>
          )}
        </div>

        {/* One-time activation request state.
            A turned-down request is shown as what the customer can DO about it
            — settle the invoice — not as a rejection: the wording and the
            neutral styling both avoid a dead end, and the approver's internal
            note is never surfaced. */}
        {request && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl border p-3 ${
              request.status === 'approved'
                ? 'bg-green-50 border-green-200'
                : request.status === 'rejected'
                  ? 'bg-coolnet-purple/5 border-coolnet-purple/15'
                  : 'bg-amber-50 border-amber-200'
            }`}
          >
            {request.status === 'approved' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            ) : request.status === 'rejected' ? (
              <Info className="w-4 h-4 text-coolnet-purple shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p className={`text-sm text-gray-700 ${font}`}>
                {request.status === 'approved'
                  ? t('customerCorner.dashboard.requestStatusApproved').replace(
                      '{date}',
                      formatDateNumeric(request.newExpiration)
                    )
                  : request.status === 'rejected'
                    ? t('customerCorner.dashboard.requestStatusRejected')
                    : t('customerCorner.dashboard.requestStatusPending')}
              </p>
              {/* While it waits, the expected turnaround is the only thing the
                  customer can act on — repeat it here, not just at submit time. */}
              {request.status === 'pending' && (
                <p className={`text-sm text-gray-600 mt-0.5 ${font}`}>
                  {t('customerCorner.dashboard.requestProcessingTime')}
                </p>
              )}
              {request.requestedAt && (
                // Label stays in the page direction; only the timestamp is
                // forced LTR so it doesn't get reordered in Arabic.
                <p className={`text-xs text-gray-500 mt-1 ${font}`}>
                  {t('customerCorner.dashboard.requestSubmittedAt')}{' '}
                  <span dir="ltr">{formatDateTimeNumeric(request.requestedAt)}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Detail grid */}
        <div className="mt-6 pt-5 border-t border-gray-100 grid sm:grid-cols-3 gap-5">
          <Detail
            icon={<Zap className="w-5 h-5 text-coolnet-purple" />}
            label={t('customerCorner.dashboard.serviceType')}
            value={details.serviceType || '—'}
            font={font}
          />
          <Detail
            icon={<CalendarClock className="w-5 h-5 text-coolnet-purple" />}
            label={t('customerCorner.dashboard.paidTill')}
            value={formatDateNumeric(details.paidTill)}
            valueClass={expired ? 'text-red-600' : 'text-gray-900'}
            font={font}
          />
          <Detail
            icon={<CalendarPlus className="w-5 h-5 text-coolnet-purple" />}
            label={t('customerCorner.dashboard.totalExtendDays')}
            value={String(details.totalExtendDays ?? 0)}
            ltr
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
  font: string;
}

const Detail: React.FC<DetailProps> = ({ icon, label, value, valueClass = 'text-gray-900', ltr, font }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-coolnet-purple/10 rounded-lg flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className={`text-gray-500 text-sm ${font}`}>{label}</p>
      <p className={`font-semibold truncate ${valueClass} ${font}`} dir={ltr ? 'ltr' : undefined}>{value}</p>
    </div>
  </div>
);

export default LineStatusCard;
