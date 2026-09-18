import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowDownRight, Plus, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const CATEGORIES = [
  'GUIDE_ALLOWANCE',
  'PORTER_FEE',
  'VEHICLE_FUEL_HIRE',
  'HOTEL_ACCOMMODATION',
  'MEALS_LOGISTICS',
  'PERMIT_REGULATORY',
  'EMERGENCY_CONTINGENCY',
  'MISCELLANEOUS',
];

const labelCategory = (value) =>
  String(value || 'MISCELLANEOUS').replaceAll('_', ' ').toLowerCase();

export default function FinanceView() {
  const [expenses, setExpenses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    bookingId: '',
    category: 'GUIDE_ALLOWANCE',
    amount: '',
    currency: 'USD',
    paidTo: '',
    notes: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  const loadFinancials = async () => {
    setLoading(true);
    setError('');
    try {
      const [expRes, bookRes] = await Promise.all([
        axiosClient.get('/financials/expenses'),
        axiosClient.get('/bookings'),
      ]);
      setExpenses(expRes.data || []);
      setBookings(bookRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load field expenses.');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, []);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post('/financials/expenses', {
        bookingId: Number(newEntry.bookingId),
        category: newEntry.category,
        amount: Number(newEntry.amount),
        currency: newEntry.currency,
        paidTo: newEntry.paidTo.trim(),
        notes: newEntry.notes.trim(),
        expenseDate: newEntry.expenseDate,
      });
      setIsModalOpen(false);
      setNewEntry((prev) => ({ ...prev, amount: '', paidTo: '', notes: '' }));
      loadFinancials();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expense.');
    }
  };

  const totalSpend = expenses.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Financial Ledger & Trip Disbursements</h1>
          <p className="text-xs text-slate-400 mt-0.5">Live field expenses linked to expedition bookings.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold shadow-sm shadow-sky-500/25 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Record expense</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <DollarSign size={16} className="text-sky-500" />
          Recorded field spend
        </div>
        <p className="text-lg font-bold text-slate-800">
          {loading ? '—' : `$${totalSpend.toLocaleString()}`}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-6 font-bold">Trip</th>
              <th className="py-3 px-6 font-bold">Paid to</th>
              <th className="py-3 px-6 font-bold">Category</th>
              <th className="py-3 px-6 font-bold">Date</th>
              <th className="py-3 px-6 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-10 text-center text-slate-400">Loading expenses…</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-slate-400">No field expenses recorded yet.</td></tr>
            ) : expenses.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-6 font-mono font-bold text-sky-600">#{row.bookingId}</td>
                <td className="py-3.5 px-6 font-semibold text-slate-800">
                  {row.paidTo}
                  {row.notes && <p className="text-[10px] text-slate-400 font-normal mt-0.5">{row.notes}</p>}
                </td>
                <td className="py-3.5 px-6 capitalize text-slate-600">{labelCategory(row.category)}</td>
                <td className="py-3.5 px-6 text-slate-400">{row.expenseDate || '—'}</td>
                <td className="py-3.5 px-6 text-right font-bold text-slate-800">
                  <span className="inline-flex items-center gap-1 text-rose-600">
                    <ArrowDownRight size={12} />
                    {row.currency || 'USD'} {Number(row.amount || 0).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Record field expense</h3>
            <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Expedition booking</label>
                <select
                  required
                  value={newEntry.bookingId}
                  onChange={(e) => setNewEntry({ ...newEntry, bookingId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Select booking</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingCode} — {b.clientName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Paid to</label>
                <input
                  type="text"
                  required
                  value={newEntry.paidTo}
                  onChange={(e) => setNewEntry({ ...newEntry, paidTo: e.target.value })}
                  placeholder="e.g. Pasang Dawa (Lead Guide)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Currency</label>
                  <select
                    value={newEntry.currency}
                    onChange={(e) => setNewEntry({ ...newEntry, currency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="USD">USD</option>
                    <option value="NPR">NPR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Category</label>
                <select
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{labelCategory(cat)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newEntry.expenseDate}
                  onChange={(e) => setNewEntry({ ...newEntry, expenseDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Notes</label>
                <input
                  type="text"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder="Optional receipt / context"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl"
                >
                  Save expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
