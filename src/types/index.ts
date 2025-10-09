// User types
export enum Role {
  FARMER = 'FARMER',
  INVESTOR = 'INVESTOR',
  ADMIN = 'ADMIN',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  APPLE = 'APPLE',
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  avatar: string | null;
  provider: AuthProvider;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  phone: string | null;
  address: string | null;
  province: string | null;
  commune: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
