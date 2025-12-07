import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { db } from '../services/mockDatabase';
import { useAuth } from '../context/AuthContext';
import { UserRole, Notification } from '../types';
import { Bell, Send, Trash2, Info, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // New Notification Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'alert' | 'success'>('info');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    const data = db.getNotifications();
    setNotifications(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this notification?')) {
      db.deleteNotification(id);
      fetchNotifications();
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    db.addNotification({ title, message, type });
    setTitle('');
    setMessage('');
    setIsFormOpen(false);
    fetchNotifications();
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <Layout title={isAdmin ? "Manage Notifications" : "Announcements"}>
      <div className="max-w-4xl mx-auto">
        
        {/* Admin Compose Section */}
        {isAdmin && (
          <div className="mb-8">
            {!isFormOpen ? (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:border-uep-maroon hover:text-uep-maroon transition-colors bg-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Post New Announcement
              </button>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Send className="w-5 h-5 mr-2 text-uep-maroon" />
                  Compose Announcement
                </h3>
                <form onSubmit={handleSend}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon focus:border-transparent outline-none"
                      placeholder="e.g. Midterm Examination Schedule"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uep-maroon focus:border-transparent outline-none"
                      placeholder="Enter the details of your announcement..."
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
                    <div className="flex space-x-4">
                      {['info', 'alert', 'success'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t as any)}
                          className={`flex-1 py-2 px-4 rounded-lg capitalize text-sm font-medium border ${
                            type === t 
                              ? 'bg-uep-maroon text-white border-uep-maroon' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button 
                      type="button" 
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-uep-maroon text-white rounded-lg hover:bg-uep-light transition-colors font-medium shadow-md"
                    >
                      Post Announcement
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
               <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
               <p className="text-gray-500">No announcements yet.</p>
             </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`bg-white rounded-xl shadow-sm border-l-4 p-6 relative group transition-all hover:shadow-md ${
                  notif.type === 'alert' ? 'border-l-red-500' :
                  notif.type === 'success' ? 'border-l-green-500' :
                  'border-l-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-4 ${
                      notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                      notif.type === 'success' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {notif.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> :
                       notif.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                       <Info className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg mb-1">{notif.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-3">
                        Posted on {new Date(notif.date).toLocaleDateString()} at {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};