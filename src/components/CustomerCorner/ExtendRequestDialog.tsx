import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Loader2 } from 'lucide-react';
import campaignImage from '@/assets/camp.jpeg';

interface ExtendRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Sends the request; the reason is optional and free text. */
  onConfirm: (reason: string) => void;
  loading: boolean;
}

/**
 * Asks for a ONE-TIME activation once the self-service extensions are used up.
 *
 * Nothing happens to the line here — the request goes to Coolgate, where staff
 * approve or reject it. The copy says so, so the subscriber doesn't sit waiting
 * for the line to come back on its own.
 */
const ExtendRequestDialog: React.FC<ExtendRequestDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  loading,
}) => {
  const { t } = useLanguage();
  const { font } = useFont();
  const [reason, setReason] = useState('');

  // Drop what was typed when the dialog closes, so a re-open starts clean.
  const handleOpenChange = (next: boolean) => {
    if (!next) setReason('');
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="w-[92vw] max-w-[92vw] sm:max-w-md max-h-[92vh] overflow-y-auto">
        {/* Same campaign artwork as the plain extend dialog, so the two paths
            read as one flow. Capped well below the extend dialog's 65vh: here it
            shares the modal with a form, and on a short phone screen a taller
            image would push the send button off the first view. */}
        <img
          src={campaignImage}
          alt={t('customerCorner.dashboard.requestExtendTitle')}
          className="w-full h-auto max-h-[30vh] object-contain rounded-xl bg-coolnet-purple"
        />

        <AlertDialogHeader>
          <AlertDialogTitle className={`text-start ${font}`}>
            {t('customerCorner.dashboard.requestExtendTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className={`text-start leading-relaxed ${font}`}>
            {t('customerCorner.dashboard.requestExtendDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Set the expectation before they send, not only after. */}
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className={`text-sm text-gray-700 ${font}`}>
            {t('customerCorner.dashboard.requestProcessingTime')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="extendRequestReason" className={font}>
            {t('customerCorner.dashboard.requestReasonLabel')}
          </Label>
          <Textarea
            id="extendRequestReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('customerCorner.dashboard.requestReasonPlaceholder')}
            maxLength={500}
            rows={3}
            disabled={loading}
            className={font}
          />
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className={`mt-0 ${font}`} disabled={loading}>
            {t('common.close')}
          </AlertDialogCancel>
          <Button
            onClick={() => onConfirm(reason.trim())}
            disabled={loading}
            className={`bg-coolnet-orange hover:bg-coolnet-orange-dark text-white ${font}`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t('customerCorner.dashboard.requestSubmit')
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExtendRequestDialog;
