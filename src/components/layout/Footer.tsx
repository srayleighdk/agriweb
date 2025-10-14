'use client';

import Link from 'next/link';
import { Sprout, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { contactInformationService, ContactInformation } from '@/lib/api/contact-information';

export default function Footer() {
  const [contactInfo, setContactInfo] = useState<ContactInformation | null>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const data = await contactInformationService.get();
        setContactInfo(data);
      } catch (error) {
        console.error('Failed to fetch contact information:', error);
      }
    };

    fetchContactInfo();
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-green-500" />
              <span className="text-xl font-bold text-white">{contactInfo?.companyName || 'Nông nghiệp tái sinh'}</span>
            </Link>
            <p className="text-sm">
              {contactInfo?.description || 'Kết nối nông dân và nhà đầu tư vì nông nghiệp bền vững và thịnh vượng chung.'}
            </p>
            <div className="flex space-x-4">
              {contactInfo?.facebook && (
                <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {contactInfo?.twitter && (
                <a href={contactInfo.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {contactInfo?.linkedin && (
                <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {contactInfo?.instagram && (
                <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {contactInfo?.youtube && (
                <a href={contactInfo.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {contactInfo?.website && (
                <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition">
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên Kết Nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="hover:text-green-500 transition">
                  Tính Năng
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-green-500 transition">
                  Cách Hoạt Động
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-green-500 transition">
                  Về Chúng Tôi
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-green-500 transition">
                  Bắt Đầu
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="text-white font-semibold mb-4">Dành Cho Người Dùng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/farmer/dashboard" className="hover:text-green-500 transition">
                  Cổng Nông Dân
                </Link>
              </li>
              <li>
                <Link href="/investor/dashboard" className="hover:text-green-500 transition">
                  Cổng Nhà Đầu Tư
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-green-500 transition">
                  Đăng Nhập
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-green-500 transition">
                  Trung Tâm Hỗ Trợ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên Hệ Chúng Tôi</h3>
            <ul className="space-y-3 text-sm">
              {contactInfo?.address && (
                <li className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{contactInfo.address}</span>
                </li>
              )}
              {contactInfo?.phone && (
                <li className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{contactInfo.phone}</span>
                </li>
              )}
              {contactInfo?.email && (
                <li className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{contactInfo.email}</span>
                </li>
              )}
              {contactInfo?.workingHours && (
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 font-semibold">Giờ làm việc:</span>
                  <span>{contactInfo.workingHours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} Nông nghiệp tái sinh. Bảo lưu mọi quyền.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-green-500 transition">
              Chính Sách Bảo Mật
            </Link>
            <Link href="#" className="hover:text-green-500 transition">
              Điều Khoản Dịch Vụ
            </Link>
            <Link href="#" className="hover:text-green-500 transition">
              Chính Sách Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
