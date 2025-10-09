import apiClient from './client';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  actionUrl: string | null;
  data: any;
  imageUrl: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationData {
  userId?: number;
  title: string;
  message: string;
  type: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  totalPages: number;
}

class NotificationsService {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data;
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const response = await apiClient.post<Notification>('/notifications', data);
    return response.data;
  }

  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  }

  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  }

  // Admin endpoints
  async getAdminNotifications(params: GetNotificationsParams = {}): Promise<PaginatedNotifications> {
    const response = await apiClient.get<PaginatedNotifications>('/admin/notifications', {
      params,
    });
    return response.data;
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>('/admin/notifications/unread-count');
    return response.data;
  }

  async markAdminNotificationAsRead(id: number): Promise<Notification> {
    const response = await apiClient.patch<Notification>(`/admin/notifications/${id}/read`);
    return response.data;
  }

  async markAllAdminNotificationsAsRead(): Promise<{ count: number }> {
    const response = await apiClient.patch<{ count: number }>('/admin/notifications/mark-all-read');
    return response.data;
  }
}

export const notificationsService = new NotificationsService();
