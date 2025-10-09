'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@/types';

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.INVESTOR]}>
      {children}
    </ProtectedRoute>
  );
}
