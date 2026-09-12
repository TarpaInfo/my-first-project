import React, { useState, useEffect } from 'react';
import { 
  Mountain, 
  Footprints, 
  Compass, 
  Plane, 
  MapPin, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { packagesApi } from '../../api/packagesApi';
import PackageFormModal from '../../components/modals/PackageFormModal';

const MODULE_TABS = [
  { id: 'ALL', name: 'All Activities', icon: Layers },
  { id: 'TREKKING', name: 'Trekking', icon: Footprints },
  { id: 'MOUNTAIN_EXPEDITION', name: 'Mountain Expedition', icon: Mountain },
  { id: 'PEAK_CLIMBING', name: 'Peak Climbing', icon: Compass },
  { id: 'HELI_TOUR', name: 'Heli Tour', icon: Plane },
  { id: 'TOUR', name: 'Cultural Tour', icon: MapPin },
];

export default function PackagesManager() {
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Modal Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await packagesApi.getAllPackages(selectedTab, search);
      setPackages(data);
    } catch {
      setFeedback({ type: 'error', message: 'Could not connect to backend activity endpoints.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [selectedTab]);

  const handleDelete = async (item) => {
    if (window.confirm(`Delete "${item.title}" from /api/activities?`)) {
      try {
        await packagesApi.deletePackage(item.category, item.id);
        setFeedback({ type: 'success', message: `Deleted package #${item.id} successfully.` });
        fetchPackages();
      } catch (err) {
        setFeedback({ 
          type: 'error', 
          message: err.response?.data?.message || 'Delete operation failed on controller.' 
        });
      }
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const filtered = packages.filter((p) => {
    const titleMatch = (p.title || '').toLowerCase().includes(search.toLowerCase());
    const regionMatch = (p.region || '').toLowerCase().includes(search.toLowerCase());
    const tabMatch = selectedTab === 'ALL' || p.category === selectedTab;
    return (titleMatch || regionMatch) && tabMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Activity Packages Operations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamically integrated with Spring Boot controllers: Trekking, Mountain Expedition, Peak Climbing, Heli, and Tours.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPackages}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-800 transition shadow-2xs cursor-pointer"
            title="Reload from API"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-sky-500' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-sm shadow-sky-500/25 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Activity Package</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {MODULE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
              }`}
            >
              <Icon size={15} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by package name or region..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-400 font-bold px-3 hidden sm:inline">
          {filtered.length} Packages Found
        </span>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-100 text-center">
            <p className="text-xs font-bold text-slate-400">No packages registered under this module yet.</p>
            <button
              onClick={openCreateModal}
              className="mt-3 px-4 py-2 text-xs bg-sky-50 text-sky-600 rounded-xl font-bold hover:bg-sky-100 transition cursor-pointer"
            >
              Create the first package
            </button>
          </div>
        ) : (
          filtered.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:border-sky-200 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-600">
                    {(item.category || selectedTab).replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.isActive !== false ? 'Active' : 'Draft'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 mt-2.5 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                  <MapPin size={12} /> {item.region || 'Nepal'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 text-center">
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold">Duration</span>
                  <span className="text-xs font-bold text-slate-700">{item.durationDays || 0} Days</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold">Max Alt</span>
                  <span className="text-xs font-bold text-slate-700">{item.maxAltitude || 0}m</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-semibold">Difficulty</span>
                  <span className="text-xs font-bold text-slate-700 truncate">{item.difficulty || 'Normal'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Standard Price</span>
                  <span className="text-base font-bold text-slate-800">${(item.priceUSD || 0).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-2 bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-600 rounded-xl transition cursor-pointer"
                    title="Edit Package"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition cursor-pointer"
                    title="Delete Package"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Shared CRUD Modal */}
      <PackageFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingItem}
        onSuccess={fetchPackages}
        activeCategory={selectedTab}
      />

    </div>
  );
}