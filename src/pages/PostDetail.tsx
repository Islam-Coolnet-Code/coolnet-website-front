import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { useSEO } from '@/hooks/use-seo';
import { usePostBySlug, useMedia } from '@/services/cms/hooks';
import { getMediaUrl } from '@/services/cms/api';
import Footer from '@/components/Footer';
import { ArrowLeft, ArrowRight, Calendar, Tag, Newspaper, Loader2, Share2, Facebook, Twitter } from 'lucide-react';
import { getLocalizedText, formatLocalizedDate } from '@/utils/i18n';
import { Button } from '@/components/ui/button';

const PostDetailSkeleton: React.FC<{ isRTL: boolean }> = ({ isRTL }) => (
  <div className={`animate-pulse ${isRTL ? 'text-right' : 'text-left'}`}>
    <div className="h-64 md:h-96 bg-gray-200 rounded-2xl mb-8" />
    <div className="max-w-4xl mx-auto">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
      <div className="h-10 bg-gray-200 rounded w-full mb-2" />
      <div className="h-10 bg-gray-200 rounded w-3/4 mb-6" />
      <div className="flex gap-2 mb-8">
        <div className="h-6 bg-gray-200 rounded w-16" />
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  </div>
);

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar' || language === 'he';

  // Fetch post by slug
  const { data: post, isLoading, error } = usePostBySlug(slug || null);

  // Fetch featured image
  const { data: media } = useMedia(post?.featuredImageId || null);

  // SEO
  useSEO({
    title: post ? getLocalizedText(post.title, language) : t('posts.loading'),
    description: post?.excerpt ? getLocalizedText(post.excerpt, language) : undefined,
  });

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const handleShare = async () => {
    const url = window.location.href;
    const title = post ? getLocalizedText(post.title, language) : '';

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      // Could show a toast here
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post ? getLocalizedText(post.title, language) : '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col min-h-screen ${font}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="flex-grow py-8 md:py-16">
          <div className="container mx-auto px-4">
            <PostDetailSkeleton isRTL={isRTL} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className={`flex flex-col min-h-screen ${font}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <main className="flex-grow flex items-center justify-center py-16">
          <div className="text-center">
            <Newspaper className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h1 className={`text-2xl font-bold text-gray-900 mb-4 ${font}`}>
              {t('posts.notFound')}
            </h1>
            <p className={`text-gray-500 mb-8 ${font}`}>
              {t('posts.notFoundMessage')}
            </p>
            <Button
              onClick={() => navigate('/news')}
              className={`inline-flex items-center gap-2 px-6 py-3 bg-coolnet-purple text-white rounded-full font-semibold hover:bg-coolnet-purple-dark transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <BackArrow className="w-5 h-5" />
              {t('posts.backToNews')}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${font}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="flex-grow">
        {/* Hero Image Section */}
        <section className="relative">
          <div className="h-64 md:h-96 lg:h-[28rem] overflow-hidden bg-gradient-to-br from-coolnet-purple/10 to-coolnet-orange/10">
            {media ? (
              <img
                src={getMediaUrl(media.fileUrl)}
                alt={getLocalizedText(media.altText, language) || getLocalizedText(post.title, language)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-coolnet-purple via-coolnet-purple-dark to-coolnet-purple">
                <Newspaper className="w-32 h-32 text-white/30" />
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>

          {/* Back button */}
          <div className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-8">
            <div className="container mx-auto">
              <Link
                to="/news"
                className={`inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full font-medium hover:bg-white transition-colors shadow-lg ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <BackArrow className="w-4 h-4" />
                {t('posts.backToNews')}
              </Link>
            </div>
          </div>

          {/* Category Badge - positioned at bottom of hero */}
          {post.category && (
            <div className={`absolute bottom-4 md:bottom-8 ${isRTL ? 'right-4 md:right-8' : 'left-4 md:left-8'}`}>
              <div className="container mx-auto">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-coolnet-purple text-white text-sm font-semibold rounded-full shadow-lg">
                  <Tag className="w-4 h-4" />
                  {post.category}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Content Section */}
        <section className="py-8 md:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <article className="max-w-4xl mx-auto">
              {/* Meta Info */}
              <div className={`flex flex-wrap items-center gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="w-5 h-5" />
                  <time dateTime={post.publishedAt || undefined} className={font}>
                    {formatLocalizedDate(post.publishedAt, language)}
                  </time>
                </div>

                {/* Share buttons */}
                <div className={`flex items-center gap-2 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                  <button
                    onClick={shareOnFacebook}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={shareOnTwitter}
                    className="p-2 text-gray-500 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-500 hover:text-coolnet-purple hover:bg-coolnet-purple/10 rounded-full transition-colors"
                    title={t('posts.share')}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight ${font}`}>
                {getLocalizedText(post.title, language)}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className={`text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-coolnet-purple pl-4 ${isRTL ? 'border-l-0 border-r-4 pl-0 pr-4' : ''} ${font}`}>
                  {getLocalizedText(post.excerpt, language)}
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className={`flex flex-wrap gap-2 mb-8 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Main Content */}
              <div
                className={`prose prose-lg max-w-none ${isRTL ? 'prose-headings:text-right' : ''} ${font}
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-coolnet-purple prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-li:text-gray-700
                  prose-blockquote:border-coolnet-purple prose-blockquote:text-gray-600 prose-blockquote:italic
                  prose-img:rounded-xl prose-img:shadow-lg
                `}
                dangerouslySetInnerHTML={{ __html: getLocalizedText(post.content, language) }}
              />

              {/* Bottom Navigation */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <Link
                  to="/news"
                  className={`inline-flex items-center gap-2 px-6 py-3 bg-coolnet-purple text-white rounded-full font-semibold hover:bg-coolnet-purple-dark transition-colors shadow-lg hover:shadow-xl ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <BackArrow className="w-5 h-5" />
                  {t('posts.viewAllNews')}
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PostDetail;
