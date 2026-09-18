import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axiosClient from '../../api/axiosClient';

export default function ReportsView() {
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [bRes, eRes] = await Promise.all([
          axiosClient.get('/bookings'),
          axiosClient.get('/financials/expenses').catch(() => ({ data: [] })),
        ]);
        setBookings(bRes.data || []);
        setExpenses(eRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load analytics.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.bookingStatus === 'CONFIRMED');
    const pending = bookings.filter((b) => b.bookingStatus === 'PENDING');
    const cancelled = bookings.filter((b) => b.bookingStatus === 'CANCELLED');
    const revenue = confirmed.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const spend = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return {
      total: bookings.length,
      confirmed: confirmed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      revenue,
      spend,
      margin: revenue - spend,
      chart: [
        { name: 'Confirmed', value: confirmed.length },
        { name: 'Pending', value: pending.length },
        { name: 'Cancelled', value: cancelled.length },
      ],
    };
  }, [bookings, expenses]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 size={20} className="text-sky-500" /> Yield analytics
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Live booking mix, confirmed revenue, and field expenses.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Bookings', stats.total],
          ['Confirmed', stats.confirmed],
          ['Revenue (invoiced)', `$${stats.revenue.toLocaleString()}`],
          ['Field spend', `$${stats.spend.toLocaleString()}`],
        ].map(([label, value]) => (
          <div key={label} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-80">
        <h2 className="text-sm font-bold text-slate-800 mb-4">Status mix</h2>
        {stats.chart.every((d) => d.value === 0) ? (
          <p className="text-xs text-slate-400">No bookings to chart yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats.chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
