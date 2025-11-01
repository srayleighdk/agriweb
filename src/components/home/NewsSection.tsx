'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { newsService, News } from '@/lib/api/news';
import { Calendar, Eye, ArrowRight, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function NewsSection() {
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const featured = await newsService.getFeaturedNews(3);
      setFeaturedNews(featured);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="news" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải tin tức...</p>
        </div>
      </section>
    );
  }

  if (featuredNews.length === 0) {
    return null; // Don't show section if no featured news
  }

  return (
    <section id="news" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
            <Newspaper className="h-4 w-4" />
            Tin Tức & Cập Nhật
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Tin Tức Mới Nhất</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cập nhật thông tin mới nhất về nông nghiệp, công nghệ và thị trường
          </p>
        </div>

        {/* Featured News Only */}
        <div className="grid md:grid-cols-3 gap-6">
          {featuredNews.map((news) => (
            <Link
              key={news.id}
              href={`/news/${news.slug}`}
              className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-200 overflow-hidden">
                {news.thumbnail ? (
                  <img
                    src={news.thumbnail}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Newspaper className="h-16 w-16 text-green-600" />
                  </div>
                )}
                {news.category && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
                    <span>{news.category.icon}</span>
                    <span>{news.category.name}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold">
                  ⭐ Nổi bật
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                  {news.title}
                </h4>
                {news.summary && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{news.summary}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(news.publishedAt || news.createdAt), 'dd MMM yyyy', { locale: vi })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {news.viewCount}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Xem Tất Cả Tin Tức
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
