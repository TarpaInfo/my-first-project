import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  DollarSign, 
  Calendar, 
  UserCheck, 
  FileText, 
  Plus, 
  AlertCircle 
} from 'lucide-react';
import { financeApi } from '../../api/financeApi';

const EXPENSE_CATEGORIES = [
  { id: 'GUIDE_WAGE', label: 'Guide Daily Wage / Fee' },
  { id: 'PORTER_WAGE', label: 'Porter Daily Wage / Tip' },
  { id: 'TEAHOUSE_MEALS_LODGING', label: 'Teahouse Lodging & Meals' },
  { id: 'PERMIT_AND_PARK_FEES', label: 'TIMS / National Park / Municipal Fee' },
  { id: 'LOCAL_TRANSPORT_MULE', label: 'Local Jeep / Mule / Yak Logistics' },
  { id: 'EMERGENCY_MEDICAL', label: 'Medical / First-Aid / Emergency Kit' },
  { id: 'MISCELLANEOUS', label: 'Miscellaneous Supplies & Fuel' }
];

export default function NewExpenseModal({ isOpen, onClose, bookingId, onExpenseAdded }) {
  const [category, setCategory] = useState('TEAHOUSE_MEALS_LODGING');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NPR');
  const [paidTo, setPaidTo] = useState('');
  const [receiptInvoiceNumber, setReceiptInvoiceNumber] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid expense amount.');
      return;
    }
    if (!paidTo.trim()) {
      setError('Please specify who received the payment.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await financeApi.recordExpense({
        bookingId: Number(bookingId),
        category,
        amount: Number(amount),
        currency,
        paidTo: paidTo.trim(),
        receiptInvoiceNumber: receiptInvoiceNumber.trim() || null,
        expenseDate,
        notes: notes.trim() || null
      });

      onClose();
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Receipt size={17} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Record Field Expense</h3>
              <p className="text-[10px] text-slate-400">Post guide wage, lodge invoice, or logistics cost</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Expense Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Amount Paid *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 14500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
              >
                <option value="NPR">NPR (रू)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Paid To (Recipient / Entity) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Namche Hilltop Lodge, Pasang Sherpa (Guide), Sagarmatha Entry"
              value={paidTo}
              onChange={(e) => setPaidTo(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Receipt / Bill Number
              </label>
              <input
                type="text"
                placeholder="e.g., REC-89102"
                value={receiptInvoiceNumber}
                onChange={(e) => setReceiptInvoiceNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Field Notes / Remarks
            </label>
            <textarea
              rows={2}
              placeholder="e.g., 3 rooms for 2 nights + hot shower charge for clients"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}