'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';
import { Role } from '@/types';
import { Sprout, TrendingUp, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Toast from '@/components/ui/Toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'farmer' | 'investor' | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage] = useState('');
  const [toastType] = useState<'success' | 'error'>('success');

  // Check for OAuth errors in URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'google_auth_failed': 'Đăng nhập Google thất bại. Vui lòng thử lại.',
        'missing_credentials': 'Thiếu thông tin xác thực. Vui lòng thử lại.',
        'callback_failed': 'Xử lý đăng nhập thất bại. Vui lòng thử lại.',
      };
      setError(errorMessages[errorParam] || decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });

      // Store auth data
      setAuth(response.user, {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });

      // Redirect to home page first
      router.push('/');

      // Then navigate to appropriate portal after a brief delay
      setTimeout(() => {
        if (response.user.role === Role.ADMIN) {
          const { getAdminUrl } = await import('@/lib/utils/domain');
          window.location.href = getAdminUrl();
        } else if (response.user.role === Role.FARMER) {
          router.push('/farmer/dashboard');
        } else if (response.user.role === Role.INVESTOR) {
          router.push('/investor/dashboard');
        }
      }, 500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-white">
            <Image 
              src="/appicon.png" 
              alt="Nông nghiệp tái sinh Logo" 
              width={50} 
              height={50}
              className="object-contain rounded-lg border-2 border-white/30"
            />
            <span className="text-3xl font-bold">Nông nghiệp tái sinh</span>
          </div>
        </div>
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-6">
            Kết nối Nông dân và Nhà đầu tư
          </h1>
          <p className="text-xl text-green-100 mb-8">
            Nền tảng kêu gọi đầu tư nông nghiệp hiện đại, minh bạch và bảo mật
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">An toàn & Minh bạch</h3>
                <p className="text-sm text-green-100">Quy trình xác thực và giám sát chặt chẽ</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold">Lợi nhuận hấp dẫn</h3>
                <p className="text-sm text-green-100">Đầu tư vào nông nghiệp bền vững</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-green-100 text-sm">
          © 2025 Nông nghiệp tái sinh. Nền tảng đầu tư nông nghiệp Việt Nam.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Image 
              src="/appicon.png" 
              alt="Nông nghiệp tái sinh Logo" 
              width={40} 
              height={40}
              className="object-contain rounded-lg border-2 border-gray-300"
            />
            <span className="text-2xl font-bold text-gray-900">Nông nghiệp tái sinh</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
              <p className="mt-2 text-gray-600">Chào mừng bạn trở lại</p>
            </div>

            {/* User Type Selection */}
            {!selectedUserType ? (
              <div className="space-y-4">
                <p className="text-center text-sm font-medium text-gray-700 mb-4">
                  Chọn loại tài khoản của bạn
                </p>
                <button
                  onClick={() => setSelectedUserType('farmer')}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 group-hover:bg-green-500 flex items-center justify-center transition-colors">
                      <Sprout className="text-green-600 group-hover:text-white" size={28} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 text-lg">Nông dân</h3>
                      <p className="text-sm text-gray-500">Tạo dự án kêu gọi đầu tư</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setSelectedUserType('investor')}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                      <TrendingUp className="text-blue-600 group-hover:text-white" size={28} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 text-lg">Nhà đầu tư</h3>
                      <p className="text-sm text-gray-500">Đầu tư vào dự án nông nghiệp</p>
                    </div>
                  </div>
                </button>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* User type badge */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    {selectedUserType === 'farmer' ? (
                      <>
                        <Sprout className="text-green-600" size={20} />
                        <span className="text-sm font-medium">Đăng nhập với tư cách Nông dân</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="text-blue-600" size={20} />
                        <span className="text-sm font-medium">Đăng nhập với tư cách Nhà đầu tư</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserType(null);
                      setError('');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Thay đổi
                  </button>
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="text-gray-400" size={20} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" size={20} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="text-gray-400 hover:text-gray-600" size={20} />
                      ) : (
                        <Eye className="text-gray-400 hover:text-gray-600" size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Quên mật khẩu?
                  </Link>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors ${
                    selectedUserType === 'farmer'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập với</span>
                  </div>
                </div>

                {/* Google login */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-medium text-gray-700">Đăng nhập với Google</span>
                </button>

                {/* Register link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
