import axiosClient from './axiosClient';

export const financeApi = {
  // Fetch financial summary and itemized expenses for a booking
  getBookingSummary: (bookingId) =>
    axiosClient.get(`/financials/summary/booking/${bookingId}`).then((res) => res.data),

  // Fetch list of expenses for a booking
  getExpensesByBooking: (bookingId) =>
    axiosClient.get(`/financials/expenses/booking/${bookingId}`).then((res) => res.data),

  // Record a field expense line item
  recordExpense: (payload) =>
    axiosClient.post('/financials/expenses', payload).then((res) => res.data),
};