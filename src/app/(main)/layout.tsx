import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgriWeb - Agricultural Investment Platform',
  description: 'Connecting farmers and investors for sustainable agriculture',
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
