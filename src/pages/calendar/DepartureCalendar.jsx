import React, { useState, useEffect } from 'react';
import { operationsApi } from '../../api/operationsApi';
import { Calendar, Compass, MapPin, Users, ChevronRight } from 'lucide-react';

export default function DepartureCalendar() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    operationsApi.getDepartures().then(setSchedules).catch(() => {
      setSchedules([
        { id: 1, route: 'Everest Base Camp Trek (14 Days)', startDate: '2026-09-12', endDate: '2026-09-26', pax: 8, guide: 'Pasang Dawa Sherpa', status: 'CONFIRMED' },
        { id: 2, route: 'Manaslu Circuit High Pass', startDate: '2026-09-18', endDate: '2026-10-04', pax: 6, guide: 'Pemba Norbu', status: 'SLOTS_OPEN' },
        { id: 3, route: 'Annapurna Sanctuary Discovery', startDate: '2026-09-22', endDate: '2026-10-04', pax: 12, guide: 'Ang Tshering', status: 'CONFIRMED' },
      ]);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Autumn 2026 Departure Calendar</h1>
        <p className="text-xs text-slate-400 mt-0.5">Commercial departure windows, Lukla twin-otter weather buffers, and team sizes.</p>
      </div>

      <div className="space-y-4">
        {schedules.map((trip) => (
          <div key={trip.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex flex-col items-center justify-center font-bold">
                <Calendar size={18} />
                <span className="text-[10px] mt-0.5 uppercase tracking-wider">{trip.startDate.split('-')[1]}/26</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{trip.route}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Window: <strong className="text-slate-700">{trip.startDate}</strong> to <strong className="text-slate-700">{trip.endDate}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {trip.pax} Trekkers</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-800">{trip.guide}</p>
                <p className="text-[10px] text-slate-400">Assigned Expedition Leader</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                trip.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'
              }`}>
                {trip.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}