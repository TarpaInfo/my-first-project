import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  RotateCw,
  Plus,
  FileText,
  Edit3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { bookingApi } from '../../api/bookingApi';
import { useModal } from '../../context/ModalContext';
import TripDetailsModal from '../../components/modals/TripDetailsModal';
import EditTripModal from '../../components/modals/EditTripModal';
import ThemeToggle from '../../components/ThemeToggle';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { openNewTripModal } = useModal();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [syncFeedback, setSyncFeedback] = useState('');

  // Pagination State (size = 5 so you can see pagination immediately)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  // Modal States
  const [inspectTrip, setInspectTrip] = useState(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [editTrip, setEditTrip] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // 1. Data Fetch & Sync Handler
  const fetchDashboardData = async (targetPage = pagination.page) => {
    setLoading(true);
    setSyncFeedback('');
    try {
      const res = await axiosClient.get(`/bookings?page=${targetPage}&size=${pagination.size}&sort=id,desc`);
      const pageData = res.data;
      const extractedList = Array.isArray(pageData) ? pageData : (pageData?.content || []);
      
      setBookings(extractedList);
      setPagination((prev) => ({
        ...prev,
        page: pageData.number ?? targetPage,
        totalPages: pageData.totalPages ?? (extractedList.length > 0 ? 1 : 0),
        totalElements: pageData.totalElements ?? extractedList.length,
      }));
      setSyncFeedback('Synced!');
      setTimeout(() => setSyncFeedback(''), 2500);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setBookings([]);
      setSyncFeedback('Sync Failed');
      setTimeout(() => setSyncFeedback(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(0);
    const onUpdated = () => fetchDashboardData(pagination.page);
    window.addEventListener('bookings-updated', onUpdated);
    return () => window.removeEventListener('bookings-updated', onUpdated);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchDashboardData(newPage);
    }
  };

  const handleNewDossier = () => {
    openNewTripModal();
  };

  // 3. Inline Quick Status Transition
  const handleQuickStatusChange = async (trip, newStatus) => {
    if (trip.bookingStatus === newStatus) return;
    setUpdatingId(trip.id);

    try {
      await bookingApi.updateBooking(trip.id, {
        clientId: trip.clientId || trip.client?.id,
        tourPackageId: trip.tourPackageId || trip.tourPackage?.id,
        bookingCode: trip.bookingCode,
        travelDate: trip.travelDate,
        numberOfTravelers: trip.numberOfTravelers,
        totalAmount: trip.totalAmount,
        currency: trip.currency || 'USD',
        bookingStatus: newStatus,
        paymentStatus: newStatus === 'CONFIRMED' ? 'PAID' : trip.paymentStatus,
        specialRequest: trip.specialRequest,
        vehicleDetails: trip.vehicleDetails,
      });

      await fetchDashboardData(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update expedition status');
    } finally {
      setUpdatingId(null);
    }
  };

  const bookingList = Array.isArray(bookings) ? bookings : (bookings?.content || []);

  // Metrics Computations
  const confirmedBookings = bookingList.filter((b) => b?.bookingStatus === 'CONFIRMED');
  const pendingBookings = bookingList.filter((b) => b?.bookingStatus === 'PENDING');
  
  const totalRevenueUSD = confirmedBookings.reduce((sum, b) => {
    const val = parseFloat(b?.totalAmount) || 0;
    return sum + val;
  }, 0);

  const totalTrekkers = confirmedBookings.reduce((sum, b) => {
    return sum + (parseInt(b?.numberOfTravelers, 10) || 0);
  }, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            {status}
          </span>
        );
    }
  };

  const startRecord = pagination.totalElements === 0 ? 0 : pagination.page * pagination.size + 1;
  const endRecord = Math.min((pagination.page + 1) * pagination.size, pagination.totalElements);

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950 p-6 md:p-8 font-sans text-zinc-900 dark:text-zinc-100 space-y-8 transition-colors duration-200">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h1>
            <span className="rounded-md bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              v2.1
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time expedition telemetry, permit workflows, and dispatch queues.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <button 
            type="button"
            onClick={() => fetchDashboardData(pagination.page)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCw size={14} className={loading ? 'animate-spin text-sky-500' : 'text-zinc-500 dark:text-zinc-400'} />
            <span>{syncFeedback ? syncFeedback : 'Sync'}</span>
          </button>
          
          <button 
            type="button"
            onClick={handleNewDossier}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3.5 py-2 text-sm font-medium text-white dark:text-zinc-900 shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>+ New Dossier</span>
          </button>
        </div>
      </div>

      {/* 4-Column KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Confirmed Revenue</span>
            <DollarSign className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              ${totalRevenueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                <TrendingUp size={12} className="inline mr-0.5" /> +18.2%
              </span> from last month
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Confirmed Trips</span>
            <CheckCircle2 className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              +{confirmedBookings.length}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Active guides & TIMS issued
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Field Trekkers</span>
            <Users className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {totalTrekkers} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">Pax</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Across Annapurna & Everest
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pending Approvals</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {pendingBookings.length}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              Awaiting dispatch confirmation
            </p>
          </div>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Recent Expeditions</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Instant operations ledger. Confirming a booking auto-dispatches the email dossier.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard/bookings')}
            className="text-xs font-medium text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400 px-2.5 py-1 rounded-md border border-sky-100 dark:border-sky-800 cursor-pointer"
          >
            Open booking registry
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/75 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Booking Ref</th>
                <th className="py-3 px-6">Client</th>
                <th className="py-3 px-6">Route / Itinerary</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Quick Workflow</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {bookingList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No active bookings found in the database.
                  </td>
                </tr>
              ) : (
                bookingList.map((trip) => {
                  const isUpdating = updatingId === trip.id;

                  return (
                    <tr key={trip.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {trip.bookingCode}
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 block">
                          {trip.clientName || 'Lead Trekker'}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {trip.numberOfTravelers} traveler(s)
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-zinc-900 dark:text-zinc-100 font-medium block max-w-xs truncate">
                          {trip.packageName || 'Himalayan Expedition'}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                          #{trip.id}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-zinc-600 dark:text-zinc-300 text-xs font-mono">
                        {trip.travelDate}
                      </td>

                      <td className="py-4 px-6 font-mono font-medium text-zinc-900 dark:text-zinc-100 text-xs">
                        ${parseFloat(trip.totalAmount || 0).toLocaleString()} {trip.currency || 'USD'}
                      </td>

                      <td className="py-4 px-6">
                        {getStatusBadge(trip.bookingStatus)}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          {trip.bookingStatus !== 'CONFIRMED' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleQuickStatusChange(trip, 'CONFIRMED')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              {isUpdating ? <RotateCw size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                              Confirm
                            </button>
                          )}
                          {trip.bookingStatus !== 'CANCELLED' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleQuickStatusChange(trip, 'CANCELLED')}
                              className="px-2 py-1 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-rose-200 dark:hover:border-rose-800 transition cursor-pointer disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectTrip(trip);
                              setIsInspectOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer"
                            title="View Dossier"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditTrip(trip);
                              setIsEditOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dashboard Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 gap-3">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing <strong className="text-zinc-800 dark:text-zinc-200">{startRecord}</strong> to{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{endRecord}</strong> of{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{pagination.totalElements}</strong> entries
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page === 0 || loading}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-2xs">
              Page {pagination.page + 1} of {Math.max(pagination.totalPages, 1)}
            </span>

            <button
              type="button"
              disabled={pagination.page + 1 >= pagination.totalPages || loading}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
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

      <EditTripModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        trip={editTrip}
        onUpdated={() => fetchDashboardData(pagination.page)}
      />
    </div>
  );
}