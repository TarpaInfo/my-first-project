import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  Radio, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { expeditionApi } from '../../api/expeditionApi';
import axiosClient from '../../api/axiosClient';

const LOG_TYPES = [
  { id: 'WAYPOINT_CHECKIN', label: 'Waypoint Check-In' },
  { id: 'WEATHER_HOLD', label: 'Weather Hold' },
  { id: 'MEDICAL_INCIDENT', label: 'Medical / AMS Report' },
  { id: 'EMERGENCY_EVAC', label: 'Emergency Evacuation' }
];

const SEVERITIES = [
  { id: 'ROUTINE', label: 'Routine', color: 'text-slate-600 bg-slate-100 border-slate-200' },
  { id: 'MILD', label: 'Mild Delay / Symptoms', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'MODERATE', label: 'Moderate Condition', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  { id: 'CRITICAL_EMERGENCY', label: 'Critical Emergency', color: 'text-rose-700 bg-rose-50 border-rose-200' }
];

export default function NewExpeditionLogModal({ isOpen, onClose, onCreated }) {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [logType, setLogType] = useState('WAYPOINT_CHECKIN');
  const [severity, setSeverity] = useState('ROUTINE');
  const [locationName, setLocationName] = useState('');
  const [altitudeMeters, setAltitudeMeters] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [heliRescueRequested, setHeliRescueRequested] = useState(false);
  const [reportNotes, setReportNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch active bookings for the dropdown selector
  useEffect(() => {
    if (isOpen) {
      setError('');
      axiosClient.get('/bookings?page=0&size=50&sort=id,desc')
        .then((res) => {
          const list = res.data?.content || res.data || [];
          setBookings(list);
          if (list.length > 0) setSelectedBookingId(list[0].id);
        })
        .catch(() => setBookings([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      setError('Please select an active expedition booking.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await expeditionApi.createLog({
        bookingId: Number(selectedBookingId),
        logType,
        severity,
        locationName: locationName.trim(),
        altitudeMeters: altitudeMeters ? Number(altitudeMeters) : null,
        reportedBy: reportedBy.trim() || 'Operations Base',
        heliRescueRequested,
        reportNotes: reportNotes.trim()
      });

      onClose();
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to file telemetry log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              heliRescueRequested || severity === 'CRITICAL_EMERGENCY' 
                ? 'bg-rose-100 text-rose-600' 
                : 'bg-sky-50 text-sky-600'
            }`}>
              <Radio size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Live Dispatch & Incident Report</h3>
              <p className="text-[10px] text-slate-400">Post field checkpoint, weather hold, or medical update</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Select Booking */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Target Expedition Booking *
            </label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-sky-500"
              required
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.bookingCode}] {b.clientName || 'Lead Trekker'} — {b.packageName || 'Expedition'}
                </option>
              ))}
            </select>
          </div>

          {/* Log Type & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Log Type *
              </label>
              <select
                value={logType}
                onChange={(e) => {
                  setLogType(e.target.value);
                  if (e.target.value === 'EMERGENCY_EVAC') {
                    setSeverity('CRITICAL_EMERGENCY');
                    setHeliRescueRequested(true);
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {LOG_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Incident Severity *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {SEVERITIES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Altitude */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Current Location / Landmark *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Dingboche, Camp 2, Pokhara"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Altitude (Meters)
              </label>
              <input
                type="number"
                placeholder="e.g. 4410"
                value={altitudeMeters}
                onChange={(e) => setAltitudeMeters(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Reported By */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Field Reporter / Guide
            </label>
            <input
              type="text"
              placeholder="e.g., Lead Guide Pasang Sherpa, Base Operations"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          {/* Helicopter Rescue Checkbox */}
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-600 shrink-0" />
              <div>
                <span className="font-bold text-rose-800 block">Helicopter Rescue Evacuation</span>
                <span className="text-[10px] text-rose-600">Triggers immediate high-priority email dispatch to operations team</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={heliRescueRequested}
              onChange={(e) => setHeliRescueRequested(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded cursor-pointer accent-rose-600"
            />
          </div>

          {/* Report Notes */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Field Report & Notes
            </label>
            <textarea
              rows={3}
              placeholder="Provide context: group health status, trail conditions, vitals, or dispatch updates..."
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${
                heliRescueRequested || severity === 'CRITICAL_EMERGENCY'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20'
                  : 'bg-sky-500 hover:bg-sky-600 shadow-md shadow-sky-500/20'
              }`}
            >
              <Send size={13} />
              <span>{loading ? 'Transmitting...' : 'Dispatch Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}