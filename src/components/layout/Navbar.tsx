'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Role } from '@/types';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handlePortalNavigation = () => {
    if (user?.role === Role.FARMER) {
      router.push('/farmer/dashboard');
    } else if (user?.role === Role.INVESTOR) {
      router.push('/investor/dashboard');
    } else if (user?.role === Role.ADMIN) {
      const { getAdminUrl } = await import('@/lib/utils/domain');
      window.location.href = getAdminUrl();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case Role.FARMER:
        return 'Nông dân';
      case Role.INVESTOR:
        return 'Nhà đầu tư';
      case Role.ADMIN:
        return 'Quản trị viên';
      default:
        return 'Người dùng';
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/appicon.png" 
              alt="Nông nghiệp tái sinh Logo" 
              width={40} 
              height={40}
              className="object-contain rounded-lg border-2 border-gray-300"
            />
            <span className="text-xl font-bold text-gray-900">Nông nghiệp tái sinh</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition">
              Tính Năng
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">
              Cách Hoạt Động
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900 transition">
              Về Chúng Tôi
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={handlePortalNavigation}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  {user?.role === Role.FARMER ? 'Cổng Nông Dân' :
                   user?.role === Role.INVESTOR ? 'Cổng Nhà Đầu Tư' :
                   'Cổng Quản Trị'}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatar || undefined} alt={user?.name || undefined} />
                        <AvatarFallback className="bg-green-600 text-white">
                          {getInitials(user?.name || undefined)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{getRoleLabel()}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handlePortalNavigation} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Hồ sơ
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Cài đặt
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Đăng Nhập</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-green-600 hover:bg-green-700">Bắt Đầu</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="#features"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tính Năng
            </Link>
            <Link
              href="#how-it-works"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cách Hoạt Động
            </Link>
            <Link
              href="#about"
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Về Chúng Tôi
            </Link>
            <div className="pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name || undefined} />
                      <AvatarFallback className="bg-green-600 text-white">
                        {getInitials(user?.name || undefined)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        handlePortalNavigation();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {user?.role === Role.FARMER ? 'Cổng Nông Dân' :
                       user?.role === Role.INVESTOR ? 'Cổng Nhà Đầu Tư' :
                       'Cổng Quản Trị'}
                    </Button>
                    <Button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">Đăng Nhập</Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button className="w-full bg-green-600 hover:bg-green-700">Bắt Đầu</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
