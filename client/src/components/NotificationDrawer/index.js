import { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import api from '../../services/api';

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id || n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">System Notifications</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id || n.id}
                  onClick={() => markAsRead(n._id || n.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    n.isRead ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-800/80 border-indigo-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {n.type === 'failure' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                    {n.type === 'escalation' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                    {n.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                    {n.type === 'system' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-white">{n.title}</h4>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
