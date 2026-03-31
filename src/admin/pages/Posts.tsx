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
  FileText,
  X,
  Eye,
} from 'lucide-react';
import { MediaPicker } from '../components/MediaPicker';

export function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { apiKey } = useAuth();
  const { t } = useAdminLanguage();

  const [featuredMediaIds, setFeaturedMediaIds] = useState<number[]>([]);
  const [galleryMediaIds, setGalleryMediaIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    slug: '',
    excerpt_en: '',
    excerpt_ar: '',
    content_en: '',
    content_ar: '',
    status: 'draft',
  });

  useEffect(() => {
    if (apiKey) {
      adminApi.setApiKey(apiKey);
      loadPosts();
    }
  }, [apiKey]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getPosts();
      setPosts(response.data || []);
    } catch (err) {
      setError(t('posts.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (post?: any) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title_en: post.title?.en || '',
        title_ar: post.title?.ar || '',
        slug: post.slug || '',
        excerpt_en: post.excerpt?.en || '',
        excerpt_ar: post.excerpt?.ar || '',
        content_en: post.content?.en || '',
        content_ar: post.content?.ar || '',
        status: post.status || 'draft',
      });
      // Load media associations
      adminApi.getContentMedia('posts', post.id, 'featured').then(res => {
        setFeaturedMediaIds((res.data || []).map((m: any) => m.media_id || m.id));
      }).catch(() => setFeaturedMediaIds([]));
      adminApi.getContentMedia('posts', post.id, 'gallery').then(res => {
        setGalleryMediaIds((res.data || []).map((m: any) => m.media_id || m.id));
      }).catch(() => setGalleryMediaIds([]));
    } else {
      setEditingPost(null);
      setFeaturedMediaIds([]);
      setGalleryMediaIds([]);
      setFormData({
        title_en: '',
        title_ar: '',
        slug: '',
        excerpt_en: '',
        excerpt_ar: '',
        content_en: '',
        content_ar: '',
        status: 'draft',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = {
        title: { en: formData.title_en, ar: formData.title_ar, he: formData.title_en },
        slug: formData.slug || generateSlug(formData.title_en),
        excerpt: { en: formData.excerpt_en, ar: formData.excerpt_ar, he: formData.excerpt_en },
        content: { en: formData.content_en, ar: formData.content_ar, he: formData.content_en },
        status: formData.status,
      };

      let postId: number;
      if (editingPost) {
        await adminApi.updatePost(editingPost.id, data);
        postId = editingPost.id;
      } else {
        const res = await adminApi.createPost(data);
        postId = res.data?.id || res.id;
      }

      // Save media associations
      if (postId) {
        await adminApi.setContentMedia('posts', postId,
          featuredMediaIds.map((id, i) => ({ mediaId: id, mediaRole: 'featured', sortOrder: i })),
          'featured'
        );
        await adminApi.setContentMedia('posts', postId,
          galleryMediaIds.map((id, i) => ({ mediaId: id, mediaRole: 'gallery', sortOrder: i })),
          'gallery'
        );
      }

      closeModal();
      loadPosts();
    } catch (err) {
      setError(t('posts.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('posts.confirmDelete'))) return;

    try {
      await adminApi.deletePost(id);
      loadPosts();
    } catch (err) {
      setError(t('posts.errorDelete'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('posts.title')}</h1>
          <p className="text-slate-400 mt-1">{t('posts.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPosts}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            {t('posts.refresh')}
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            {t('posts.addPost')}
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

      {/* Posts Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('posts.noPosts')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-start text-sm text-slate-400 bg-slate-750">
                  <th className="px-6 py-4 font-medium text-start">{t('posts.titleField')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('posts.slug')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('posts.status')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('posts.date')}</th>
                  <th className="px-6 py-4 font-medium text-start">{t('posts.actions')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {posts.map((post) => (
                  <tr key={post.id} className="border-t border-slate-700 hover:bg-slate-750">
                    <td className="px-6 py-4 text-white font-medium">
                      {post.title?.en || post.title}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {post.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.status === 'published'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {post.status === 'published' ? t('posts.published') : t('posts.draft')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(post.created_at || post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/news/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                        </a>
                        <button
                          onClick={() => openModal(post)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
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
          <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">
                {editingPost ? t('posts.editPost') : t('posts.addNewPost')}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('posts.titleEn')}
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title_en: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('posts.titleAr')}
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('posts.slug')}
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('posts.contentEn')}
                </label>
                <textarea
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('posts.contentAr')}
                </label>
                <textarea
                  value={formData.content_ar}
                  onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  dir="rtl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {t('posts.status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">{t('posts.draft')}</option>
                  <option value="published">{t('posts.published')}</option>
                </select>
              </div>

              <MediaPicker
                label="Featured Image"
                value={featuredMediaIds}
                onChange={(ids) => setFeaturedMediaIds(ids)}
                accept="image"
              />

              <MediaPicker
                label="Gallery (Images / Videos / Files)"
                value={galleryMediaIds}
                onChange={(ids) => setGalleryMediaIds(ids)}
                multiple
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  {t('posts.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSaving && (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                  {editingPost ? t('posts.update') : t('posts.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
