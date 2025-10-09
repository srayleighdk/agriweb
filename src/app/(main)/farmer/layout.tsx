'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Role } from '@/types';

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[Role.FARMER]}>
      {children}
    </ProtectedRoute>
  );
}
