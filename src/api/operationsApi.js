import axiosClient from './axiosClient';
import { documentApi } from './documentApi';

export const operationsApi = {
  uploadDocument: documentApi.uploadDocument,

  getAllDocuments: async () => {
    const res = await axiosClient.get('/documents');
    return res.data || [];
  },

  downloadDocument: async (storedFileName, originalFileName) => {
    const url = documentApi.getDownloadUrl(storedFileName);
    const token = localStorage.getItem('satori_token');
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.setAttribute('download', originalFileName || storedFileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  },

  getStaffDirectory: async () => {
    const res = await axiosClient.get('/logistics/staff');
    return res.data || [];
  },

  createStaffMember: async (staffData) => {
    const res = await axiosClient.post('/logistics/staff', {
      fullName: staffData.fullName,
      role: staffData.role,
      email: staffData.email,
      phoneNumber: staffData.phone || staffData.phoneNumber,
      licenseNumber: staffData.licenseNumber || '',
    });
    return res.data;
  },

  // --- Staff CV Upload & CRUD ---

  uploadStaffCv: async (staffId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axiosClient.post(`/logistics/staff/${staffId}/cv`, formData, {
      transformRequest: [(data) => data],
      headers: {
        'Content-Type': undefined, // Overrides default application/json header
      },
    });
    return res.data;
  },

  updateStaffMember: async (staffId, staffData) => {
    const res = await axiosClient.put(`/logistics/staff/${staffId}`, {
      fullName: staffData.fullName,
      role: staffData.role,
      email: staffData.email,
      phoneNumber: staffData.phone || staffData.phoneNumber,
      licenseNumber: staffData.licenseNumber || '',
    });
    return res.data;
  },

  deleteStaffMember: async (staffId) => {
    const res = await axiosClient.delete(`/logistics/staff/${staffId}`);
    return res.data;
  },

  // --------------------------------------------

  getDepartures: async () => {
    const [bookingsRes, assignmentsRes] = await Promise.all([
      axiosClient.get('/bookings'),
      axiosClient.get('/logistics/assignments').catch(() => ({ data: [] })),
    ]);
    const bookings = bookingsRes.data || [];
    const assignments = assignmentsRes.data || [];
    const guideByBooking = {};
    assignments.forEach((a) => {
      const name = a.staff?.fullName;
      if (name && a.bookingId != null) guideByBooking[a.bookingId] = name;
    });
    return bookings.map((b) => ({
      id: b.id,
      route: b.packageName || 'Expedition',
      startDate: b.travelDate,
      endDate: b.travelDate,
      pax: b.numberOfTravelers || 1,
      guide: guideByBooking[b.id] || 'Unassigned',
      status: b.bookingStatus || 'PENDING',
      bookingCode: b.bookingCode,
      clientName: b.clientName,
    }));
  },
};