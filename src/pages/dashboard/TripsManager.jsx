import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../api/bookingApi';
import { useModal } from '../../context/ModalContext';
import { 
  Compass, 
  Search, 
  Plus, 
  RefreshCw, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MapPin,
  DollarSign
} from 'lucide-react';

export default function TripsManager() {
  const { openNewTripModal } = useModal();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getAllTrips();
      setTrips(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    const onUpdated = () => fetchTrips();
    window.addEventListener('bookings-updated', onUpdated);
    return () => window.removeEventListener('bookings-updated', onUpdated);
  }, []);

  const filteredTrips = trips.filter((t) => {
    const hay = `${t.packageName || ''} ${t.clientName || ''} ${t.bookingCode || ''}`.toLowerCase();
    const matchesSearch = hay.includes(search.toLowerCase());
    const matchesRegion = regionFilter === 'ALL' || (t.packageName || '').toLowerCase().includes(regionFilter.toLowerCase());
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Expeditions & Historical Log</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Previous records, live active routes, and manual trip registry.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTrips}
            className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-800 transition shadow-2xs"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-sky-500' : ''} />
          </button>
          <button
            onClick={openNewTripModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-2xl shadow-sm shadow-sky-500/25 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Manual Trip</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across custom routes, 200+ itineraries, or clients..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 focus:bg-white"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'Khumbu', 'Manaslu', 'Annapurna', 'Dolpo'].map((reg) => (
            <button
              key={reg}
              onClick={() => setRegionFilter(reg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                regionFilter === reg
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-6 font-bold">Trip / Route Name</th>
              <th className="py-3 px-6 font-bold">Lead Client</th>
              <th className="py-3 px-6 font-bold">Expedition Window</th>
              <th className="py-3 px-6 font-bold text-center">Pax</th>
              <th className="py-3 px-6 font-bold text-center">Status</th>
              <th className="py-3 px-6 font-bold text-right">Yield Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTrips.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  No expeditions found matching criteria.
                </td>
              </tr>
            ) : (
              filteredTrips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0">
                        <Compass size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{t.packageName || t.bookingCode}</p>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {t.bookingCode}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 font-semibold text-slate-700">
                    {t.clientName || 'Direct client'}
                  </td>

                  <td className="py-4 px-6 text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{t.travelDate || 'TBD'}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-center font-bold text-slate-700">
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                      <Users size={11} className="text-slate-400" /> {t.numberOfTravelers || 1}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.bookingStatus === 'CANCELLED'
                        ? 'bg-slate-100 text-slate-600'
                        : t.bookingStatus === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {t.bookingStatus || 'PENDING'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right font-bold text-slate-800">
                    ${(Number(t.totalAmount) || 0).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}