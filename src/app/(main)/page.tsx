'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Sprout,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  Heart,
  Leaf,
  Coins,
  ArrowRight,
  CheckCircle2,
  Target,
} from 'lucide-react';

export default function HomePage() {

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🌱 Nền Tảng Nông Nghiệp Bền Vững
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Kết Nối Nông Dân với Cơ Hội
                <span className="text-green-600"> Đầu Tư</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Trao quyền phát triển nông nghiệp thông qua công nghệ. Cùng hàng nghìn nông dân và
                nhà đầu tư xây dựng tương lai bền vững.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 h-14">
                    Bắt Đầu Ngay <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                    Tìm Hiểu Thêm
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-gray-900">5K+</div>
                  <div className="text-sm text-gray-600">Nông Dân Hoạt Động</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">2K+</div>
                  <div className="text-sm text-gray-600">Nhà Đầu Tư</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">$10M+</div>
                  <div className="text-sm text-gray-600">Đã Huy Động</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px] bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <Sprout className="h-32 w-32 text-green-600 mx-auto" />
                    <p className="text-2xl font-semibold text-gray-800">Cùng Phát Triển</p>
                  </div>
                </div>
                {/* Floating Cards */}
                <div className="absolute top-10 right-10 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">+23% Tăng Trưởng</span>
                  </div>
                </div>
                <div className="absolute bottom-10 left-10 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">7K+ Người Dùng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại Sao Chọn AgriWeb?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nền tảng toàn diện được thiết kế để cách mạng hóa đầu tư nông nghiệp và quản lý trang trại
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Sprout className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Quản Lý Trang Trại</CardTitle>
                <CardDescription>
                  Công cụ hoàn chỉnh để quản lý đất canh tác, cây trồng và vật nuôi một cách dễ dàng
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card 2 */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Cơ Hội Đầu Tư</CardTitle>
                <CardDescription>
                  Tìm kiếm và đầu tư vào các dự án nông nghiệp đã được xác minh với theo dõi minh bạch
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card 3 */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Xác Minh & An Toàn</CardTitle>
                <CardDescription>
                  Tất cả người dùng và dự án đều được xác minh để đảm bảo tin cậy và an toàn
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card 4 */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle>Phân Tích Thời Gian Thực</CardTitle>
                <CardDescription>
                  Theo dõi đầu tư và hiệu suất trang trại với phân tích chi tiết
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card 5 */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Tập Trung Bền Vững</CardTitle>
                <CardDescription>
                  Hỗ trợ các phương pháp canh tác thân thiện với môi trường và nông nghiệp bền vững
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature Card 6 */}
            <Card className="border-2 hover:border-green-500 transition-all hover:shadow-lg">
              <CardHeader>
                <div className="h-12 w-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle>Hỗ Trợ Cộng Đồng</CardTitle>
                <CardDescription>
                  Tham gia cộng đồng sôi động của nông dân và nhà đầu tư cùng nhau phát triển
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cách Thức Hoạt Động</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Các bước đơn giản để bắt đầu hành trình nông nghiệp của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Farmers */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Sprout className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Dành Cho Nông Dân</h3>
              </div>
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Đăng Ký & Xác Minh</h4>
                    <p className="text-gray-600">
                      Tạo tài khoản và hoàn thành quy trình xác minh
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Thêm Đất Canh Tác</h4>
                    <p className="text-gray-600">
                      Đăng ký đất canh tác, cây trồng và vật nuôi trên nền tảng
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Yêu Cầu Tài Trợ</h4>
                    <p className="text-gray-600">
                      Tạo yêu cầu tài trợ và kết nối với các nhà đầu tư quan tâm
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phát Triển Trang Trải</h4>
                    <p className="text-gray-600">
                      Nhận vốn và theo dõi tiến độ thông qua bảng điều khiển
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Investors */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Dành Cho Nhà Đầu Tư</h3>
              </div>
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Tạo Tài Khoản</h4>
                    <p className="text-gray-600">
                      Đăng ký và hoàn thành xác minh nhà đầu tư
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Tìm Kiếm Cơ Hội</h4>
                    <p className="text-gray-600">
                      Khám phá các cơ hội đầu tư nông nghiệp đã được xác minh
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Thực Hiện Đầu Tư</h4>
                    <p className="text-gray-600">
                      Đầu tư vào các dự án phù hợp với mục tiêu của bạn
                    </p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Theo Dõi Lợi Nhuận</h4>
                    <p className="text-gray-600">
                      Giám sát danh mục đầu tư và lợi nhuận theo thời gian thực
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-4 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tác Động Của Chúng Tôi</h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Tạo sự khác biệt thực sự trong cộng đồng nông nghiệp trên toàn quốc
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">5,000+</div>
              <div className="text-green-100">Nông Dân Được Trao Quyền</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">2,000+</div>
              <div className="text-green-100">Nhà Đầu Tư Hoạt Động</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">$10M+</div>
              <div className="text-green-100">Vốn Đã Triển Khai</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">15K+</div>
              <div className="text-green-100">Hecta Được Tài Trợ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Xây Dựng Tương Lai Nông Nghiệp Bền Vững
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                AgriWeb không chỉ là một nền tảng—đây là một phong trào hướng tới nông nghiệp bền vững,
                dựa trên công nghệ mang lại lợi ích cho tất cả mọi người tham gia.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Hoạt Động Minh Bạch</h4>
                    <p className="text-gray-600">
                      Mọi giao dịch và cập nhật dự án đều hiển thị cho tất cả các bên liên quan
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Người Dùng Đã Xác Minh</h4>
                    <p className="text-gray-600">
                      Tất cả nông dân và nhà đầu tư đều trải qua quy trình xác minh kỹ lưỡng
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Hỗ Trợ Chuyên Gia</h4>
                    <p className="text-gray-600">
                      Tiếp cận các chuyên gia nông nghiệp và cố vấn đầu tư
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Thực Hành Bền Vững</h4>
                    <p className="text-gray-600">
                      Thúc đẩy các phương pháp canh tác thân thiện với môi trường và đầu tư có trách nhiệm
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl p-12 text-center">
                <Target className="h-32 w-32 text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sứ Mệnh Của Chúng Tôi</h3>
                <p className="text-gray-700 text-lg">
                  Tạo ra một hệ sinh thái bền vững nơi nông dân phát triển mạnh và nhà đầu tư
                  tạo ra tác động có ý nghĩa đồng thời mang lại lợi nhuận.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
