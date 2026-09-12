import axiosClient from "./axiosClient";
import { packagesApi } from "./packagesApi";

const PREFIX_MAP = {
  TREKKING: "TRK",
  MOUNTAIN_EXPEDITION: "EXP",
  PEAK_CLIMBING: "PKC",
  HELI_TOUR: "HLI",
  TOUR: "TUR",
};

export const bookingApi = {
  // 1. Calculate next sequential Booking Code (e.g., TRK-2026-01, TRK-2026-02)
  getNextBookingCode: async (category = "TREKKING") => {
    try {
      const prefix = PREFIX_MAP[category] || "TRK";
      const year = new Date().getFullYear();
      const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);

      const res = await axiosClient.get("/bookings");
      const allBookings = res.data || [];

      let maxSerial = 0;
      allBookings.forEach((b) => {
        const code = b.bookingCode || "";
        const match = code.match(pattern);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxSerial) maxSerial = num;
        }
      });

      const nextSerial = String(maxSerial + 1).padStart(2, "0");
      return `${prefix}-${year}-${nextSerial}`;
    } catch {
      const prefix = PREFIX_MAP[category] || "TRK";
      const year = new Date().getFullYear();
      return `${prefix}-${year}-01`;
    }
  },

  // 2. Fetch packages for the selected category
  getPackagesByCategory: async (category = "TOUR") => {
    try {
      const data = await packagesApi.getAllPackages(category);
      return (data || []).map((item) => ({
        id: item.id,
        code:
          item.packageCode ||
          item.trekkingCode ||
          item.expeditionCode ||
          item.peakCode ||
          item.heliTourCode ||
          `PKG-${item.id}`,
        title:
          item.packageName ||
          item.trekkingName ||
          item.expeditionName ||
          item.peakName ||
          item.heliTourName ||
          item.name ||
          item.title,
        price: item.price || item.priceUSD || 0,
        region: item.region || item.destination || "Nepal",
        category,
      }));
    } catch (err) {
      console.warn(`Failed to fetch packages for ${category}`, err);
      return [];
    }
  },

  // 3. Fetch existing clients list
  getClients: async () => {
    try {
      const res = await axiosClient.get("/clients");
      return (res.data || []).map((c) => ({
        id: c.id,
        fullName:
          c.fullName ||
          `${c.firstName || ""} ${c.lastName || ""}`.trim() ||
          c.name,
        email: c.email,
        phone: c.phone,
        nationality: c.nationality,
      }));
    } catch {
      return [];
    }
  },

  // 4. Register client on-the-fly to acquire valid clientId
  createClient: async (clientData) => {
    const names = (clientData.fullName || "Client").trim().split(" ");
    const firstName = names[0];
    const lastName = names.slice(1).join(" ") || "Traveler";

    const payload = {
      firstName,
      lastName,
      fullName: clientData.fullName,
      email: clientData.email,
      phone: clientData.phone,
      nationality: clientData.nationality || "International",
      active: true,
    };
    const res = await axiosClient.post("/clients", payload);
    return res.data;
  },

  // 5. Register custom route as a tour package to acquire valid tourPackageId
  createQuickPackage: async (pkgData) => {
    const payload = {
      packageCode: `PKG-CUST-${Math.floor(100 + Math.random() * 900)}`,
      packageName: pkgData.title,
      packageType: "Custom Trek & Tour",
      destination: "Nepal",
      durationDays: Number(pkgData.durationDays || 14),
      durationNights: Number(
        pkgData.durationDays ? pkgData.durationDays - 1 : 13,
      ),
      price: Number(pkgData.price || 1500),
      currency: "USD",
      difficulty: "Moderate",
      active: true,
    };
    const res = await axiosClient.post("/activities/tour-packages", payload);
    return res.data;
  },

  // 6. Submit Booking matching BookingRequest.java
  createBooking: async (payload) => {
    const res = await axiosClient.post("/bookings", payload);
    return res.data;
  },

  // 7. Update booking status (e.g. from PENDING to CONFIRMED, which triggers Spring Boot AlertService)
  confirmBooking: async (bookingId, currentBooking) => {
    const payload = {
      bookingCode: currentBooking.bookingCode,
      clientId: currentBooking.clientId,
      tourPackageId: currentBooking.tourPackageId || 1,
      travelDate: currentBooking.travelDate,
      numberOfTravelers: currentBooking.numberOfTravelers || 1,
      totalAmount: currentBooking.totalAmount || 0,
      currency: currentBooking.currency || "USD",
      bookingStatus: "CONFIRMED",
      paymentStatus: "PAID",
      specialRequest:
        currentBooking.specialRequest || "Confirmed by Internal Operations",
      active: true,
      requiresAirportTransfer: true,
      vehicleDetails:
        currentBooking.transferLocation || "Assigned Logistics Pickup",
    };
    const res = await axiosClient.put(`/bookings/${bookingId}`, payload);
    return res.data;
  },

  // 8. Fetch all bookings
  getAllTrips: async () => {
    try {
      const res = await axiosClient.get("/bookings");
      return res.data || [];
    } catch {
      return [];
    }
  },

  // Update existing booking details (dates, pax, price, status, notes)
  updateBooking: async (bookingId, payload) => {
    const res = await axiosClient.put(`/bookings/${bookingId}`, payload);
    return res.data;
  },

  // Delete / cancel trip booking
  deleteBooking: async (bookingId) => {
    const res = await axiosClient.delete(`/bookings/${bookingId}`);
    return res.data;
  },
};
