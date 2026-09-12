import React, { useState, useEffect } from "react";
import {
  Search,
  RotateCw,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  X,
  FileCheck,
  MapPin,
  Calendar,
  FileText,
  UserCheck,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { bookingApi } from "../../api/bookingApi";
import StaffPaperworkModal from "../../components/modals/StaffPaperworkModal";
import TripDetailsModal from "../../components/modals/TripDetailsModal";
import AssignStaffModal from "../../components/modals/AssignStaffModal";

export default function LogisticsBoard() {
  const [logisticsList, setLogisticsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState("ALL"); // 'ALL' | 'PENDING' | 'CONFIRMED'
  const [loadingIds, setLoadingIds] = useState([]);
  const [errorBanner, setErrorBanner] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  // Modals state
  const [selectedBookingForDocs, setSelectedBookingForDocs] = useState(null);
  const [isPaperworkOpen, setIsPaperworkOpen] = useState(false);

  const [inspectTrip, setInspectTrip] = useState(null);
  const [isInspectOpen, setIsInspectOpen] = useState(false);

  const [selectedBookingForStaff, setSelectedBookingForStaff] = useState(null);
  const [isStaffAssignOpen, setIsStaffAssignOpen] = useState(false);

  // 1. Fetch live bookings from Spring Boot
  const fetchLiveLogistics = async () => {
    try {
      const res = await axiosClient.get("/bookings");
      const bookings = res.data || [];

      if (bookings.length > 0) {
        const mapped = bookings.map((b, idx) => ({
          id: b.id,
          clientId: b.clientId || 1,
          tourPackageId: b.tourPackageId || 1,
          bookingCode:
            b.bookingCode || `TRK-2026-${String(idx + 1).padStart(2, "0")}`,
          clientName: b.clientName || "Lead Client",
          routeName: b.packageName || "Custom Route",
          assignedGuide: "Assigned Lead Guide",
          transferLocation: b.vehicleDetails || "Airport / Hotel Transfer",
          travelDate: b.travelDate,
          transferDateTime: b.travelDate
            ? `${b.travelDate} 06:00 AM`
            : "2026-09-25 06:00 AM",
          gearStatus: "Preparing",
          bookingStatus: b.bookingStatus || "PENDING",
          numberOfTravelers: b.numberOfTravelers || 1,
          totalAmount: b.totalAmount || 0,
          currency: b.currency || "USD",
        }));
        setLogisticsList(mapped);
      } else {
        setLogisticsList([
          {
            id: 102,
            clientId: 1,
            tourPackageId: 1,
            bookingCode: "TRK-2026-01",
            clientName: "Elena Rostova",
            routeName: "Manaslu Circuit Expedition",
            assignedGuide: "Pemba Norbu",
            transferLocation: "Hotel Yak & Yeti, Kathmandu",
            travelDate: "2026-09-14",
            transferDateTime: "2026-09-14 06:00 AM",
            gearStatus: "Preparing",
            bookingStatus: "CONFIRMED",
            numberOfTravelers: 2,
            totalAmount: 5000,
            currency: "USD",
          },
        ]);
      }
    } catch {
      // Quietly fallback
    }
  };

  useEffect(() => {
    fetchLiveLogistics();
  }, []);

  const handleDeleteBooking = async (trip) => {
    const confirmMsg = `Are you sure you want to cancel and delete expedition "${trip.bookingCode}" for ${trip.clientName}?`;
    if (window.confirm(confirmMsg)) {
      try {
        await bookingApi.deleteBooking(trip.id);
        fetchLiveLogistics(); // <-- Refreshes the logistics table
      } catch (err) {
        alert(
          err.response?.data?.message || "Failed to delete trip from database.",
        );
      }
    }
  };

  // 2. Dispatch Briefing
  const handleDispatchBriefing = async (row) => {
    setErrorBanner("");
    setSuccessBanner("");
    setLoadingIds((prev) => [...prev, row.id]);

    try {
      await axiosClient.post("/logistics/briefings/dispatch");
      setSuccessBanner(
        `Briefing packet dispatched to guide and field staff for ${row.clientName}!`,
      );
    } catch (err) {
      setErrorBanner(
        err.response?.data?.message || "Failed to dispatch briefing.",
      );
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== row.id));
      setTimeout(() => setSuccessBanner(""), 4000);
    }
  };

  // 3. Confirm Booking (Updates status to CONFIRMED and triggers Spring Boot AlertService email)
  const handleConfirmAndAlert = async (row) => {
    setErrorBanner("");
    setSuccessBanner("");
    setLoadingIds((prev) => [...prev, row.id]);

    try {
      await bookingApi.confirmBooking(row.id, row);
      setSuccessBanner(
        `Booking ${row.bookingCode} confirmed! Automated email alert triggered to client.`,
      );
      await fetchLiveLogistics();
    } catch (err) {
      setErrorBanner(
        err.response?.data?.message || "Failed to confirm booking on backend.",
      );
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== row.id));
      setTimeout(() => setSuccessBanner(""), 4000);
    }
  };

  // Filter rows
  const filteredRows = logisticsList.filter((item) => {
    const matchesSearch =
      item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedGuide?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === "PENDING") return item.bookingStatus === "PENDING";
    if (filterTab === "CONFIRMED") return item.bookingStatus === "CONFIRMED";
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Internal Logistics Command Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Back-office trip verification, document vaults, staff deployment,
            and client notification.
          </p>
        </div>
        <button
          onClick={fetchLiveLogistics}
          className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:border-slate-300 shadow-xs cursor-pointer transition"
          title="Refresh Board"
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* Error Alert */}
      {errorBanner && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-semibold">{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner("")}
            className="text-rose-400 hover:text-rose-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Success Alert */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner("")}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by client, guide, or route..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-sky-500 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto justify-center">
          {["ALL", "PENDING", "CONFIRMED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterTab === tab
                  ? "bg-sky-500 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Logistics Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Booking / Client</th>
                <th className="py-3.5 px-6">Assigned Guide</th>
                <th className="py-3.5 px-6">Transfer / Logistics</th>
                <th className="py-3.5 px-6">Readiness</th>
                <th className="py-3.5 px-6">Booking Status</th>
                <th className="py-3.5 px-6 text-right">Ops Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No logistical records match your query.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isConfirmed = row.bookingStatus === "CONFIRMED";
                  const isProcessing = loadingIds.includes(row.id);

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/60 transition"
                    >
                      {/* Booking Code & Client */}
                      <td
                        className="py-4 px-6 cursor-pointer group"
                        onClick={() => {
                          setInspectTrip(row);
                          setIsInspectOpen(true);
                        }}
                      >
                        <span className="font-mono text-[11px] font-bold text-sky-600 group-hover:underline block">
                          #{row.id} ({row.bookingCode})
                        </span>
                        <span className="font-bold text-slate-800 text-sm block group-hover:text-sky-600 transition">
                          {row.clientName}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {row.routeName}
                        </span>
                      </td>

                      {/* Staff Assignment */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-sky-50 text-sky-600 font-bold text-[10px] flex items-center justify-center">
                            {row.assignedGuide.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-700">
                            {row.assignedGuide}
                          </span>
                        </div>
                      </td>

                      {/* Transfer Location */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <MapPin
                              size={13}
                              className="text-slate-400 shrink-0"
                            />
                            <span>{row.transferLocation}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Calendar size={12} className="shrink-0" />
                            <span>{row.transferDateTime}</span>
                          </div>
                        </div>
                      </td>

                      {/* Gear Readiness */}
                      <td className="py-4 px-6">
                        {row.gearStatus === "Ready" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 size={12} /> Ready
                          </span>
                        )}
                        {row.gearStatus === "Preparing" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px]">
                            <Clock size={12} /> Preparing
                          </span>
                        )}
                      </td>

                      {/* Booking Status Badge */}
                      <td className="py-4 px-6">
                        {isConfirmed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 size={12} /> CONFIRMED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-[11px]">
                            <Clock size={12} /> PENDING
                          </span>
                        )}
                      </td>

                      {/* Operations Actions Cell */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* 1. Inspect Dossier */}
                          <button
                            type="button"
                            onClick={() => {
                              setInspectTrip(row);
                              setIsInspectOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                            title="Inspect Trip & Uploaded Files"
                          >
                            <FileText size={14} />
                          </button>

                          {/* 2. Paperwork Vault */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingForDocs(row);
                              setIsPaperworkOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                            title="Upload & Review Permits / Passports"
                          >
                            <FileCheck size={14} className="text-sky-600" />
                          </button>

                          {/* 3. Assign Staff / Guide */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBookingForStaff(row);
                              setIsStaffAssignOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                            title="Assign Field Guide & Vehicle"
                          >
                            <UserCheck size={14} className="text-emerald-600" />
                          </button>

                          {/* 4. Confirm Status (Triggers Spring Boot Client Email Alert) */}
                          {!isConfirmed ? (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleConfirmAndAlert(row)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition cursor-pointer text-xs disabled:opacity-50"
                              title="Confirm booking and dispatch email alert to client"
                            >
                              {isProcessing ? "Confirming..." : "Confirm Trip"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleDispatchBriefing(row)}
                              className="px-3 py-1.5 border border-sky-200 text-sky-600 hover:bg-sky-50 font-bold rounded-xl transition cursor-pointer text-xs disabled:opacity-50"
                            >
                              Resend Briefing
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Paperwork & Document Vault Modal */}
      <StaffPaperworkModal
        isOpen={isPaperworkOpen}
        onClose={() => setIsPaperworkOpen(false)}
        booking={selectedBookingForDocs}
      />

      {/* Trip Inspector Modal */}
      <TripDetailsModal
        isOpen={isInspectOpen}
        onClose={() => setIsInspectOpen(false)}
        trip={inspectTrip}
      />

      {/* Staff Dispatch Modal */}
      <AssignStaffModal
        isOpen={isStaffAssignOpen}
        onClose={() => setIsStaffAssignOpen(false)}
        booking={selectedBookingForStaff}
        onAssigned={fetchLiveLogistics}
      />
    </div>
  );
}
