import axiosClient from './axiosClient';

export const expeditionApi = {
  // Fetch paginated logs (optional category filter)
  getLogs: (category = null, page = 0, size = 15) => {
    const params = new URLSearchParams({ page, size, sort: 'timestamp,desc' });
    if (category && category !== 'ALL') {
      params.append('category', category);
    }
    return axiosClient.get(`/expedition-logs?${params.toString()}`).then((res) => res.data);
  },

  // Fetch telemetry logs for a specific trip
  getLogsByBooking: (bookingId) => 
    axiosClient.get(`/expedition-logs/booking/${bookingId}`).then((res) => res.data),

  // Submit a waypoint check-in or incident report
  createLog: (payload) => 
    axiosClient.post('/expedition-logs', payload).then((res) => res.data),
};