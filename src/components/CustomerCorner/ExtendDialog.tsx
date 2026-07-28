import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import campaignImage from '@/assets/camp.jpeg';

interface ExtendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

const ExtendDialog: React.FC<ExtendDialogProps> = ({ open, onOpenChange, onConfirm, loading }) => {
  const { t } = useLanguage();
  const { font } = useFont();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[92vw] max-w-[92vw] sm:max-w-md max-h-[92vh] overflow-y-auto p-0 gap-0">
        <AlertDialogHeader className="sr-only">
          <AlertDialogTitle className={font}>
            {t('customerCorner.dashboard.extend')}
          </AlertDialogTitle>
          <AlertDialogDescription className={font}>
            {t('customerCorner.dashboard.extendConfirm')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <img
          src={campaignImage}
          alt={t('customerCorner.dashboard.extend')}
          className="w-full h-auto max-h-[65vh] object-contain bg-coolnet-purple"
        />

        <AlertDialogFooter className="p-4 gap-2">
          <AlertDialogCancel className={`mt-0 ${font}`} disabled={loading}>
            {t('common.close')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirm(); }}
            disabled={loading}
            className={`bg-coolnet-orange hover:bg-coolnet-orange-dark ${font}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.ok')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExtendDialog;
