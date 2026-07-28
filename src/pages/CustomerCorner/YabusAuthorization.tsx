import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import CustomerCornerHeader from '@/components/CustomerCorner/CustomerCornerHeader';
import {
  submitYabusAuthorization,
  updateYabusAuthorization,
  getMyYabusAuthorizations,
  getUserDetails,
  CustomerApiError,
} from '@/services/auth/api';
import type { YabusAuthorizationRecord, YabusRequestStatus } from '@/types/authTypes';
import { validateIdentityNumber } from '@/utils/orderValidation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RequiredAsterisk } from '@/components/RequiredAsterisk';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Hash,
  IdCard,
  UploadCloud,
  X,
  Check,
  Users,
  Info,
  ChevronDown,
  ArrowRight,
  ClipboardList,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  Pencil,
  ExternalLink,
} from 'lucide-react';
import yaboosLogo from '@/assets/yaboos.png';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// Must stay in sync with the API's multer fileFilter. iOS/Android report HEIC
// photos as either image/heic or image/heif, and some browsers use image/jpg.
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
];
const ACCEPT_ATTR = 'image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf,.pdf,.heic';

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

type FileKey = 'salarySlip' | 'idImage' | 'idAnnex' | 'coolnetIdImage' | 'coolnetIdAnnex';

interface FieldErrors {
  yaboosUserName?: string;
  idNumberSalary?: string;
  idNumberCoolnet?: string;
  relationship?: string;
  salarySlip?: string;
  idImage?: string;
  idAnnex?: string;
  coolnetIdImage?: string;
  coolnetIdAnnex?: string;
}

