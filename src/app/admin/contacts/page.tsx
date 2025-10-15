'use client';

import { useEffect, useState } from 'react';
import { contactService, Contact, ContactStatus } from '@/lib/api/contact';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Eye, EyeOff, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<ContactStatus>(ContactStatus.PENDING);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const result = await contactService.getAll();
      setContacts(result.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Không thể tải danh sách liên hệ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContact = async (id: number) => {
    try {
      await contactService.update(id, {
        status,
        response: response || undefined,
      });
      alert('Cập nhật thành công!');
      fetchContacts();
      setSelectedContact(null);
      setResponse('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) return;
    try {
      await contactService.delete(id);
      alert('Xóa thành công!');
      fetchContacts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || 'Xóa thất bại');
    }
  };

  const getStatusBadge = (status: ContactStatus) => {
    const variants: Record<ContactStatus, { label: string; className: string }> = {
      PENDING: { label: 'Chờ xử lý', className: 'bg-yellow-500' },
      IN_PROGRESS: { label: 'Đang xử lý', className: 'bg-blue-500' },
      RESOLVED: { label: 'Đã giải quyết', className: 'bg-green-500' },
      CLOSED: { label: 'Đã đóng', className: 'bg-gray-500' },
    };
    const { label, className } = variants[status];
    return <Badge className={className}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý liên hệ</h1>
        <p className="text-gray-600 mt-2">
          Tổng số: {contacts.length} liên hệ
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{contact.subject}</CardTitle>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {contact.name} ({contact.email})
                    </span>
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {contact.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(contact.createdAt), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {getStatusBadge(contact.status)}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (selectedContact?.id === contact.id) {
                        setSelectedContact(null);
                      } else {
                        setSelectedContact(contact);
                        setStatus(contact.status);
                        setResponse(contact.response || '');
                      }
                    }}
                  >
                    {selectedContact?.id === contact.id ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Nội dung:</p>
                <p className="text-gray-600 whitespace-pre-wrap">{contact.message}</p>
              </div>

              {contact.response && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Phản hồi:</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{contact.response}</p>
                  {contact.respondedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Phản hồi lúc: {format(new Date(contact.respondedAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                  )}
                </div>
              )}

              {selectedContact?.id === contact.id && (
                <div className="mt-4 p-4 border-t">
                  <h4 className="font-semibold mb-4">Cập nhật liên hệ</h4>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Trạng thái</label>
                      <Select value={status} onValueChange={(value) => setStatus(value as ContactStatus)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ContactStatus.PENDING}>Chờ xử lý</SelectItem>
                          <SelectItem value={ContactStatus.IN_PROGRESS}>Đang xử lý</SelectItem>
                          <SelectItem value={ContactStatus.RESOLVED}>Đã giải quyết</SelectItem>
                          <SelectItem value={ContactStatus.CLOSED}>Đã đóng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phản hồi</label>
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Nhập phản hồi cho khách hàng..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdateContact(contact.id)}>
                        Lưu cập nhật
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedContact(null);
                          setResponse('');
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {contacts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Chưa có liên hệ nào</p>
        </div>
      )}
    </div>
  );
}
