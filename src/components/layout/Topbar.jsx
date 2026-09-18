import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, ChevronDown, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { openNewTripModal } = useModal();
  const navigate = useNavigate();
  const userName = user?.email?.split('@')[0] || 'Operations';

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Notification items state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Lukla briefing dispatched',
      description: 'Flight rosters sent to team leads.',
      time: '5m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Client Confirmation Sent',
      description: 'Automated HTML voucher sent for TRK-2026-03.',
      time: '24m ago',
      unread: true,
    },
    {
      id: 3,
      title: 'TIMS Permit Verification',
      description: 'Manaslu conservation permits awaiting officer signature.',
      time: '1h ago',
      unread: false,
    }
  ]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const markSingleAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/logistics?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30 border-b border-slate-100 dark:border-zinc-800">
      
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-80 lg:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search trips, guides, permits, vouchers..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-zinc-900 transition text-slate-900 dark:text-zinc-100 placeholder-slate-400"
        />
      </form>

      {/* Topbar Actions */}
      <div className="flex items-center gap-4">
        
        {/* Working + New Trip Button */}
        <button
          type="button"
          onClick={openNewTripModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-semibold rounded-2xl shadow-sm shadow-sky-500/25 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>New Trip</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition relative cursor-pointer"
            aria-label="Toggle notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full absolute top-2.5 right-2.5 ring-2 ring-white dark:ring-zinc-950 animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-100 dark:border-zinc-800 p-4 z-40 animate-in fade-in zoom-in-95 duration-100 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[10px] font-semibold text-sky-500 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No recent notifications.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markSingleAsRead(n.id)}
                      className={`p-2.5 rounded-2xl flex gap-3 text-xs transition-colors cursor-pointer ${
                        n.unread
                          ? 'bg-sky-50/70 dark:bg-sky-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <CheckCircle2 size={16} className="text-sky-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-[11px] leading-tight ${n.unread ? 'font-bold text-slate-800 dark:text-zinc-100' : 'font-semibold text-slate-700 dark:text-zinc-300'}`}>
                            {n.title}
                          </p>
                          <span className="text-[9px] text-slate-400 whitespace-nowrap ml-2">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-400 mt-0.5 leading-snug">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card & Sign Out Menu */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 pl-2 border-l border-slate-100 dark:border-zinc-800 cursor-pointer select-none"
          >
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'sagar'}`}
              alt="avatar"
              className="w-10 h-10 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-sky-50"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-100 capitalize leading-tight">{userName}</p>
              <p className="text-[10px] text-slate-400 font-medium">{user?.role?.replace('ROLE_', '') || 'OPERATIONS'}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 p-2 z-40">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 text-xs">
                <p className="font-bold text-slate-800 dark:text-zinc-100 capitalize">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <div className="pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-semibold transition cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}