'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { newsService, News, NewsCategory, CreateNewsData } from '@/lib/api/news';
import { Save, X } from 'lucide-react';

interface NewsFormProps {
  news?: News;
}

export function NewsForm({ news }: NewsFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateNewsData>({
    title: news?.title || '',
    slug: news?.slug || '',
    summary: news?.summary || '',
    content: news?.content || '',
    thumbnail: news?.thumbnail || '',
    images: news?.images || [],
    categoryId: news?.categoryId || undefined,
    tags: news?.tags || [],
    author: news?.author || '',
    isPublished: news?.isPublished || false,
    isFeatured: news?.isFeatured || false,
  });
  const [tagInput, setTagInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await newsService.getActiveCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (news) {
        await newsService.updateNews(news.id, formData);
      } else {
        await newsService.createNews(formData);
      }
      router.push('/admin/news');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Failed to save news');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const handleAddImage = () => {
    if (imageInput.trim() && !formData.images?.includes(imageInput.trim())) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), imageInput.trim()],
      });
      setImageInput('');
    }
  };

  const handleRemoveImage = (image: string) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((img) => img !== image) || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập tiêu đề tin tức"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (để trống để tự động tạo)
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="vd: ky-thuat-trong-lua"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
          <select
            value={formData.categoryId || ''}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tóm tắt</label>
          <textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Tóm tắt ngắn gọn về bài viết"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nội dung chi tiết của bài viết"
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện (URL)</label>
          <input
            type="url"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://example.com/image.jpg"
          />
          {formData.thumbnail && (
            <img
              src={formData.thumbnail}
              alt="Thumbnail preview"
              className="mt-2 w-32 h-32 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bổ sung</label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="URL ảnh"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Thêm
            </button>
          </div>
          {formData.images && formData.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} alt={`Image ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Thêm
            </button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-2"
                >
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-500 hover:text-red-500">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tác giả</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Tên tác giả"
          />
        </div>

        {/* Status */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Xuất bản ngay</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Tin nổi bật</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Đang lưu...' : news ? 'Cập nhật' : 'Tạo mới'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      </div>
    </form>
  );
}
