import { useEffect, useState, useRef } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Upload,
  Image as ImageIcon,
  Film,
  FileText,
  Check,
  Trash2,
  GripVertical,
} from 'lucide-react';

interface MediaItem {
  id: number;
  uuid: string;
  name: string;
  filename: string;
  fileUrl: string;
  file_url?: string;
  mimeType: string;
  mime_type?: string;
  fileSize: number;
  file_size?: number;
  width?: number;
  height?: number;
}

interface MediaPickerProps {
  /** Currently selected media IDs */
  value: number[];
  /** Called when selection changes */
  onChange: (mediaIds: number[], mediaItems: MediaItem[]) => void;
  /** Allow selecting multiple items */
  multiple?: boolean;
  /** Filter by mime type prefix (e.g., 'image', 'video') */
  accept?: string;
  /** Label shown above the picker */
  label?: string;
  /** Media role hint (for display only) */
  role?: string;
}

const getMediaUrl = (item: MediaItem) => {
  const url = item.fileUrl || item.file_url || '';
  const apiUrl = import.meta.env.VITE_CMS_API_URL || '';
  return url.startsWith('http') ? url : `${apiUrl}${url}`;
};

const getMimeType = (item: MediaItem) => item.mimeType || item.mime_type || '';

const isImage = (item: MediaItem) => getMimeType(item).startsWith('image/');
const isVideo = (item: MediaItem) => getMimeType(item).startsWith('video/');

const formatSize = (bytes: number) => {
  const size = bytes || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export function MediaPicker({ value, onChange, multiple = false, accept, label, role }: MediaPickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { apiKey } = useAuth();

  // Load selected items on mount / when value changes
  useEffect(() => {
    if (value.length > 0 && allMedia.length > 0) {
      const items = value.map(id => allMedia.find(m => m.id === id)).filter(Boolean) as MediaItem[];
      setSelectedItems(items);
    } else if (value.length === 0) {
      setSelectedItems([]);
    }
  }, [value, allMedia]);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      if (apiKey) adminApi.setApiKey(apiKey);
      const response = await adminApi.getMedia({ limit: 100 });
      let items = response.data || [];
      if (accept) {
        items = items.filter((m: MediaItem) => getMimeType(m).startsWith(accept));
      }
      setAllMedia(items);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    loadMedia();
    setShowModal(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    try {
      if (apiKey) adminApi.setApiKey(apiKey);
      for (let i = 0; i < files.length; i++) {
        await adminApi.uploadMedia(files[i]);
      }
      await loadMedia();
    } catch {
      // silent
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleSelect = (item: MediaItem) => {
    if (multiple) {
      const exists = value.includes(item.id);
      const newIds = exists ? value.filter(id => id !== item.id) : [...value, item.id];
      const newItems = newIds.map(id => allMedia.find(m => m.id === id)).filter(Boolean) as MediaItem[];
      onChange(newIds, newItems);
    } else {
      onChange([item.id], [item]);
      setShowModal(false);
    }
  };

  const removeItem = (id: number) => {
    const newIds = value.filter(v => v !== id);
    const newItems = newIds.map(mid => selectedItems.find(m => m.id === mid) || allMedia.find(m => m.id === mid)).filter(Boolean) as MediaItem[];
    onChange(newIds, newItems);
  };

  const getAcceptAttr = () => {
    if (accept === 'image') return 'image/*';
    if (accept === 'video') return 'video/*';
    return '*/*';
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}

      {/* Preview selected items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedItems.map(item => (
            <div key={item.id} className="relative group w-20 h-20 rounded-lg overflow-hidden bg-slate-700 border border-slate-600">
              {isImage(item) ? (
                <img src={getMediaUrl(item)} alt={item.name} className="w-full h-full object-cover" />
              ) : isVideo(item) ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-8 h-8 text-purple-400" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Open picker button */}
      <button
        type="button"
        onClick={openModal}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
      >
        <ImageIcon className="w-4 h-4" />
        {selectedItems.length > 0
          ? (multiple ? 'Add More Media' : 'Change Media')
          : 'Select Media'}
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Select Media</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer text-sm transition-colors">
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Upload'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAcceptAttr()}
                    multiple
                    onChange={handleUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                {multiple && (
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-colors"
                  >
                    Done ({value.length} selected)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="text-center text-slate-400 py-12">Loading media...</div>
              ) : allMedia.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No media found. Upload some files to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {allMedia.map(item => {
                    const selected = value.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleSelect(item)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
                          selected
                            ? 'border-blue-500 ring-2 ring-blue-500/30'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        {isImage(item) ? (
                          <img src={getMediaUrl(item)} alt={item.name} className="w-full h-full object-cover" />
                        ) : isVideo(item) ? (
                          <div className="w-full h-full bg-slate-700 flex flex-col items-center justify-center gap-1">
                            <Film className="w-8 h-8 text-purple-400" />
                            <span className="text-[10px] text-slate-400 px-1 truncate w-full text-center">{item.name}</span>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-slate-700 flex flex-col items-center justify-center gap-1">
                            <FileText className="w-8 h-8 text-blue-400" />
                            <span className="text-[10px] text-slate-400 px-1 truncate w-full text-center">{item.name}</span>
                          </div>
                        )}

                        {/* Selected checkmark */}
                        {selected && (
                          <div className="absolute top-1 right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* Info overlay on hover */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                          {item.name} · {formatSize(item.fileSize || item.file_size || 0)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaPicker;
