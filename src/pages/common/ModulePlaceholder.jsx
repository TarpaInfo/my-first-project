import React from 'react';
import { Construction } from 'lucide-react';

export default function ModulePlaceholder({ title, description }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-4xl mx-auto my-8 shadow-sm">
      <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Construction size={28} />
      </div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">{description}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button 
          onClick={() => window.history.back()} 
          className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}