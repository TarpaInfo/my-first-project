import axiosClient from './axiosClient';

// Exact mappings matching your Spring Boot controllers
const ENDPOINT_MAP = {
  HELI_TOUR: '/activities/heli-tours',
  MOUNTAIN_EXPEDITION: '/activities/mountain-expedition',
  PEAK_CLIMBING: '/activities/peak-climbings',
  TOUR: '/activities/tour-packages',
  TREKKING: '/activities/trekkings',
};

export const getEndpoint = (category) => {
  if (!category) return '/activities/trekkings';
  const clean = String(category).trim().toUpperCase();
  return ENDPOINT_MAP[clean] || '/activities/trekkings';
};

export const packagesApi = {
  getEndpoint,

  // 1. Fetch activities (single category or all 5 aggregated)
  getAllPackages: async (category = 'ALL', search = '') => {
    try {
      if (category !== 'ALL') {
        const endpoint = getEndpoint(category);
        const res = await axiosClient.get(endpoint, {
          params: search ? { search } : undefined,
        });
        return (res.data || []).map((item) => ({ ...item, category }));
      }

      // If 'ALL', query each controller in parallel
      const keys = Object.keys(ENDPOINT_MAP);
      const responses = await Promise.allSettled(
        keys.map((cat) =>
          axiosClient.get(ENDPOINT_MAP[cat]).then((res) =>
            (res.data || []).map((item) => ({ ...item, category: cat }))
          )
        )
      );

      return responses
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => r.value);
    } catch (err) {
      console.warn('Backend activity fetch failed:', err);
      return [];
    }
  },

  // 2. Dynamic CREATE: dispatches to the correct controller
  createPackage: async (payload) => {
    const endpoint = getEndpoint(payload.category);
    const res = await axiosClient.post(endpoint, payload);
    return res.data;
  },

  // 3. Dynamic UPDATE: dispatches to the correct controller
  updatePackage: async (category, id, payload) => {
    const endpoint = getEndpoint(category);
    const res = await axiosClient.put(`${endpoint}/${id}`, payload);
    return res.data;
  },

  // 4. Dynamic DELETE: dispatches to the correct controller
  deletePackage: async (category, id) => {
    const endpoint = getEndpoint(category);
    const res = await axiosClient.delete(`${endpoint}/${id}`);
    return res.data;
  },
};