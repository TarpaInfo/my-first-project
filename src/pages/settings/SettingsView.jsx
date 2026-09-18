import React from 'react';
import { Settings, LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsView() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings size={20} className="text-sky-500" /> Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Workspace theme, signed-in operator, and API connection.</p>
      </div>

      <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Appearance</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'slate', label: 'Slate', icon: Monitor },
          ].map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border cursor-pointer ${
                  active ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Icon size={14} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-2 text-xs">
        <h2 className="text-sm font-bold text-slate-800">Operator</h2>
        <p className="text-slate-600"><span className="text-slate-400">Email:</span> {user?.email || '—'}</p>
        <p className="text-slate-600"><span className="text-slate-400">Role:</span> {user?.role || '—'}</p>
        <p className="text-slate-600"><span className="text-slate-400">API:</span> http://localhost:8080/api</p>
        <p className="text-slate-400 pt-2">SMTP and mail dispatch are configured on the Spring Boot server (`application.properties`).</p>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold cursor-pointer"
      >
        <LogOut size={14} /> Sign out
      </button>
    </div>
  );
}
