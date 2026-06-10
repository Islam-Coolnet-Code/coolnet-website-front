import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import { Plus, Pencil, Trash2, RefreshCw, X } from 'lucide-react';

interface PlanAddon {
  id: number;
  code: string;
  name: { en: string; ar: string; he: string };
  description: { en: string; ar: string; he: string } | null;
  monthlyPrice: number;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm = {
  code: '',
  nameEn: '',
  nameAr: '',
  nameHe: '',
  descriptionEn: '',
  descriptionAr: '',
  descriptionHe: '',
  monthlyPrice: '',
  icon: '',
  sortOrder: 0,
  isActive: true,
};

export function PlanAddonsPage() {
  const [addons, setAddons] = useState<PlanAddon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PlanAddon | null>(null);
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
      const res = await adminApi.getPlanAddons();
      setAddons(res.data || []);
    } catch {
      setError(t('planAddons.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ ...emptyForm, sortOrder: addons.length });
    setShowModal(true);
  };

  const openEdit = (item: PlanAddon) => {
    setEditing(item);
    setFormData({
      code: item.code || '',
      nameEn: item.name?.en || '',
      nameAr: item.name?.ar || '',
      nameHe: item.name?.he || '',
      descriptionEn: item.description?.en || '',
      descriptionAr: item.description?.ar || '',
      descriptionHe: item.description?.he || '',
      monthlyPrice: String(typeof item.monthlyPrice === 'object' ? (item.monthlyPrice as any)?.amount : item.monthlyPrice || ''),
      icon: item.icon || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: formData.code,
      name: { en: formData.nameEn, ar: formData.nameAr, he: formData.nameHe },
      description: { en: formData.descriptionEn, ar: formData.descriptionAr, he: formData.descriptionHe },
      monthlyPrice: parseFloat(formData.monthlyPrice) || 0,
      icon: formData.icon || null,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
    };
    try {
      if (editing) {
        await adminApi.updatePlanAddon(editing.id, payload);
      } else {
        await adminApi.createPlanAddon(payload);
      }
      setShowModal(false);
      load();
    } catch {
      setError(t('planAddons.errorSave'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('planAddons.confirmDelete'))) return;
    try {
      await adminApi.deletePlanAddon(id);
      load();
    } catch {
      setError(t('planAddons.errorDelete'));
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('planAddons.title')}</h1>
          <p className="text-slate-400 mt-1">{t('planAddons.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
            <RefreshCw size={16} /> {t('plans.refresh')}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
            <Plus size={16} /> {t('planAddons.addAddon')}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-900/50 text-red-200 px-4 py-3 rounded-lg">{error}</div>}

      <div className="space-y-3">
        {addons.map((item) => (
          <div key={item.id} className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-medium">{item.name?.en || item.name?.ar || 'Untitled'}</h3>
                <span className="text-xs text-slate-500">({item.code})</span>
              </div>
              <p className="text-slate-400 text-sm truncate">{item.description?.en || item.description?.ar || ''}</p>
            </div>
            <span className="text-green-400 font-semibold">₪{typeof item.monthlyPrice === 'object' ? (item.monthlyPrice as any)?.amount : item.monthlyPrice}/mo</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
              {item.isActive ? t('common.active') : t('common.inactive')}
            </span>
            <div className="flex gap-2">
              <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-900/50 text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {addons.length === 0 && <div className="text-center py-12 text-slate-400">{t('planAddons.noAddons')}</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">{editing ? t('planAddons.editAddon') : t('planAddons.addAddon')}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('planAddons.code')}</label>
                <input required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" placeholder="e.g. STATIC_IP" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-slate-400 mb-1">{t('planAddons.name')} (EN) *</label><input required value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('planAddons.name')} (AR) *</label><input required value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('planAddons.name')} (HE)</label><input value={formData.nameHe} onChange={(e) => setFormData({ ...formData, nameHe: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-slate-400 mb-1">{t('planAddons.description')} (EN)</label><input value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('planAddons.description')} (AR)</label><input value={formData.descriptionAr} onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">{t('planAddons.description')} (HE)</label><input value={formData.descriptionHe} onChange={(e) => setFormData({ ...formData, descriptionHe: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" dir="rtl" /></div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t('planAddons.monthlyPrice')}</label>
                <input required type="number" step="0.01" value={formData.monthlyPrice} onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })} className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 text-sm" />
              </div>
              <div className="flex items-center gap-6">
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
