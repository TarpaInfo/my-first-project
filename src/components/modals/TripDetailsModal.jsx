import React, { useState, useEffect } from 'react';
import { 
  X, 
  Compass, 
  Users, 
  ExternalLink, 
  HardDrive, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CreditCard,
  UserCheck, 
  Plane, 
  Car, 
  Footprints, 
  Mountain, 
  Clock, 
  Home, 
  Utensils, 
  FileText, 
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Loader2
} from 'lucide-react';
import { documentApi } from '../../api/documentApi';
import { activityItineraryApi } from '../../api/activityItineraryApi';
import axiosClient from '../../api/axiosClient';

const TABS = [
  { id: 'ITINERARY', label: 'Day-by-Day Itinerary', icon: Footprints },
  { id: 'LOGISTICS', label: 'Guide, Porter & Transport', icon: Car },
  { id: 'DOCUMENTS', label: 'Document Vault & Files', icon: FileCheck },
  { id: 'PAYMENT', label: 'Payment Ledger', icon: CreditCard },
];

export default function TripDetailsModal({ isOpen, onClose, trip }) {
  const [activeTab, setActiveTab] = useState('ITINERARY');

  // Itinerary records
  const [itineraryDays, setItineraryDays] = useState([]);
  const [loadingItinerary, setLoadingItinerary] = useState(false);

  // Document Vault records
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [openingDocId, setOpeningDocId] = useState(null);

  // Field Staff & Logistics Assignments
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    if (isOpen && trip?.id) {
      // 1. Fetch Day-by-Day Itinerary
      setLoadingItinerary(true);
      activityItineraryApi.getItineraryForBooking(trip)
        .then((data) => setItineraryDays(data || []))
        .catch(() => setItineraryDays([]))
        .finally(() => setLoadingItinerary(false));

      // 2. Fetch Stored Documents & Permits
      setLoadingDocs(true);
      documentApi.getDocumentsByBooking(trip.id)
        .then((docs) => setDocuments(docs || []))
        .catch(() => setDocuments([]))
        .finally(() => setLoadingDocs(false));

      // 3. Fetch Assigned Staff & Logistics (Guide, Porter, Pickup)
      setLoadingAssignments(true);
      axiosClient.get(`/logistics/assignments/booking/${trip.id}`)
        .then((res) => setAssignments(res.data || []))
        .catch(() => setAssignments([]))
        .finally(() => setLoadingAssignments(false));
    }
  }, [isOpen, trip]);

  if (!isOpen || !trip) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Authenticated file viewing via Blob URL
  const handleInspectDocument = async (doc) => {
    setOpeningDocId(doc.id);
    try {
      const url = documentApi.getDownloadUrl(doc.storedFileName);
      const token = localStorage.getItem('satori_token');
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('Could not access document from server');

      const blob = await res.blob();
      const fileBlob = doc.contentType ? new Blob([blob], { type: doc.contentType }) : blob;
      const objectUrl = window.URL.createObjectURL(fileBlob);

      const previewTab = window.open(objectUrl, '_blank');
      if (!previewTab) {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.setAttribute('download', doc.originalFileName || doc.storedFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
    } catch (err) {
      alert(`Failed to load document: ${err.message}`);
    } finally {
      setOpeningDocId(null);
    }
  };

  const isPaid = trip.bookingStatus === 'CONFIRMED' || trip.paymentStatus === 'PAID';
  const totalAmount = trip.totalAmount || (trip.numberOfTravelers || 1) * 2500;
  const depositPaid = isPaid ? totalAmount : totalAmount * 0.3;
  const balanceDue = isPaid ? 0 : totalAmount - depositPaid;

  const activeAssignment = assignments.length > 0 ? assignments[0] : null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-100 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/25">
              <Compass size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">{trip.routeName || trip.packageName || 'Himalayan Expedition'}</h3>
                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-mono font-bold text-[10px]">
                  {trip.bookingCode || `#${trip.id}`}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Lead Client: <span className="font-semibold text-slate-600">{trip.clientName || 'Lead Traveler'}</span> | Travel Date: <span className="font-semibold text-slate-600">{trip.travelDate || 'Scheduled'}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Toolbar */}
        <div className="px-6 pt-2 border-b border-slate-100 flex items-center gap-1 bg-slate-50/60">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 font-bold text-xs transition cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 text-sky-600 bg-white rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Body */}
        <div className="p-6 space-y-5 text-xs overflow-y-auto flex-1 bg-white">
          
          {/* Quick Info Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Party Size</span>
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Users size={12} className="text-sky-500" /> {trip.numberOfTravelers || 1} Trekker(s)
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Field Status</span>
              <span className={`font-bold ${trip.bookingStatus === 'CONFIRMED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {trip.bookingStatus || 'PENDING VERIFICATION'}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Rendezvous Point</span>
              <span className="font-semibold text-slate-700 truncate block">
                {activeAssignment?.pickupLocation || trip.transferLocation || 'Tribhuvan International Airport (TIA)'}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Payment Ledger</span>
              <span className={`font-bold ${isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPaid ? 'Paid in Full' : 'Deposit Received'}
              </span>
            </div>
          </div>

          {/* TAB 1: DAY BY DAY ITINERARY */}
          {activeTab === 'ITINERARY' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Daily Route Plan ({itineraryDays.length} Days)
                </span>
                {loadingItinerary && <span className="text-[10px] text-slate-400 animate-pulse">Syncing schedule...</span>}
              </div>

              {itineraryDays.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                  <Footprints size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold">No daily schedule recorded for this package.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Standard route parameters apply. Check logistics directives for deviations.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {itineraryDays.map((day) => (
                    <div key={day.id || day.dayNumber} className="p-4 bg-slate-50/60 border border-slate-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-sky-500 text-white font-mono font-bold text-[10px]">
                            Day {day.dayNumber}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">{day.title}</span>
                        </div>
                        {day.difficulty && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px]">
                            {day.difficulty}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {day.altitude && (
                          <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-100 text-slate-700">
                            <Mountain size={13} className="text-sky-600 shrink-0" />
                            <span className="font-semibold">{day.altitude} m</span>
                          </div>
                        )}
                        {day.walkingHours && (
                          <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-100 text-slate-700">
                            <Clock size={13} className="text-amber-500 shrink-0" />
                            <span className="font-semibold">{day.walkingHours}</span>
                          </div>
                        )}
                        {day.accommodation && (
                          <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-100 text-slate-700">
                            <Home size={13} className="text-emerald-600 shrink-0" />
                            <span className="font-semibold truncate">{day.accommodation}</span>
                          </div>
                        )}
                        {day.meals && (
                          <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-100 text-slate-700">
                            <Utensils size={13} className="text-rose-500 shrink-0" />
                            <span className="font-semibold">{day.meals}</span>
                          </div>
                        )}
                      </div>

                      {day.description && (
                        <p className="text-slate-600 text-xs bg-white p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                          {day.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GUIDE, PORTER & FIELD LOGISTICS */}
          {activeTab === 'LOGISTICS' && (
            <div className="space-y-4">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Field Deployment & Crew Dispatch
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-sky-700 font-bold">
                    <UserCheck size={16} />
                    <span>Lead Expedition Guide</span>
                  </div>
                  {activeAssignment?.staff ? (
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{activeAssignment.staff.fullName}</p>
                      <p className="text-slate-500 text-[11px]">Role: {String(activeAssignment.staff.role || '').replaceAll('_', ' ')} • Phone: {activeAssignment.staff.phoneNumber || 'N/A'}</p>
                      <p className="text-slate-400 text-[10px] font-mono mt-0.5">License: {activeAssignment.staff.licenseNumber || 'Verified'}</p>
                    </div>
                  ) : (
                    <p className="text-amber-600 text-[11px]">No lead guide assigned yet. Use the green User icon on the board to assign crew.</p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Briefcase size={16} />
                    <span>Field Directive & Notes</span>
                  </div>
                  <p className="font-semibold text-slate-700 text-xs">
                    {activeAssignment?.operationalNotes || trip.specialRequest || 'Standard high-altitude trekking protocols apply.'}
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    Briefing status: {activeAssignment?.briefingSent ? '✓ Dispatch Transmitted' : 'Pending Guide Confirmation'}
                  </p>
                </div>
              </div>

              {/* Transport & Vehicles */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Ground & Air Travel Coordinates
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                      <Car size={14} className="text-sky-500" />
                      <span>Rendezvous & Vehicle Transfer</span>
                    </div>
                    <p className="text-slate-700 font-semibold">
                      {activeAssignment?.pickupLocation || trip.transferLocation || 'Kathmandu Airport (TIA)'}
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Vehicle: {activeAssignment?.vehicleDetails || trip.vehicleDetails || 'Dedicated Operations Transfer'}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                      <Plane size={14} className="text-rose-500" />
                      <span>Domestic Mountain Flight</span>
                    </div>
                    <p className="text-slate-700 font-semibold">Kathmandu (KTM) ⇄ Sector Airfield</p>
                    <p className="text-slate-400 text-[10px]">Carrier vouchers & e-tickets stored in the Document Vault</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT VAULT & COMPLIANCE */}
          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Stored Documents & Official Permits ({documents.length})
                </span>
                {loadingDocs && <span className="text-[10px] text-slate-400 animate-pulse">Syncing vault...</span>}
              </div>

              {documents.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                  <HardDrive size={24} className="mx-auto mb-2 text-slate-300" />
                  <p>No compliance documents filed for this trip yet.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Upload passports, TIMS permits, or air vouchers using the Paperwork button.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3.5 bg-white flex items-center justify-between hover:bg-slate-50/80 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <ShieldCheck size={16} />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs">{doc.originalFileName}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[9px] font-bold">
                              {doc.documentType}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {formatFileSize(doc.sizeInBytes)} • {doc.contentType || 'file'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={openingDocId === doc.id}
                        onClick={() => handleInspectDocument(doc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl font-bold transition text-[11px] cursor-pointer disabled:opacity-50"
                      >
                        {openingDocId === doc.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <ExternalLink size={12} />
                        )}
                        <span>{openingDocId === doc.id ? 'Loading...' : 'Inspect File'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT LEDGER & FINANCIALS */}
          {activeTab === 'PAYMENT' && (
            <div className="space-y-4">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                Expedition Financial Overview
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Invoice</span>
                  <span className="text-lg font-bold text-slate-800">${Number(totalAmount).toLocaleString()} USD</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Includes TIMS & Park Fees</span>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase">Amount Cleared</span>
                  <span className="text-lg font-bold text-emerald-700">${Number(depositPaid).toLocaleString()} USD</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">Verified Bank Settlement</span>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  <span className="block text-[10px] font-bold text-rose-600 uppercase">Outstanding Balance</span>
                  <span className="text-lg font-bold text-rose-700">${Number(balanceDue).toLocaleString()} USD</span>
                  <span className="text-[10px] text-rose-500 block mt-0.5">Due at Kathmandu briefing</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Invoice Reference: INV-{trip.bookingCode || trip.id}</span>
                  <span className="text-[11px] text-slate-500">Receipt archived in internal operations ledger.</span>
                </div>
                <span className={`px-3 py-1 rounded-xl font-bold text-xs ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isPaid ? 'CLEARED' : 'PENDING FINAL SETTLEMENT'}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between sticky bottom-0 bg-white z-20">
          <div className="text-[11px] text-slate-400">
            Internal Record: <span className="font-mono font-bold text-slate-600">ID #{trip.id}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer text-xs"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
}