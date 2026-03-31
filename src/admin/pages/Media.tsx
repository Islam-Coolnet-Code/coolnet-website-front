import { useEffect, useState, useRef } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import {
  Upload,
  Trash2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  X,
  Copy,
  Check,
  Eye,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export function MediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { apiKey } = useAuth();
  const { t } = useAdminLanguage();

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadMedia();
    }
  }, [apiKey]);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getMedia({ limit: 50 });
      setMedia(response.data || []);
    } catch (err) {
      setError(t('media.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');

    try {
      for (const file of Array.from(files)) {
        await adminApi.uploadMedia(file);
      }
      loadMedia();
    } catch (err) {
      setError(t('media.errorUpload'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('media.confirmDelete'))) return;

    try {
      await adminApi.deleteMedia(id);
      loadMedia();
    } catch (err) {
      setError(t('media.errorDelete'));
    }
  };

  const copyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMediaUrl = (item: any) => {
    const apiUrl = import.meta.env.VITE_CMS_API_URL || '';
    const url = item.fileUrl || item.url;
    return url?.startsWith('http') ? url : `${apiUrl}${url}`;
  };

  const openImageViewer = (item: any) => {
    setSelectedImage(item);
    setZoom(1);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('media.title')}</h1>
          <p className="text-slate-400 mt-1">{t('media.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadMedia}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            {t('media.refresh')}
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer">
            <Upload size={18} />
            {t('media.upload')}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
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

      {isUploading && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center gap-3 text-blue-400 mb-6">
          <div className="w-5 h-5 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
          <span>{t('media.uploading')}</span>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : media.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <ImageIcon size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('media.noMedia')}</p>
            <p className="text-sm mt-1">{t('media.uploadHint')}</p>
          </div>
        ) : (
          media.map((item) => (
            <div
              key={item.id}
              className="group relative bg-slate-800 rounded-xl overflow-hidden aspect-square"
            >
              {item.mime_type?.startsWith('image/') || item.mimeType?.startsWith('image/') ? (
                <img
                  src={getMediaUrl(item)}
                  alt={item.filename || item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-700">
                  <ImageIcon size={40} className="text-slate-500" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => openImageViewer(item)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title={t('media.viewFullSize')}
                >
                  <Eye size={18} className="text-white" />
                </button>
                <button
                  onClick={() => copyUrl(getMediaUrl(item), item.id)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title={t('media.copyUrl')}
                >
                  {copiedId === item.id ? (
                    <Check size={18} className="text-green-400" />
                  ) : (
                    <Copy size={18} className="text-white" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                  title={t('media.delete')}
                >
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>

              {/* Filename */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs text-white truncate">
                  {item.filename || item.name}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeImageViewer}
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title={t('media.zoomOut')}
            >
              <ZoomOut size={20} className="text-white" />
            </button>
            <span className="text-white text-sm px-2">{Math.round(zoom * 100)}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title={t('media.zoomIn')}
            >
              <ZoomIn size={20} className="text-white" />
            </button>
            <button
              onClick={closeImageViewer}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors ml-4"
              title={t('media.close')}
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Image Info */}
          <div className="absolute bottom-4 left-4 text-white z-10">
            <p className="font-medium">{selectedImage.filename || selectedImage.name}</p>
            <p className="text-sm text-slate-400">
              {selectedImage.width} x {selectedImage.height} | {(selectedImage.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getMediaUrl(selectedImage)}
              alt={selectedImage.filename || selectedImage.name}
              className="transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
