import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  X,
  ExternalLink,
  Link as LinkIcon,
  Hash,
} from 'lucide-react';

interface NavItem {
  id: number;
  menuLocation: 'header' | 'footer' | 'mobile';
  parentId: number | null;
  label: { ar: string; en: string; he: string };
  linkType: 'url' | 'anchor' | 'page';
  linkValue: string;
  icon: string | null;
  target: '_self' | '_blank';
  sortOrder: number;
  isActive: number | boolean;
}

type MenuLocation = 'header' | 'footer' | 'mobile';

const defaultForm = {
  menuLocation: 'header' as MenuLocation,
  labelEn: '',
  labelAr: '',
  labelHe: '',
  linkType: 'url' as 'url' | 'anchor' | 'page',
  linkValue: '',
  icon: '',
  target: '_self' as '_self' | '_blank',
  isActive: true,
};

const locationLabelsEn: Record<MenuLocation, string> = {
  header: 'Header',
  footer: 'Footer',
  mobile: 'Mobile',
};

const locationLabelsAr: Record<MenuLocation, string> = {
  header: 'الرأس',
  footer: 'التذييل',
  mobile: 'الجوال',
};

const linkTypeIcons: Record<string, any> = {
  url: LinkIcon,
  anchor: Hash,
  page: ExternalLink,
};

export function NavigationPage() {
  const { apiKey } = useAuth();
  const { t, language } = useAdminLanguage();
  const [allItems, setAllItems] = useState<NavItem[]>([]);
  const [activeTab, setActiveTab] = useState<MenuLocation>('header');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadNavItems();
    }
  }, [apiKey]);

  const loadNavItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminApi.getNavItems();
      setAllItems(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load navigation items');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = allItems
    .filter((item) => item.menuLocation === activeTab)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const openModal = (item?: NavItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        menuLocation: item.menuLocation,
        labelEn: item.label.en,
        labelAr: item.label.ar,
        labelHe: item.label.he || '',
        linkType: item.linkType,
        linkValue: item.linkValue,
        icon: item.icon || '',
        target: item.target,
        isActive: !!item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({ ...defaultForm, menuLocation: activeTab });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData(defaultForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      const payload = {
        menuLocation: formData.menuLocation,
        label: { en: formData.labelEn, ar: formData.labelAr, he: formData.labelHe },
        linkType: formData.linkType,
        linkValue: formData.linkValue,
        icon: formData.icon || null,
        target: formData.target,
        isActive: formData.isActive,
      };

      if (editingItem) {
        await adminApi.updateNavItem(editingItem.id, payload);
      } else {
        await adminApi.createNavItem(payload);
      }
      closeModal();
      await loadNavItems();
    } catch (err: any) {
      setError(err.message || 'Failed to save navigation item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('navigationPage.confirmDelete'))) return;
    try {
      setError(null);
      await adminApi.deleteNavItem(id);
      await loadNavItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete navigation item');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const items = [...filteredItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
    const orderedIds = items.map((item) => item.id);

    try {
      await adminApi.reorderNavItems(orderedIds);
      await loadNavItems();
    } catch (err: any) {
      setError(err.message || 'Failed to reorder');
    }
  };

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
          <h1 className="text-2xl font-bold text-white">{t('navigationPage.title')}</h1>
          <p className="text-slate-400 mt-1">{t('navigationPage.subtitle')}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          {t('navigationPage.addItem')}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800 rounded-lg p-1 w-fit">
        {(['header', 'footer', 'mobile'] as MenuLocation[]).map((loc) => {
          const count = allItems.filter((i) => i.menuLocation === loc).length;
          return (
            <button
              key={loc}
              onClick={() => setActiveTab(loc)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === loc
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {language === 'ar' ? locationLabelsAr[loc] : locationLabelsEn[loc]}
              <span className="ml-2 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Nav Items List */}
      <div className="space-y-2">
        {filteredItems.map((item, index) => {
          const LinkTypeIcon = linkTypeIcons[item.linkType] || LinkIcon;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                item.isActive
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-slate-800/50 border-slate-700/50 opacity-60'
              }`}
            >
              {/* Order number */}
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                {index + 1}
              </div>

              {/* Item info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium">{item.label.en}</h3>
                  {!item.isActive && (
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">
                      Hidden
                    </span>
                  )}
                  {item.target === '_blank' && (
                    <ExternalLink size={12} className="text-slate-500" />
                  )}
                </div>
                <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                  <span>{item.label.ar}</span>
                  <span>|</span>
                  <span>{item.label.he}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <LinkTypeIcon size={12} />
                  <span className="font-mono">{item.linkValue}</span>
                </div>
              </div>

              {/* Move buttons */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === filteredItems.length - 1}
                  className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={() => openModal(item)}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded-lg hover:bg-red-900/50 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No navigation items for {locationLabels[activeTab]}. Click "Add Item" to create one.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                {editingItem ? t('navigationPage.editItem') : t('navigationPage.addItem')}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Menu Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('navigationPage.menuLocation')}</label>
                <select
                  value={formData.menuLocation}
                  onChange={(e) => setFormData({ ...formData, menuLocation: e.target.value as MenuLocation })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="header">{t('navigationPage.header')}</option>
                  <option value="footer">{t('navigationPage.footer')}</option>
                  <option value="mobile">{t('navigationPage.mobile')}</option>
                </select>
              </div>

              {/* Labels */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('navigationPage.labelEn')}</label>
                  <input
                    type="text"
                    value={formData.labelEn}
                    onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('navigationPage.labelAr')}</label>
                  <input
                    type="text"
                    value={formData.labelAr}
                    onChange={(e) => setFormData({ ...formData, labelAr: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    dir="rtl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('navigationPage.labelHe')}</label>
                  <input
                    type="text"
                    value={formData.labelHe}
                    onChange={(e) => setFormData({ ...formData, labelHe: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Link Type & Value */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('navigationPage.linkType')}</label>
                  <select
                    value={formData.linkType}
                    onChange={(e) => setFormData({ ...formData, linkType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="url">URL</option>
                    <option value="anchor">Anchor</option>
                    <option value="page">Page</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('navigationPage.linkValue')}</label>
                  <input
                    type="text"
                    value={formData.linkValue}
                    onChange={(e) => setFormData({ ...formData, linkValue: e.target.value })}
                    placeholder={formData.linkType === 'anchor' ? '#section-id' : '/path'}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    required
                  />
                </div>
              </div>

              {/* Target & Icon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('navigationPage.target')}</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="_self">{t('navigationPage.sameTab')}</option>
                    <option value="_blank">{t('navigationPage.newTab')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('navigationPage.iconOptional')}</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g. Home, Phone"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="navActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700"
                />
                <label htmlFor="navActive" className="text-sm text-slate-300">{t('navigationPage.activeVisible')}</label>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  {t('navigationPage.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {editingItem ? t('navigationPage.update') : t('navigationPage.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
