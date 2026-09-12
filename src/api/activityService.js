import axiosClient from './axiosClient';

// Configuration for each Red Activity Module
export const ACTIVITY_MODULES = {
  TREKKING: {
    key: 'TREKKING',
    label: 'Trekking',
    prefix: 'TRK',
    packagesUrl: '/activities/trekking',
    itineraryUrl: '/activities/trekking-itineraries/trekking',
  },
  MOUNTAIN_EXPEDITION: {
    key: 'MOUNTAIN_EXPEDITION',
    label: 'Mountain Expedition',
    prefix: 'EXP',
    packagesUrl: '/activities/mountain-expeditions',
    itineraryUrl: '/activities/mountain-expedition-itineraries/expedition',
  },
  PEAK_CLIMBING: {
    key: 'PEAK_CLIMBING',
    label: 'Peak Climbing',
    prefix: 'PKC',
    packagesUrl: '/activities/peak-climbing',
    itineraryUrl: '/activities/peak-climbing-itineraries/peak-climbing',
  },
  HELI_TOUR: {
    key: 'HELI_TOUR',
    label: 'Heli Tour',
    prefix: 'HLI',
    packagesUrl: '/activities/heli-tours',
    itineraryUrl: '/activities/heli-tour-itineraries/heli-tour',
  },
  TOUR: {
    key: 'TOUR',
    label: 'Tour Packages',
    prefix: 'TUR',
    packagesUrl: '/activities/tour-packages',
    itineraryUrl: '/activities/tour-package-itineraries/tour-package',
  },
};

export const activityService = {
  // 1. Calculate the exact sequential code for the chosen activity (e.g., TRK-2026-01)
  getNextCode: async (category = 'TREKKING') => {
    const config = ACTIVITY_MODULES[category] || ACTIVITY_MODULES.TREKKING;
    const prefix = config.prefix;
    const year = new Date().getFullYear();
    const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);

    try {
      const res = await axiosClient.get('/bookings');
      const allBookings = res.data || [];

      let maxSerial = 0;
      allBookings.forEach((b) => {
        const code = b.bookingCode || '';
        const match = code.match(pattern);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxSerial) maxSerial = num;
        }
      });

      const nextSerial = String(maxSerial + 1).padStart(2, '0');
      return `${prefix}-${year}-${nextSerial}`;
    } catch {
      return `${prefix}-${year}-01`;
    }
  },

  // 2. Fetch packages for whichever of the 5 modules is selected
  getPackagesByActivity: async (category = 'TREKKING') => {
    const config = ACTIVITY_MODULES[category] || ACTIVITY_MODULES.TREKKING;
    try {
      const res = await axiosClient.get(config.packagesUrl);
      const data = res.data || [];
      return data.map((item) => ({
        id: item.id,
        code:
          item.packageCode ||
          item.trekkingCode ||
          item.expeditionCode ||
          item.peakCode ||
          item.heliTourCode ||
          `${config.prefix}-${item.id}`,
        title:
          item.packageName ||
          item.trekkingName ||
          item.expeditionName ||
          item.peakName ||
          item.heliTourName ||
          item.name ||
          item.title,
        price: item.price || item.priceUSD || 1500,
        durationDays: item.durationDays || item.days || 14,
        region: item.region || item.destination || 'Nepal',
        difficulty: item.difficulty || 'Moderate',
      }));
    } catch (err) {
      console.warn(`Could not load packages from ${config.packagesUrl}:`, err);
      return [];
    }
  },

  // 3. Fetch day-by-day itineraries for a specific package ID in that activity
  getItineraryByPackageId: async (category, packageId) => {
    if (!packageId) return [];
    const config = ACTIVITY_MODULES[category] || ACTIVITY_MODULES.TREKKING;
    try {
      const res = await axiosClient.get(`${config.itineraryUrl}/${packageId}`);
      const days = res.data || [];
      return days.sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));
    } catch (err) {
      console.warn(`Could not load itinerary from ${config.itineraryUrl}/${packageId}:`, err);
      return [];
    }
  },
};