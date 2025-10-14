'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Role } from '@/types';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const userStr = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          console.error('Google OAuth error:', error);
          router.push(`/login?error=${encodeURIComponent(error)}`);
          return;
        }

        if (accessToken && refreshToken && userStr) {
          const user = JSON.parse(decodeURIComponent(userStr));
          
          // Store auth data
          setAuth(user, {
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          // Redirect based on user role
          if (user.role === Role.FARMER) {
            router.push('/farmer/dashboard');
          } else if (user.role === Role.INVESTOR) {
            router.push('/investor/dashboard');
          } else if (user.role === Role.ADMIN) {
            const port = window.location.port || '3001';
            window.location.href = `http://admin.localhost:${port}`;
          } else {
            router.push('/');
          }
        } else {
          router.push('/login?error=missing_credentials');
        }
      } catch (error) {
        console.error('Error processing Google callback:', error);
        router.push('/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">
          Đang xác thực với Google...
        </h2>
        <p className="mt-2 text-gray-600">
          Vui lòng đợi trong giây lát
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
