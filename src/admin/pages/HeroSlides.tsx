import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import { MediaPicker } from '../components/MediaPicker';
import { Plus, Pencil, Trash2, RefreshCw, X, GripVertical } from 'lucide-react';

interface HeroSlide {
  id: number;
  mediaId: number | null;
  badge: { en: string; ar: string; he: string } | null;
  title: { en: string; ar: string; he: string };
  subtitle: { en: string; ar: string; he: string } | null;
  ctaPrimaryText: { en: string; ar: string; he: string } | null;
  ctaPrimaryLink: string | null;
  ctaSecondaryText: { en: string; ar: string; he: string } | null;
  ctaSecondaryLink: string | null;
  sortOrder: number;
  isActive: boolean;
  media?: any;
}

const emptyForm = {
  titleEn: '',
  titleAr: '',
  titleHe: '',
  subtitleEn: '',
  subtitleAr: '',
  subtitleHe: '',
  badgeEn: '',
  badgeAr: '',
  badgeHe: '',
  ctaPrimaryTextEn: '',
  ctaPrimaryTextAr: '',
  ctaPrimaryTextHe: '',
  ctaPrimaryLink: '',
  ctaSecondaryTextEn: '',
  ctaSecondaryTextAr: '',
  ctaSecondaryTextHe: '',
  ctaSecondaryLink: '',
  mediaId: null as number | null,
  isActive: true,
  sortOrder: 0,
};

