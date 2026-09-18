import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls({ 
  currentPage, 
  totalPages, 
  totalElements, 
  pageSize, 
  onPageChange 
}) {
  if (totalPages <= 1) return null;

  const startRecord = currentPage * pageSize + 1;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-white/80 rounded-b-2xl">
      <div className="text-[11px] font-semibold text-slate-400">
        Showing <span className="text-slate-700 font-bold">{startRecord}</span> to{' '}
        <span className="text-slate-700 font-bold">{endRecord}</span> of{' '}
        <span className="text-slate-700 font-bold">{totalElements}</span> entries
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={14} /> Previous
        </button>

        <span className="text-xs font-mono font-bold text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">
          {currentPage + 1} / {totalPages}
        </span>

        <button
          type="button"
          disabled={currentPage + 1 >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}