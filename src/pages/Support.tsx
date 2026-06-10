import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { useSEO } from '@/hooks/use-seo';
import { useSiteSettings } from '@/services/cms';
import Footer from '@/components/Footer';
import { Phone, Clock, Upload, X, CheckCircle } from 'lucide-react';

const Support = () => {
  const { t, language } = useLanguage();
  const font = useFont();

  useSEO({
    title: t('support.title'),
    description: language === 'ar'
      ? 'تواصل مع فريق دعم كولنت على مدار الساعة. اتصل بنا على 0562222444'
      : 'Contact Coolnet support team 24/7. Call us at 0562222444',
    keywords: language === 'ar'
      ? 'دعم كولنت, خدمة عملاء, اتصل بنا, دعم فني'
      : 'coolnet support, customer service, contact us, technical support',
  });
  const { data: siteSettings } = useSiteSettings();
  const [attachment, setAttachment] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isRTL = language === 'ar' || language === 'he';

  const getSettingValue = (key: string): string => {
    if (!siteSettings) return '';
    const setting = siteSettings.find((s: any) => s.settingKey === key);
    if (!setting) return '';
    if (language === 'ar') return setting.valueAr || setting.valueEn || '';
    if (language === 'he') return setting.valueHe || setting.valueEn || '';
    return setting.valueEn || '';
  };

  const contactPhone = getSettingValue('contact_phone') || '0562222444';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-white ${font}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-coolnet-purple via-purple-800 to-indigo-900 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-coolnet-orange rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('support.title')}
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            {t('support.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="container mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Phone Card */}
          <a
            href={`tel:${contactPhone.replace(/\s/g, '')}`}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow group"
          >
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('support.callUs')}</h3>
            <p className="text-coolnet-purple font-bold text-lg" dir="ltr">{contactPhone}</p>
          </a>

          {/* Hours Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('support.workingHours')}</h3>
            <p className="text-gray-600 text-sm">{t('support.sunThu')}</p>
            <p className="text-gray-600 text-sm">{t('support.friSat')}</p>
          </div>
        </div>
      </section>


      {/* Support Form with Attachment */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('support.formTitle')}
          </h2>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">{t('support.thankYou')}</h3>
              <p className="text-green-600">{t('support.weWillContact')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('support.name')}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coolnet-purple focus:border-transparent outline-none transition-all"
                  placeholder={t('support.namePlaceholder')}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('support.phone')}
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coolnet-purple focus:border-transparent outline-none transition-all"
                  placeholder="05X-XXX-XXXX"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('support.message')}
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coolnet-purple focus:border-transparent outline-none transition-all resize-none"
                  placeholder={t('support.messagePlaceholder')}
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('support.attachment')}
                </label>
                {!attachment ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-coolnet-purple hover:bg-purple-50 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">{t('support.uploadHint')}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {preview && (
                      <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                      <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-coolnet-purple text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors"
              >
                {t('support.submit')}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Support;
