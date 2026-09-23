import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCw, 
  Calendar, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  FileText,
  FileCheck,
  Edit3,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  XCircle
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { bookingApi } from '../../api/bookingApi';
import { useModal } from '../../context/ModalContext';
import TripDetailsModal from '../../components/modals/TripDetailsModal';
import StaffPaperworkModal from '../../components/modals/StaffPaperworkModal';
import EditTripModal from '../../components/modals/EditTripModal';

export default function BookingRegistry() {
  const { openNewTripModal } = useModal();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Server-Side Pagination State
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  // Modals state
  const [inspectTrip, setInspectTrip] = useState(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);

  const [selectedBookingForDocs, setSelectedBookingForDocs] = useState(null);
  const [isPaperworkOpen, setIsPaperworkOpen] = useState(false);

  const [editTrip, setEditTrip] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 1. Fetch live paginated bookings from Spring Boot backend
  const fetchBookings = async (targetPage = pagination.page) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(
        `/bookings?page=${targetPage}&size=${pagination.size}&sort=id,desc`
      );
      
      const pageData = res.data;
      const dataList = Array.isArray(pageData) ? pageData : (pageData?.content || []);

      setTrips(dataList.map((b, idx) => ({
        id: b.id,
        clientId: b.clientId || 1,
        tourPackageId: b.tourPackageId || 1,
        bookingCode: b.bookingCode || `TRK-2026-${String(idx + 1).padStart(2, '0')}`,
        clientName: b.clientName || 'Lead Trekker',
        routeName: b.packageName || 'Expedition Route',
        travelDate: b.travelDate || 'Scheduled',
        transferLocation: b.vehicleDetails || 'Airport Transfer',
        numberOfTravelers: b.numberOfTravelers || 1,
        totalAmount: b.totalAmount || 0,
        currency: b.currency || 'USD',
        specialRequest: b.specialRequest || '',
        bookingStatus: b.bookingStatus || 'PENDING',
        paymentStatus: b.paymentStatus || 'UNPAID',
      })));

      setPagination((prev) => ({
        ...prev,
        page: pageData.number ?? targetPage,
        totalPages: pageData.totalPages ?? (dataList.length > 0 ? 1 : 0),
        totalElements: pageData.totalElements ?? dataList.length,
      }));
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(0);
    const onUpdated = () => fetchBookings(pagination.page);
    window.addEventListener('bookings-updated', onUpdated);
    return () => window.removeEventListener('bookings-updated', onUpdated);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchBookings(newPage);
    }
  };

  // 2. Delete / Cancel Booking Function
  const handleDeleteBooking = async (trip) => {
    const confirmMsg = `Are you sure you want to cancel and delete expedition "${trip.bookingCode}" for ${trip.clientName}?`;
    if (window.confirm(confirmMsg)) {
      try {
        await bookingApi.deleteBooking(trip.id);
        fetchBookings(pagination.page);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete trip from database.');
      }
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchesSearch = 
      t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.routeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const startRecord = pagination.totalElements === 0 ? 0 : pagination.page * pagination.size + 1;
  const endRecord = Math.min((pagination.page + 1) * pagination.size, pagination.totalElements);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Trip Bookings Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete company trip logs, client dossiers, compliance files, and itineraries.
          </p>
        </div>
        <div className="flex items-center gap-2 w-fit">
          <button 
            type="button"
            onClick={openNewTripModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-xs cursor-pointer transition"
          >
            <Plus size={13} />
            <span>New Booking</span>
          </button>
          <button 
            type="button"
            onClick={() => fetchBookings(pagination.page)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-xs cursor-pointer transition disabled:opacity-50"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-sky-500' : ''} />
            <span>Refresh Bookings</span>
          </button>
        </div>
      </div>

      {/* Bookings Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs space-y-3">
        
        {/* Search & Status Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-800 text-sm">All Bookings</h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
              {pagination.totalElements} Total
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto justify-center">
              {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === tab 
                      ? 'bg-white text-slate-800 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search code, trekker, route..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-sky-500 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">Booking Reference</th>
                <th className="py-3 px-6">Expedition Route</th>
                <th className="py-3 px-6">Travel Date & Pickup</th>
                <th className="py-3 px-6">Party Size</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No bookings found in database.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr 
                    key={trip.id} 
                    className="hover:bg-sky-50/40 transition cursor-pointer group"
                    onClick={() => {
                      setInspectTrip(trip);
                      setIsInspectOpen(true);
                    }}
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono text-[11px] font-bold text-sky-600 block group-hover:underline">
                        {trip.bookingCode}
                      </span>
                      <span className="font-bold text-slate-800 text-sm block mt-0.5">
                        {trip.clientName}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-700 block">
                        {trip.routeName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        ID: #{trip.id}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{trip.travelDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-44">{trip.transferLocation}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        <Users size={12} className="text-sky-500" />
                        <span>{trip.numberOfTravelers} Pax</span>
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {trip.bookingStatus === 'CONFIRMED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          <CheckCircle2 size={12} /> CONFIRMED
                        </span>
                      ) : trip.bookingStatus === 'CANCELLED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                          <XCircle size={12} /> CANCELLED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">
                          <Clock size={12} /> PENDING
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookingForDocs(trip);
                            setIsPaperworkOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                          title="View Permits & Files"
                        >
                          <FileCheck size={14} className="text-sky-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setInspectTrip(trip);
                            setIsInspectOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-xl font-bold transition text-xs cursor-pointer"
                          title="Inspect Full Dossier"
                        >
                          <FileText size={13} />
                          <span>Dossier</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditTrip(trip);
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                          title="Edit Dates, Pax & Pricing"
                        >
                          <Edit3 size={13} className="text-amber-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBooking(trip)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Cancel & Delete Booking"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50 gap-3">
          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-700">{startRecord}</strong> to{' '}
            <strong className="text-slate-700">{endRecord}</strong> of{' '}
            <strong className="text-slate-700">{pagination.totalElements}</strong> bookings
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page === 0 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span className="text-xs font-mono font-bold text-slate-700 px-3 py-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
              Page {pagination.page + 1} of {Math.max(pagination.totalPages, 1)}
            </span>

            <button
              type="button"
              disabled={pagination.page + 1 >= pagination.totalPages || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-2xs"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TripDetailsModal
        isOpen={isInspectOpen}
        onClose={() => setIsInspectOpen(false)}
        trip={inspectTrip}
      />

      <StaffPaperworkModal
        isOpen={isPaperworkOpen}
        onClose={() => setIsPaperworkOpen(false)}
        booking={selectedBookingForDocs}
      />

      <EditTripModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        trip={editTrip}
        onUpdated={() => fetchBookings(pagination.page)}
      />
    </div>
  );
}