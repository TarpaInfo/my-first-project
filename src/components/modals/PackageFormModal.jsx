import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mountain, 
  Footprints, 
  Compass, 
  Plane, 
  MapPin, 
  AlertCircle, 
  RefreshCw,
  Hash
} from 'lucide-react';
import { packagesApi, getEndpoint } from '../../api/packagesApi';

const MODULE_TABS = [
  { id: 'TREKKING', label: 'Trekking', prefix: 'TRK', icon: Footprints },
  { id: 'MOUNTAIN_EXPEDITION', label: 'Expedition', prefix: 'EXP', icon: Mountain },
  { id: 'PEAK_CLIMBING', label: 'Peak Climbing', prefix: 'PKC', icon: Compass },
  { id: 'HELI_TOUR', label: 'Heli Tour', prefix: 'HLI', icon: Plane },
  { id: 'TOUR', label: 'Tour Package', prefix: 'TUR', icon: MapPin },
];

export default function PackageFormModal({ isOpen, onClose, initialData, onSuccess, activeCategory }) {
  const [category, setCategory] = useState('TREKKING');

  // Common core fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('Khumbu');
  const [destination, setDestination] = useState('Nepal');
  const [durationDays, setDurationDays] = useState(14);
  const [durationNights, setDurationNights] = useState(13);
  const [price, setPrice] = useState(1500);
  const [currency, setCurrency] = useState('USD');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  // Module 1: Mountain Expedition fields (MountainExpeditionRequest)
  const [mountainName, setMountainName] = useState('Mt. Manaslu');
  const [mountainHeight, setMountainHeight] = useState(8163);
  const [expeditionGrade, setExpeditionGrade] = useState('Extreme / Technical (Grade 5)');
  const [technicalDifficulty, setTechnicalDifficulty] = useState('D+ (Difficult Plus)');
  const [expeditionSeason, setExpeditionSeason] = useState('Autumn');
  const [permitRequired, setPermitRequired] = useState(true);
  const [permitDetails, setPermitDetails] = useState('Ministry of Tourism Climbing Permit');
  const [requiredClimbingGuides, setRequiredClimbingGuides] = useState(2);
  const [requiredHighAltitudeWorkers, setRequiredHighAltitudeWorkers] = useState(4);

  // Module 2: Trekking fields (TrekkingRequest)
  const [trekMaxAltitude, setTrekMaxAltitude] = useState(5416);
  const [trekDifficulty, setTrekDifficulty] = useState('Moderate to Strenuous');
  const [walkingHours, setWalkingHours] = useState('5-7 hours');
  const [distance, setDistance] = useState('160 km');
  const [startLocation, setStartLocation] = useState('Kathmandu');
  const [endLocation, setEndLocation] = useState('Pokhara');
  const [guideRequired, setGuideRequired] = useState(true);

  // Module 3: Tour Package fields (TourPackageRequest)
  const [packageType, setPackageType] = useState('Cultural Heritage Tour');

  // Module 4: Peak Climbing fields (PeakClimbingRequest)
  const [peakName, setPeakName] = useState('Island Peak (Imja Tse)');
  const [peakHeight, setPeakHeight] = useState(6189);
  const [climbingGrade, setClimbingGrade] = useState('Alpine PD+');
  const [highCamp, setHighCamp] = useState('High Camp (5,600m)');

  // Module 5: Heli Tour fields (HeliTourRequest)
  const [durationHours, setDurationHours] = useState(4);
  const [helicopterType, setHelicopterType] = useState('Airbus H125 / AS350 B3e');
  const [flightType, setFlightType] = useState('Charter / Shared');
  const [departureLocation, setDepartureLocation] = useState('Kathmandu Domestic Airport');
  const [landingLocation, setLandingLocation] = useState('Kala Patthar (5,545m)');
  const [minPassengers, setMinPassengers] = useState(1);
  const [maxPassengers, setMaxPassengers] = useState(5);
  const [oxygenAvailable, setOxygenAvailable] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate dynamic trip code with matching prefix
  const generateDynamicCode = (cat) => {
    const tab = MODULE_TABS.find((t) => t.id === cat) || MODULE_TABS[0];
    const randomSeq = Math.floor(100 + Math.random() * 900);
    return `${tab.prefix}-${randomSeq}`;
  };

  useEffect(() => {
    if (!isOpen) return;
    setError('');

    const targetCat = (initialData?.category || (activeCategory !== 'ALL' ? activeCategory : 'TREKKING')).toUpperCase();
    setCategory(targetCat);

    if (initialData) {
      // PREVIOUS TRIP: Retain existing Trip ID & fields
      const existingCode = initialData.code || 
                           initialData.trekkingCode || 
                           initialData.expeditionCode || 
                           initialData.peakCode || 
                           initialData.packageCode || 
                           initialData.heliTourCode || 
                           `ID-${initialData.id}`;
      setCode(existingCode);
      setName(initialData.name || initialData.trekkingName || initialData.expeditionName || initialData.peakName || initialData.packageName || initialData.heliTourName || initialData.title || '');
      setRegion(initialData.region || 'Khumbu');
      setDestination(initialData.destination || 'Nepal');
      setDurationDays(initialData.durationDays || 14);
      setDurationNights(initialData.durationNights || 13);
      setPrice(initialData.price || initialData.priceUSD || 1000);
      setCurrency(initialData.currency || 'USD');
      setShortDescription(initialData.shortDescription || '');
      setDescription(initialData.description || '');
      setActive(initialData.active !== undefined ? initialData.active : true);
    } else {
      // NEW TRIP: Generate new automatic Trip ID
      setCode(generateDynamicCode(targetCat));
      setName('');
      setPrice(targetCat === 'MOUNTAIN_EXPEDITION' ? 20000 : 1500);
    }
  }, [isOpen, initialData, activeCategory]);

  const handleTabChange = (newCat) => {
    setCategory(newCat);
    if (!initialData) {
      setCode(generateDynamicCode(newCat));
    }
  };

  const handleRegenerateCode = () => {
    if (!initialData) {
      setCode(generateDynamicCode(category));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let payload = {
        category,
        region: region || 'Himalayas',
        destination: destination || 'Nepal',
        shortDescription: (shortDescription || `${name} package overview.`).slice(0, 1000),
        description: description || `${name} full itinerary description.`,
        currency: currency || 'USD',
        active: Boolean(active),
      };

      // Exact DTO parameter structures
      switch (category) {
        case 'TREKKING':
          payload = {
            ...payload,
            trekkingCode: code.trim(),
            trekkingName: name.trim(),
            durationDays: Number(durationDays),
            durationNights: Number(durationNights || durationDays - 1),
            difficulty: trekDifficulty,
            maxAltitude: Number(trekMaxAltitude),
            distance: distance || '160 km',
            walkingHours: walkingHours || '5-7 hours',
            startLocation: startLocation || 'Kathmandu',
            endLocation: endLocation || 'Pokhara',
            bestSeason: 'Autumn / Spring',
            minGroupSize: 1,
            maxGroupSize: 16,
            price: Number(price),
            permitRequired: Boolean(permitRequired),
            permitDetails: (permitDetails || 'TIMS Card & ACAP Permit').slice(0, 1000),
            guideRequired: Boolean(guideRequired),
          };
          break;

        case 'MOUNTAIN_EXPEDITION':
          payload = {
            ...payload,
            expeditionCode: code.trim(),
            expeditionName: name.trim(),
            mountainName: mountainName.trim(),
            mountainHeight: Number(mountainHeight),
            maximumAltitude: Number(mountainHeight),
            durationDays: Number(durationDays),
            durationNights: Number(durationNights || durationDays - 1),
            expeditionGrade: expeditionGrade,
            technicalDifficulty: technicalDifficulty,
            expeditionSeason: expeditionSeason || 'Autumn',
            price: Number(price),
            permitRequired: Boolean(permitRequired),
            permitDetails: (permitDetails || 'Ministry of Tourism Permit').slice(0, 1500),
            requiredClimbingGuides: Number(requiredClimbingGuides),
            requiredHighAltitudeWorkers: Number(requiredHighAltitudeWorkers),
            startLocation: 'Kathmandu',
            endLocation: 'Kathmandu',
          };
          break;

        case 'TOUR':
          payload = {
            ...payload,
            packageCode: code.trim(),
            packageName: name.trim(),
            packageType: packageType.trim(),
            durationDays: Number(durationDays),
            durationNights: Number(durationNights || durationDays - 1),
            difficulty: 'Easy',
            maxAltitude: Number(trekMaxAltitude || 2200),
            bestSeason: 'All Year Round',
            startLocation: startLocation || 'Kathmandu',
            endLocation: endLocation || 'Kathmandu',
            price: Number(price) > 0 ? Number(price) : 500, // Price must be > 0
            minGroupSize: 1,
            maxGroupSize: 20,
          };
          break;

        case 'PEAK_CLIMBING':
          payload = {
            ...payload,
            peakCode: code.trim(),
            peakName: (peakName || name).trim(),
            peakHeight: Number(peakHeight),
            climbingGrade: climbingGrade,
            technicalDifficulty: 'Challenging',
            climbingSeason: 'Spring / Autumn',
            durationDays: Number(durationDays),
            durationNights: Number(durationNights || durationDays - 1),
            startLocation: 'Kathmandu',
            endLocation: 'Kathmandu',
            highCamp: highCamp || 'High Camp',
            minGroupSize: 1,
            maxGroupSize: 12,
            distance: distance || '80 km',
            climbingHours: '8-10 summit day hours',
            price: Number(price),
            permitRequired: Boolean(permitRequired),
            permitDetails: (permitDetails || 'NMA Climbing Permit').slice(0, 1000),
            climbingGuideRequired: true,
          };
          break;

        case 'HELI_TOUR':
          payload = {
            ...payload,
            heliTourCode: code.trim(),
            heliTourName: name.trim(),
            durationHours: Number(durationHours),
            flightType: flightType || 'Charter',
            helicopterType: helicopterType || 'Airbus H125',
            departureLocation: departureLocation || 'Kathmandu Airport',
            landingLocation: landingLocation || 'Kala Patthar',
            returnLocation: departureLocation || 'Kathmandu Airport',
            minPassengers: Number(minPassengers),
            maxPassengers: Number(maxPassengers),
            maximumAltitude: 5545,
            flightDistance: '140 km',
            bestSeason: 'Autumn / Spring',
            landingAllowed: true,
            landingDetails: (landingLocation || 'Kala Patthar Landing (15 Mins)').slice(0, 1500),
            oxygenAvailable: Boolean(oxygenAvailable),
            emergencySupportAvailable: true,
            price: Number(price),
            pricePerPerson: true,
          };
          break;

        default:
          throw new Error('Unsupported activity category');
      }

      if (initialData?.id) {
        await packagesApi.updatePackage(category, initialData.id, payload);
      } else {
        await packagesApi.createPackage(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        if (Array.isArray(res.errors)) {
          setError(res.errors.map((e) => (typeof e === 'object' ? `${e.field}: ${e.defaultMessage || e.message}` : String(e))).join(' | '));
        } else if (typeof res.errors === 'object') {
          setError(Object.entries(res.errors).map(([k, v]) => `${k}: ${typeof v === 'object' ? (v.defaultMessage || JSON.stringify(v)) : v}`).join(' | '));
        } else {
          setError(String(res.errors));
        }
      } else if (res?.message) {
        setError(res.message);
      } else {
        setError('Failed to persist package to Spring Boot controller.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl my-6 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Hash size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {initialData ? 'Update Existing Package' : 'Register New Activity Package'}
              </h3>
              <p className="text-[10px] text-slate-400">
                Target Route: <span className="font-mono text-sky-600">{getEndpoint(category)}</span>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Validation Errors */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Module Category Selector */}
          <div>
            <label className="block font-bold text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">
              Module Package Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {MODULE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = category === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={!!initialData}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                      isSelected ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Automatic Trip ID & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">
                {initialData ? 'Trip ID (Locked)' : 'Automatic Trip ID'} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  readOnly={!!initialData}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-700 focus:outline-none"
                />
                {!initialData && (
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 cursor-pointer"
                    title="Generate another Trip ID"
                  >
                    <RefreshCw size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">
                Package / Itinerary Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Annapurna Circuit Trek / Everest Heli Tour"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Pricing, Currency & Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">
                {category === 'HELI_TOUR' ? 'Duration (Hours) *' : 'Duration (Days) *'}
              </label>
              <input
                type="number"
                min="1"
                required
                value={category === 'HELI_TOUR' ? durationHours : durationDays}
                onChange={(e) => category === 'HELI_TOUR' ? setDurationHours(e.target.value) : setDurationDays(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">
                Base Price *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">
                Currency *
              </label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">
                Himalayan Region
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Khumbu / Annapurna"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* DYNAMIC MODULE 1: MOUNTAIN EXPEDITION */}
          {category === 'MOUNTAIN_EXPEDITION' && (
            <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl space-y-3">
              <span className="font-bold text-sky-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Mountain size={13} /> Mountain Expedition Parameters (MountainExpeditionRequest)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Mountain Peak Name *</label>
                  <input
                    type="text"
                    required
                    value={mountainName}
                    onChange={(e) => setMountainName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Peak Height (Meters) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={mountainHeight}
                    onChange={(e) => setMountainHeight(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC MODULE 2: TREKKING */}
          {category === 'TREKKING' && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-3">
              <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Footprints size={13} /> Trekking Parameters (TrekkingRequest)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Max Altitude (Meters) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={trekMaxAltitude}
                    onChange={(e) => setTrekMaxAltitude(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Daily Walking Hours</label>
                  <input
                    type="text"
                    value={walkingHours}
                    onChange={(e) => setWalkingHours(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Difficulty Level</label>
                  <input
                    type="text"
                    value={trekDifficulty}
                    onChange={(e) => setTrekDifficulty(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC MODULE 3: TOUR */}
          {category === 'TOUR' && (
            <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-3">
              <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <MapPin size={13} /> Tour Package Parameters (TourPackageRequest)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Package Type *</label>
                  <input
                    type="text"
                    required
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    placeholder="e.g. Cultural Heritage / Wildlife Safari"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Start Location</label>
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC MODULE 4: PEAK CLIMBING */}
          {category === 'PEAK_CLIMBING' && (
            <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-3">
              <span className="font-bold text-purple-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Compass size={13} /> Peak Climbing Parameters (PeakClimbingRequest)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Peak Name *</label>
                  <input
                    type="text"
                    required
                    value={peakName}
                    onChange={(e) => setPeakName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Peak Elevation (Meters) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={peakHeight}
                    onChange={(e) => setPeakHeight(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC MODULE 5: HELI TOUR */}
          {category === 'HELI_TOUR' && (
            <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-3">
              <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Plane size={13} /> Heli Tour Parameters (HeliTourRequest)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Helicopter Model</label>
                  <input
                    type="text"
                    value={helicopterType}
                    onChange={(e) => setHelicopterType(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1 text-[10px]">Landing Location</label>
                  <input
                    type="text"
                    value={landingLocation}
                    onChange={(e) => setLandingLocation(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Overview Short Description */}
          <div>
            <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">
              Short Description (Max 1000 Chars)
            </label>
            <textarea
              rows={2}
              maxLength={1000}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Highlights, logistical overview, and inclusions..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          {/* Active Switch */}
          <div>
            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded text-sky-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-700">Open for Commercial Booking</span>
            </label>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 sticky bottom-0 bg-white">
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
              className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/25 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting to Backend...' : initialData ? 'Update Activity' : 'Publish Activity'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}