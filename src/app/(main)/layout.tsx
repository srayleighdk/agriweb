import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nông nghiệp tái sinh - Nền tảng Đầu tư Nông nghiệp',
  description: 'Kết nối nông dân và nhà đầu tư cho nông nghiệp bền vững',
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
