import apiClient from './client';
import { User, PaginatedResponse, Role } from '@/types';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  province?: string;
  commune?: string;
  role?: Role;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

class UsersService {
  /**
   * Get all users (admin only)
   */
  async getUsers(params: GetUsersParams = {}): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/admin/users', {
      params,
    });
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<User> {
    const response = await apiClient.get<User>(`/admin/users/${userId}`);
    return response.data;
  }

  /**
   * Update user (admin)
   */
  async updateUser(userId: number, data: UpdateUserData): Promise<User> {
    const response = await apiClient.patch<User>(`/admin/users/${userId}`, data);
    return response.data;
  }

  /**
   * Delete user (admin)
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  }
}

export const usersService = new UsersService();
