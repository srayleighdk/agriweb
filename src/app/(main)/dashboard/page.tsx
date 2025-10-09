'use client';

import { useAuthStore } from '@/store/auth';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
      // Redirect to admin subdomain with current port
      const port = window.location.port || '3001';
      window.location.href = `http://admin.localhost:${port}`;
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
