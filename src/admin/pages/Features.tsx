import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  X,
  Zap,
  Shield,
  Headphones,
  Wifi,
  Globe,
  Clock,
  Server,
  Lock,
} from 'lucide-react';
import { MediaPicker } from '../components/MediaPicker';

const ICON_OPTIONS = [
  { value: 'Zap', label: 'Lightning Bolt', icon: Zap },
  { value: 'Shield', label: 'Shield', icon: Shield },
  { value: 'Headphones', label: 'Headphones', icon: Headphones },
  { value: 'Wifi', label: 'WiFi', icon: Wifi },
  { value: 'Globe', label: 'Globe', icon: Globe },
  { value: 'Clock', label: 'Clock', icon: Clock },
  { value: 'Server', label: 'Server', icon: Server },
  { value: 'Lock', label: 'Lock', icon: Lock },
  { value: 'Sparkles', label: 'Sparkles', icon: Sparkles },
];

const getIconComponent = (iconName: string) => {
  const found = ICON_OPTIONS.find((i) => i.value === iconName);
  return found ? found.icon : Sparkles;
};

export function FeaturesPage() {
  const [features, setFeatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { apiKey } = useAuth();
  const { t } = useAdminLanguage();

  const [mediaIds, setMediaIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    icon: 'Zap',
    titleEn: '',
    titleAr: '',
    titleHe: '',
    descriptionEn: '',
    descriptionAr: '',
    descriptionHe: '',
    bgColor: '#EEF2FF',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadFeatures();
    }
  }, [apiKey]);

  const loadFeatures = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getFeatures();
      setFeatures(response.data || []);
    } catch (err) {
      setError(t('features.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeatureMedia = async (featureId: number) => {
    try {
      const res = await adminApi.getContentMedia('features', featureId);
      const ids = (res.data || []).map((m: any) => m.media_id || m.id);
      setMediaIds(ids);
    } catch {
      setMediaIds([]);
    }
  };

  const openModal = (feature?: any) => {
    if (feature) {
      setEditingFeature(feature);
      setFormData({
        icon: feature.icon || 'Zap',
        titleEn: feature.title?.en || feature.titleEn || '',
        titleAr: feature.title?.ar || feature.titleAr || '',
        titleHe: feature.title?.he || feature.titleHe || '',
        descriptionEn: feature.description?.en || feature.descriptionEn || '',
        descriptionAr: feature.description?.ar || feature.descriptionAr || '',
        descriptionHe: feature.description?.he || feature.descriptionHe || '',
        bgColor: feature.bgColor || '#EEF2FF',
        sortOrder: feature.sortOrder || 0,
        isActive: feature.isActive !== false,
      });
      loadFeatureMedia(feature.id);
    } else {
      setEditingFeature(null);
      setMediaIds([]);
      setFormData({
        icon: 'Zap',
        titleEn: '',
        titleAr: '',
        titleHe: '',
        descriptionEn: '',
        descriptionAr: '',
        descriptionHe: '',
        bgColor: '#EEF2FF',
        sortOrder: 0,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFeature(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = {
        icon: formData.icon,
        titleEn: formData.titleEn,
        titleAr: formData.titleAr,
        titleHe: formData.titleHe,
        descriptionEn: formData.descriptionEn,
        descriptionAr: formData.descriptionAr,
        descriptionHe: formData.descriptionHe,
        bgColor: formData.bgColor,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };

      let featureId: number;
      if (editingFeature) {
        await adminApi.updateFeature(editingFeature.id, data);
        featureId = editingFeature.id;
      } else {
        const res = await adminApi.createFeature(data);
        featureId = res.data?.id || res.id;
      }

      // Save media associations
      if (featureId) {
        await adminApi.setContentMedia('features', featureId, mediaIds.map((id, i) => ({ mediaId: id, mediaRole: 'gallery', sortOrder: i })));
      }

      closeModal();
      loadFeatures();
    } catch (err) {
      setError(t('features.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('features.confirmDelete'))) return;

    try {
      await adminApi.deleteFeature(id);
      loadFeatures();
    } catch (err) {
      setError(t('features.errorDelete'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('features.title')}</h1>
          <p className="text-slate-400 mt-1">{t('features.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadFeatures}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            {t('features.refresh')}
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            {t('features.addFeature')}
          </button>
        </div>
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

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : features.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <Sparkles size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('features.noFeatures')}</p>
          </div>
        ) : (
          features.map((feature) => {
            const IconComponent = getIconComponent(feature.icon);
            return (
              <div
                key={feature.id}
                className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feature.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {feature.isActive ? t('features.active') : t('features.inactive')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(feature)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(feature.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: feature.bgColor || '#EEF2FF' }}
                >
                  <IconComponent size={32} className="text-slate-700" />
                </div>

                <h3 className="text-white font-medium">
                  {feature.title?.en || feature.titleEn || t('features.untitled')}
                </h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                  {feature.description?.en || feature.descriptionEn || ''}
                </p>
                <p className="text-xs text-slate-500 mt-2">{t('features.order')}: {feature.sortOrder}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <h2 className="text-xl font-semibold text-white">
                {editingFeature ? t('features.editFeature') : t('features.addNewFeature')}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('features.icon')}
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('features.bgColor')}
                  </label>
                  <input
                    type="color"
                    value={formData.bgColor}
                    onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                    className="w-full h-10 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <MediaPicker
                label="Media (Images / Videos)"
                value={mediaIds}
                onChange={(ids) => setMediaIds(ids)}
                multiple
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('features.titleEn')}
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('features.titleAr')}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('features.titleHe')}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.titleHe}
                    onChange={(e) => setFormData({ ...formData, titleHe: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('features.descEn')}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('features.descAr')}
                  </label>
                  <textarea
                    dir="rtl"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('features.descHe')}
                  </label>
                  <textarea
                    dir="rtl"
                    value={formData.descriptionHe}
                    onChange={(e) => setFormData({ ...formData, descriptionHe: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('features.sortOrder')}
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2 pb-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-slate-300">
                      {t('features.active')}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {t('features.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                  {editingFeature ? t('features.update') : t('features.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
