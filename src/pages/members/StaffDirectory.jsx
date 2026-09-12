import React, { useState, useEffect } from 'react';
import { operationsApi } from '../../api/operationsApi';
import { Users, Plus, ShieldCheck, Phone, Mail, Award } from 'lucide-react';

export default function StaffDirectory() {
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'CLIMBING_GUIDE',
    phone: '',
    email: '',
    summitCount: 5,
  });

  const loadStaff = async () => {
    try {
      const data = await operationsApi.getStaffDirectory();
      setStaffList(data);
    } catch {
      setStaffList([
        { id: 1, fullName: 'Pasang Dawa Sherpa', role: 'Lead Climbing Sherpa', phone: '+977 9801046037', email: 'pasang.sherpa@satori.np', summits: 14, status: 'IN_FIELD' },
        { id: 2, fullName: 'Pemba Norbu', role: 'High Altitude Medic & Guide', phone: '+977 9841293849', email: 'pemba.norbu@satori.np', summits: 8, status: 'AVAILABLE' },
        { id: 3, fullName: 'Ang Tshering', role: 'Logistics Coordinator (Lukla Base)', phone: '+977 9812938472', email: 'ang.tshering@satori.np', summits: 4, status: 'AVAILABLE' },
      ]);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await operationsApi.createStaffMember(formData);
      setIsModalOpen(false);
      loadStaff();
    } catch {
      setStaffList(prev => [...prev, { id: Date.now(), ...formData, summits: formData.summitCount, status: 'AVAILABLE' }]);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mountain Crew & Staff Roster</h1>
          <p className="text-xs text-slate-400 mt-0.5">Licensed UIAGM/NNMGA mountain guides, lead Sherpas, and basecamp medics.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold shadow-sm shadow-sky-500/25 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Staff / Sherpa</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {staffList.map((crew) => (
          <div key={crew.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-base">
                {crew.fullName.charAt(0)}
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                crew.status === 'IN_FIELD' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                ● {crew.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">{crew.fullName}</h3>
              <p className="text-xs font-medium text-slate-400">{crew.role}</p>
            </div>

            <div className="pt-2 border-t border-slate-50 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Award size={14} className="text-sky-500" />
                <span>Summits Cleared: <strong className="text-slate-800">{crew.summits || 0} Peaks</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                <span>{crew.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <span className="truncate">{crew.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Enroll Mountain Crew Member</h3>
            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Dawa Yangzum Sherpa"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Primary Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Lead Climbing Sherpa">Lead Climbing Sherpa</option>
                  <option value="Trekking Guide (Grade A)">Trekking Guide (Grade A)</option>
                  <option value="High Altitude Medic">High Altitude Medic</option>
                  <option value="Kathmandu Transport Dispatcher">Kathmandu Transport Dispatcher</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+977 98..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">8,000m+ Summits</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.summitCount}
                    onChange={(e) => setFormData({ ...formData, summitCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@satori.np"
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
                  Enroll Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}