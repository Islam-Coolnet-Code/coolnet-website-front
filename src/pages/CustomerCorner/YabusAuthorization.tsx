import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import CustomerCornerHeader from '@/components/CustomerCorner/CustomerCornerHeader';
import { submitYabusAuthorization, CustomerApiError } from '@/services/auth/api';
import { validateIdentityNumber } from '@/utils/orderValidation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RequiredAsterisk } from '@/components/RequiredAsterisk';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  FileSignature,
  Hash,
  IdCard,
  UploadCloud,
  FileText,
  X,
  Check,
  Users,
  Info,
  ChevronDown,
} from 'lucide-react';
import englishLogo from '@/assets/logos/english.png';
import arabicLogo from '@/assets/logos/arabic.png';
import yaboosLogo from '@/assets/yaboos.png';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
const ACCEPT_ATTR = 'image/jpeg,image/png,image/webp,image/heic,application/pdf,.pdf';

// Payer's relationship to the subscription owner (self + first-degree relatives).
// Codes are stable; the visible labels come from i18n (customerCorner.yabus.relationships.*).
const RELATIONSHIPS = [
  'self',
  'father',
  'son',
  'daughter',
  'husband',
  'wife',
  'brother',
  'sister',
  'mother',
] as const;

type FileKey = 'salarySlip' | 'idImage' | 'idAnnex';

interface FieldErrors {
  idNumberSalary?: string;
  idNumberCoolnet?: string;
  relationship?: string;
  salarySlip?: string;
  idImage?: string;
  idAnnex?: string;
}

