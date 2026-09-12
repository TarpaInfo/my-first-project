import React, { useState, useEffect } from 'react';
import { FileCheck2, ShieldCheck, Download, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function PermitsView() {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPermit, setNewPermit] = useState({
    serialNumber: '',
    trekkerName: '',
    regulatoryArea: 'Sagarmatha National Park',
    expiryDate: ''
  });

  const loadPermits = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/permits');
      setPermits(res.data);
    } catch {
      // Fallback display
      setPermits([
        { id: 1, serialNumber: 'TIMS-9842', trekkerName: 'Alex Rivera', regulatoryArea: 'Annapurna (ACAP)', expiryDate: '2026-10-15', status: 'ISSUED' },
        { id: 2, serialNumber: 'SNP-4421', trekkerName: 'Julian Thorne', regulatoryArea: 'Sagarmatha National Park', expiryDate: '2026-10-02', status: 'ISSUED' },
        { id: 3, serialNumber: 'MAN-1192', trekkerName: 'Elena Rostova', regulatoryArea: 'Manaslu Restricted Area', expiryDate: '2026-09-30', status: 'IN_REVIEW' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermits();
  }, []);

  const handleCreatePermit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/permits', newPermit);
      setIsModalOpen(false);
      setNewPermit({ serialNumber: '', trekkerName: '', regulatoryArea: 'Sagarmatha National Park', expiryDate: '' });
      loadPermits();
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering permit.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Regulatory Permits & TIMS Clearance</h1>
          <p className="text-xs text-slate-400 mt-0.5">Government clearances, national park passes, and restricted sector permits.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold shadow-sm shadow-sky-500/25 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Issue Permit</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-6 font-bold">Permit Serial</th>
              <th className="py-3 px-6 font-bold">Trekker Name</th>
              <th className="py-3 px-6 font-bold">Regulatory Area</th>
              <th className="py-3 px-6 font-bold">Valid Until</th>
              <th className="py-3 px-6 font-bold text-center">Status</th>
              <th className="py-3 px-6 font-bold text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {permits.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-6 font-mono font-bold text-slate-700">{p.serialNumber}</td>
                <td className="py-3.5 px-6 text-slate-800 font-semibold">{p.trekkerName}</td>
                <td className="py-3.5 px-6 text-slate-500">{p.regulatoryArea}</td>
                <td className="py-3.5 px-6 text-slate-500">{p.expiryDate}</td>
                <td className="py-3.5 px-6 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    p.status === 'ISSUED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-6 text-right">
                  <button className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer">
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue Permit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Register New Regulatory Permit</h3>
            <form onSubmit={handleCreatePermit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Permit / TIMS Serial</label>
                <input
                  type="text"
                  required
                  value={newPermit.serialNumber}
                  onChange={(e) => setNewPermit({ ...newPermit, serialNumber: e.target.value })}
                  placeholder="e.g. TIMS-1092"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Trekker Full Name</label>
                <input
                  type="text"
                  required
                  value={newPermit.trekkerName}
                  onChange={(e) => setNewPermit({ ...newPermit, trekkerName: e.target.value })}
                  placeholder="e.g. Julian Thorne"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Regulatory Area</label>
                <select
                  value={newPermit.regulatoryArea}
                  onChange={(e) => setNewPermit({ ...newPermit, regulatoryArea: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Sagarmatha National Park">Sagarmatha National Park</option>
                  <option value="Annapurna (ACAP)">Annapurna Conservation Area (ACAP)</option>
                  <option value="Manaslu Restricted Area">Manaslu Restricted Area</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Valid Until</label>
                <input
                  type="date"
                  required
                  value={newPermit.expiryDate}
                  onChange={(e) => setNewPermit({ ...newPermit, expiryDate: e.target.value })}
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
                  Issue Permit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}