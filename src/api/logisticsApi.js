import axiosClient from './axiosClient';

export const logisticsApi = {
  dispatchBriefing: async () => {
    const res = await axiosClient.post('/logistics/briefings/dispatch');
    return res.data;
  },

  getAssignments: async () => {
    const res = await axiosClient.get('/logistics/assignments');
    return res.data || [];
  },
};
