import React, { useState, useEffect } from 'react';
import { 
  X, 
  Compass, 
  Plus, 
  Trash2, 
  Users, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Hash,
  MailCheck,
  CalendarDays,
  Mountain,
  MapPin,
  Utensils
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { bookingApi } from '../../api/bookingApi';
import { documentApi } from '../../api/documentApi';
import { activityService, ACTIVITY_MODULES } from '../../api/activityService';

const AVAILABLE_DOC_TYPES = [
  { id: 'PASSPORT', label: 'Passport Scan' },
  { id: 'INSURANCE_POLICY', label: 'Rescue Insurance' },
  { id: 'PERMIT_SCAN', label: 'TIMS / Entry Permit' },
  { id: 'NEPAL_VISA', label: 'Nepal Visa' },
  { id: 'MEDICAL_CLEARANCE', label: 'Medical Clearance' },
  { id: 'EXPENSE_RECEIPT', label: 'Other Document' }
];

const ACCOMMODATION_OPTIONS = [
  { id: 'Hotel', label: 'Hotel' },
  { id: 'Teahouse / Lodge', label: 'Teahouse / Lodge' },
  { id: 'Lodge', label: 'Lodge' },
  { id: 'Camping / Tent', label: 'Camping / Tent' },
  { id: 'Homestay', label: 'Homestay' },
  { id: 'Resort', label: 'Resort' },
  { id: 'In Transit', label: 'In Transit / Flight' }
];

const MEAL_PLANS = [
  { id: 'B,L,D', label: 'B,L,D (All Meals)' },
  { id: 'B,B', label: 'B,B (Bed & Breakfast)' },
  { id: 'B,D', label: 'B,D (Breakfast & Dinner)' },
  { id: 'B,L', label: 'B,L (Breakfast & Lunch)' },
  { id: 'EP', label: 'Room Only (No Meals)' }
];

export default function NewTripModal() {
  const { isNewTripOpen, closeNewTripModal } = useModal();

  // 1. Module Category & Auto-Generated Code
  const [category, setCategory] = useState('TREKKING');
  const [bookingCode, setBookingCode] = useState('TRK-2026-01');
  const [codeLoading, setCodeLoading] = useState(false);

  // 2. Package Catalog & Day-by-Day Itinerary Preview
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [itineraryPreview, setItineraryPreview] = useState([]);
  const [showItinerary, setShowItinerary] = useState(false);

  // Dynamic Custom Itinerary Builder with Editable Day Label
  const [isCustomRoute, setIsCustomRoute] = useState(false);
  const [customRouteTitle, setCustomRouteTitle] = useState('');
  const [customDays, setCustomDays] = useState([
    { 
      dayLabel: 'Day 1',
      title: '', 
      altitude: '', 
      trekTimeDistance: '', 
      accommodation: 'Hotel', 
      meals: 'B,B' 
    }
  ]);

  // 3. Client Information
  const [clients, setClients] = useState([]);
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientForm, setClientForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationality: 'International'
  });

  // 4. Trip Dates & Pricing
  const [travelDate, setTravelDate] = useState('');
  const [pricePerPerson, setPricePerPerson] = useState(2500);

  // 5. Travelers / Party Roster
  const [travelers, setTravelers] = useState([
    { fullName: '', passportNumber: '', nationality: '', dietaryReq: '' }
  ]);

  // 6. Multi-File Document Vault Queue
  const [fileQueue, setFileQueue] = useState([
    { id: 1, documentType: 'PASSPORT', file: null }
  ]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isHeliTour = category === 'HELI_TOUR';

  const refreshCode = async (catKey) => {
    setCodeLoading(true);
    try {
      const code = await activityService.getNextCode(catKey);
      setBookingCode(code);
    } catch {
      const cfg = ACTIVITY_MODULES[catKey] || ACTIVITY_MODULES.TREKKING;
      setBookingCode(`${cfg.prefix}-2026-01`);
    } finally {
      setCodeLoading(false);
    }
  };

  useEffect(() => {
    if (isNewTripOpen) {
      setError('');
      setSuccess('');
      setShowItinerary(false);
      setFileQueue([{ id: Date.now(), documentType: 'PASSPORT', file: null }]);
      setTravelers([{ fullName: '', passportNumber: '', nationality: '', dietaryReq: '' }]);
      
      const target = new Date();
      target.setDate(target.getDate() + 14);
      setTravelDate(target.toISOString().split('T')[0]);

      refreshCode(category);

      bookingApi.getClients().then((res) => {
        setClients(res || []);
        if (res && res.length > 0) {
          setSelectedClientId(res[0].id);
          setIsNewClient(false);
        } else {
          setIsNewClient(true);
        }
      });
    }
  }, [isNewTripOpen]);

  useEffect(() => {
    if (isNewTripOpen) {
      refreshCode(category);
      setPackagesLoading(true);
      activityService.getPackagesByActivity(category)
        .then((items) => {
          setPackages(items || []);
          if (items && items.length > 0) {
            setSelectedPackageId(items[0].id);
            setSelectedPackage(items[0]);
            setPricePerPerson(items[0].price || (category === 'HELI_TOUR' ? 1200 : 2500));
            setIsCustomRoute(false);
          } else {
            setSelectedPackageId('');
            setSelectedPackage(null);
            setIsCustomRoute(true);
          }
        })
        .finally(() => setPackagesLoading(false));
    }
  }, [category, isNewTripOpen]);

  useEffect(() => {
    if (selectedPackageId && !isCustomRoute) {
      const pkg = packages.find((p) => String(p.id) === String(selectedPackageId));
      setSelectedPackage(pkg || null);
      if (pkg) setPricePerPerson(pkg.price || 2500);

      activityService.getItineraryByPackageId(category, selectedPackageId)
        .then((days) => setItineraryPreview(days || []))
        .catch(() => setItineraryPreview([]));
    } else {
      setItineraryPreview([]);
    }
  }, [selectedPackageId, isCustomRoute, category, packages]);

  if (!isNewTripOpen) return null;

  // Handlers: Multi-Day Builder with editable label
  const handleAddNextDay = () => {
    const nextDayNum = customDays.length + 1;
    setCustomDays([
      ...customDays,
      {
        dayLabel: `Day ${nextDayNum}`,
        title: '',
        altitude: '',
        trekTimeDistance: '',
        accommodation: 'Teahouse / Lodge',
        meals: 'B,L,D'
      }
    ]);
  };

  const handleRemoveDay = (index) => {
    if (customDays.length <= 1) return;
    const updated = customDays.filter((_, idx) => idx !== index);
    setCustomDays(updated);
  };

  const handleUpdateDay = (index, field, value) => {
    const copy = [...customDays];
    copy[index][field] = value;
    setCustomDays(copy);
  };

  // Handlers: Travelers
  const addTraveler = () => {
    setTravelers([...travelers, { fullName: '', passportNumber: '', nationality: '', dietaryReq: '' }]);
  };
  const removeTraveler = (idx) => {
    if (travelers.length === 1) return;
    setTravelers(travelers.filter((_, i) => i !== idx));
  };
  const updateTraveler = (idx, field, val) => {
    const copy = [...travelers];
    copy[idx][field] = val;
    setTravelers(copy);
  };

  // Handlers: File Queue
  const addFileSlot = () => {
    setFileQueue([...fileQueue, { id: Date.now(), documentType: 'PASSPORT', file: null }]);
  };
  const removeFileSlot = (id) => {
    if (fileQueue.length === 1) {
      setFileQueue([{ id: Date.now(), documentType: 'PASSPORT', file: null }]);
      return;
    }
    setFileQueue(fileQueue.filter((item) => item.id !== id));
  };

  const totalAmount = Number(pricePerPerson || 0) * travelers.length;

  // Form Submission
  const handleSaveBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Resolve client
      let finalClientId = selectedClientId;
      if (isNewClient) {
        if (!clientForm.fullName.trim() || !clientForm.email.trim()) {
          throw new Error('Please enter client name and email.');
        }
        const created = await bookingApi.createClient(clientForm);
        finalClientId = created.id;
      }

      // 2. Resolve package ID
      let finalPackageId = selectedPackageId;
      if (isCustomRoute || !finalPackageId) {
        if (!customRouteTitle.trim()) {
          throw new Error('Please enter the custom expedition route title.');
        }

        const duration = isHeliTour ? 1 : Math.max(customDays.length, 1);
        const createdPkg = await bookingApi.createQuickPackage({
          title: customRouteTitle.trim(),
          price: pricePerPerson,
          durationDays: duration
        });
        finalPackageId = createdPkg.id;
      }

      // 3. Register booking with full custom breakdown using the manual dayLabel
      const itinerarySummary = isCustomRoute && !isHeliTour
        ? customDays.map(d => 
            `${d.dayLabel || 'Day'}: ${d.title || 'Stage'} (${d.altitude ? d.altitude + 'm' : 'N/A'}${d.trekTimeDistance ? ', ' + d.trekTimeDistance : ''}, ${d.accommodation}, ${d.meals})`
          ).join(' | ')
        : '';

      const payload = {
        bookingCode: bookingCode.trim(),
        clientId: Number(finalClientId),
        tourPackageId: Number(finalPackageId),
        travelDate: travelDate,
        numberOfTravelers: Number(travelers.length),
        totalAmount: Number(totalAmount),
        currency: 'USD',
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        specialRequest: `Internal Entry | ${itinerarySummary ? `Itinerary: ${itinerarySummary} | ` : ''}Emergency: ${clientForm.phone || 'Recorded'} | Members: ${travelers.map(t => t.fullName).filter(Boolean).join(', ')}`,
        active: true,
        requiresAirportTransfer: true,
        vehicleDetails: 'Operations Airport Transfer Reserved'
      };

      const createdBooking = await bookingApi.createBooking(payload);

      // 4. Upload attached compliance files
      const validFiles = fileQueue.filter((item) => item.file !== null);
      if (validFiles.length > 0 && createdBooking?.id) {
        const uploads = validFiles.map((item) =>
          documentApi.uploadDocument({
            file: item.file,
            bookingId: createdBooking.id,
            clientId: Number(finalClientId),
            documentType: item.documentType
          })
        );
        await Promise.allSettled(uploads);
      }

      setSuccess(`Trip ${bookingCode} confirmed! Automated dispatch emails sent.`);
      setTimeout(() => {
        closeNewTripModal();
        window.dispatchEvent(new Event('bookings-updated'));
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to record booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-100 shadow-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Internal Expedition Entry</h3>
              <p className="text-[10px] text-slate-400">Log inquiry from WhatsApp / Direct Website Booking</p>
            </div>
          </div>
          <button type="button" onClick={closeNewTripModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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

        {/* Form Body */}
        <form onSubmit={handleSaveBooking} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          
          {/* 1. Activity Selector & Sequential Reference */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                1. Select Activity Module
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-sky-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                <Hash size={13} />
                <span>{codeLoading ? 'Generating...' : bookingCode}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {Object.values(ACTIVITY_MODULES).map((mod) => {
                const active = category === mod.key;
                return (
                  <button
                    key={mod.key}
                    type="button"
                    onClick={() => setCategory(mod.key)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer text-center ${
                      active
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Package Catalog OR Dynamic Multi-Day Itinerary Builder */}
          <div className="p-4 bg-sky-50/40 border border-sky-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <CalendarDays size={13} className="text-sky-600" />
                2. Select Package Route & Itinerary
              </span>
              <button
                type="button"
                onClick={() => setIsCustomRoute(!isCustomRoute)}
                className="text-sky-600 font-bold hover:underline cursor-pointer text-[11px]"
              >
                {isCustomRoute ? '← Choose From Catalog' : '+ Custom Multi-Day Route'}
              </button>
            </div>

            {!isCustomRoute ? (
              <div>
                {packagesLoading ? (
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400">
                    Loading {category} packages from backend...
                  </div>
                ) : packages.length === 0 ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
                    No active packages found in database for this category. Click "+ Custom Multi-Day Route" above.
                  </div>
                ) : (
                  <select
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-sky-500"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        [{pkg.code}] {pkg.title} - ${pkg.price} USD ({pkg.durationDays} Days, {pkg.region})
                      </option>
                    ))}
                  </select>
                )}

                {/* Catalog Accordion Preview with Meals */}
                {itineraryPreview.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowItinerary(!showItinerary)}
                      className="flex items-center justify-between w-full p-2.5 bg-white border border-sky-100 rounded-xl text-slate-700 font-semibold cursor-pointer hover:bg-sky-50/50 transition"
                    >
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Clock size={13} className="text-sky-600" />
                        Verified Day-by-Day Schedule ({itineraryPreview.length} Days linked)
                      </span>
                      {showItinerary ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showItinerary && (
                      <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                        {itineraryPreview.map((d) => (
                          <div key={d.id || d.dayNumber} className="flex items-start gap-2 p-1.5 border-b border-slate-50 last:border-0">
                            <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-600 font-mono text-[9px] font-bold shrink-0">
                              D{d.dayNumber}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{d.title}</p>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{d.altitude ? `${d.altitude}m • ` : ''}{d.walkingHours || 'Trek'} • {d.accommodation || 'Lodge'}</span>
                                <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  {d.meals || 'B,L,D'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Custom Route with Multi-Day Dynamic Builder & Manual Day Label Input */
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Expedition / Trip Route Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isHeliTour ? "e.g., Everest Base Camp Helicopter Day Flight" : "e.g., Manaslu & Tsum Valley Circuit Expedition"}
                    value={customRouteTitle}
                    onChange={(e) => setCustomRouteTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-sky-500"
                  />
                </div>

                {isHeliTour ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Flight Route & Landing Waypoints
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Kathmandu -> Lukla (Refuel) -> Kalapatthar (Landing) -> Hotel Everest View (Breakfast) -> Kathmandu"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">
                        Day-by-Day Expedition Itinerary ({customDays.length} Stages)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddNextDay}
                        className="flex items-center gap-1 px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[11px] font-bold transition cursor-pointer shadow-xs"
                      >
                        <Plus size={12} /> Add Next Day
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto p-2 bg-white border border-slate-200 rounded-2xl">
                      {customDays.map((day, idx) => (
                        <div key={idx} className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5">
                          {/* Day Header with EDITABLE Day / Multi-Day Input */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Stage / Days:</label>
                              <input
                                type="text"
                                required
                                value={day.dayLabel}
                                onChange={(e) => handleUpdateDay(idx, 'dayLabel', e.target.value)}
                                placeholder="e.g. Day 1, Day 14-18, Rest Day"
                                className="w-36 p-1 px-2.5 bg-white border border-sky-300 rounded-md text-xs font-bold text-sky-700 font-mono shadow-2xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                              />
                            </div>

                            {customDays.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDay(idx)}
                                className="text-rose-400 hover:text-rose-600 transition cursor-pointer p-1"
                                title="Remove this day/stage"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          {/* Row 1: Manual Stage Title */}
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Stage details (e.g. Rest and preparation at Kathmandu / Rest & Acclimatization at Base Camp)"
                              value={day.title}
                              onChange={(e) => handleUpdateDay(idx, 'title', e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-sky-500"
                            />
                          </div>

                          {/* Row 2: Altitude, Trek Time/Distance, Accommodation Dropdown, Meal Plan Dropdown */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            {/* Altitude */}
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                                Altitude (m)
                              </label>
                              <input
                                type="number"
                                placeholder="e.g. 1350"
                                value={day.altitude}
                                onChange={(e) => handleUpdateDay(idx, 'altitude', e.target.value)}
                                className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                              />
                            </div>

                            {/* Trek Time & Distance */}
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                                Time & Distance
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 4hrs / 8km (5mi) or Rest"
                                value={day.trekTimeDistance}
                                onChange={(e) => handleUpdateDay(idx, 'trekTimeDistance', e.target.value)}
                                className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                              />
                            </div>

                            {/* Accommodation Dropdown */}
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                                Accommodation
                              </label>
                              <select
                                value={day.accommodation}
                                onChange={(e) => handleUpdateDay(idx, 'accommodation', e.target.value)}
                                className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                              >
                                {ACCOMMODATION_OPTIONS.map((opt) => (
                                  <option key={opt.id} value={opt.id}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Meal Plan Dropdown */}
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                                Meal Plan
                              </label>
                              <select
                                value={day.meals || 'B,L,D'}
                                onChange={(e) => handleUpdateDay(idx, 'meals', e.target.value)}
                                className="w-full p-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold"
                              >
                                {MEAL_PLANS.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Lead Client Information */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <UserPlus size={13} className="text-sky-500" /> 3. Lead Client & Email Dispatch
              </span>
              <button
                type="button"
                onClick={() => setIsNewClient(!isNewClient)}
                className="text-sky-600 font-bold hover:underline cursor-pointer text-[11px]"
              >
                {isNewClient ? '← Choose Existing Client' : '+ New Client Contact'}
              </button>
            </div>

            {!isNewClient ? (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName || c.name} ({c.email}) - {c.phone}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="Full Legal Name"
                  value={clientForm.fullName}
                  onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl"
                />
                <input
                  type="email"
                  required
                  placeholder="Client Email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl"
                />
                <input
                  type="tel"
                  required
                  placeholder="WhatsApp / Phone Number"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Nationality"
                  value={clientForm.nationality}
                  onChange={(e) => setClientForm({ ...clientForm, nationality: e.target.value })}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            )}
          </div>

          {/* 4. Travel Date & Cost Ledger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 uppercase mb-1 text-[10px]">
                Expedition Start Date *
              </label>
              <input
                type="date"
                required
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 uppercase mb-1 text-[10px]">
                Agreed Rate / Person ($ USD) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={pricePerPerson}
                onChange={(e) => setPricePerPerson(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          {/* 5. Team / Traveler Member Roster */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Users size={14} className="text-sky-500" /> 4. Trekking Party Roster ({travelers.length} Pax)
              </span>
              <button
                type="button"
                onClick={addTraveler}
                className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-xl font-bold transition cursor-pointer"
              >
                <Plus size={12} /> Add Trekker
              </button>
            </div>

            {travelers.map((t, idx) => (
              <div key={idx} className="p-3 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>Traveler #{idx + 1}</span>
                  {travelers.length > 1 && (
                    <button type="button" onClick={() => removeTraveler(idx)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Passport Name"
                    value={t.fullName}
                    onChange={(e) => updateTraveler(idx, 'fullName', e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Passport Number"
                    value={t.passportNumber}
                    onChange={(e) => updateTraveler(idx, 'passportNumber', e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Nationality"
                    value={t.nationality}
                    onChange={(e) => updateTraveler(idx, 'nationality', e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Dietary Notes (e.g. Vegetarian, Gluten Free)"
                    value={t.dietaryReq}
                    onChange={(e) => updateTraveler(idx, 'dietaryReq', e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 6. Multi-File Document Attachment Queue */}
          <div className="p-4 bg-sky-50/40 border border-sky-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <UploadCloud size={14} className="text-sky-600" /> 
                5. Attach Compliance Documents ({fileQueue.filter(f => f.file).length} Attached)
              </span>
              <button
                type="button"
                onClick={addFileSlot}
                className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-sky-50 text-sky-600 border border-sky-200 rounded-xl text-[11px] font-bold transition cursor-pointer"
              >
                <Plus size={12} /> Add File Slot
              </button>
            </div>

            <div className="space-y-2">
              {fileQueue.map((item, idx) => (
                <div key={item.id} className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span>Document #{idx + 1}</span>
                    {fileQueue.length > 1 && (
                      <button type="button" onClick={() => removeFileSlot(item.id)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <select
                      value={item.documentType}
                      onChange={(e) => {
                        const copy = [...fileQueue];
                        copy[idx].documentType = e.target.value;
                        setFileQueue(copy);
                      }}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    >
                      {AVAILABLE_DOC_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                    <input
                      type="file"
                      onChange={(e) => {
                        const copy = [...fileQueue];
                        copy[idx].file = e.target.files?.[0] || null;
                        setFileQueue(copy);
                      }}
                      className="sm:col-span-2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary & Dispatch Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Booking Value</span>
              <span className="text-base font-bold text-sky-400">${totalAmount.toLocaleString()} USD</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <MailCheck size={16} />
              <span>Saving triggers Client Confirmation & Operations Dispatch</span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={closeNewTripModal}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || codeLoading}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-sky-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Filing & Triggering Emails...' : `Save & Confirm Trip (${bookingCode})`}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}