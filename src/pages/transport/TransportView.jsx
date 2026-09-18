import React, { useEffect, useState } from 'react';
import { Plane, Plus, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function TransportView() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    heliTourCode: '',
    heliTourName: '',
    region: 'Khumbu',
    destination: 'Everest region',
    durationHours: 1,
    flightType: 'Scenic',
    helicopterType: 'AS350',
    departureLocation: 'Kathmandu TIA',
    landingLocation: 'Lukla / Kala Patthar',
    maxPassengers: 5,
    price: '',
    currency: 'USD',
    active: true,
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get('/activities/heli-tours');
      setTours(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load helicopter catalog.');
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post('/activities/heli-tours', {
        ...form,
        durationHours: Number(form.durationHours),
        maxPassengers: Number(form.maxPassengers),
        minPassengers: 1,
        price: Number(form.price || 0),
        pricePerPerson: true,
        landingAllowed: true,
        oxygenAvailable: true,
        emergencySupportAvailable: true,
        active: true,
      });
      setIsModalOpen(false);
      setForm((prev) => ({ ...prev, heliTourCode: '', heliTourName: '', price: '' }));
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save heli tour.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Aviation & Fleet</h1>
          <p className="text-xs text-slate-400 mt-0.5">Helicopter charters, baggage limits, and Lukla flight products.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold cursor-pointer"
        >
          <Plus size={16} />
          Add heli tour
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-6 font-bold">Code</th>
              <th className="py-3 px-6 font-bold">Product</th>
              <th className="py-3 px-6 font-bold">Routing</th>
              <th className="py-3 px-6 font-bold">Aircraft</th>
              <th className="py-3 px-6 font-bold">Pax</th>
              <th className="py-3 px-6 font-bold text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading fleet catalog…</td></tr>
            ) : tours.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-slate-400">No heli tours in catalog.</td></tr>
            ) : tours.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                <td className="py-3.5 px-6 font-mono font-bold text-sky-600">{row.heliTourCode}</td>
                <td className="py-3.5 px-6">
                  <p className="font-semibold text-slate-800">{row.heliTourName}</p>
                  <p className="text-[10px] text-slate-400">{row.region} · {row.durationHours}h</p>
                </td>
                <td className="py-3.5 px-6 text-slate-600">{row.departureLocation} → {row.landingLocation}</td>
                <td className="py-3.5 px-6">{row.helicopterType || '—'}</td>
                <td className="py-3.5 px-6">{row.maxPassengers || '—'}</td>
                <td className="py-3.5 px-6 text-right font-bold">{row.currency || 'USD'} {row.price ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Plane size={16} /> New heli tour</h3>
            <input required placeholder="Code e.g. HLI-EBC-01" value={form.heliTourCode} onChange={(e) => setForm({ ...form, heliTourCode: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            <input required placeholder="Tour name" value={form.heliTourName} onChange={(e) => setForm({ ...form, heliTourName: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Departure" value={form.departureLocation} onChange={(e) => setForm({ ...form, departureLocation: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              <input placeholder="Landing" value={form.landingLocation} onChange={(e) => setForm({ ...form, landingLocation: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" min="1" required value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              <input placeholder="Aircraft" value={form.helicopterType} onChange={(e) => setForm({ ...form, helicopterType: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              <input type="number" min="0" placeholder="Price USD" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-sky-500 text-white font-bold rounded-xl">Save tour</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
