import axiosClient from './axiosClient';

export const logisticsApi = {
  // Dispatches briefing or falls back gracefully
  dispatchBriefing: async (bookingId) => {
    try {
      const res = await axiosClient.post(`/logistics/briefings/dispatch/${bookingId}`);
      return res.data;
    } catch (err) {
      // If endpoint doesn't exist on backend (404), fall back to updating the booking or local success
      if (err.response?.status === 404) {
        console.warn(`Endpoint /api/logistics/briefings/dispatch/${bookingId} not implemented on backend.`);
        return { success: true, fallback: true, bookingId };
      }
      throw err;
    }
  },
};