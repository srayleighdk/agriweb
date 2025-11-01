'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { newsService, News } from '@/lib/api/news';
import { Calendar, Eye, User, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [news, setNews] = useState<News | null>(null);
  const [relatedNews, setRelatedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadNews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await newsService.getNewsBySlug(slug);
      setNews(data);

      // Load related news
      if (data.id) {
        const related = await newsService.getRelatedNews(data.id, 3);
        setRelatedNews(related);
      }
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <p className="text-red-600 text-lg">Không tìm thấy tin tức</p>
            <Link href="/news" className="text-green-600 hover:underline mt-4 inline-block">
              Quay lại danh sách tin tức
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Back Button */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </div>
        </div>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Category & Featured Badge */}
          <div className="flex items-center gap-3 mb-4">
            {news.category && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                <span>{news.category.icon}</span>
                <span>{news.category.name}</span>
              </div>
            )}
            {news.isFeatured && (
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                ⭐ Nổi bật
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {news.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
            {news.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{news.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(news.publishedAt || news.createdAt), 'dd MMMM yyyy', { locale: vi })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{news.viewCount} lượt xem</span>
            </div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: news.title,
                    text: news.summary || '',
                    url: window.location.href,
                  });
                }
              }}
              className="flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <Share2 className="h-4 w-4" />
              <span>Chia sẻ</span>
            </button>
          </div>

          {/* Featured Image */}
          {news.thumbnail && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={news.thumbnail}
                alt={news.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Summary */}
          {news.summary && (
            <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8 rounded-r-lg">
              <p className="text-lg text-gray-700 leading-relaxed">{news.summary}</p>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {news.content}
            </div>
          </div>

          {/* Additional Images */}
          {news.images && news.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {news.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${news.title} - Image ${idx + 1}`}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b">
              {news.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tin Liên Quan</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className="group bg-white rounded-lg border-2 border-gray-100 hover:border-green-500 overflow-hidden transition-all hover:shadow-lg"
                  >
                    <div className="relative h-40 bg-gradient-to-br from-green-100 to-emerald-200">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-green-600" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(new Date(item.publishedAt || item.createdAt), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
