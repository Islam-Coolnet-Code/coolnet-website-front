import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import { MediaPicker } from '../components/MediaPicker';
import { Plus, Pencil, Trash2, RefreshCw, X, Wifi } from 'lucide-react';

interface RouterItem {
  id: number;
  sku: string;
  category: string;
  title: { en: string; ar: string; he: string };
  description: { en: string; ar: string; he: string } | null;
  mediaId: number | null;
  purchasePrice: number;
  rentalPrice: number | null;
  isRentable: boolean;
  offerText: { en: string; ar: string; he: string } | null;
  sortOrder: number;
  isActive: boolean;
  media?: any;
}

const emptyForm = {
  sku: '',
  category: 'residential',
  titleEn: '',
  titleAr: '',
  titleHe: '',
  descriptionEn: '',
  descriptionAr: '',
  descriptionHe: '',
  mediaId: null as number | null,
  purchasePrice: '',
  rentalPrice: '',
  isRentable: false,
  offerTextEn: '',
  offerTextAr: '',
  offerTextHe: '',
  sortOrder: 0,
  isActive: true,
};

export function RoutersPage() {
  const [routers, setRouters] = useState<RouterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RouterItem | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const { apiKey } = useAuth();
  const { t } = useAdminLanguage();

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      load();
    }
  }, [apiKey]);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getRouters();
      setRouters(res.data || []);
    } catch {
      setError(t('routers.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const getMediaUrl = (item: any) => {
    if (!item?.media?.fileUrl) return null;
    const apiUrl = (import.meta.env.VITE_CMS_API_URL || '').replace(/\/api\/?$/, '');
    const url = item.media.fileUrl;
    return url.startsWith('http') ? url : `${apiUrl}${url}`;
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ ...emptyForm, sortOrder: routers.length });
    setShowModal(true);
  };

  const openEdit = (item: RouterItem) => {
    setEditing(item);
    setFormData({
      sku: item.sku || '',
      category: item.category || 'residential',
      titleEn: item.title?.en || '',
      titleAr: item.title?.ar || '',
      titleHe: item.title?.he || '',
      descriptionEn: item.description?.en || '',
      descriptionAr: item.description?.ar || '',
      descriptionHe: item.description?.he || '',
      mediaId: item.mediaId,
      purchasePrice: String(typeof item.purchasePrice === 'object' ? item.purchasePrice?.amount : item.purchasePrice || ''),
      rentalPrice: String(typeof item.rentalPrice === 'object' ? item.rentalPrice?.amount : item.rentalPrice || ''),
      isRentable: item.isRentable,
      offerTextEn: item.offerText?.en || '',
      offerTextAr: item.offerText?.ar || '',
      offerTextHe: item.offerText?.he || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      sku: formData.sku,
      category: formData.category,
      title: { en: formData.titleEn, ar: formData.titleAr, he: formData.titleHe },
      description: { en: formData.descriptionEn, ar: formData.descriptionAr, he: formData.descriptionHe },
      mediaId: formData.mediaId,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      rentalPrice: formData.rentalPrice ? parseFloat(formData.rentalPrice) : null,
      isRentable: formData.isRentable,
      offerText: { en: formData.offerTextEn, ar: formData.offerTextAr, he: formData.offerTextHe },
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
    };
    try {
      if (editing) {
        await adminApi.updateRouter(editing.id, payload);
      } else {
        await adminApi.createRouter(payload);
      }
      setShowModal(false);
      load();
    } catch {
      setError(t('routers.errorSave'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('routers.confirmDelete'))) return;
    try {
      await adminApi.deleteRouter(id);
      load();
    } catch {
      setError(t('routers.errorDelete'));
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('routers.title')}</h1>
          <p className="text-slate-400 mt-1">{t('routers.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"><RefreshCw size={16} /> {t('plans.refresh')}</button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"><Plus size={16} /> {t('routers.addRouter')}</button>
        </div>
      </div>

      {error && <div className="bg-red-900/50 text-red-200 px-4 py-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routers.map((item) => {
          const imgUrl = getMediaUrl(item);
          return (
            <div key={item.id} className="bg-slate-800 rounded-xl p-4">
              <div className="w-full h-32 bg-slate-700 rounded-lg overflow-hidden mb-3">
                {imgUrl ? (
                  <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Wifi size={32} className="text-slate-500" /></div>
                )}
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-white font-medium">{item.title?.en || item.title?.ar || 'Untitled'}</h3>
                  <span className="text-xs text-slate-500">SKU: {item.sku}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${item.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                  {item.isActive ? t('common.active') : t('common.inactive')}
                </span>
              </div>
              <div className="text-sm text-slate-400 mb-3">
                <span className="text-green-400 font-semibold">₪{typeof item.purchasePrice === 'object' ? item.purchasePrice?.amount : item.purchasePrice}</span>
                {item.isRentable && item.rentalPrice && <span className="ml-2">/ ₪{typeof item.rentalPrice === 'object' ? item.rentalPrice?.amount : item.rentalPrice}/mo rental</span>}
              </div>
              {item.offerText?.en && <p className="text-xs text-orange-300 bg-orange-900/30 px-2 py-1 rounded mb-3">{item.offerText.en}</p>}
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="flex-1 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm">{t('common.edit')}</button>
                <button onClick={() => handleDelete(item.id)} className="py-1.5 px-3 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900 text-sm"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {routers.length === 0 && <div className="text-center py-12 text-slate-400">{t('routers.noRouters')}</div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">{editing ? t('routers.editRouter') : t('routers.addRouter')}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('routers.image')}</label>
                <MediaPicker value={formData.mediaId ? [formData.mediaId] : []} onChange={(ids) => setFormData({ ...formData, mediaId: ids[0] || null })} accept="image" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.sku')}</label><input required value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" placeholder="e.g. RTR-001" /></div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{t('routers.category')}</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm">
                    <option value="residential">{t('routers.residential')}</option>
                    <option value="business">{t('routers.business')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.titleField')} (EN) *</label><input required value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.titleField')} (AR) *</label><input required value={formData.titleAr} onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.titleField')} (HE)</label><input value={formData.titleHe} onChange={(e) => setFormData({ ...formData, titleHe: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.description')} (EN)</label><textarea value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" rows={2} /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.description')} (AR)</label><textarea value={formData.descriptionAr} onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" rows={2} dir="rtl" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.description')} (HE)</label><textarea value={formData.descriptionHe} onChange={(e) => setFormData({ ...formData, descriptionHe: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" rows={2} dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.purchasePrice')}</label><input required type="number" step="0.01" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.rentalPrice')}</label><input type="number" step="0.01" value={formData.rentalPrice} onChange={(e) => setFormData({ ...formData, rentalPrice: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.offerText')} (EN)</label><input value={formData.offerTextEn} onChange={(e) => setFormData({ ...formData, offerTextEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" placeholder="e.g. Free installation" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.offerText')} (AR)</label><input value={formData.offerTextAr} onChange={(e) => setFormData({ ...formData, offerTextAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('routers.offerText')} (HE)</label><input value={formData.offerTextHe} onChange={(e) => setFormData({ ...formData, offerTextHe: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" /></div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-slate-300"><input type="checkbox" checked={formData.isRentable} onChange={(e) => setFormData({ ...formData, isRentable: e.target.checked })} className="rounded" /> {t('routers.rentable')}</label>
                <label className="flex items-center gap-2 text-slate-300"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" /> {t('common.active')}</label>
                <div className="flex items-center gap-2"><label className="text-xs text-slate-400">{t('heroSlides.sortOrder')}</label><input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} className="w-20 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" /></div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">{t('common.cancel')}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">{editing ? t('common.update') : t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
