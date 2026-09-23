import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  RotateCw, 
  Plus, 
  DollarSign, 
  Calendar, 
  UserCheck, 
  FileText, 
  CreditCard,
  Building2,
  TrendingDown,
  TrendingUp,
  Search
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { financeApi } from '../../api/financeApi';
import NewExpenseModal from '../../components/modals/NewExpenseModal';

export default function FinancialLedger() {
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load active bookings dropdown
  useEffect(() => {
    axiosClient.get('/bookings?page=0&size=50&sort=id,desc')
      .then((res) => {
        const list = res.data?.content || res.data || [];
        setBookings(list);
        if (list.length > 0) {
          setSelectedBookingId(list[0].id);
          setSelectedBooking(list[0]);
        }
      })
      .catch(() => setBookings([]));
  }, []);

  const loadFinancialData = async (bId) => {
    if (!bId) return;
    setLoading(true);
    try {
      const [sumRes, expList] = await Promise.all([
        financeApi.getBookingSummary(bId).catch(() => null),
        financeApi.getExpensesByBooking(bId).catch(() => [])
      ]);
      setSummary(sumRes);
      setExpenses(expList || []);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBookingId) {
      const b = bookings.find((item) => String(item.id) === String(selectedBookingId));
      setSelectedBooking(b || null);
      loadFinancialData(selectedBookingId);
    }
  }, [selectedBookingId, bookings]);

  // Aggregate stats
  const totalNprExpenses = expenses
    .filter(e => (e.currency || 'NPR') === 'NPR')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const totalUsdExpenses = expenses
    .filter(e => e.currency === 'USD')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const revenueUsd = Number(selectedBooking?.totalAmount || 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Receipt size={24} className="text-emerald-600" />
            Field Financial Settlement & Guide Advance Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track lodge invoices, porter wages, TIMS fees, and real-time field cash settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!selectedBookingId}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Plus size={14} />
            <span>Record Field Expense</span>
          </button>
          <button
            type="button"
            disabled={loading || !selectedBookingId}
            onClick={() => loadFinancialData(selectedBookingId)}
            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 shadow-xs cursor-pointer transition disabled:opacity-50"
          >
            <RotateCw size={15} className={loading ? 'animate-spin text-emerald-600' : ''} />
          </button>
        </div>
      </div>

      {/* Select Expedition Trip */}
      <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Trip File:</span>
        </div>
        <select
          value={selectedBookingId}
          onChange={(e) => setSelectedBookingId(e.target.value)}
          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 max-w-xl w-full focus:outline-none focus:border-emerald-500"
        >
          {bookings.map((b) => (
            <option key={b.id} value={b.id}>
              [{b.bookingCode}] {b.clientName || 'Lead Trekker'} — {b.packageName || 'Expedition'} (${b.totalAmount || 0} USD)
            </option>
          ))}
        </select>
      </div>

      {/* Financial Health Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Trip Revenue */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Trip Revenue</span>
            <TrendingUp size={15} className="text-emerald-500" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-800">
            ${revenueUsd.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Client: <strong className="text-slate-700">{selectedBooking?.clientName || 'N/A'}</strong>
          </p>
        </div>

        {/* NPR Field Disbursals */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Trail Expenses (NPR)</span>
            <TrendingDown size={15} className="text-rose-500" />
          </div>
          <p className="text-xl font-bold font-mono text-rose-600">
            रू {totalNprExpenses.toLocaleString()} <span className="text-xs font-normal text-slate-400">NPR</span>
          </p>
          <p className="text-[11px] text-slate-500">
            {expenses.length} Itemized Receipt(s) filed
          </p>
        </div>

        {/* USD Trail Disbursals / Margin */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">USD Direct Outlays</span>
            <CreditCard size={15} className="text-sky-500" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-800">
            ${totalUsdExpenses.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            Status: {selectedBooking?.paymentStatus || 'Verified'}
          </p>
        </div>
      </div>

      {/* Itemized Expenses Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Itemized Field Receipts & Cost Ledger ({expenses.length})
          </h2>
        </div>

        {expenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No expenses or field receipts recorded for this trip file yet. Click &ldquo;Record Field Expense&rdquo; above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Paid To</th>
                  <th className="px-4 py-3">Bill / Receipt #</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                      {item.expenseDate || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700">
                        {String(item.category || '').replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {item.paidTo}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {item.receiptInvoiceNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                      {item.notes || '—'}
                    </td>
                    <td className="px-4 py-3 font-bold font-mono text-right whitespace-nowrap text-slate-900">
                      {item.currency === 'USD' ? '$' : 'रू '}
                      {Number(item.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <NewExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingId={selectedBookingId}
        onExpenseAdded={() => loadFinancialData(selectedBookingId)}
      />

    </div>
  );
}