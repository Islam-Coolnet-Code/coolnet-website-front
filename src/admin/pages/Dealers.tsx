import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  QrCode,
  Copy,
  Download,
  Check,
  Phone,
  MapPin,
  Wrench,
  Headphones,
  Cable,
} from 'lucide-react';
import { MediaPicker } from '../components/MediaPicker';

interface Dealer {
  id: number;
  name: { ar: string; en: string; he?: string };
  address: { ar: string; en: string; he?: string };
  phone: string;
  email: string | null;
  location: { lat: number; lng: number };
  hasInstallation: boolean;
  hasSupport: boolean;
  hasNewConnections: boolean;
  isActive: boolean;
}

const defaultForm = {
  nameEn: '',
  nameAr: '',
  nameHe: '',
  phone: '',
  email: '',
  addressEn: '',
  addressAr: '',
  lat: '',
  lng: '',
  hasInstallation: false,
  hasSupport: false,
  hasNewConnections: true,
  isActive: true,
};

export function DealersPage() {
  const { apiKey } = useAuth();
  const { t, language } = useAdminLanguage();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [dealerMediaIds, setDealerMediaIds] = useState<number[]>([]);
  const [formData, setFormData] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadDealers();
    }
  }, [apiKey]);

  const loadDealers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminApi.getDealers();
      setDealers(response.data || []);
    } catch (err: any) {
      setError(err.message || t('dealers.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const getQrUrl = (dealerId: number) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/new-line?dealer=${dealerId}`;
  };

  const getQrImageUrl = (dealerId: number) => {
    const url = encodeURIComponent(getQrUrl(dealerId));
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${url}`;
  };

  const handleCopyLink = async (dealer: Dealer) => {
    try {
      await navigator.clipboard.writeText(getQrUrl(dealer.id));
      setCopiedId(dealer.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadQr = (dealer: Dealer) => {
    const link = document.createElement('a');
    link.href = getQrImageUrl(dealer.id);
    link.download = `dealer-${dealer.id}-qr.png`;
    link.click();
  };

  const openQrModal = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setShowQrModal(true);
  };

  const openModal = (dealer?: Dealer) => {
    if (dealer) {
      setEditingDealer(dealer);
      setFormData({
        nameEn: dealer.name.en,
        nameAr: dealer.name.ar,
        nameHe: dealer.name.he || '',
        phone: dealer.phone,
        email: dealer.email || '',
        addressEn: dealer.address.en,
        addressAr: dealer.address.ar,
        lat: dealer.location?.lat?.toString() || '',
        lng: dealer.location?.lng?.toString() || '',
        hasInstallation: dealer.hasInstallation,
        hasSupport: dealer.hasSupport,
        hasNewConnections: dealer.hasNewConnections,
        isActive: !!dealer.isActive,
      });
      adminApi.getContentMedia('dealers', dealer.id).then(res => {
        setDealerMediaIds((res.data || []).map((m: any) => m.media_id || m.id));
      }).catch(() => setDealerMediaIds([]));
    } else {
      setEditingDealer(null);
      setDealerMediaIds([]);
      setFormData(defaultForm);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDealer(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      const payload = {
        name: { en: formData.nameEn, ar: formData.nameAr, he: formData.nameHe },
        address: { en: formData.addressEn, ar: formData.addressAr, he: '' },
        phone: formData.phone,
        email: formData.email || null,
        location: { lat: parseFloat(formData.lat) || 0, lng: parseFloat(formData.lng) || 0 },
        hasInstallation: formData.hasInstallation,
        hasSupport: formData.hasSupport,
        hasNewConnections: formData.hasNewConnections,
        isActive: formData.isActive,
      };
      let dealerId: number;
      if (editingDealer) {
        await adminApi.updateDealer(editingDealer.id, payload);
        dealerId = editingDealer.id;
      } else {
        const res = await adminApi.createDealer(payload);
        dealerId = res.data?.id || res.id;
      }

      if (dealerId) {
        await adminApi.setContentMedia('dealers', dealerId,
          dealerMediaIds.map((id, i) => ({ mediaId: id, mediaRole: 'gallery', sortOrder: i }))
        );
      }

      closeModal();
      await loadDealers();
    } catch (err: any) {
      setError(err.message || t('dealers.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('dealers.confirmDelete'))) return;
    try {
      await adminApi.deleteDealer(id);
      await loadDealers();
    } catch (err: any) {
      setError(err.message || t('dealers.errorDelete'));
    }
  };

  const getName = (dealer: Dealer) =>
    language === 'ar' ? dealer.name.ar : dealer.name.en;

  const getAddress = (dealer: Dealer) =>
    language === 'ar' ? dealer.address.ar : dealer.address.en;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('dealers.title')}</h1>
          <p className="text-slate-400 mt-1">{t('dealers.subtitle')}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          {t('dealers.addDealer')}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Dealers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {dealers.map((dealer) => (
          <div
            key={dealer.id}
            className={`bg-slate-800 rounded-xl p-5 border transition-colors ${
              dealer.isActive ? 'border-slate-700' : 'border-slate-700/50 opacity-60'
            }`}
          >
            {/* Dealer Info */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg truncate">{getName(dealer)}</h3>
                {language === 'ar' && dealer.name.en && (
                  <p className="text-xs text-slate-500">{dealer.name.en}</p>
                )}
                {language !== 'ar' && dealer.name.ar && (
                  <p className="text-xs text-slate-500">{dealer.name.ar}</p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                dealer.isActive ? 'bg-green-600/20 text-green-400' : 'bg-slate-700 text-slate-400'
              }`}>
                {dealer.isActive ? t('dealers.active') : t('dealers.inactive')}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone size={14} />
                <span>{dealer.phone}</span>
              </div>
              {getAddress(dealer) && (
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={14} />
                  <span className="truncate">{getAddress(dealer)}</span>
                </div>
              )}
              <div className="flex gap-3 text-xs">
                {dealer.hasInstallation && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <Wrench size={12} /> {t('dealers.installation')}
                  </span>
                )}
                {dealer.hasSupport && (
                  <span className="flex items-center gap-1 text-green-400">
                    <Headphones size={12} /> {t('dealers.support')}
                  </span>
                )}
                {dealer.hasNewConnections && (
                  <span className="flex items-center gap-1 text-purple-400">
                    <Cable size={12} /> {t('dealers.newConnections')}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
              <button
                onClick={() => openQrModal(dealer)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg text-sm transition-colors"
              >
                <QrCode size={14} />
                {t('dealers.qrCode')}
              </button>
              <button
                onClick={() => handleCopyLink(dealer)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg text-sm transition-colors"
              >
                {copiedId === dealer.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copiedId === dealer.id ? t('dealers.linkCopied') : t('dealers.copyLink')}
              </button>
              <div className="flex-1" />
              <button
                onClick={() => openModal(dealer)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(dealer.id)}
                className="p-2 rounded-lg hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {dealers.length === 0 && !isLoading && (
        <div className="text-center py-12 text-slate-400">
          {t('dealers.noDealers')}
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && selectedDealer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                {t('dealers.qrCode')} — {getName(selectedDealer)}
              </h2>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-xl">
                <img
                  src={getQrImageUrl(selectedDealer.id)}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>
              <div className="w-full">
                <label className="block text-xs text-slate-400 mb-1">{t('dealers.qrLink')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getQrUrl(selectedDealer.id)}
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm font-mono"
                  />
                  <button
                    onClick={() => handleCopyLink(selectedDealer)}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                  >
                    {copiedId === selectedDealer.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleDownloadQr(selectedDealer)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-full justify-center"
              >
                <Download size={16} />
                {t('dealers.downloadQr')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                {editingDealer ? t('dealers.editDealer') : t('dealers.addDealer')}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <MediaPicker
                label="Dealer Images"
                value={dealerMediaIds}
                onChange={(ids) => setDealerMediaIds(ids)}
                multiple
              />

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('dealers.nameEn')}</label>
                  <input type="text" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('dealers.nameAr')}</label>
                  <input type="text" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" dir="rtl" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('dealers.phone')}</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('dealers.email')}</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('dealers.addressEn')}</label>
                  <input type="text" value={formData.addressEn} onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('dealers.addressAr')}</label>
                  <input type="text" value={formData.addressAr} onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" dir="rtl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('dealers.lat')}</label>
                  <input type="text" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" placeholder="32.0853" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('dealers.lng')}</label>
                  <input type="text" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" placeholder="34.7818" />
                </div>
              </div>

              {/* Service checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={formData.hasInstallation} onChange={(e) => setFormData({ ...formData, hasInstallation: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-300">{t('dealers.installation')}</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={formData.hasSupport} onChange={(e) => setFormData({ ...formData, hasSupport: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-300">{t('dealers.support')}</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={formData.hasNewConnections} onChange={(e) => setFormData({ ...formData, hasNewConnections: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-300">{t('dealers.newConnections')}</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-300">{t('dealers.active')}</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                  {t('dealers.cancel')}
                </button>
                <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {editingDealer ? t('dealers.update') : t('dealers.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
