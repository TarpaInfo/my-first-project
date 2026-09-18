import React, { useEffect, useState } from 'react';
import { Building2, Plus, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function HotelsView() {
  const [lodges, setLodges] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    hotelBookingCode: '',
    bookingId: '',
    hotelName: '',
    city: 'Kathmandu',
    country: 'Nepal',
    checkInDate: '',
    checkOutDate: '',
    numberOfRooms: 1,
    numberOfGuests: 2,
    roomType: 'Twin Lodge',
    mealPlan: 'BB',
    totalAmount: '',
    currency: 'USD',
    status: 'CONFIRMED',
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [hotelRes, bookingRes] = await Promise.all([
        axiosClient.get('/hotel-bookings'),
        axiosClient.get('/bookings'),
      ]);
      setLodges(hotelRes.data || []);
      setBookings(bookingRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load lodge bookings.');
      setLodges([]);
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
      const checkIn = form.checkInDate;
      const checkOut = form.checkOutDate;
      const nights = checkIn && checkOut
        ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
        : 1;
      await axiosClient.post('/hotel-bookings', {
        ...form,
        bookingId: Number(form.bookingId),
        numberOfNights: nights,
        numberOfRooms: Number(form.numberOfRooms),
        numberOfGuests: Number(form.numberOfGuests),
        totalAmount: Number(form.totalAmount || 0),
        active: true,
      });
      setIsModalOpen(false);
      setForm((prev) => ({ ...prev, hotelBookingCode: '', hotelName: '', totalAmount: '' }));
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lodge voucher.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Lodges & Teahouses</h1>
          <p className="text-xs text-slate-400 mt-0.5">Tea-house allotments and lodge vouchers linked to expedition bookings.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          Lodge voucher
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
              <th className="py-3 px-6 font-bold">Voucher</th>
              <th className="py-3 px-6 font-bold">Lodge</th>
              <th className="py-3 px-6 font-bold">Linked trip</th>
              <th className="py-3 px-6 font-bold">Stay</th>
              <th className="py-3 px-6 font-bold">Rooms</th>
              <th className="py-3 px-6 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading lodge bookings…</td></tr>
            ) : lodges.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-slate-400">No lodge vouchers yet.</td></tr>
            ) : lodges.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                <td className="py-3.5 px-6 font-mono font-bold text-sky-600">{row.hotelBookingCode}</td>
                <td className="py-3.5 px-6">
                  <p className="font-semibold text-slate-800">{row.hotelName}</p>
                  <p className="text-[10px] text-slate-400">{row.city}, {row.country}</p>
                </td>
                <td className="py-3.5 px-6 font-mono text-slate-600">{row.bookingCode || `#${row.bookingId}`}</td>
                <td className="py-3.5 px-6 text-slate-600">{row.checkInDate} → {row.checkOutDate}</td>
                <td className="py-3.5 px-6">{row.numberOfRooms} × {row.roomType}</td>
                <td className="py-3.5 px-6 text-right font-bold">{row.currency} {row.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Building2 size={16} /> New lodge voucher</h3>
            <input required placeholder="Voucher code e.g. HTL-2026-01" value={form.hotelBookingCode} onChange={(e) => setForm({ ...form, hotelBookingCode: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            <select required value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <option value="">Link expedition booking</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>{b.bookingCode} — {b.clientName}</option>
              ))}
            </select>
            <input required placeholder="Lodge / teahouse name" value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <input required type="date" value={form.checkInDate} onChange={(e) => setForm({ ...form, checkInDate: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              <input required type="date" value={form.checkOutDate} onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" min="1" value={form.numberOfRooms} onChange={(e) => setForm({ ...form, numberOfRooms: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              <input placeholder="Room type" value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              <input type="number" min="0" placeholder="Amount" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-sky-500 text-white font-bold rounded-xl">Save voucher</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
