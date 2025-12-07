
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserRole, Notification } from '../types';
import { Bell, Send, Trash2, Info, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'alert' | 'success'>('info');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this notification?')) {
      await api.deleteNotification(id);
      fetchNotifications();
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addNotification({ title, message, type });
    setTitle('');
    setMessage('');
    setIsFormOpen(false);
    fetchNotifications();
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <Layout title={isAdmin ? "Manage Notifications" : "Announcements"}>
      <div className="max-w-4xl mx-auto">
        {isAdmin && (
          <div className="mb-8">
            {!isFormOpen ? (
              <button onClick={() => setIsFormOpen(true)} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:border-uep-maroon hover:text-uep-maroon transition-colors bg-white">
                <Plus className="w-5 h-5 mr-2" /> Post New Announcement
              </button>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Send className="w-5 h-5 mr-2 text-uep-maroon" />Compose</h3>
                <form onSubmit={handleSend}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                  </div>
                  <div className="mb-6">
                    <div className="flex space-x-4">
                      {['info', 'alert', 'success'].map((t) => (
                        <button key={t} type="button" onClick={() => setType(t as any)} className={`flex-1 py-2 px-4 rounded-lg capitalize text-sm font-medium border ${type === t ? 'bg-uep-maroon text-white' : 'bg-white text-gray-600'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-uep-maroon text-white rounded-lg">Post</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif.id} className={`bg-white rounded-xl shadow-sm border-l-4 p-6 relative group ${notif.type === 'alert' ? 'border-l-red-500' : notif.type === 'success' ? 'border-l-green-500' : 'border-l-blue-500'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    {notif.type === 'alert' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : notif.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Info className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-1">{notif.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-3">{new Date(notif.date).toLocaleDateString()}</p>
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(notif.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
