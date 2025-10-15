'use client';

import { useAuthStore } from '@/store/auth';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getAdminUrl } from '@/lib/utils/domain';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Redirect based on role
    if (user?.role === Role.FARMER) {
      router.push('/farmer/dashboard');
    } else if (user?.role === Role.INVESTOR) {
      router.push('/investor/dashboard');
    } else if (user?.role === Role.ADMIN) {
      // Redirect to admin subdomain
      window.location.href = getAdminUrl();
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
