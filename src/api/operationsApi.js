import axiosClient from './axiosClient';

export const operationsApi = {
  // --- Document Vault (Multipart) ---
  uploadDocument: async (formData) => {
    const res = await axiosClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getAllDocuments: async () => {
    const res = await axiosClient.get('/documents');
    return res.data;
  },

  downloadDocument: async (id, fileName) => {
    const res = await axiosClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    // Create download trigger in browser
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || `document-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // --- Staff & Guides Directory ---
  getStaffDirectory: async () => {
    const res = await axiosClient.get('/users/staff');
    return res.data;
  },

  createStaffMember: async (staffData) => {
    const res = await axiosClient.post('/users/staff', staffData);
    return res.data;
  },

  // --- Departures & Calendar ---
  getDepartures: async () => {
    const res = await axiosClient.get('/bookings/schedule');
    return res.data;
  }
};