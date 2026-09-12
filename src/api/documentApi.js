import axiosClient from './axiosClient';

export const documentApi = {
  // Upload a physical document (Passport, Insurance, Permit, etc.)
  uploadDocument: async ({ file, bookingId, clientId, documentType }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', bookingId);
    formData.append('clientId', clientId);
    formData.append('documentType', documentType);

    const res = await axiosClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Fetch all documents uploaded for a specific booking
  getDocumentsByBooking: async (bookingId) => {
    const res = await axiosClient.get(`/documents/booking/${bookingId}`);
    return res.data || [];
  },

  // Direct download / preview URL helper
  getDownloadUrl: (storedFileName) => {
    const baseURL = axiosClient.defaults.baseURL || 'http://localhost:8080/api';
    return `${baseURL}/documents/download/${storedFileName}`;
  },
};