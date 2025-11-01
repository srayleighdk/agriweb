'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { newsService, News } from '@/lib/api/news';
import { NewsForm } from '@/components/admin/NewsForm';

export default function EditNewsPage() {
  const params = useParams();
  const id = Number(params.id);
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadNews = async () => {
    try {
      const data = await newsService.getNewsById(id);
      setNews(data);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">Không tìm thấy tin tức</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa tin tức</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin bài viết</p>
      </div>
      <NewsForm news={news} />
    </div>
  );
}
