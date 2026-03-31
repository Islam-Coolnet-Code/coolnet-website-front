import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import { AlertCircle, Save, X, RefreshCw } from 'lucide-react';

export function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { apiKey } = useAuth();
  const { t } = useAdminLanguage();

  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    // Hero stats
    heroStatSpeed: '',
    heroStatUptime: '',
    heroStatSupport: '',
    heroCustomerCount: '',
    // App links
    appStoreLink: '',
    playStoreLink: '',
  });

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadSettings();
    }
  }, [apiKey]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getSettings();
      const settingsArray = response.data || [];

      // Convert array of settings to object keyed by settingKey
      const data: Record<string, string> = {};
      if (Array.isArray(settingsArray)) {
        settingsArray.forEach((setting: any) => {
          // Use valueEn as the default value
          data[setting.settingKey] = setting.valueEn || setting.value || '';
        });
      }

      setSettings(data);
      setFormData({
        siteName: data.site_name || '',
        siteDescription: data.site_tagline || data.site_description || '',
        contactEmail: data.contact_email || '',
        contactPhone: data.contact_phone || '',
        address: data.address || '',
        facebookUrl: data.facebook_url || '',
        twitterUrl: data.twitter_url || '',
        instagramUrl: data.instagram_url || '',
        linkedinUrl: data.linkedin_url || '',
        // Hero stats
        heroStatSpeed: data.hero_stat_speed || '',
        heroStatUptime: data.hero_stat_uptime || '',
        heroStatSupport: data.hero_stat_support || '',
        heroCustomerCount: data.hero_customer_count || '',
        // App links
        appStoreLink: data.app_store_link || '',
        playStoreLink: data.play_store_link || '',
      });
    } catch (err) {
      setError(t('settings.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Convert form data to array format expected by backend
      const settingsArray = [
        { key: 'site_name', valueEn: formData.siteName },
        { key: 'site_tagline', valueEn: formData.siteDescription },
        { key: 'contact_email', valueEn: formData.contactEmail },
        { key: 'contact_phone', valueEn: formData.contactPhone },
        { key: 'address', valueEn: formData.address },
        { key: 'facebook_url', valueEn: formData.facebookUrl },
        { key: 'twitter_url', valueEn: formData.twitterUrl },
        { key: 'instagram_url', valueEn: formData.instagramUrl },
        { key: 'linkedin_url', valueEn: formData.linkedinUrl },
        // Hero stats
        { key: 'hero_stat_speed', valueEn: formData.heroStatSpeed },
        { key: 'hero_stat_uptime', valueEn: formData.heroStatUptime },
        { key: 'hero_stat_support', valueEn: formData.heroStatSupport },
        { key: 'hero_customer_count', valueEn: formData.heroCustomerCount },
        // App links
        { key: 'app_store_link', valueEn: formData.appStoreLink },
        { key: 'play_store_link', valueEn: formData.playStoreLink },
      ].filter(s => s.valueEn !== undefined); // Include all values including empty strings

      await adminApi.updateSettings({ settings: settingsArray });
      setSuccess(t('settings.savedSuccess'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('settings.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('settings.title')}</h1>
          <p className="text-slate-400 mt-1">{t('settings.subtitle')}</p>
        </div>
        <button
          onClick={loadSettings}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          {t('settings.reload')}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400 mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3 text-green-400 mb-6">
          <Save size={20} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('settings.general')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.siteName')}
              </label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.siteDescription')}
              </label>
              <input
                type="text"
                value={formData.siteDescription}
                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('settings.contactInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.email')}
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.phone')}
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.address')}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Hero Settings */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('settings.heroStats')}</h2>
          <p className="text-sm text-slate-400 mb-4">{t('settings.heroStats')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.speedStat')}
              </label>
              <input
                type="text"
                value={formData.heroStatSpeed}
                onChange={(e) => setFormData({ ...formData, heroStatSpeed: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('settings.speedPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.uptimeStat')}
              </label>
              <input
                type="text"
                value={formData.heroStatUptime}
                onChange={(e) => setFormData({ ...formData, heroStatUptime: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('settings.uptimePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.supportStat')}
              </label>
              <input
                type="text"
                value={formData.heroStatSupport}
                onChange={(e) => setFormData({ ...formData, heroStatSupport: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('settings.supportPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.customerCount')}
              </label>
              <input
                type="text"
                value={formData.heroCustomerCount}
                onChange={(e) => setFormData({ ...formData, heroCustomerCount: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('settings.customerCountPlaceholder')}
              />
              <p className="text-xs text-slate-500 mt-1">{t('settings.numberFormatHint')}</p>
            </div>
          </div>
        </div>

        {/* App Links */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('settings.appLinks')}</h2>
          <p className="text-sm text-slate-400 mb-4">{t('settings.appLinks')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.appStoreUrl')}
              </label>
              <input
                type="url"
                value={formData.appStoreLink}
                onChange={(e) => setFormData({ ...formData, appStoreLink: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://apps.apple.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.playStoreUrl')}
              </label>
              <input
                type="url"
                value={formData.playStoreLink}
                onChange={(e) => setFormData({ ...formData, playStoreLink: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://play.google.com/store/apps/..."
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('settings.socialMedia')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.facebookUrl')}
              </label>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.twitterUrl')}
              </label>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://twitter.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.instagramUrl')}
              </label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {t('settings.linkedinUrl')}
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/..."
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                {t('settings.saving')}
              </>
            ) : (
              <>
                <Save size={18} />
                {t('settings.saveSettings')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
