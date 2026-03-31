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
  MapPin,
  X,
} from 'lucide-react';

export function ZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const { apiKey } = useAuth();
  const { t, language } = useAdminLanguage();

  const [formData, setFormData] = useState({
    cityId: '',
    code: '',
    name_en: '',
    name_ar: '',
    name_he: '',
    isActive: true,
  });

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadZones();
      loadCities();
    }
  }, [apiKey]);

  const loadCities = async () => {
    try {
      const response = await adminApi.getCities();
      setCities(response.data || []);
    } catch (err) {
      // Cities loading failure is non-blocking
    }
  };

  const loadZones = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getZones();
      setZones(response.data || []);
    } catch (err) {
      setError(t('zones.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (zone?: any) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        cityId: zone.cityId?.toString() || '',
        code: zone.code || '',
        name_en: zone.name?.en || '',
        name_ar: zone.name?.ar || '',
        name_he: zone.name?.he || '',
        isActive: zone.isActive !== false,
      });
    } else {
      setEditingZone(null);
      setFormData({
        cityId: '',
        code: '',
        name_en: '',
        name_ar: '',
        name_he: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingZone(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = {
        cityId: formData.cityId ? parseInt(formData.cityId) : null,
        code: formData.code,
        name: {
          en: formData.name_en,
          ar: formData.name_ar,
          he: formData.name_he || formData.name_en,
        },
        isActive: formData.isActive,
      };

      if (editingZone) {
        await adminApi.updateZone(editingZone.id, data);
      } else {
        await adminApi.createZone(data);
      }

      closeModal();
      loadZones();
    } catch (err) {
      setError(t('zones.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('zones.confirmDelete'))) return;

    try {
      await adminApi.deleteZone(id);
      loadZones();
    } catch (err) {
      setError(t('zones.errorDelete'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('zones.title')}</h1>
          <p className="text-slate-400 mt-1">{t('zones.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadZones}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            {t('zones.refresh')}
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            {t('zones.addZone')}
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

      {/* Zones Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MapPin size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('zones.noZones')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-start text-sm text-slate-400 bg-slate-750">
                  <th className="px-6 py-4 font-medium text-start">{t('zones.city')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('zones.code')}</th>
                  <th className="px-6 py-4 font-medium text-start">{language === 'ar' ? t('zones.nameAr') : t('zones.nameEn')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('common.active')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {zones.map((zone) => (
                  <tr key={zone.id} className="border-t border-slate-700 hover:bg-slate-750">
                    <td className="px-6 py-4 text-white">
                      {(() => {
                        const city = cities.find((c) => c.id === zone.cityId);
                        return city ? (language === 'ar' ? city.name.ar : city.name.en) : '—';
                      })()}
                    </td>
                    <td className="px-6 py-4 font-mono text-blue-400">
                      {zone.code}
                    </td>
                    <td className="px-6 py-4 text-white">
                      <div>{language === 'ar' ? zone.name?.ar : zone.name?.en}</div>
                      <div className="text-xs text-slate-500">{language === 'ar' ? zone.name?.en : zone.name?.ar}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          zone.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {zone.isActive ? t('zones.active') : t('zones.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(zone)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(zone.id)}
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
                {editingZone ? t('zones.editZone') : t('zones.addNewZone')}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('zones.city')}
                </label>
                <select
                  value={formData.cityId}
                  onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('zones.selectCity')}</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {language === 'ar' ? city.name.ar : city.name.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('zones.code')}
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('zones.codePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('zones.nameEn')}
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('zones.nameAr')}
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                  required
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
                  {t('zones.active')}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {t('zones.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                  {editingZone ? t('zones.update') : t('zones.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
