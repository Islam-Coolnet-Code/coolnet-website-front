import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { useSEO } from '@/hooks/use-seo';
import { useInfinitePosts, useMedia, Post, getMediaUrl } from '@/services/cms';
import Footer from '@/components/Footer';
import { ArrowRight, Calendar, Tag, Newspaper, Loader2 } from 'lucide-react';
import { getLocalizedText, formatLocalizedDate } from '@/utils/i18n';
import { Button } from '@/components/ui/button';

interface PostCardProps {
  post: Post;
  isRTL: boolean;
  font: string;
  language: string;
}

const PostCard = memo<PostCardProps>(({ post, isRTL, font, language }) => {
  const { data: media } = useMedia(post.featuredImageId);

  return (
    <Link to={`/news/${post.slug}`} className="block">
      <article
        className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        {/* Featured Image */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-coolnet-purple/10 to-coolnet-orange/10">
          {media ? (
            <img
              src={getMediaUrl(media.fileUrl)}
              alt={getLocalizedText(media.altText, language) || getLocalizedText(post.title, language)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Newspaper className="w-20 h-20 text-coolnet-purple/30" />
            </div>
          )}
          {/* Category Badge */}
          {post.category && (
            <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-coolnet-purple text-white text-sm font-semibold rounded-full">
                <Tag className="w-3.5 h-3.5" />
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
            <time dateTime={post.publishedAt || undefined}>{formatLocalizedDate(post.publishedAt, language)}</time>
          </div>

          {/* Title */}
          <h3 className={`text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-coolnet-purple transition-colors ${font}`}>
            {getLocalizedText(post.title, language)}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className={`text-gray-600 mb-4 line-clamp-3 ${font}`}>
              {getLocalizedText(post.excerpt, language)}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className={`flex flex-wrap gap-2 mb-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              {post.tags.slice(0, 4).map((tag, index) => (
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
            className={`inline-flex items-center gap-2 text-coolnet-purple font-semibold group-hover:text-coolnet-orange transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {t('posts.readMore')}
            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </span>
        </div>
      </article>
    </Link>
  );
});

const PostsSkeleton: React.FC<{ isRTL: boolean }> = ({ isRTL }) => (
  <div className={`bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 animate-pulse ${isRTL ? 'text-right' : 'text-left'}`}>
    <div className="h-56 bg-gray-200" />
    <div className="p-6">
      <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
      <div className="h-6 bg-gray-200 rounded w-full mb-2" />
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-24" />
    </div>
  </div>
);

const AllNews: React.FC = () => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar' || language === 'he';

  // SEO
  useSEO({
    title: t('allNews.title'),
    description: t('allNews.seoDescription'),
  });

  // Fetch posts with infinite pagination (9 posts per page)
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(9);

  // Flatten all pages into a single array of posts
  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.posts);
  }, [data]);

  return (
    <div className={`flex flex-col min-h-screen ${font}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-coolnet-purple via-coolnet-purple-dark to-coolnet-purple overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-coolnet-orange/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Newspaper className="w-5 h-5 text-white" />
              <span className={`text-white font-semibold ${font}`}>
                {t('posts.badge')}
              </span>
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 ${font}`}>
              {t('allNews.title')}
            </h1>
            <p className={`text-xl text-white/80 max-w-2xl mx-auto ${font}`}>
              {t('allNews.subtitle')}
            </p>
          </div>
        </section>

        {/* Posts Grid Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <PostsSkeleton key={i} isRTL={isRTL} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className={`text-gray-500 ${font}`}>
                  {t('posts.error')}
                </p>
              </div>
            ) : posts && posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      isRTL={isRTL}
                      font={font}
                      language={language}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className={`px-8 py-3 bg-coolnet-purple hover:bg-coolnet-purple-dark text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${font}`}
                    >
                      {isFetchingNextPage ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t('posts.loadingMore')}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {t('posts.loadMore')}
                          <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className={`text-gray-500 text-lg ${font}`}>
                  {t('posts.noNews')}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AllNews;
