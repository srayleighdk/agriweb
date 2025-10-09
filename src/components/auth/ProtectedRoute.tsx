'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for store to hydrate from localStorage
    if (!_hasHydrated) {
      return;
    }

    setIsChecking(false);

    if (requireAuth && !isAuthenticated) {
      // Check if we're on admin routes
      if (pathname?.startsWith('/admin')) {
        router.push('/admin/login');
      } else {
        router.push('/login');
      }
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === Role.FARMER) {
        router.push('/farmer/dashboard');
      } else if (user.role === Role.INVESTOR) {
        router.push('/investor/dashboard');
      } else if (user.role === Role.ADMIN) {
        // Get current port for admin redirect
        const port = typeof window !== 'undefined' ? window.location.port : '';
        window.location.href = `http://admin.localhost${port ? ':' + port : ''}`;
      } else {
        router.push('/');
      }
    }
  }, [user, isAuthenticated, allowedRoles, requireAuth, router, pathname, _hasHydrated]);

  // Show loading while hydrating or checking auth
  if (!_hasHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
