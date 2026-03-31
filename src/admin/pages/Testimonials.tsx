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
  MessageSquareQuote,
  X,
  Star,
} from 'lucide-react';
import { MediaPicker } from '../components/MediaPicker';

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { apiKey } = useAuth();
  const { t } = useAdminLanguage();

  const [avatarMediaIds, setAvatarMediaIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    nameHe: '',
    roleEn: '',
    roleAr: '',
    roleHe: '',
    contentEn: '',
    contentAr: '',
    contentHe: '',
    rating: 5,
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadTestimonials();
    }
  }, [apiKey]);

  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getTestimonials();
      setTestimonials(response.data || []);
    } catch (err) {
      setError(t('testimonials.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (testimonial?: any) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        nameEn: testimonial.name?.en || testimonial.nameEn || '',
        nameAr: testimonial.name?.ar || testimonial.nameAr || '',
        nameHe: testimonial.name?.he || testimonial.nameHe || '',
        roleEn: testimonial.role?.en || testimonial.roleEn || '',
        roleAr: testimonial.role?.ar || testimonial.roleAr || '',
        roleHe: testimonial.role?.he || testimonial.roleHe || '',
        contentEn: testimonial.content?.en || testimonial.contentEn || '',
        contentAr: testimonial.content?.ar || testimonial.contentAr || '',
        contentHe: testimonial.content?.he || testimonial.contentHe || '',
        rating: testimonial.rating || 5,
        sortOrder: testimonial.sortOrder || 0,
        isActive: testimonial.isActive !== false,
      });
      adminApi.getContentMedia('testimonials', testimonial.id, 'avatar').then(res => {
        setAvatarMediaIds((res.data || []).map((m: any) => m.media_id || m.id));
      }).catch(() => setAvatarMediaIds([]));
    } else {
      setEditingTestimonial(null);
      setAvatarMediaIds([]);
      setFormData({
        nameEn: '',
        nameAr: '',
        nameHe: '',
        roleEn: '',
        roleAr: '',
        roleHe: '',
        contentEn: '',
        contentAr: '',
        contentHe: '',
        rating: 5,
        sortOrder: 0,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = {
        nameEn: formData.nameEn,
        nameAr: formData.nameAr,
        nameHe: formData.nameHe,
        roleEn: formData.roleEn,
        roleAr: formData.roleAr,
        roleHe: formData.roleHe,
        contentEn: formData.contentEn,
        contentAr: formData.contentAr,
        contentHe: formData.contentHe,
        rating: formData.rating,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      };

      let testimonialId: number;
      if (editingTestimonial) {
        await adminApi.updateTestimonial(editingTestimonial.id, data);
        testimonialId = editingTestimonial.id;
      } else {
        const res = await adminApi.createTestimonial(data);
        testimonialId = res.data?.id || res.id;
      }

      if (testimonialId) {
        await adminApi.setContentMedia('testimonials', testimonialId,
          avatarMediaIds.map((id, i) => ({ mediaId: id, mediaRole: 'avatar', sortOrder: i })),
          'avatar'
        );
      }

      closeModal();
      loadTestimonials();
    } catch (err) {
      setError(t('testimonials.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('testimonials.confirmDelete'))) return;

    try {
      await adminApi.deleteTestimonial(id);
      loadTestimonials();
    } catch (err) {
      setError(t('testimonials.errorDelete'));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('testimonials.title')}</h1>
          <p className="text-slate-400 mt-1">{t('testimonials.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadTestimonials}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            {t('testimonials.refresh')}
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            {t('testimonials.addTestimonial')}
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

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            <MessageSquareQuote size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('testimonials.noTestimonials')}</p>
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    testimonial.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {testimonial.isActive ? t('testimonials.active') : t('testimonials.inactive')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(testimonial)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                  <MessageSquareQuote size={20} />
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {testimonial.name?.en || testimonial.nameEn || t('testimonials.untitled')}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {testimonial.role?.en || testimonial.roleEn || ''}
                  </p>
                </div>
              </div>

              <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                "{testimonial.content?.en || testimonial.contentEn || ''}"
              </p>

              <div className="flex items-center justify-between">
                {renderStars(testimonial.rating || 5)}
                <span className="text-xs text-slate-500">{t('testimonials.order')}: {testimonial.sortOrder}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <h2 className="text-xl font-semibold text-white">
                {editingTestimonial ? t('testimonials.editTestimonial') : t('testimonials.addNewTestimonial')}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <MediaPicker
                label="Avatar Image"
                value={avatarMediaIds}
                onChange={(ids) => setAvatarMediaIds(ids)}
                accept="image"
              />

              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('testimonials.nameEn')}
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
                    {t('testimonials.nameAr')}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('testimonials.nameHe')}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.nameHe}
                    onChange={(e) => setFormData({ ...formData, nameHe: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Roles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('testimonials.roleEn')}
                  </label>
                  <input
                    type="text"
                    value={formData.roleEn}
                    onChange={(e) => setFormData({ ...formData, roleEn: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('testimonials.rolePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('testimonials.roleAr')}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.roleAr}
                    onChange={(e) => setFormData({ ...formData, roleAr: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('testimonials.roleHe')}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.roleHe}
                    onChange={(e) => setFormData({ ...formData, roleHe: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('testimonials.contentEn')}
                  </label>
                  <textarea
                    value={formData.contentEn}
                    onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('testimonials.contentAr')}
                  </label>
                  <textarea
                    dir="rtl"
                    value={formData.contentAr}
                    onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('testimonials.contentHe')}
                  </label>
                  <textarea
                    dir="rtl"
                    value={formData.contentHe}
                    onChange={(e) => setFormData({ ...formData, contentHe: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Rating, Sort Order, Active */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('testimonials.rating')}
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>
                        {r} Star{r > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {t('testimonials.sortOrder')}
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2 pb-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-slate-300">
                      {t('testimonials.active')}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {t('testimonials.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                  {editingTestimonial ? t('testimonials.update') : t('testimonials.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
