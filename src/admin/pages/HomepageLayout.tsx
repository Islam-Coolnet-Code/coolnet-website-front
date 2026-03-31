import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAdminLanguage } from '../context/AdminLanguageContext';
import {
  GripVertical,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Image,
  Gauge,
  Package,
  Sparkles,
  FileText,
  MessageSquareQuote,
  Users,
  LayoutGrid,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface HomepageSection {
  id: number;
  sectionKey: string;
  title: { ar: string; en: string; he: string };
  icon: string;
  sortOrder: number;
  isVisible: boolean;
  config: Record<string, any> | null;
}

const iconMap: Record<string, any> = {
  Image,
  Gauge,
  Package,
  Sparkles,
  FileText,
  MessageSquareQuote,
  Users,
};

export function HomepageLayoutPage() {
  const { apiKey } = useAuth();
  const { t, language } = useAdminLanguage();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadSections();
    }
  }, [apiKey]);

  const loadSections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminApi.getHomepageSections();
      setSections(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load homepage sections');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = (id: number) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
    );
    setHasChanges(true);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

    // Update sort orders
    newSections.forEach((s, i) => {
      s.sortOrder = i + 1;
    });

    setSections(newSections);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const payload = sections.map((s) => ({
        id: s.id,
        sortOrder: s.sortOrder,
        isVisible: s.isVisible,
      }));
      await adminApi.bulkUpdateHomepageSections(payload);
      setHasChanges(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || LayoutGrid;
    return <IconComponent size={20} />;
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
          <h1 className="text-2xl font-bold text-white">{t('homepageLayout.title')}</h1>
          <p className="text-slate-400 mt-1">
            {t('homepageLayout.subtitle')}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            hasChanges
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {t('homepageLayout.saveChanges')}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
              section.isVisible
                ? 'bg-slate-800 border-slate-700'
                : 'bg-slate-800/50 border-slate-700/50 opacity-60'
            }`}
          >
            {/* Drag handle icon */}
            <div className="text-slate-500">
              <GripVertical size={20} />
            </div>

            {/* Order number */}
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
              {index + 1}
            </div>

            {/* Section icon */}
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                section.isVisible
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'bg-slate-700 text-slate-500'
              }`}
            >
              {getIcon(section.icon)}
            </div>

            {/* Section info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium">
                {language === 'ar' ? section.title.ar : section.title.en}
              </h3>
              <div className="flex gap-3 text-xs text-slate-400 mt-0.5">
                <span>{language === 'ar' ? section.title.en : section.title.ar}</span>
                <span>|</span>
                <span>{section.title.he}</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {section.sectionKey}
              </span>
            </div>

            {/* Move buttons */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => moveSection(index, 'down')}
                disabled={index === sections.length - 1}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowDown size={16} />
              </button>
            </div>

            {/* Visibility toggle */}
            <button
              onClick={() => toggleVisibility(section.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                section.isVisible
                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {section.isVisible ? (
                <>
                  <Eye size={16} />
                  {t('homepageLayout.visible')}
                </>
              ) : (
                <>
                  <EyeOff size={16} />
                  {t('homepageLayout.hidden')}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {sections.length === 0 && !isLoading && (
        <div className="text-center py-12 text-slate-400">
          {t('homepageLayout.noSections')}
        </div>
      )}
    </div>
  );
}
