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
import QRCode from 'qrcode';

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
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

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

  // Generate the QR code locally (no external service, no CORS issues)
  const generateQrDataUrl = (dealerId: number) =>
    QRCode.toDataURL(getQrUrl(dealerId), {
      width: 300,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

  const handleCopyLink = async (dealer: Dealer) => {
    try {
      await navigator.clipboard.writeText(getQrUrl(dealer.id));
      setCopiedId(dealer.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  // Resolution used to map physical cm sizes onto pixels for printing.
  const PRINT_DPI = 300;
  const cmToPx = (cm: number) => Math.round((cm / 2.54) * PRINT_DPI);

  // PNG CRC-32 (needed to build a valid pHYs chunk)
  const crc32 = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
    return (bytes: Uint8Array) => {
      let crc = 0xffffffff;
      for (let i = 0; i < bytes.length; i++) crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
      return (crc ^ 0xffffffff) >>> 0;
    };
  })();

  // Inject a pHYs chunk so the PNG carries its DPI and prints at the exact cm size.
  const setPngDpi = (bytes: Uint8Array, dpi: number) => {
    const ppm = Math.round(dpi / 0.0254); // pixels per metre
    const chunk = new Uint8Array(21); // 4 len + 4 type + 9 data + 4 crc
    const dv = new DataView(chunk.buffer);
    dv.setUint32(0, 9); // data length
    chunk.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
    dv.setUint32(8, ppm); // x ppm
    dv.setUint32(12, ppm); // y ppm
    chunk[16] = 1; // unit: metre
    dv.setUint32(17, crc32(chunk.subarray(4, 17)));

    // Insert right after the IHDR chunk (8 sig + 25 IHDR = offset 33)
    const at = 33;
    const out = new Uint8Array(bytes.length + chunk.length);
    out.set(bytes.subarray(0, at), 0);
    out.set(chunk, at);
    out.set(bytes.subarray(at), at + chunk.length);
    return out;
  };

  // Render the QR + dealer name onto a canvas sized to exact physical dimensions.
  const renderQrCanvas = async (dealer: Dealer, widthCm: number, heightCm: number) => {
    const name = getName(dealer);
    const targetW = cmToPx(widthCm);
    const targetH = cmToPx(heightCm);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    const padding = Math.round(Math.min(targetW, targetH) * 0.06);
    const fontSize = Math.max(10, Math.round(targetH * 0.06));
    const lineHeight = Math.round(fontSize * 1.25);

    // Wrap the name into at most two lines that fit the width
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    const maxTextWidth = targetW - padding * 2;
    const words = name.split(/\s+/);
    const allLines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxTextWidth && current) {
        allLines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) allLines.push(current);
    const lines = allLines.slice(0, 2);
    const labelHeight = lines.length * lineHeight + Math.round(padding * 0.5);

    // Largest centred QR square that fits the remaining space
    const qrSize = Math.max(
      0,
      Math.min(targetW - padding * 2, targetH - padding * 2 - labelHeight),
    );

    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, getQrUrl(dealer.id), {
      width: qrSize,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    const qrX = (targetW - qrSize) / 2;
    const qrY = padding;
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // Dealer name under the QR (wrapped)
    ctx.fillStyle = '#0f172a';
    ctx.font = `600 ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textTop = qrY + qrSize + Math.round(padding * 0.5);
    lines.forEach((line, i) => {
      ctx.fillText(line, targetW / 2, textTop + i * lineHeight + lineHeight / 2);
    });

    return canvas;
  };

  const handleDownloadQr = async (
    dealer: Dealer,
    widthCm: number,
    heightCm: number,
    sizeKey: string,
  ) => {
    const canvas = await renderQrCanvas(dealer, widthCm, heightCm);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const withDpi = setPngDpi(bytes, PRINT_DPI);
      const url = URL.createObjectURL(new Blob([withDpi], { type: 'image/png' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `dealer-${dealer.id}-qr-${sizeKey}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const openQrModal = async (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setQrDataUrl('');
    setShowQrModal(true);
    try {
      setQrDataUrl(await generateQrDataUrl(dealer.id));
    } catch {
      // leave blank if generation fails
    }
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
              <div className="bg-white p-4 rounded-xl flex flex-col items-center gap-2">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-slate-400" size={32} />
                  </div>
                )}
                <span className="text-slate-900 font-semibold text-center text-sm max-w-64 break-words">
                  {getName(selectedDealer)}
                </span>
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
              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={() => handleDownloadQr(selectedDealer, 7.5, 6.7, 'large')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-full justify-center"
                >
                  <Download size={16} />
                  {t('dealers.downloadQrLarge')}
                </button>
                <button
                  onClick={() => handleDownloadQr(selectedDealer, 2.15, 1.9, 'small')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors w-full justify-center"
                >
                  <Download size={16} />
                  {t('dealers.downloadQrSmall')}
                </button>
              </div>
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
