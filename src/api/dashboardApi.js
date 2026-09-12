import axiosClient from './axiosClient';

export const dashboardApi = {
  getKPIStats: async () => {
    try {
      const res = await axiosClient.get('/logistics/assignments');
      const assignments = res.data || [];
      return {
        activeTrips: assignments.length,
        upcomingTrips: Math.max(assignments.length - 2, 0),
        pendingBriefings: assignments.filter(a => !a.briefingSent).length,
        revenue: 48500
      };
    } catch {
      return { activeTrips: 18, upcomingTrips: 7, pendingBriefings: 4, revenue: 48500 };
    }
  },

  getUpcomingTrips: async () => {
    try {
      const res = await axiosClient.get('/logistics/assignments');
      return res.data.slice(0, 4);
    } catch {
      return [];
    }
  },

  dispatchBriefings: async () => {
    const res = await axiosClient.post('/logistics/briefings/dispatch');
    return res.data;
  }
};