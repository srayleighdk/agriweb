'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, X } from 'lucide-react';
import apiClient from '@/lib/api/client';
import Toast from '@/components/ui/Toast';

export default function NewNotificationPage() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'SYSTEM_ANNOUNCEMENT',
    priority: 'MEDIUM',
    targetRole: 'ALL',
    targetUserId: '',
    actionUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: any = {
      title: formData.title,
      message: formData.message,
      type: formData.type,
      priority: formData.priority,
      actionUrl: formData.actionUrl || null,
    };

    // Add target based on selection
    if (formData.targetRole === 'ALL') {
      data.targetAll = true;
    } else if (formData.targetRole === 'SPECIFIC') {
      data.targetUserId = parseInt(formData.targetUserId);
    } else {
      data.targetRole = formData.targetRole;
    }

    try {
      setSending(true);
      await apiClient.post('/admin/notifications', data);
      router.push('/admin/notifications');
    } catch (err: any) {
      setToastMessage(err.response?.data?.message || 'Failed to send notification');
      setToastType('error');
      setShowToast(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/notifications')}
          className="text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-2"
        >
          ← Back to Notifications
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Send Notification</h1>
        <p className="text-gray-600 mt-2">Send a notification to users</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Notification title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Notification message"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="SYSTEM_ANNOUNCEMENT">System Announcement</option>
                <option value="INVESTMENT_UPDATE">Investment Update</option>
                <option value="PAYMENT_RECEIVED">Payment Received</option>
                <option value="PROJECT_APPROVED">Project Approved</option>
                <option value="PROJECT_REJECTED">Project Rejected</option>
                <option value="FUNDING_COMPLETE">Funding Complete</option>
                <option value="HARVEST_REMINDER">Harvest Reminder</option>
                <option value="WEATHER_ALERT">Weather Alert</option>
                <option value="INVESTMENT_OPPORTUNITY">Investment Opportunity</option>
                <option value="RETURN_RECEIVED">Return Received</option>
                <option value="INVESTMENT_MATURED">Investment Matured</option>
                <option value="CROP_UPDATE">Crop Update</option>
                <option value="LIVESTOCK_UPDATE">Livestock Update</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Target Audience */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Target Audience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send To <span className="text-red-600">*</span>
                </label>
                <select
                  required
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value, targetUserId: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="ALL">All Users</option>
                  <option value="FARMER">All Farmers</option>
                  <option value="INVESTOR">All Investors</option>
                  <option value="ADMIN">All Admins</option>
                  <option value="SPECIFIC">Specific User</option>
                </select>
              </div>

              {formData.targetRole === 'SPECIFIC' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.targetUserId}
                    onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter user ID"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.actionUrl}
                  onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., /farmer/investments/123"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL to navigate to when notification is clicked
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Send className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {formData.title || 'Notification Title'}
                    </h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        formData.priority === 'LOW'
                          ? 'bg-gray-100 text-gray-800'
                          : formData.priority === 'MEDIUM'
                          ? 'bg-blue-100 text-blue-800'
                          : formData.priority === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {formData.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {formData.message || 'Notification message will appear here'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formData.type}</span>
                    <span>•</span>
                    <span>
                      To:{' '}
                      {formData.targetRole === 'SPECIFIC' && formData.targetUserId
                        ? `User #${formData.targetUserId}`
                        : formData.targetRole === 'ALL'
                        ? 'All Users'
                        : `All ${formData.targetRole}s`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-4">
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={18} />
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/notifications')}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      </form>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
