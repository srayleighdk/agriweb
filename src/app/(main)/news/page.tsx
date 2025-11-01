'use client';

import { useState, useEffect } from 'react';
import { newsService, News, NewsCategory } from '@/lib/api/news';
import { Search, Calendar, Eye, Newspaper, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NewsListPage() {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await newsService.getActiveCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await newsService.getPublishedNews({
        page,
        limit,
        search: search || undefined,
        categoryId: selectedCategory || undefined,
      });
      setNews(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
              <Newspaper className="h-4 w-4" />
              Tin Tức & Cập Nhật
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Tin Tức Nông Nghiệp
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cập nhật thông tin mới nhất về nông nghiệp, công nghệ và thị trường
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-b sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm tin tức..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value ? Number(e.target.value) : '');
                    setPage(1);
                  }}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white min-w-[200px]"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Không tìm thấy tin tức</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {news.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-200 overflow-hidden">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="h-16 w-16 text-green-600" />
                        </div>
                      )}
                      {item.category && (
                        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
                          <span>{item.category.icon}</span>
                          <span>{item.category.name}</span>
                        </div>
                      )}
                      {item.isFeatured && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold">
                          ⭐ Nổi bật
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.summary}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(item.publishedAt || item.createdAt), 'dd MMM yyyy', { locale: vi })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.viewCount}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white"
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg ${
                            page === pageNum
                              ? 'bg-green-600 text-white'
                              : 'border hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && <span className="px-2">...</span>}
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 disabled:hover:bg-white"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
