import axiosClient from './axiosClient';

export const dashboardApi = {
  getKPIStats: async () => {
    const [bookingsRes, assignmentsRes] = await Promise.all([
      axiosClient.get('/bookings'),
      axiosClient.get('/logistics/assignments').catch(() => ({ data: [] })),
    ]);
    const bookings = bookingsRes.data || [];
    const assignments = assignmentsRes.data || [];
    const confirmed = bookings.filter((b) => b.bookingStatus === 'CONFIRMED');
    return {
      activeTrips: bookings.filter((b) => b.bookingStatus !== 'CANCELLED').length,
      upcomingTrips: confirmed.length,
      pendingBriefings: assignments.filter((a) => !a.briefingSent).length,
      revenue: confirmed.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0),
    };
  },

  getUpcomingTrips: async () => {
    const res = await axiosClient.get('/bookings');
    return (res.data || []).slice(0, 8);
  },

  dispatchBriefings: async () => {
    const res = await axiosClient.post('/logistics/briefings/dispatch');
    return res.data;
  },
};
