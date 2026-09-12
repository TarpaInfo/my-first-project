import axiosClient from './axiosClient';

// Map activity category/prefix to its backend controller route
const ENDPOINT_MAP = {
  TREKKING: '/activities/trekking-itineraries/trekking',
  TRK: '/activities/trekking-itineraries/trekking',
  
  MOUNTAIN_EXPEDITION: '/activities/mountain-expedition-itineraries/expedition',
  EXP: '/activities/mountain-expedition-itineraries/expedition',

  PEAK_CLIMBING: '/activities/peak-climbing-itineraries/peak-climbing',
  PKC: '/activities/peak-climbing-itineraries/peak-climbing',

  HELI_TOUR: '/activities/heli-tour-itineraries/heli-tour',
  HLI: '/activities/heli-tour-itineraries/heli-tour',

  TOUR: '/activities/tour-package-itineraries/tour-package',
  TUR: '/activities/tour-package-itineraries/tour-package'
};

export const activityItineraryApi = {
  getItineraryForBooking: async (trip) => {
    if (!trip) return [];

    // 1. Detect activity type from bookingCode prefix (TRK, EXP, PKC, HLI, TUR) or category
    const prefix = trip.bookingCode ? trip.bookingCode.split('-')[0] : 'TRK';
    const endpointPrefix = ENDPOINT_MAP[trip.category] || ENDPOINT_MAP[prefix] || ENDPOINT_MAP.TRK;

    // 2. Activity ID (tourPackageId or id linked in the booking)
    const targetActivityId = trip.tourPackageId || trip.trekkingId || trip.packageId || trip.id;

    try {
      // Direct call to controller: e.g. GET /api/activities/trekking-itineraries/trekking/2
      const res = await axiosClient.get(`${endpointPrefix}/${targetActivityId}`);
      
      // Sort in ascending day order
      const days = res.data || [];
      return days.sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));
    } catch (err) {
      // Fallback: If no custom activity days registered yet, check general trekking itinerary
      if (err.response?.status === 404) {
        try {
          const fallbackRes = await axiosClient.get(`/activities/trekking-itineraries/trekking/${targetActivityId}`);
          return fallbackRes.data || [];
        } catch {
          return [];
        }
      }
      return [];
    }
  }
};