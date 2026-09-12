import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Save 
} from 'lucide-react';
import { bookingApi } from '../../api/bookingApi';

const STATUS_OPTIONS = [
  { value: 'CONFIRMED', label: 'Confirmed (Active Expedition)' },
  { value: 'PENDING', label: 'Pending Verification' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' }
];

export default function EditTripModal({ isOpen, onClose, trip, onUpdated }) {
  const [travelDate, setTravelDate] = useState('');
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [bookingStatus, setBookingStatus] = useState('CONFIRMED');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [transferLocation, setTransferLocation] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && trip) {
      setError('');
      setSuccess('');
      setTravelDate(trip.travelDate || '');
      setNumberOfTravelers(trip.numberOfTravelers || 1);
      setTotalAmount(trip.totalAmount || 0);
      setBookingStatus(trip.bookingStatus || 'CONFIRMED');
      setPaymentStatus(trip.paymentStatus || 'PAID');
      setTransferLocation(trip.transferLocation || trip.vehicleDetails || '');
      setSpecialRequest(trip.specialRequest || '');
    }
  }, [isOpen, trip]);

  if (!isOpen || !trip) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        bookingCode: trip.bookingCode,
        clientId: trip.clientId,
        tourPackageId: trip.tourPackageId,
        travelDate: travelDate,
        numberOfTravelers: Number(numberOfTravelers),
        totalAmount: Number(totalAmount),
        currency: trip.currency || 'USD',
        bookingStatus: bookingStatus,
        paymentStatus: paymentStatus,
        specialRequest: specialRequest,
        active: bookingStatus !== 'CANCELLED',
        requiresAirportTransfer: true,
        vehicleDetails: transferLocation
      };

      await bookingApi.updateBooking(trip.id, payload);
      setSuccess(`Trip ${trip.bookingCode} updated successfully!`);

      setTimeout(() => {
        if (onUpdated) onUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update booking on server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Edit3 size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Modify Trip Booking</h3>
              <p className="text-[10px] text-slate-400">
                Booking: <span className="font-mono font-bold text-sky-600">{trip.bookingCode}</span> | {trip.clientName}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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

        <form onSubmit={handleUpdate} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Trip Route Display */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Expedition Route</span>
            <span className="font-bold text-slate-800 text-xs">{trip.routeName}</span>
          </div>

          {/* Travel Date & Party Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Rescheduled Travel Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Party Size (Pax) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={numberOfTravelers}
                onChange={(e) => setNumberOfTravelers(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-sky-500"
              />
            </div>
          </div>

          {/* Pricing & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Total Amount ($ USD) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Booking Status
              </label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:border-sky-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rendezvous Pickup Point */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Airport Transfer / Pickup Location
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={transferLocation}
                onChange={(e) => setTransferLocation(e.target.value)}
                placeholder="e.g. Tribhuvan Int. Airport (TIA) / Hotel Yak & Yeti"
                className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Internal Operations Notes */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Internal Ops / Change Notes
            </label>
            <textarea
              rows={2}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Reason for change, extra porter requests, flight rescheduling..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{loading ? 'Saving Changes...' : 'Save Modifications'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}