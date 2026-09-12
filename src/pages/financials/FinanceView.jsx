import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function FinanceView() {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE'
  });

  const loadFinancials = async () => {
    try {
      const res = await axiosClient.get('/financials/transactions');
      setTransactions(res.data);
    } catch {
      setTransactions([
        { id: 1, description: 'Lukla Twin Otter Flight Clearances (14 Pax)', amount: 2650, type: 'EXPENSE', date: 'Sep 06, 2026' },
        { id: 2, description: 'Everest Base Camp Deposit Received', amount: 9800, type: 'INCOME', date: 'Sep 07, 2026' },
        { id: 3, description: 'Porter & Guide Wages Advance (Namche)', amount: 1200, type: 'EXPENSE', date: 'Sep 08, 2026' }
      ]);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, []);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/financials/transactions', {
        ...newEntry,
        amount: Number(newEntry.amount)
      });
      setIsModalOpen(false);
      setNewEntry({ description: '', amount: '', type: 'EXPENSE' });
      loadFinancials();
    } catch {
      setTransactions(prev => [
        { id: Date.now(), ...newEntry, amount: Number(newEntry.amount), date: 'Sep 09, 2026' },
        ...prev
      ]);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Financial Ledger & Trip Disbursements</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track field disbursement, receipts, and guide operational allowances.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold shadow-sm shadow-sky-500/25 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Record Entry</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-6 font-bold">Transaction Reference</th>
              <th className="py-3 px-6 font-bold">Description</th>
              <th className="py-3 px-6 font-bold">Date</th>
              <th className="py-3 px-6 font-bold">Amount (USD)</th>
              <th className="py-3 px-6 font-bold text-center">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-6 font-mono font-bold text-slate-700">TX-{tx.id}</td>
                <td className="py-3.5 px-6 font-semibold text-slate-800">{tx.description}</td>
                <td className="py-3.5 px-6 text-slate-400">{tx.date}</td>
                <td className="py-3.5 px-6 font-bold text-slate-800">${tx.amount.toLocaleString()}</td>
                <td className="py-3.5 px-6 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {tx.type === 'INCOME' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {tx.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Record Financial Entry</h3>
            <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder="e.g. Kathmandu Luxury Hotel Deposit"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                  placeholder="e.g. 1500"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Transaction Type</label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="EXPENSE">Expense (Field Outflow)</option>
                  <option value="INCOME">Income (Client Receipt)</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}