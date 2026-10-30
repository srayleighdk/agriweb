import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TraceNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-20 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-gray-900">Không tìm thấy lô hàng</h1>
          <p className="mt-2 text-gray-600">
            Mã truy xuất không đúng, hoặc nông trại đã ẩn trang của lô này. Hãy kiểm
            tra lại mã in trên tem.
          </p>
          <Link href="/" className="text-green-600 hover:underline mt-4 inline-block">
            Về trang chủ
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
