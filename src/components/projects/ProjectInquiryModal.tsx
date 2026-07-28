'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { contactService } from '@/lib/api/contact';

interface ProjectInquiryModalProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  projectTitle: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function ProjectInquiryModal({
  open,
  onClose,
  projectId,
  projectTitle,
  onSuccess,
  onError,
}: ProjectInquiryModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await contactService.create({
        name,
        email,
        phone: phone || undefined,
        subject: `Quan tâm dự án: ${projectTitle}`,
        message,
        farmerInvestmentId: projectId,
      });
      onSuccess('Đã gửi yêu cầu liên hệ. Admin sẽ liên hệ lại với bạn sớm!');
      resetForm();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      onError(error.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Liên hệ về dự án này</h3>
          <button onClick={onClose} className="text-gray-400" aria-label="Đóng">
            <X size={22} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Để lại thông tin, admin sẽ liên hệ lại với bạn về dự án &quot;{projectTitle}&quot;.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Nguyễn Văn A"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="email@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại (tuỳ chọn)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="0901234567"
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nội dung</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Bạn muốn hỏi gì về dự án này?"
              required
              maxLength={2000}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi liên hệ'}
          </button>
        </form>
      </div>
    </div>
  );
}
