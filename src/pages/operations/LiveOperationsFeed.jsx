import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  RotateCw, 
  Plus, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { expeditionApi } from '../../api/expeditionApi';
import NewExpeditionLogModal from '../../components/modals/NewExpeditionLogModal';

const MODULE_TABS = [
  { id: 'ALL', label: 'All Operations' },
  { id: 'TREKKING', label: 'Trekking' },
  { id: 'PEAK_CLIMBING', label: 'Peak Climbing' },
  { id: 'EXPEDITION', label: 'Mountain Expedition' },
  { id: 'TOUR', label: 'Cultural Tour' },
  { id: 'HELI_TOUR', label: 'Heli Tours' }
];

export default function LiveOperationsFeed() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 15,
    totalPages: 0,
    totalElements: 0
  });

  const fetchLogs = async (targetPage = pagination.page, tab = activeTab) => {
    setLoading(true);
    try {
      const data = await expeditionApi.getLogs(tab, targetPage, pagination.size);
      const content = data?.content || [];
      setLogs(content);
      setPagination((prev) => ({
        ...prev,
        page: data.number ?? targetPage,
        totalPages: data.totalPages ?? 0,
        totalElements: data.totalElements ?? 0
      }));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0, activeTab);
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const getSeverityBadge = (severity, heliRequested) => {
    if (heliRequested || severity === 'CRITICAL_EMERGENCY') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <ShieldAlert size={11} /> Critical Alert / Heli
        </span>
      );
    }
    if (severity === 'MODERATE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
          <AlertTriangle size={11} /> Moderate
        </span>
      );
    }
    if (severity === 'MILD') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={11} /> Mild
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Routine
      </span>
    );
  };

  const formatTime = (ts) => {
    if (!ts) return 'Just now';
    const date = new Date(ts);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Radio size={24} className="text-sky-500 animate-pulse" />
            Live Expedition Operations & Incident Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time trail checkpoints, AMS escalations, and weather holds across all 5 operational modules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>New Check-In / Alert</span>
          </button>
          <button
            type="button"
            onClick={() => fetchLogs(pagination.page, activeTab)}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 shadow-xs cursor-pointer transition disabled:opacity-50"
          >
            <RotateCw size={15} className={loading ? 'animate-spin text-sky-500' : ''} />
          </button>
        </div>
      </div>

      {/* Module Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-x-auto">
        {MODULE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Log Feed List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl text-slate-400 text-xs">
            No telemetry check-ins recorded for this module category yet.
          </div>
        ) : (
          logs.map((item) => {
            const isAlert = item.heliRescueRequested || item.severity === 'CRITICAL_EMERGENCY';

            return (
              <div
                key={item.id}
                className={`p-4 bg-white border rounded-2xl shadow-xs transition hover:shadow-sm ${
                  isAlert ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                      {item.bookingCode}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">{item.clientName}</span>
                    <span className="text-slate-400 text-xs">• {item.routeName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.activityCategory}
                    </span>
                    {getSeverityBadge(item.severity, item.heliRescueRequested)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span>{item.locationName}</span>
                    {item.altitudeMeters && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({item.altitudeMeters}m)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    <UserCheck size={14} className="text-slate-400 shrink-0" />
                    <span>Reported by: <strong className="text-slate-700">{item.reportedBy}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] sm:justify-end">
                    <Clock size={13} className="shrink-0" />
                    <span>{formatTime(item.timestamp)}</span>
                  </div>
                </div>

                {item.reportNotes && (
                  <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-xs leading-relaxed">
                    {item.reportNotes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Server-Side Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500">
            Total Elements: <strong className="text-slate-800">{pagination.totalElements}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page === 0 || loading}
              onClick={() => fetchLogs(pagination.page - 1, activeTab)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-xs font-bold text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">
              {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page + 1 >= pagination.totalPages || loading}
              onClick={() => fetchLogs(pagination.page + 1, activeTab)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Telemetry & Alert Modal */}
      <NewExpeditionLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => fetchLogs(0, activeTab)}
      />

    </div>
  );
}