export function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const { apiKey } = useAuth();
  const { t, language } = useAdminLanguage();

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadSlides();
    }
  }, [apiKey]);

  const loadSlides = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getHeroes();
      setSlides(response.data || []);
    } catch {
      setError(t('heroSlides.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingSlide(null);
    setFormData({ ...emptyForm, sortOrder: slides.length });
    setShowModal(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      titleEn: slide.title?.en || '',
      titleAr: slide.title?.ar || '',
      titleHe: slide.title?.he || '',
      subtitleEn: slide.subtitle?.en || '',
      subtitleAr: slide.subtitle?.ar || '',
      subtitleHe: slide.subtitle?.he || '',
      badgeEn: slide.badge?.en || '',
      badgeAr: slide.badge?.ar || '',
      badgeHe: slide.badge?.he || '',
      ctaPrimaryTextEn: slide.ctaPrimaryText?.en || '',
      ctaPrimaryTextAr: slide.ctaPrimaryText?.ar || '',
      ctaPrimaryTextHe: slide.ctaPrimaryText?.he || '',
      ctaPrimaryLink: slide.ctaPrimaryLink || '',
      ctaSecondaryTextEn: slide.ctaSecondaryText?.en || '',
      ctaSecondaryTextAr: slide.ctaSecondaryText?.ar || '',
      ctaSecondaryTextHe: slide.ctaSecondaryText?.he || '',
      ctaSecondaryLink: slide.ctaSecondaryLink || '',
      mediaId: slide.mediaId,
      isActive: slide.isActive,
      sortOrder: slide.sortOrder,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: { en: formData.titleEn, ar: formData.titleAr, he: formData.titleHe },
      subtitle: { en: formData.subtitleEn, ar: formData.subtitleAr, he: formData.subtitleHe },
      badge: { en: formData.badgeEn, ar: formData.badgeAr, he: formData.badgeHe },
      ctaPrimaryText: { en: formData.ctaPrimaryTextEn, ar: formData.ctaPrimaryTextAr, he: formData.ctaPrimaryTextHe },
      ctaPrimaryLink: formData.ctaPrimaryLink || null,
      ctaSecondaryText: { en: formData.ctaSecondaryTextEn, ar: formData.ctaSecondaryTextAr, he: formData.ctaSecondaryTextHe },
      ctaSecondaryLink: formData.ctaSecondaryLink || null,
      mediaId: formData.mediaId,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,
    };

    try {
      if (editingSlide) {
        await adminApi.updateHero(editingSlide.id, payload);
      } else {
        await adminApi.createHero(payload);
      }
      setShowModal(false);
      loadSlides();
    } catch {
      setError(t('heroSlides.errorSave'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('heroSlides.confirmDelete'))) return;
    try {
      await adminApi.deleteHero(id);
      loadSlides();
    } catch {
      setError(t('heroSlides.errorDelete'));
    }
  };

  const getMediaUrl = (item: any) => {
    if (!item?.media?.fileUrl) return null;
    const apiUrl = (import.meta.env.VITE_CMS_API_URL || '').replace(/\/api\/?$/, '');
    const url = item.media.fileUrl;
    return url.startsWith('http') ? url : `${apiUrl}${url}`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('heroSlides.title')}</h1>
          <p className="text-slate-400 mt-1">{t('heroSlides.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadSlides} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
            <RefreshCw size={16} /> {t('plans.refresh')}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
            <Plus size={16} /> {t('heroSlides.addSlide')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 text-red-200 px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Slides List */}
      <div className="space-y-4">
        {slides.map((slide) => {
          const imgUrl = getMediaUrl(slide);
          return (
            <div key={slide.id} className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
              <GripVertical size={20} className="text-slate-500 flex-shrink-0" />

              {/* Thumbnail */}
              <div className="w-24 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                {imgUrl ? (
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No image</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                  {slide.title?.en || slide.title?.ar || 'Untitled'}
                </h3>
                <p className="text-slate-400 text-sm truncate">
                  {slide.subtitle?.en || slide.subtitle?.ar || ''}
                </p>
                {slide.badge?.en && (
                  <span className="inline-block mt-1 text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                    {slide.badge.en}
                  </span>
                )}
              </div>

              {/* Status */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${slide.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                {slide.isActive ? t('common.active') : t('common.inactive')}
              </span>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => openEdit(slide)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(slide.id)} className="p-2 rounded-lg hover:bg-red-900/50 text-slate-400 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {slides.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            {t('heroSlides.noSlides')}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                {editingSlide ? t('heroSlides.editSlide') : t('heroSlides.addSlide')}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('heroSlides.backgroundImage')}</label>
                <MediaPicker
                  value={formData.mediaId ? [formData.mediaId] : []}
                  onChange={(ids) => setFormData({ ...formData, mediaId: ids[0] || null })}
                  accept="image"
                />
              </div>

              {/* Badge */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.badge')} (EN)</label>
                  <input value={formData.badgeEn} onChange={(e) => setFormData({ ...formData, badgeEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" placeholder="e.g. New" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.badge')} (AR)</label>
                  <input value={formData.badgeAr} onChange={(e) => setFormData({ ...formData, badgeAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.badge')} (HE)</label>
                  <input value={formData.badgeHe} onChange={(e) => setFormData({ ...formData, badgeHe: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" />
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.titleField')} (EN) *</label>
                  <input required value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.titleField')} (AR) *</label>
                  <input required value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.titleField')} (HE)</label>
                  <input value={formData.titleHe} onChange={(e) => setFormData({ ...formData, titleHe: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" />
                </div>
              </div>

              {/* Subtitle */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.subtitleField')} (EN)</label>
                  <input value={formData.subtitleEn} onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.subtitleField')} (AR)</label>
                  <input value={formData.subtitleAr} onChange={(e) => setFormData({ ...formData, subtitleAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.subtitleField')} (HE)</label>
                  <input value={formData.subtitleHe} onChange={(e) => setFormData({ ...formData, subtitleHe: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" />
                </div>
              </div>

              {/* CTA Primary */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.primaryButtonLink')}</label>
                <input value={formData.ctaPrimaryLink} onChange={(e) => setFormData({ ...formData, ctaPrimaryLink: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" placeholder="/new-line" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.buttonText')} (EN)</label>
                  <input value={formData.ctaPrimaryTextEn} onChange={(e) => setFormData({ ...formData, ctaPrimaryTextEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.buttonText')} (AR)</label>
                  <input value={formData.ctaPrimaryTextAr} onChange={(e) => setFormData({ ...formData, ctaPrimaryTextAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('heroSlides.buttonText')} (HE)</label>
                  <input value={formData.ctaPrimaryTextHe} onChange={(e) => setFormData({ ...formData, ctaPrimaryTextHe: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" />
                </div>
              </div>

              {/* Active + Sort */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-slate-300">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                  {t('common.active')}
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">{t('heroSlides.sortOrder')}</label>
                  <input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} className="w-20 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
                  {editingSlide ? t('common.update') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
