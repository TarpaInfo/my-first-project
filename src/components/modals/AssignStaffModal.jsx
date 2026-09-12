import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  Car, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  UserPlus
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function AssignStaffModal({ isOpen, onClose, booking, onAssigned }) {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Tribhuvan International Airport (TIA), Kathmandu');
  const [vehicleDetails, setVehicleDetails] = useState('Private Tourist HiAce (Ba 2 Kha 4521)');
  const [operationalNotes, setOperationalNotes] = useState('Lead field guide responsible for briefing, TIMS permit validation, and gear inspection.');
  
  // Quick-register staff mode if none exist
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    fullName: 'Pemba Norbu Sherpa',
    role: 'Lead Climbing Guide',
    email: 'pemba.sherpa@tarpaoperations.com',
    phoneNumber: '9841234567',
    licenseNumber: 'NMA-GUIDE-8421'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch available staff from backend
  const fetchStaff = async () => {
    try {
      const res = await axiosClient.get('/logistics/staff');
      const list = res.data || [];
      setStaffList(list);
      if (list.length > 0) {
        setSelectedStaffId(list[0].id);
        setShowAddStaff(false);
      } else {
        setShowAddStaff(true);
      }
    } catch (err) {
      console.warn('Could not fetch staff list:', err);
      setShowAddStaff(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      fetchStaff();
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  // 2. Quick create staff member if list is empty
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.post('/logistics/staff', newStaffData);
      setSuccess(`Staff ${res.data.fullName} registered successfully!`);
      await fetchStaff();
      setSelectedStaffId(res.data.id);
      setShowAddStaff(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register new staff member.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Assign selected staff to the trip
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      setError('Please select or register a staff member first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Matches TripAssignmentRequestDto in LogisticsController.java
      await axiosClient.post('/logistics/assignments', {
        bookingId: booking.id,
        staffId: Number(selectedStaffId),
        pickupLocation,
        vehicleDetails,
        operationalNotes
      });

      setSuccess('Staff and logistics assigned successfully!');
      setTimeout(() => {
        if (onAssigned) onAssigned();
        onClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign staff to this expedition.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Internal Staff & Guide Dispatch</h3>
              <p className="text-[10px] text-slate-400">
                Booking: <span className="font-mono font-bold text-sky-600">{booking.bookingCode || `#${booking.id}`}</span> | {booking.clientName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Quick Registration Form (if needed) */}
          {showAddStaff ? (
            <form onSubmit={handleCreateStaff} className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <UserPlus size={13} className="text-sky-600" /> Quick-Register Staff / Guide
                </span>
                {staffList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddStaff(false)}
                    className="text-sky-600 font-bold hover:underline cursor-pointer text-[11px]"
                  >
                    ← Choose Existing Staff
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Full Legal Name"
                  value={newStaffData.fullName}
                  onChange={(e) => setNewStaffData({ ...newStaffData, fullName: e.target.value })}
                  className="p-2 bg-white border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Role (e.g. Lead Guide, Sirdar)"
                  value={newStaffData.role}
                  onChange={(e) => setNewStaffData({ ...newStaffData, role: e.target.value })}
                  className="p-2 bg-white border border-slate-200 rounded-xl"
                />
                <input
                  type="email"
                  required
                  placeholder="Internal Email"
                  value={newStaffData.email}
                  onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
                  className="p-2 bg-white border border-slate-200 rounded-xl"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={newStaffData.phoneNumber}
                  onChange={(e) => setNewStaffData({ ...newStaffData, phoneNumber: e.target.value })}
                  className="p-2 bg-white border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="License Number (e.g. NMA-123)"
                  value={newStaffData.licenseNumber}
                  onChange={(e) => setNewStaffData({ ...newStaffData, licenseNumber: e.target.value })}
                  className="sm:col-span-2 p-2 bg-white border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                {loading ? 'Saving...' : 'Add to Staff Roster'}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700">Assign From Active Team</span>
              <button
                type="button"
                onClick={() => setShowAddStaff(true)}
                className="text-sky-600 font-bold hover:underline cursor-pointer text-[11px]"
              >
                + Register New Staff
              </button>
            </div>
          )}

          {/* Main Assignment Form */}
          <form onSubmit={handleAssign} className="space-y-4">
            
            {!showAddStaff && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Select Field Guide / Sirdar *
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-sky-500"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.role}) — {s.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Pickup / Rendezvous Location
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Vehicle & Transport Deployment
              </label>
              <div className="relative">
                <Car size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={vehicleDetails}
                  onChange={(e) => setVehicleDetails(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Operational Notes for Field Team
              </label>
              <textarea
                rows={2}
                value={operationalNotes}
                onChange={(e) => setOperationalNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || staffList.length === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Assigning...' : 'Deploy Guide to Trip'}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}