import React, { useState, useEffect } from 'react';
import { FileCheck2, Plus, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const PERMIT_TYPES = [
  'TIMS_CARD',
  'SAGARMATHA_NATIONAL_PARK',
  'ANNAPURNA_CONSERVATION_AREA',
  'MANASLU_RESTRICTED_PERMIT',
  'UPPER_MUSTANG_SPECIAL',
  'NMA_CLIMBING_PERMIT',
];

const statusClass = (status) => {
  if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-600';
  if (status === 'SUBMITTED') return 'bg-sky-50 text-sky-600';
  if (status === 'REJECTED' || status === 'EXPIRED') return 'bg-rose-50 text-rose-600';
  return 'bg-amber-50 text-amber-600';
};

export default function PermitsView() {
  const [permits, setPermits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPermit, setNewPermit] = useState({
    bookingId: '',
    permitType: 'TIMS_CARD',
    governmentPermitNumber: '',
    expiryDate: '',
    feeInNpr: '',
    remarks: '',
  });

  const loadPermits = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, bRes] = await Promise.all([
        axiosClient.get('/permits'),
        axiosClient.get('/bookings'),
      ]);
      setPermits(pRes.data || []);
      setBookings(bRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load permits.');
      setPermits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermits();
  }, []);

  const bookingLabel = (id) => {
    const b = bookings.find((row) => row.id === id);
    return b ? `${b.bookingCode} — ${b.clientName}` : `#${id}`;
  };

  const handleCreatePermit = async (e) => {
    e.preventDefault();
    setError('');
    const booking = bookings.find((b) => String(b.id) === String(newPermit.bookingId));
    try {
      await axiosClient.post('/permits', {
        bookingId: Number(newPermit.bookingId),
        clientId: booking?.clientId,
        permitType: newPermit.permitType,
        governmentPermitNumber: newPermit.governmentPermitNumber,
        status: 'SUBMITTED',
        feeInNpr: Number(newPermit.feeInNpr || 0),
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: newPermit.expiryDate,
        remarks: newPermit.remarks,
      });
      setIsModalOpen(false);
      setNewPermit({
        bookingId: '',
        permitType: 'TIMS_CARD',
        governmentPermitNumber: '',
        expiryDate: '',
        feeInNpr: '',
        remarks: '',
      });
      loadPermits();
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering permit.');
    }
  };

  const handleApprove = async (permit) => {
    try {
      await axiosClient.patch(`/permits/${permit.id}/status`, null, {
        params: { status: 'APPROVED', governmentPermitNumber: permit.governmentPermitNumber },
      });
      loadPermits();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update permit status.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck2 size={20} className="text-sky-500" /> Regulatory Permits & TIMS
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Government clearances linked to expedition bookings.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold cursor-pointer"
        >
          <Plus size={16} />
          Issue permit
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
              <th className="py-3 px-6 font-bold">Permit number</th>
              <th className="py-3 px-6 font-bold">Trip</th>
              <th className="py-3 px-6 font-bold">Type</th>
              <th className="py-3 px-6 font-bold">Valid until</th>
              <th className="py-3 px-6 font-bold text-center">Status</th>
              <th className="py-3 px-6 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-slate-400">Loading permits…</td></tr>
            ) : permits.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-slate-400">No permits recorded yet.</td></tr>
            ) : permits.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60">
                <td className="py-3.5 px-6 font-mono font-bold text-slate-700">{p.governmentPermitNumber || '—'}</td>
                <td className="py-3.5 px-6 text-slate-800 font-semibold">{bookingLabel(p.bookingId)}</td>
                <td className="py-3.5 px-6 text-slate-500">{String(p.permitType || '').replaceAll('_', ' ')}</td>
                <td className="py-3.5 px-6 text-slate-500">{p.expiryDate || '—'}</td>
                <td className="py-3.5 px-6 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusClass(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-right">
                  {p.status !== 'APPROVED' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(p)}
                      className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
                    >
                      Mark approved
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Register permit</h3>
            <form onSubmit={handleCreatePermit} className="space-y-3 text-xs">
              <select
                required
                value={newPermit.bookingId}
                onChange={(e) => setNewPermit({ ...newPermit, bookingId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Select booking</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>{b.bookingCode} — {b.clientName}</option>
                ))}
              </select>
              <select
                value={newPermit.permitType}
                onChange={(e) => setNewPermit({ ...newPermit, permitType: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {PERMIT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>
                ))}
              </select>
              <input
                required
                placeholder="Government / TIMS serial"
                value={newPermit.governmentPermitNumber}
                onChange={(e) => setNewPermit({ ...newPermit, governmentPermitNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  type="date"
                  value={newPermit.expiryDate}
                  onChange={(e) => setNewPermit({ ...newPermit, expiryDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Fee NPR"
                  value={newPermit.feeInNpr}
                  onChange={(e) => setNewPermit({ ...newPermit, feeInNpr: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <input
                placeholder="Remarks"
                value={newPermit.remarks}
                onChange={(e) => setNewPermit({ ...newPermit, remarks: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-sky-500 text-white font-bold rounded-xl">Issue permit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
