'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Sprout,
  DollarSign,
  MapPin,
  Bell,
  FileText,
  Settings,
  Leaf,
  Beef,
  MessageSquare,
  Info,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Bảng điều khiển', href: '/admin' },
  { icon: Users, label: 'Người dùng', href: '/admin/users' },
  { icon: Sprout, label: 'Nông dân', href: '/admin/farmers' },
  { icon: DollarSign, label: 'Nhà đầu tư', href: '/admin/investors' },
  { icon: FileText, label: 'Đầu tư', href: '/admin/investments' },
  { icon: MapPin, label: 'Vùng đất', href: '/admin/farmlands' },
  { icon: Leaf, label: 'Cây trồng', href: '/admin/plants' },
  { icon: Beef, label: 'Vật nuôi', href: '/admin/animals' },
  { icon: Bell, label: 'Thông báo', href: '/admin/notifications' },
  { icon: MessageSquare, label: 'Liên hệ', href: '/admin/contacts' },
  { icon: Info, label: 'Thông tin liên hệ', href: '/admin/contact-information' },
  { icon: Settings, label: 'Cài đặt', href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Nông nghiệp tái sinh CMS</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