const YabusAuthorization: React.FC = () => {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { font } = useFont();
  const { toast } = useToast();

  const [yaboosUserName, setYaboosUserName] = useState('');
  const [idNumberSalary, setIdNumberSalary] = useState('');
  const [idNumberCoolnet, setIdNumberCoolnet] = useState('');
  const [relationship, setRelationship] = useState('');
  // The Coolnet account holder's full name — appended to the owner-identity label.
  const [fullName, setFullName] = useState('');
  const [files, setFiles] = useState<Record<FileKey, File | null>>({
    salarySlip: null,
    idImage: null,
    idAnnex: null,
    coolnetIdImage: null,
    coolnetIdAnnex: null,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  // The subscriber's own existing requests.
  const [myRequests, setMyRequests] = useState<YabusAuthorizationRecord[]>([]);

  const userno = session?.userno ?? '';

  const loadMine = useCallback(async () => {
    try {
      setMyRequests(await getMyYabusAuthorizations());
    } catch {
      // Non-fatal: the form still works even if the history can't be loaded.
    }
  }, []);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  // Fetch the subscriber's full name for the Coolnet owner-identity label.
  useEffect(() => {
    getUserDetails()
      .then((d) => setFullName(d.fullName || ''))
      .catch(() => {
        /* non-fatal — the label simply omits the name */
      });
  }, []);

  const clearFiles = () =>
    setFiles({ salarySlip: null, idImage: null, idAnnex: null, coolnetIdImage: null, coolnetIdAnnex: null });

  // The customer's current request (most recent). It drives the page mode:
  //  - approved            → locked (view only, no new application)
  //  - pending/reviewed/rejected → edit that request
  //  - none                → create a new one
  const active = myRequests.length > 0 ? myRequests[0] : null;
  const isApproved = active?.status === 'approved';
  const isEditing = !!active && !isApproved;

  // When editing, prefill the fields from the existing request (once per request).
  useEffect(() => {
    if (active && active.status !== 'approved') {
      setYaboosUserName(active.yaboosUserName || '');
      setIdNumberSalary(active.idNumberSalary || '');
      setIdNumberCoolnet(active.idNumberCoolnet || '');
      setRelationship(active.relationship || '');
      clearFiles();
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

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

    if (!yaboosUserName.trim()) next.yaboosUserName = t('customerCorner.yabus.errors.required');

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

    // On create every document is required. When editing, existing files are
    // kept unless the customer replaces them, so files are optional.
    if (!isEditing) {
      if (!files.salarySlip) next.salarySlip = t('customerCorner.yabus.errors.fileRequired');
      if (!files.idImage) next.idImage = t('customerCorner.yabus.errors.fileRequired');
      if (!files.idAnnex) next.idAnnex = t('customerCorner.yabus.errors.fileRequired');
      if (!files.coolnetIdImage) next.coolnetIdImage = t('customerCorner.yabus.errors.fileRequired');
      if (!files.coolnetIdAnnex) next.coolnetIdAnnex = t('customerCorner.yabus.errors.fileRequired');
    }

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
      if (isEditing && active) {
        await updateYabusAuthorization(active.id, {
          yaboosUserName: yaboosUserName.trim(),
          idNumberSalary: idNumberSalary.trim(),
          idNumberCoolnet: idNumberCoolnet.trim(),
          relationship,
          salarySlip: files.salarySlip,
          idImage: files.idImage,
          idAnnex: files.idAnnex,
          coolnetIdImage: files.coolnetIdImage,
          coolnetIdAnnex: files.coolnetIdAnnex,
        });
        toast({
          title: t('customerCorner.yabus.toast.updatedTitle'),
          description: t('customerCorner.yabus.toast.updatedBody'),
        });
      } else {
        await submitYabusAuthorization({
          userno,
          yaboosUserName: yaboosUserName.trim(),
          idNumberSalary: idNumberSalary.trim(),
          idNumberCoolnet: idNumberCoolnet.trim(),
          relationship,
          salarySlip: files.salarySlip as File,
          idImage: files.idImage as File,
          idAnnex: files.idAnnex as File,
          coolnetIdImage: files.coolnetIdImage as File,
          coolnetIdAnnex: files.coolnetIdAnnex as File,
        });
        toast({
          title: t('customerCorner.yabus.toast.successTitle'),
          description: t('customerCorner.yabus.toast.successBody'),
        });
      }

      // Stay on the page so the subscriber sees their request in the list.
      clearFiles();
      setErrors({});
      await loadMine();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const apiError = err instanceof CustomerApiError ? err : null;
      const code = apiError?.code ?? '';

      if (code === 'VALIDATION_ERROR') {
        toast({
          title: t('customerCorner.yabus.errors.validationTitle'),
          // The server names the offending field(s); show that rather than a
          // generic "try again", which tells the customer nothing actionable.
          description: apiError?.message || t('customerCorner.yabus.errors.validationBody'),
          variant: 'destructive',
        });
      } else if (code === 'FILE_TOO_LARGE' || code === 'UPLOAD_TOO_LARGE') {
        toast({
          title: t('customerCorner.yabus.toast.failedTitle'),
          description: t('customerCorner.yabus.errors.fileSize'),
          variant: 'destructive',
        });
      } else if (code === 'UNEXPECTED_FILE' || code === 'UPLOAD_FAILED') {
        toast({
          title: t('customerCorner.yabus.toast.failedTitle'),
          description: t('customerCorner.yabus.errors.uploadFailed'),
          variant: 'destructive',
        });
      } else if (code === 'TIMEOUT' || code === 'NETWORK_ERROR') {
        toast({
          title: t('customerCorner.yabus.toast.failedTitle'),
          description: t('customerCorner.yabus.errors.uploadTimeout'),
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

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* The subscriber's existing requests */}
        {myRequests.length > 0 && (
          <div className="mb-6">
            <MyRequestsPanel requests={myRequests} font={font} />
          </div>
        )}

        {isApproved && active ? (
          /* Approved → locked. No editing, no new application. */
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-sm border border-emerald-100 overflow-hidden">
              <div className="bg-emerald-50 border-b border-emerald-100 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-lg font-bold text-gray-900 ${font}`}>
                    {t('customerCorner.yabus.approvedTitle')}
                  </h2>
                  <p className={`text-sm text-gray-600 ${font}`}>
                    {t('customerCorner.yabus.approvedBody')}
                  </p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className={`flex items-center gap-2 text-sm text-gray-500 ${font}`}>
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>{t('customerCorner.yabus.lockedHint')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left — branded info & requirements panel */}
          <aside className="lg:col-span-1 lg:sticky lg:top-[88px]">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-coolnet-purple via-coolnet-purple to-coolnet-purple-dark text-white p-6 sm:p-8 shadow-lg">
              <div className="absolute -top-16 -end-12 w-60 h-60 rounded-full bg-white/10" />
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2">
                  <img src={yaboosLogo} alt="Yabous Finance" className="w-full h-full object-contain" />
                </div>
                <h1 className={`mt-5 text-2xl font-bold ${font}`}>{t('customerCorner.yabus.title')}</h1>
                <p className={`mt-2 text-white/75 text-sm leading-relaxed ${font}`}>
                  {t('customerCorner.yabus.subtitle')}
                </p>

                {isEditing && (
                  <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ${font}`}>
                    <Pencil className="w-3.5 h-3.5" />
                    {t('customerCorner.yabus.editingBadge')}
                  </div>
                )}

                {/* Eligibility notice */}
                <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-white/10 border border-white/15 p-3.5">
                  <Info className="w-4 h-4 text-coolnet-orange shrink-0 mt-0.5" />
                  <p className={`text-xs sm:text-[13px] text-white/85 leading-relaxed ${font}`}>
                    {t('customerCorner.yabus.notice')}
                  </p>
                </div>

                {/* Required documents — live checklist */}
                <div className="mt-6">
                  <p className={`text-[11px] uppercase tracking-wider text-white/55 mb-3 ${font}`}>
                    {t('customerCorner.yabus.requirementsTitle')}
                  </p>
                  <ul className="space-y-2.5">
                    <ReqItem done={!!files.salarySlip || (isEditing && !!active?.salarySlipUrl)} label={t('customerCorner.yabus.salarySlip')} font={font} />
                    <ReqItem done={!!files.idImage || (isEditing && !!active?.idImageUrl)} label={t('customerCorner.yabus.idImage')} font={font} />
                    <ReqItem done={!!files.idAnnex || (isEditing && !!active?.idAnnexUrl)} label={t('customerCorner.yabus.idAnnex')} font={font} />
                    <ReqItem done={!!files.coolnetIdImage || (isEditing && !!active?.coolnetIdImageUrl)} label={t('customerCorner.yabus.coolnetIdImage')} font={font} />
                    <ReqItem done={!!files.coolnetIdAnnex || (isEditing && !!active?.coolnetIdAnnexUrl)} label={t('customerCorner.yabus.coolnetIdAnnex')} font={font} />
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* Right — the form */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Applicant information */}
                  <section className="space-y-5">
                    <SectionHeading
                      icon={<IdCard className="w-5 h-5 text-coolnet-purple" />}
                      title={t('customerCorner.yabus.sectionInfo')}
                      font={font}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Yaboos app account owner name */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className={`text-sm font-medium text-gray-700 ${font}`}>
                          {t('customerCorner.yabus.yaboosUserName')}
                          <RequiredAsterisk />
                        </label>
                        <div className="relative">
                          <Users className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400 pointer-events-none" />
                          <Input
                            value={yaboosUserName}
                            onChange={(e) => {
                              setYaboosUserName(e.target.value);
                              setErrors((p) => ({ ...p, yaboosUserName: undefined }));
                            }}
                            placeholder={t('customerCorner.yabus.yaboosUserNamePlaceholder')}
                            className={`h-12 ps-11 border-gray-300 focus-visible:ring-coolnet-purple ${
                              errors.yaboosUserName ? 'border-red-400' : ''
                            }`}
                          />
                        </div>
                        {errors.yaboosUserName && (
                          <p className={`text-red-600 text-sm ${font}`}>{errors.yaboosUserName}</p>
                        )}
                      </div>

                      {/* Subscription number — prefilled, read-only */}
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

                      {/* Relationship */}
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
                            className={`h-12 w-full ps-11 pe-10 appearance-none rounded-md border bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coolnet-purple ${font} ${
                              errors.relationship ? 'border-red-400' : 'border-gray-300'
                            } ${relationship ? 'text-gray-900' : 'text-gray-400'}`}
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

                      {/* ID per salary slip / Yabus app */}
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

                      {/* ID of the subscription owner at Coolnet */}
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
                    </div>
                  </section>

                  {/* Required documents */}
                  <section className="space-y-5">
                    <SectionHeading
                      icon={<UploadCloud className="w-5 h-5 text-coolnet-purple" />}
                      title={t('customerCorner.yabus.sectionDocs')}
                      font={font}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      <FileField
                        label={t('customerCorner.yabus.salarySlip')}
                        file={files.salarySlip}
                        onChange={(f) => handleFileChange('salarySlip', f)}
                        error={errors.salarySlip}
                        font={font}
                        hint={t('customerCorner.yabus.fileHint')}
                        currentUrl={isEditing ? active?.salarySlipUrl : null}
                        optional={isEditing}
                      />
                      <FileField
                        label={t('customerCorner.yabus.idImage')}
                        file={files.idImage}
                        onChange={(f) => handleFileChange('idImage', f)}
                        error={errors.idImage}
                        font={font}
                        hint={t('customerCorner.yabus.fileHint')}
                        currentUrl={isEditing ? active?.idImageUrl : null}
                        optional={isEditing}
                      />
                      <FileField
                        label={t('customerCorner.yabus.idAnnex')}
                        file={files.idAnnex}
                        onChange={(f) => handleFileChange('idAnnex', f)}
                        error={errors.idAnnex}
                        font={font}
                        hint={t('customerCorner.yabus.idAnnexHint')}
                        currentUrl={isEditing ? active?.idAnnexUrl : null}
                        optional={isEditing}
                      />
                      <FileField
                        label={`${t('customerCorner.yabus.coolnetIdImage')}${fullName ? ` (${fullName})` : ''}`}
                        file={files.coolnetIdImage}
                        onChange={(f) => handleFileChange('coolnetIdImage', f)}
                        error={errors.coolnetIdImage}
                        font={font}
                        hint={t('customerCorner.yabus.fileHint')}
                        currentUrl={isEditing ? active?.coolnetIdImageUrl : null}
                        optional={isEditing}
                      />
                      <FileField
                        label={t('customerCorner.yabus.coolnetIdAnnex')}
                        file={files.coolnetIdAnnex}
                        onChange={(f) => handleFileChange('coolnetIdAnnex', f)}
                        error={errors.coolnetIdAnnex}
                        font={font}
                        hint={t('customerCorner.yabus.fileHint')}
                        currentUrl={isEditing ? active?.coolnetIdAnnexUrl : null}
                        optional={isEditing}
                      />
                    </div>
                  </section>

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-gray-100">
                    <p className={`text-xs text-gray-400 sm:me-auto ${font}`}>
                      {isEditing ? t('customerCorner.yabus.editHint') : t('customerCorner.yabus.fileHint')}
                    </p>
                    <Button
                      type="submit"
                      disabled={loading}
                      className={`h-12 px-8 bg-coolnet-purple hover:bg-coolnet-purple-dark text-white font-medium ${font}`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {isEditing ? t('customerCorner.yabus.updating') : t('customerCorner.yabus.submitting')}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {isEditing ? t('customerCorner.yabus.update') : t('customerCorner.yabus.submit')}
                          {isEditing ? <Pencil className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 rtl:rotate-180" />}
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

interface SectionHeadingProps {
  icon: React.ReactNode;
  title: string;
  font: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ icon, title, font }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-lg bg-coolnet-purple/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <h2 className={`text-base font-semibold text-gray-900 ${font}`}>{title}</h2>
  </div>
);

// ---- Status styling for the "my requests" list ----
const STATUS_STYLE: Record<YabusRequestStatus, { badge: string; icon: React.ReactNode }> = {
  pending: { badge: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3.5 h-3.5" /> },
  reviewed: { badge: 'bg-blue-100 text-blue-700', icon: <Eye className="w-3.5 h-3.5" /> },
  approved: { badge: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  rejected: { badge: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
};

interface MyRequestsPanelProps {
  requests: YabusAuthorizationRecord[];
  font: string;
}

const MyRequestsPanel: React.FC<MyRequestsPanelProps> = ({ requests, font }) => {
  const { t } = useLanguage();

  const docs = (r: YabusAuthorizationRecord): { url: string | null; label: string }[] => [
    { url: r.salarySlipUrl, label: t('customerCorner.yabus.salarySlip') },
    { url: r.idImageUrl, label: t('customerCorner.yabus.idImage') },
    { url: r.idAnnexUrl, label: t('customerCorner.yabus.idAnnex') },
    { url: r.coolnetIdImageUrl, label: t('customerCorner.yabus.coolnetIdImage') },
    { url: r.coolnetIdAnnexUrl, label: t('customerCorner.yabus.coolnetIdAnnex') },
  ];

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-coolnet-purple/10 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 text-coolnet-purple" />
          </div>
          <h2 className={`text-base font-semibold text-gray-900 ${font}`}>
            {t('customerCorner.yabus.myRequests')}
          </h2>
          <span className="ms-auto text-xs text-gray-400">{requests.length}</span>
        </div>

        <div className="space-y-3">
          {requests.map((r) => {
            const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.pending;
            const submitted = r.createdAt ? new Date(r.createdAt).toLocaleString() : '';
            return (
              <div
                key={r.id}
                className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${st.badge} ${font}`}>
                        {st.icon}
                        {t(`customerCorner.yabus.status.${r.status}`)}
                      </span>
                      <span className="text-xs text-gray-400" dir="ltr">#{r.id}</span>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1.5 ${font}`}>
                      {t('customerCorner.yabus.submittedOn')}: <span dir="ltr">{submitted}</span>
                    </p>
                  </div>

                  {/* Document links */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {docs(r)
                      .filter((d) => !!d.url)
                      .map((d, i) => (
                        <a
                          key={i}
                          href={d.url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 hover:border-coolnet-purple hover:text-coolnet-purple transition-colors ${font}`}
                          title={d.label}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline max-w-[9rem] truncate">{d.label}</span>
                        </a>
                      ))}
                  </div>
                </div>

                {/* Reviewer's note to the customer */}
                {r.reviewNote && (
                  <div
                    className={`rounded-lg border p-3 ${
                      r.status === 'rejected'
                        ? 'bg-red-50 border-red-100'
                        : 'bg-coolnet-purple/5 border-coolnet-purple/10'
                    }`}
                  >
                    <p className={`text-[11px] uppercase tracking-wide text-gray-400 mb-0.5 ${font}`}>
                      {t('customerCorner.yabus.reviewNote')}
                    </p>
                    <p className={`text-sm text-gray-700 whitespace-pre-wrap ${font}`}>{r.reviewNote}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface ReqItemProps {
  done: boolean;
  label: string;
  font: string;
}

const ReqItem: React.FC<ReqItemProps> = ({ done, label, font }) => (
  <li className="flex items-center gap-2.5">
    <span
      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
        done ? 'bg-emerald-400 text-white' : 'bg-white/15'
      }`}
    >
      {done ? <Check className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-white/50" />}
    </span>
    <span className={`text-sm ${done ? 'text-white' : 'text-white/70'} ${font}`}>{label}</span>
  </li>
);

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
  /** URL of the already-uploaded document (edit mode). */
  currentUrl?: string | null;
  /** When true, no red asterisk and existing file counts as provided. */
  optional?: boolean;
}

const FileField: React.FC<FileFieldProps> = ({
  label,
  file,
  onChange,
  error,
  font,
  hint,
  currentUrl,
  optional,
}) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium text-gray-700 ${font}`}>
        {label}
        {!optional && <RequiredAsterisk />}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="relative rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 min-h-[136px] flex flex-col items-center justify-center text-center">
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="absolute top-2 end-2 w-7 h-7 rounded-full bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white flex items-center justify-center shadow-sm"
            aria-label={t('customerCorner.yabus.removeFile')}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <p className={`text-sm font-medium text-gray-800 truncate max-w-full px-2 ${font}`} dir="ltr">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      ) : currentUrl ? (
        // Edit mode: an existing document is on file. Show it with a replace option.
        <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 min-h-[136px] flex flex-col items-center justify-center text-center">
          <div className="w-11 h-11 rounded-full bg-coolnet-purple/10 flex items-center justify-center mb-2">
            <FileText className="w-5 h-5 text-coolnet-purple" />
          </div>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-sm font-medium text-coolnet-purple hover:underline ${font}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('customerCorner.yabus.currentFile')}
          </a>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`mt-2 text-xs text-gray-500 hover:text-coolnet-purple ${font}`}
          >
            {t('customerCorner.yabus.replaceFile')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full rounded-xl border-2 border-dashed p-4 min-h-[136px] flex flex-col items-center justify-center text-center transition-colors hover:border-coolnet-purple hover:bg-coolnet-purple/5 ${
            error ? 'border-red-300 bg-red-50/40' : 'border-gray-300'
          }`}
        >
          <div className="w-11 h-11 rounded-full bg-coolnet-purple/10 flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5 text-coolnet-purple" />
          </div>
          <p className={`text-sm font-medium text-gray-700 ${font}`}>
            {t('customerCorner.yabus.chooseFile')}
          </p>
          {hint && <p className={`text-[11px] text-gray-400 mt-1 leading-snug ${font}`}>{hint}</p>}
        </button>
      )}

      {error && <p className={`text-red-600 text-sm ${font}`}>{error}</p>}
    </div>
  );
};

export default YabusAuthorization;
