import apiClient from './client';
import { PaginatedResponse } from '@/types';

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    news: number;
  };
}

export interface News {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  thumbnail: string | null;
  images: string[];
  categoryId: number | null;
  category?: NewsCategory;
  tags: string[];
  author: string | null;
  authorId: number | null;
  isPublished: boolean;
  publishedAt: string | null;
  viewCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsData {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  thumbnail?: string;
  images?: string[];
  categoryId?: number;
  tags?: string[];
  author?: string;
  authorId?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface CreateNewsCategoryData {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  displayOrder?: number;
}

class NewsService {
  // News endpoints
  async getNews(params?: {
    page?: number;
    limit?: number;
    categoryId?: number;
    isPublished?: boolean;
    isFeatured?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<News>> {
    const response = await apiClient.get<PaginatedResponse<News>>('/news', { params });
    return response.data;
  }

  async getPublishedNews(params?: {
    page?: number;
    limit?: number;
    categoryId?: number;
    isFeatured?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<News>> {
    const response = await apiClient.get<PaginatedResponse<News>>('/news/published', { params });
    return response.data;
  }

  async getFeaturedNews(limit?: number): Promise<News[]> {
    const response = await apiClient.get<News[]>('/news/featured', { params: { limit } });
    return response.data;
  }

  async getNewsById(id: number): Promise<News> {
    const response = await apiClient.get<News>(`/news/${id}`);
    return response.data;
  }

  async getNewsBySlug(slug: string): Promise<News> {
    const response = await apiClient.get<News>(`/news/slug/${slug}`);
    return response.data;
  }

  async getRelatedNews(id: number, limit?: number): Promise<News[]> {
    const response = await apiClient.get<News[]>(`/news/${id}/related`, { params: { limit } });
    return response.data;
  }

  async createNews(data: CreateNewsData): Promise<News> {
    const response = await apiClient.post<News>('/news', data);
    return response.data;
  }

  async updateNews(id: number, data: Partial<CreateNewsData>): Promise<News> {
    const response = await apiClient.patch<News>(`/news/${id}`, data);
    return response.data;
  }

  async togglePublish(id: number): Promise<News> {
    const response = await apiClient.patch<News>(`/news/${id}/publish`);
    return response.data;
  }

  async toggleFeatured(id: number): Promise<News> {
    const response = await apiClient.patch<News>(`/news/${id}/featured`);
    return response.data;
  }

  async deleteNews(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/news/${id}`);
    return response.data;
  }

  // News Category endpoints
  async getCategories(params?: { isActive?: boolean }): Promise<NewsCategory[]> {
    const response = await apiClient.get<NewsCategory[]>('/news-categories', { params });
    return response.data;
  }

  async getActiveCategories(): Promise<NewsCategory[]> {
    const response = await apiClient.get<NewsCategory[]>('/news-categories/active');
    return response.data;
  }

  async getCategoryById(id: number): Promise<NewsCategory> {
    const response = await apiClient.get<NewsCategory>(`/news-categories/${id}`);
    return response.data;
  }

  async getCategoryBySlug(slug: string): Promise<NewsCategory> {
    const response = await apiClient.get<NewsCategory>(`/news-categories/slug/${slug}`);
    return response.data;
  }

  async createCategory(data: CreateNewsCategoryData): Promise<NewsCategory> {
    const response = await apiClient.post<NewsCategory>('/news-categories', data);
    return response.data;
  }

  async updateCategory(id: number, data: Partial<CreateNewsCategoryData>): Promise<NewsCategory> {
    const response = await apiClient.patch<NewsCategory>(`/news-categories/${id}`, data);
    return response.data;
  }

  async toggleCategoryActive(id: number): Promise<NewsCategory> {
    const response = await apiClient.patch<NewsCategory>(`/news-categories/${id}/toggle-active`);
    return response.data;
  }

  async reorderCategories(categoryIds: number[]): Promise<void> {
    await apiClient.patch('/news-categories/reorder', { categoryIds });
  }

  async deleteCategory(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/news-categories/${id}`);
    return response.data;
  }
}

export const newsService = new NewsService();
