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
  Building2,
  X,
} from 'lucide-react';

export function CitiesPage() {
  const [cities, setCities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { apiKey } = useAuth();
  const { t, language } = useAdminLanguage();

  const [formData, setFormData] = useState({
    code: '',
    nameEn: '',
    nameAr: '',
    nameHe: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadCities();
    }
  }, [apiKey]);

  const loadCities = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getCities();
      setCities(response.data || []);
    } catch (err) {
      setError(t('cities.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (city?: any) => {
    if (city) {
      setEditingCity(city);
      setFormData({
        code: city.code || '',
        nameEn: city.name?.en || '',
        nameAr: city.name?.ar || '',
        nameHe: city.name?.he || '',
        sortOrder: city.sortOrder || 0,
        isActive: city.isActive !== false,
      });
    } else {
      setEditingCity(null);
      setFormData({
        code: '',
        nameEn: '',
        nameAr: '',
        nameHe: '',
        sortOrder: 0,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = {
        code: formData.code,
        name: {
          en: formData.nameEn,
          ar: formData.nameAr,
          he: formData.nameHe || formData.nameEn,
        },
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };

      if (editingCity) {
        await adminApi.updateCity(editingCity.id, data);
      } else {
        await adminApi.createCity(data);
      }

      closeModal();
      loadCities();
    } catch (err) {
      setError(t('cities.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('cities.confirmDelete'))) return;

    try {
      await adminApi.deleteCity(id);
      loadCities();
    } catch (err) {
      setError(t('cities.errorDelete'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('cities.title')}</h1>
          <p className="text-slate-400 mt-1">{t('cities.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadCities}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            {t('cities.addCity')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400 mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ms-auto">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Cities Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('cities.noCities')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-start text-sm text-slate-400 bg-slate-750">
                  <th className="px-6 py-4 font-medium text-start">{t('cities.code')}</th>
                  <th className="px-6 py-4 font-medium text-start">{language === 'ar' ? t('cities.nameAr') : t('cities.nameEn')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('cities.sortOrder')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('common.active')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {cities.map((city) => (
                  <tr key={city.id} className="border-t border-slate-700 hover:bg-slate-750">
                    <td className="px-6 py-4 font-mono text-blue-400">
                      {city.code}
                    </td>
                    <td className="px-6 py-4 text-white">
                      <div>{language === 'ar' ? city.name?.ar : city.name?.en}</div>
                      <div className="text-xs text-slate-500">{language === 'ar' ? city.name?.en : city.name?.ar}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {city.sortOrder}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          city.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {city.isActive ? t('cities.active') : t('cities.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(city)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(city.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">
                {editingCity ? t('cities.editCity') : t('cities.addCity')}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('cities.code')}
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
                  {t('cities.nameEn')}
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('cities.nameAr')}
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('cities.nameHe')}
                </label>
                <input
                  type="text"
                  value={formData.nameHe}
                  onChange={(e) => setFormData({ ...formData, nameHe: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('cities.sortOrder')}
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  {t('cities.active')}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {t('cities.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                  {editingCity ? t('cities.update') : t('cities.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
