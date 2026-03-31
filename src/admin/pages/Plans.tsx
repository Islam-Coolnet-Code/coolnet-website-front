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
  Wifi,
  X,
} from 'lucide-react';

export function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { apiKey } = useAuth();
  const { t } = useAdminLanguage();

  const [formData, setFormData] = useState({
    code: '',
    category: 'home',
    title_en: '',
    title_ar: '',
    title_he: '',
    price: '',
    downloadSpeed: '',
    uploadSpeed: '',
    isActive: true,
  });

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadPlans();
    }
  }, [apiKey]);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getPlans();
      setPlans(response.data || []);
    } catch (err) {
      setError(t('plans.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        code: plan.code || '',
        category: plan.category || 'home',
        title_en: plan.title?.en || '',
        title_ar: plan.title?.ar || '',
        title_he: plan.title?.he || '',
        price: plan.price?.amount?.toString() || plan.price?.toString() || '',
        downloadSpeed: plan.downloadSpeed?.toString() || '',
        uploadSpeed: plan.uploadSpeed?.toString() || '',
        isActive: plan.isActive !== false,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        code: '',
        category: 'home',
        title_en: '',
        title_ar: '',
        title_he: '',
        price: '',
        downloadSpeed: '',
        uploadSpeed: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = {
        code: formData.code,
        category: formData.category,
        title: {
          en: formData.title_en,
          ar: formData.title_ar,
          he: formData.title_he || formData.title_en,
        },
        price: parseFloat(formData.price),
        downloadSpeed: parseInt(formData.downloadSpeed),
        uploadSpeed: parseInt(formData.uploadSpeed),
        isActive: formData.isActive,
      };

      if (editingPlan) {
        await adminApi.updatePlan(editingPlan.id, data);
      } else {
        await adminApi.createPlan(data);
      }

      closeModal();
      loadPlans();
    } catch (err) {
      setError(t('plans.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('plans.confirmDelete'))) return;

    try {
      await adminApi.deletePlan(id);
      loadPlans();
    } catch (err) {
      setError(t('plans.errorDelete'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('plans.title')}</h1>
          <p className="text-slate-400 mt-1">{t('plans.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPlans}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            {t('plans.refresh')}
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            {t('plans.addPlan')}
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <Wifi size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('plans.noPlans')}</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-medium text-blue-400 uppercase">
                    {plan.category}
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-1">
                    {plan.title?.en || plan.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(plan)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('plans.price')}</span>
                  <span className="text-white font-medium">₪{plan.price?.amount || plan.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('plans.download')}</span>
                  <span className="text-white">{plan.downloadSpeed} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('plans.upload')}</span>
                  <span className="text-white">{plan.uploadSpeed} Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('plans.status')}</span>
                  <span className={plan.isActive ? 'text-green-400' : 'text-red-400'}>
                    {plan.isActive ? t('plans.active') : t('plans.inactive')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">
                {editingPlan ? t('plans.editPlan') : t('plans.addNewPlan')}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('plans.code')}
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('plans.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="home">{t('plans.home')}</option>
                    <option value="business">{t('plans.business')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('plans.titleEn')}
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('plans.titleAr')}
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('plans.price')} (₪)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('plans.download')} (Mbps)
                  </label>
                  <input
                    type="number"
                    value={formData.downloadSpeed}
                    onChange={(e) => setFormData({ ...formData, downloadSpeed: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('plans.upload')} (Mbps)
                  </label>
                  <input
                    type="number"
                    value={formData.uploadSpeed}
                    onChange={(e) => setFormData({ ...formData, uploadSpeed: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-300">
                  {t('plans.active')}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {t('plans.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                  {editingPlan ? t('plans.update') : t('plans.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
