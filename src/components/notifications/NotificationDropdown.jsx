import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const formatWhen = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const load = async () => {
    try {
      const [alertsRes, notesRes] = await Promise.all([
        axiosClient.get('/alerts').catch(() => ({ data: [] })),
        axiosClient.get('/notifications').catch(() => ({ data: [] })),
      ]);
      const alerts = (alertsRes.data || []).map((a) => ({
        id: `alert-${a.id}`,
        title: a.title || a.alertCode || 'Alert',
        description: a.message || a.bookingCode || '',
        time: formatWhen(a.createdAt || a.scheduledAt),
        type: a.status === 'PENDING' ? 'warning' : 'success',
        unread: a.status === 'PENDING' || a.status === 'ACTIVE',
      }));
      const notes = (notesRes.data || []).map((n) => ({
        id: `note-${n.id}`,
        title: n.title || n.notificationCode || 'Notice',
        description: n.message || n.bookingCode || '',
        time: formatWhen(n.createdAt || n.scheduledAt),
        type: n.status === 'SENT' ? 'success' : 'info',
        unread: n.status !== 'SENT',
      }));
      setNotifications([...alerts, ...notes].slice(0, 20));
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const getIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={16} className="text-sky-500 flex-shrink-0" />;
    if (type === 'warning') return <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />;
    return <Info size={16} className="text-zinc-400 flex-shrink-0" />;
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) load();
        }}
        className="relative p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer shadow-xs"
        aria-label="View Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Operations alerts</h3>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllAsRead} className="text-[11px] font-medium text-sky-600 hover:underline cursor-pointer">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[340px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-400">No alerts or notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`group relative flex items-start gap-3 p-3.5 ${n.unread ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''}`}>
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${n.unread ? 'font-bold text-zinc-900 dark:text-white' : 'font-medium text-zinc-700 dark:text-zinc-300'}`}>{n.title}</p>
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap ml-2">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{n.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteNotification(n.id)}
                    className="opacity-0 group-hover:opacity-100 absolute right-2.5 top-3.5 p-1 text-zinc-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
