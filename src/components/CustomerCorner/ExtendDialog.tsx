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

interface ExtendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

const ExtendDialog: React.FC<ExtendDialogProps> = ({ open, onOpenChange, onConfirm, loading }) => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
        <AlertDialogHeader>
          <AlertDialogTitle className={font}>
            {t('customerCorner.dashboard.extend')}
          </AlertDialogTitle>
          <AlertDialogDescription className={font}>
            {t('customerCorner.dashboard.extendConfirm')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={isRTL ? 'flex-row-reverse gap-2' : ''}>
          <AlertDialogCancel className={font} disabled={loading}>
            {t('common.close')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirm(); }}
            disabled={loading}
            className={`bg-coolnet-orange hover:bg-coolnet-orange/90 ${font}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('customerCorner.dashboard.extend')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExtendDialog;
