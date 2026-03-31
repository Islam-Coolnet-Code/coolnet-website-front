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
  Users,
  X,
} from 'lucide-react';
import { MediaPicker } from '../components/MediaPicker';

export function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { apiKey } = useAuth();
  const { t } = useAdminLanguage();

  const [logoMediaIds, setLogoMediaIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    websiteUrl: '',
    category: 'technology',
    isActive: true,
  });

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadPartners();
    }
  }, [apiKey]);

  const loadPartners = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getPartners();
      setPartners(response.data || []);
    } catch (err) {
      setError(t('partners.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (partner?: any) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name || '',
        logoUrl: partner.logoUrl || partner.logo_url || '',
        websiteUrl: partner.websiteUrl || partner.website_url || '',
        category: partner.category || 'technology',
        isActive: partner.isActive !== false,
      });
      adminApi.getContentMedia('partners', partner.id, 'logo').then(res => {
        setLogoMediaIds((res.data || []).map((m: any) => m.media_id || m.id));
      }).catch(() => setLogoMediaIds([]));
    } else {
      setEditingPartner(null);
      setLogoMediaIds([]);
      setFormData({
        name: '',
        logoUrl: '',
        websiteUrl: '',
        category: 'technology',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPartner(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = {
        name: formData.name,
        logoUrl: formData.logoUrl,
        websiteUrl: formData.websiteUrl,
        category: formData.category,
        isActive: formData.isActive,
      };

      let partnerId: number;
      if (editingPartner) {
        await adminApi.updatePartner(editingPartner.id, data);
        partnerId = editingPartner.id;
      } else {
        const res = await adminApi.createPartner(data);
        partnerId = res.data?.id || res.id;
      }

      if (partnerId) {
        await adminApi.setContentMedia('partners', partnerId,
          logoMediaIds.map((id, i) => ({ mediaId: id, mediaRole: 'logo', sortOrder: i })),
          'logo'
        );
      }

      closeModal();
      loadPartners();
    } catch (err) {
      setError(t('partners.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('partners.confirmDelete'))) return;

    try {
      await adminApi.deletePartner(id);
      loadPartners();
    } catch (err) {
      setError(t('partners.errorDelete'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('partners.title')}</h1>
          <p className="text-slate-400 mt-1">{t('partners.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPartners}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            {t('partners.refresh')}
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            {t('partners.addPartner')}
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

      {/* Partners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : partners.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('partners.noPartners')}</p>
          </div>
        ) : (
          partners.map((partner) => (
            <div
              key={partner.id}
              className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    partner.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {partner.isActive ? t('partners.active') : t('partners.inactive')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(partner)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {partner.logoUrl || partner.logo_url ? (
                  <img
                    src={partner.logoUrl || partner.logo_url}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain p-4"
                  />
                ) : (
                  <Users size={40} className="text-slate-500" />
                )}
              </div>

              <h3 className="text-white font-medium">{partner.name}</h3>
              <p className="text-sm text-slate-400 mt-1">{partner.category}</p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">
                {editingPartner ? t('partners.editPartner') : t('partners.addNewPartner')}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('partners.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <MediaPicker
                label="Logo Image"
                value={logoMediaIds}
                onChange={(ids) => setLogoMediaIds(ids)}
                accept="image"
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('partners.logoUrl')}
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://... (or use media picker above)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('partners.websiteUrl')}
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('partners.category')}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="technology">{t('partners.technology')}</option>
                  <option value="telecommunications">{t('partners.telecom')}</option>
                  <option value="media">{t('partners.mediaCategory')}</option>
                  <option value="other">{t('partners.other')}</option>
                </select>
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
                  {t('partners.active')}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {t('partners.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                  {editingPartner ? t('partners.update') : t('partners.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
