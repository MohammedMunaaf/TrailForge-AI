'use client';

import React from 'react';

export default function PackingList({ packingList = [], onToggle, loading }) {
  if (!packingList || packingList.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-400">
        <p className="text-sm">No packing recommendations generated yet.</p>
      </div>
    );
  }

  // Group items by category
  const categories = ['Documents', 'Clothing', 'Gear', 'Other'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">⛈️</span>
        <h3 className="text-xl font-bold text-white">AI Weather-Aware Packing Assistant</h3>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Based on your destination climate and activities, the AI generated a customized checklist:
      </p>

      <div className="space-y-6">
        {categories.map((category) => {
          const items = packingList.filter(item => item.category === category);
          if (items.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                {category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((item) => (
                  <div
                    key={item._id || item.item}
                    onClick={() => !loading && onToggle(item._id || item.item)}
                    className={`flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition select-none ${
                      item.isPacked ? 'bg-slate-900/40 border-emerald-950/20' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.isPacked}
                      onChange={() => {}} // toggling is handled by div onClick
                      disabled={loading}
                      className="h-4 w-4 rounded bg-slate-950 border-slate-800 accent-emerald-500 cursor-pointer"
                    />
                    <span className={`text-sm transition ${item.isPacked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
