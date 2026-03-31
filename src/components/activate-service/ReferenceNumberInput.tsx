import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';

interface ReferenceNumberInputProps {
  referenceNumber: string;
  setReferenceNumber: (value: string) => void;
  loading: boolean;
  notFound: boolean;
  onSubmit: () => void;
}

export const ReferenceNumberInput: React.FC<ReferenceNumberInputProps> = ({
  referenceNumber,
  setReferenceNumber,
  loading,
  notFound,
  onSubmit
}) => {
  const { t } = useLanguage();
  const { font } = useFont();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="max-w-lg mx-auto mb-8">
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/10">
        <CardHeader className="text-center">
          <CardTitle className={`text-2xl text-white ${font}`}>
            {t('activateService.referenceNumber')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>

              <Input
                id="reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder={t('activateService.referenceNumberPlaceholder')}
                className={`mt-2 ${font} bg-white/10 backdrop-blur-md border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:bg-white/20 text-center placeholder:text-center`}
                dir="ltr"
              />
            </div>
            
            {notFound && (
              <Alert className="bg-red-500/10 backdrop-blur-md border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className={`text-red-400 ${font}`}>
                  {t('activateService.notFoundDescription')}
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              disabled={!referenceNumber || loading}
              className={`w-full bg-coolnet-purple hover:bg-coolnet-purple/80 text-white ${font} backdrop-blur-md`}
            >
              {loading ? '...' : t('activateService.checkService')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