const YabusAuthorization: React.FC = () => {
  const { t, language } = useLanguage();
  const { session } = useAuth();
  const { font } = useFont();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isRTL = language === 'ar';

  const [idNumberSalary, setIdNumberSalary] = useState('');
  const [idNumberCoolnet, setIdNumberCoolnet] = useState('');
  const [relationship, setRelationship] = useState('');
  const [files, setFiles] = useState<Record<FileKey, File | null>>({
    salarySlip: null,
    idImage: null,
    idAnnex: null,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const userno = session?.userno ?? '';

  const validateFile = (file: File): string | undefined => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return t('customerCorner.yabus.errors.fileType');
    }
    if (file.size > MAX_FILE_SIZE) {
      return t('customerCorner.yabus.errors.fileSize');
    }
    return undefined;
  };

  const handleFileChange = (key: FileKey, file: File | null) => {
    if (file) {
      const err = validateFile(file);
      if (err) {
        setErrors((prev) => ({ ...prev, [key]: err }));
        return;
      }
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!idNumberSalary.trim()) {
      next.idNumberSalary = t('customerCorner.yabus.errors.required');
    } else if (!validateIdentityNumber(idNumberSalary)) {
      next.idNumberSalary = t('customerCorner.yabus.errors.idFormat');
    }

    if (!idNumberCoolnet.trim()) {
      next.idNumberCoolnet = t('customerCorner.yabus.errors.required');
    } else if (!validateIdentityNumber(idNumberCoolnet)) {
      next.idNumberCoolnet = t('customerCorner.yabus.errors.idFormat');
    }

    if (!relationship) next.relationship = t('customerCorner.yabus.errors.required');

    if (!files.salarySlip) next.salarySlip = t('customerCorner.yabus.errors.fileRequired');
    if (!files.idImage) next.idImage = t('customerCorner.yabus.errors.fileRequired');
    if (!files.idAnnex) next.idAnnex = t('customerCorner.yabus.errors.fileRequired');

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({
        title: t('customerCorner.yabus.errors.validationTitle'),
        description: t('customerCorner.yabus.errors.validationBody'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await submitYabusAuthorization({
        userno,
        idNumberSalary: idNumberSalary.trim(),
        idNumberCoolnet: idNumberCoolnet.trim(),
        relationship,
        salarySlip: files.salarySlip as File,
        idImage: files.idImage as File,
        idAnnex: files.idAnnex as File,
      });

      toast({
        title: t('customerCorner.yabus.toast.successTitle'),
        description: t('customerCorner.yabus.toast.successBody'),
      });
      navigate('/customer-corner/dashboard', { replace: true });
    } catch (err) {
      const code = err instanceof CustomerApiError ? err.code : '';
      if (code === 'VALIDATION_ERROR') {
        toast({
          title: t('customerCorner.yabus.errors.validationTitle'),
          description: t('customerCorner.yabus.errors.validationBody'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('customerCorner.yabus.toast.failedTitle'),
          description: t('customerCorner.yabus.toast.failedBody'),
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-coolnet-purple/5 via-gray-50 to-gray-50">
      <CustomerCornerHeader showLogout />

      <main className="container mx-auto px-4 py-10 sm:py-14">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 overflow-hidden">
            {/* Branded header */}
            <div className="bg-gradient-to-br from-coolnet-purple to-coolnet-purple-dark px-6 pt-7 pb-8 text-center">
              <img
                src={isRTL ? arabicLogo : englishLogo}
                alt="Coolnet"
                className="h-11 sm:h-12 mx-auto object-contain"
              />
              {/* Yabous (Yaboos) partner logo */}
              <div className="mt-5 mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-lg ring-4 ring-white/20 flex items-center justify-center p-2">
                <img
                  src={yaboosLogo}
                  alt="Yabous Finance"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-4 inline-flex items-center justify-center gap-2">
                <FileSignature className="w-5 h-5 text-coolnet-orange" />
                <h1 className={`text-xl sm:text-2xl font-bold text-white ${font}`}>
                  {t('customerCorner.yabus.title')}
                </h1>
              </div>
              <p className={`text-white/70 text-sm mt-2 max-w-md mx-auto ${font}`}>
                {t('customerCorner.yabus.subtitle')}
              </p>
            </div>

            <CardContent className="pt-6 pb-8">
              {/* Eligibility notice */}
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-coolnet-purple/5 border border-coolnet-purple/15 p-4">
                <Info className="w-5 h-5 text-coolnet-purple shrink-0 mt-0.5" />
                <p className={`text-sm text-gray-600 leading-relaxed text-start ${font}`}>
                  {t('customerCorner.yabus.notice')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Subscription number — prefilled from the session, read-only */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium text-gray-700 ${font}`}>
                    {t('customerCorner.yabus.subscriptionNo')}
                  </label>
                  <div className="relative">
                    <Hash className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input
                      value={userno}
                      readOnly
                      dir="ltr"
                      className="h-12 ps-11 bg-gray-100 border-gray-300 text-gray-700 font-medium cursor-not-allowed"
                    />
                  </div>
                  <p className={`text-xs text-gray-400 ${font}`}>
                    {t('customerCorner.yabus.subscriptionNoHint')}
                  </p>
                </div>

                {/* ID number per salary slip / Yabus app */}
                <IdField
                  label={t('customerCorner.yabus.idNumberSalary')}
                  value={idNumberSalary}
                  onChange={(v) => {
                    setIdNumberSalary(v);
                    setErrors((p) => ({ ...p, idNumberSalary: undefined }));
                  }}
                  error={errors.idNumberSalary}
                  font={font}
                />

                {/* ID number of the subscription owner at Coolnet */}
                <IdField
                  label={t('customerCorner.yabus.idNumberCoolnet')}
                  value={idNumberCoolnet}
                  onChange={(v) => {
                    setIdNumberCoolnet(v);
                    setErrors((p) => ({ ...p, idNumberCoolnet: undefined }));
                  }}
                  error={errors.idNumberCoolnet}
                  font={font}
                />

                {/* Relationship to the subscription owner */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium text-gray-700 ${font}`}>
                    {t('customerCorner.yabus.relationship')}
                    <RequiredAsterisk />
                  </label>
                  <div className="relative">
                    <Users className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      value={relationship}
                      onChange={(e) => {
                        setRelationship(e.target.value);
                        setErrors((p) => ({ ...p, relationship: undefined }));
                      }}
                      className={`h-12 w-full ps-11 pe-10 appearance-none rounded-md border bg-white text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coolnet-purple ${font} ${
                        errors.relationship ? 'border-red-400' : 'border-gray-300'
                      } ${relationship ? '' : 'text-gray-400'}`}
                    >
                      <option value="" disabled>
                        {t('customerCorner.yabus.relationshipPlaceholder')}
                      </option>
                      {RELATIONSHIPS.map((code) => (
                        <option key={code} value={code} className="text-gray-900">
                          {t(`customerCorner.yabus.relationships.${code}`)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute top-1/2 -translate-y-1/2 end-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.relationship && (
                    <p className={`text-red-600 text-sm ${font}`}>{errors.relationship}</p>
                  )}
                </div>

                <div className="pt-1 border-t border-gray-100" />

                {/* Attachments */}
                <FileField
                  label={t('customerCorner.yabus.salarySlip')}
                  file={files.salarySlip}
                  onChange={(f) => handleFileChange('salarySlip', f)}
                  error={errors.salarySlip}
                  font={font}
                  hint={t('customerCorner.yabus.fileHint')}
                />
                <FileField
                  label={t('customerCorner.yabus.idImage')}
                  file={files.idImage}
                  onChange={(f) => handleFileChange('idImage', f)}
                  error={errors.idImage}
                  font={font}
                  hint={t('customerCorner.yabus.fileHint')}
                />
                <FileField
                  label={t('customerCorner.yabus.idAnnex')}
                  file={files.idAnnex}
                  onChange={(f) => handleFileChange('idAnnex', f)}
                  error={errors.idAnnex}
                  font={font}
                  hint={t('customerCorner.yabus.idAnnexHint')}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-12 bg-coolnet-purple hover:bg-coolnet-purple-dark text-white font-medium ${font}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('customerCorner.yabus.submitting')}
                    </span>
                  ) : (
                    t('customerCorner.yabus.submit')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

interface IdFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  font: string;
}

const IdField: React.FC<IdFieldProps> = ({ label, value, onChange, error, font }) => (
  <div className="space-y-2">
    <label className={`text-sm font-medium text-gray-700 ${font}`}>
      {label}
      <RequiredAsterisk />
    </label>
    <div className="relative">
      <IdCard className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400 pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          // Digits only, max 9
          if (v === '' || /^\d{0,9}$/.test(v)) onChange(v);
        }}
        inputMode="numeric"
        maxLength={9}
        dir="ltr"
        className={`h-12 ps-11 border-gray-300 focus-visible:ring-coolnet-purple ${
          error ? 'border-red-400' : ''
        }`}
      />
    </div>
    {error && <p className={`text-red-600 text-sm ${font}`}>{error}</p>}
  </div>
);

interface FileFieldProps {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  font: string;
  hint?: string;
}

const FileField: React.FC<FileFieldProps> = ({ label, file, onChange, error, font, hint }) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium text-gray-700 ${font}`}>
        {label}
        <RequiredAsterisk />
      </label>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium text-gray-800 truncate ${font}`} dir="ltr">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="text-gray-400 hover:text-red-500 shrink-0"
            aria-label={t('customerCorner.yabus.removeFile')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 text-start transition-colors hover:border-coolnet-purple hover:bg-coolnet-purple/5 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-coolnet-purple/10 flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5 text-coolnet-purple" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-medium text-gray-700 ${font}`}>
              {t('customerCorner.yabus.chooseFile')}
            </p>
            {hint && <p className={`text-xs text-gray-400 ${font}`}>{hint}</p>}
          </div>
          <FileText className="w-5 h-5 text-gray-300 ms-auto shrink-0" />
        </button>
      )}

      {error && <p className={`text-red-600 text-sm ${font}`}>{error}</p>}
    </div>
  );
};

export default YabusAuthorization;
