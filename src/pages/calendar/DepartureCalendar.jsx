import React, { useState, useEffect } from 'react';
import { operationsApi } from '../../api/operationsApi';
import { Calendar, Users, AlertCircle } from 'lucide-react';

export default function DepartureCalendar() {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    operationsApi.getDepartures()
      .then((rows) => {
        setSchedules(rows || []);
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Could not load departures.');
        setSchedules([]);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Departure calendar</h1>
        <p className="text-xs text-slate-400 mt-0.5">Travel dates from live bookings, with assigned guides when logistics has them.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {schedules.length === 0 && !error && (
        <p className="text-xs text-slate-400">No departures scheduled yet.</p>
      )}

      <div className="space-y-4">
        {schedules.map((trip) => (
          <div key={trip.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex flex-col items-center justify-center font-bold">
                <Calendar size={18} />
                <span className="text-[10px] mt-0.5 uppercase tracking-wider">
                  {trip.startDate ? String(trip.startDate).slice(5, 7) : '--'}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{trip.route}</h3>
                <p className="text-[10px] font-mono text-sky-600 mt-0.5">{trip.bookingCode} · {trip.clientName}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Travel: <strong className="text-slate-700">{trip.startDate || 'TBD'}</strong></span>
                  <span className="flex items-center gap-1"><Users size={12} /> {trip.pax} trekkers</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-800">{trip.guide}</p>
                <p className="text-[10px] text-slate-400">Assigned expedition leader</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                trip.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
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
