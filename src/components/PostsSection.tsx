import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Tag, Newspaper } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { usePosts, useMedia } from '@/services/cms/hooks';
import { getMediaUrl, Post } from '@/services/cms/api';

interface PostCardProps {
  post: Post;
  isRTL: boolean;
  font: string;
  t: (key: string) => string;
  language: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, isRTL, font, t, language }) => {
  const { data: media } = useMedia(post.featuredImageId);

  const getLocalizedText = (text: { en: string; ar: string | null; he: string | null } | null): string => {
    if (!text) return '';
    if (language === 'ar') return text.ar || text.en;
    if (language === 'he') return text.he || text.en;
    return text.en;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link to={`/news/${post.slug}`} className="block">
      <article
        className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        {/* Featured Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-coolnet-purple/10 to-coolnet-orange/10">
          {media ? (
            <img
              src={getMediaUrl(media.fileUrl)}
              alt={getLocalizedText(media.altText) || getLocalizedText(post.title)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Newspaper className="w-16 h-16 text-coolnet-purple/30" />
            </div>
          )}
          {/* Category Badge */}
          {post.category && (
            <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-coolnet-purple text-white text-xs font-semibold rounded-full">
                <Tag className="w-3 h-3" />
                {post.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Date */}
          <div className={`flex items-center gap-2 text-gray-500 text-sm mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="w-4 h-4" />
            <time dateTime={post.publishedAt || undefined}>{formatDate(post.publishedAt)}</time>
          </div>

          {/* Title */}
          <h3 className={`text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-coolnet-purple transition-colors ${font}`}>
            {getLocalizedText(post.title)}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className={`text-gray-600 text-sm mb-4 line-clamp-3 ${font}`}>
              {getLocalizedText(post.excerpt)}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className={`flex flex-wrap gap-2 mb-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              {post.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Read More Link */}
          <span
            className={`inline-flex items-center gap-2 text-coolnet-purple font-semibold text-sm group-hover:text-coolnet-orange transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {t('posts.readMore') || 'Read More'}
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </span>
        </div>
      </article>
    </Link>
  );
};

const PostsSkeleton: React.FC<{ isRTL: boolean }> = ({ isRTL }) => (
  <div className={`bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 animate-pulse ${isRTL ? 'text-right' : 'text-left'}`}>
    <div className="h-48 bg-gray-200" />
    <div className="p-6">
      <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
      <div className="h-6 bg-gray-200 rounded w-full mb-2" />
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-20" />
    </div>
  </div>
);

export const PostsSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar' || language === 'he';

  // Fetch latest 3 posts
  const { data: posts, isLoading, error } = usePosts(3);

  // Don't render if no posts
  if (!isLoading && (!posts || posts.length === 0)) {
    return null;
  }

  return (
    <section
      id="news"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-12 ${isRTL ? 'text-right md:text-center' : 'text-left md:text-center'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-coolnet-purple/10 rounded-full mb-4">
            <Newspaper className="w-4 h-4 text-coolnet-purple" />
            <span className={`text-sm font-semibold text-coolnet-purple ${font}`}>
              {t('posts.badge') || 'Latest News'}
            </span>
          </div>

          {/* Title */}
          <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 ${font}`}>
            {t('posts.title') || 'Stay Updated'}
          </h2>

          {/* Subtitle */}
          <p className={`text-gray-600 max-w-2xl mx-auto ${font}`}>
            {t('posts.subtitle') || 'Get the latest news, updates, and announcements from Coolnet'}
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <PostsSkeleton isRTL={isRTL} />
              <PostsSkeleton isRTL={isRTL} />
              <PostsSkeleton isRTL={isRTL} />
            </>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">{t('posts.error') || 'Failed to load posts'}</p>
            </div>
          ) : (
            posts?.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isRTL={isRTL}
                font={font}
                t={t}
                language={language}
              />
            ))
          )}
        </div>

        {/* View All Button */}
        {posts && posts.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/news"
              className={`inline-flex items-center gap-2 px-8 py-4 bg-coolnet-purple text-white rounded-full font-semibold hover:bg-coolnet-purple/90 transition-colors shadow-lg hover:shadow-xl ${isRTL ? 'flex-row-reverse' : ''} ${font}`}
            >
              {t('posts.viewAll') || 'View All News'}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default PostsSection;
