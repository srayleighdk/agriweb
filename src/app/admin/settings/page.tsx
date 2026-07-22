'use client';

import Link from 'next/link';
import { Settings, Info, Mail, Bell, Shield } from 'lucide-react';

const links = [
  {
    href: '/admin/contact-information',
    icon: Mail,
    title: 'Thông tin liên hệ công ty',
    description: 'Số điện thoại, email, mạng xã hội hiển thị trên website',
  },
  {
    href: '/admin/notifications',
    icon: Bell,
    title: 'Thông báo',
    description: 'Gửi và quản lý thông báo tới người dùng',
  },
  {
    href: '/admin/users',
    icon: Shield,
    title: 'Quản lý người dùng',
    description: 'Vai trò, xác minh email và quyền truy cập',
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="text-green-600" size={32} />
          Cài đặt
        </h1>
        <p className="text-gray-600 mt-2">Cấu hình hệ thống và liên kết quản trị</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-blue-900">
          Trang tổng hợp cài đặt CMS. Các mục chi tiết (SMTP, bảo mật, tích hợp) sẽ được bổ sung trong các phiên
          bản sau.
        </p>
      </div>

      <div className="space-y-4">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <Icon className="text-green-700" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}