'use client';

import { NewsForm } from '@/components/admin/NewsForm';

export default function NewNewsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thêm tin tức mới</h1>
        <p className="text-gray-600 mt-2">Tạo bài viết tin tức mới</p>
      </div>
      <NewsForm />
    </div>
  );
}
