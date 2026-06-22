'use client';

import React, { useState } from 'react';

const INTEREST_OPTIONS = [
  'Food', 'Culture', 'Adventure', 'Shopping',
  'Nightlife', 'Nature', 'History', 'Wellness'
];

export default function CreateTripForm({ onSubmit, loading }) {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState('Medium');
  const [interests, setInterests] = useState([]);

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;
    onSubmit({
      destination,
      durationDays,
      budgetTier,
      interests
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Where do you want to go?
        </label>
        <input
          type="text"
          placeholder="e.g. Tokyo, Paris, Bali"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          disabled={loading}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Duration (Days)
          </label>
          <input
            type="number"
            min="1"
            max="15"
            required
            value={durationDays}
            onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Budget Preference
          </label>
          <select
            value={budgetTier}
            onChange={(e) => setBudgetTier(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm"
          >
            <option value="Low">Low (Budget Friendly)</option>
            <option value="Medium">Medium (Mid-Range)</option>
            <option value="High">High (Luxury)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Interests (Select all that apply)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {INTEREST_OPTIONS.map((interest) => {
            const isSelected = interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                disabled={loading}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-center ${isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !destination.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating Secure Itinerary via Gemini AI...
          </>
        ) : (
          <span>Plan My Trip ✈️</span>
        )}
      </button>
    </form>
  );
}
