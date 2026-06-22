'use client';

import React, { useState } from 'react';
import { Plus, Trash, RefreshCw, Clock, DollarSign } from 'lucide-react';

export default function ItineraryCard({ trip, onUpdate, onRegenerateDay, loading }) {
  const [newActivities, setNewActivities] = useState({}); // { [dayNumber]: { title: '', description: '', estimatedCostUSD: 0, timeOfDay: 'Morning' } }
  const [regenPrompts, setRegenPrompts] = useState({}); // { [dayNumber]: '' }
  const [regenLoading, setRegenLoading] = useState({}); // { [dayNumber]: boolean }

  const handleFieldChange = (dayNumber, field, value) => {
    setNewActivities(prev => ({
      ...prev,
      [dayNumber]: {
        ...prev[dayNumber],
        [field]: value
      }
    }));
  };

  const recalcBudget = (updatedItinerary, trip) => {
    let totalActivitiesCost = 0;

    updatedItinerary.forEach(day => {
      day.activities.forEach(activity => {
        totalActivitiesCost += activity.estimatedCostUSD || 0;
      });
    });

    return {
      ...trip.estimatedBudget,
      activities: totalActivitiesCost,
      total:
        trip.estimatedBudget.transport +
        trip.estimatedBudget.accommodation +
        trip.estimatedBudget.food +
        totalActivitiesCost
    };
  };

  const handleAddActivity = async (dayNumber) => {
    const actData = newActivities[dayNumber];
    if (!actData || !actData.title?.trim()) return;

    const newActivity = {
      title: actData.title,
      description: actData.description || 'Added by traveler',
      estimatedCostUSD: parseFloat(actData.estimatedCostUSD) || 0,
      timeOfDay: actData.timeOfDay || 'Morning'
    };

    const updatedItinerary = trip.itinerary.map(day => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: [...day.activities, newActivity]
        };
      }
      return day;
    });

    const updatedBudget = recalcBudget(updatedItinerary, trip);

    await onUpdate({
      itinerary: updatedItinerary,
      estimatedBudget: updatedBudget
    });

    // Reset inputs
    setNewActivities(prev => ({
      ...prev,
      [dayNumber]: { title: '', description: '', estimatedCostUSD: 0, timeOfDay: 'Morning' }
    }));
  };

  const handleRemoveActivity = async (dayNumber, activityIndex) => {
    const updatedItinerary = trip.itinerary.map(day => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          activities: day.activities.filter((_, idx) => idx !== activityIndex)
        };
      }
      return day;
    });

    const updatedBudget = recalcBudget(updatedItinerary, trip);

    await onUpdate({
      itinerary: updatedItinerary,
      estimatedBudget: updatedBudget
    });
  };

  const handleRegenerate = async (dayNumber) => {
    const promptText = regenPrompts[dayNumber];
    if (!promptText || !promptText.trim()) return;

    setRegenLoading(prev => ({ ...prev, [dayNumber]: true }));
    try {
      await onRegenerateDay(dayNumber, promptText);
      setRegenPrompts(prev => ({ ...prev, [dayNumber]: '' }));
    } catch (error) {
      console.error('Failed to regenerate day:', error);
    } finally {
      setRegenLoading(prev => ({ ...prev, [dayNumber]: false }));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Day-by-Day Timeline</h2>
        <p className="text-xs text-slate-400 mt-1">Customize your itinerary by adding, removing, or regenerating days.</p>
      </div>

      <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
        {trip.itinerary.map((day) => {
          const dayAct = newActivities[day.dayNumber] || { title: '', description: '', estimatedCostUSD: 0, timeOfDay: 'Morning' };
          const isRegenning = regenLoading[day.dayNumber];

          return (
            <div key={day.dayNumber} className="pl-8 relative group">
              {/* Timeline marker */}
              <div className="absolute left-[3px] top-[6px] w-5 h-5 bg-indigo-600 rounded-full border-4 border-slate-900 shadow-md group-hover:scale-110 transition" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <h3 className="text-lg font-bold text-white">Day {day.dayNumber}</h3>
                <span className="text-xs font-mono bg-slate-800/80 border border-slate-700/50 text-slate-300 px-2 py-0.5 rounded-md">
                  {day.activities.length} activities
                </span>
              </div>

              {/* Day activities list */}
              <div className="space-y-3 mb-5">
                {day.activities.map((act, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between bg-slate-800/40 hover:bg-slate-800/70 border border-slate-850 p-3.5 rounded-xl transition"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-200 text-sm">{act.title}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-950/50 text-indigo-300 border border-indigo-900/30 px-2 py-0.5 rounded-full font-mono">
                          <Clock className="w-2.5 h-2.5" /> {act.timeOfDay}
                        </span>
                        {act.estimatedCostUSD > 0 && (
                          <span className="inline-flex items-center text-[10px] bg-emerald-950/50 text-emerald-300 border border-emerald-900/30 px-2 py-0.5 rounded-full font-mono">
                            <DollarSign className="w-2.5 h-2.5" /> {act.estimatedCostUSD}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{act.description}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveActivity(day.dayNumber, index)}
                      disabled={loading}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-750 transition"
                      title="Remove activity"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {day.activities.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No activities planned for this day.</p>
                )}
              </div>

              {/* Add Activity Inline Form */}
              <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-3.5 space-y-3 mb-4">
                <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-indigo-400" /> Add Custom Activity
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Activity title..."
                    value={dayAct.title || ""}
                    onChange={(e) => handleFieldChange(day.dayNumber, 'title', e.target.value)}
                    disabled={loading}
                    className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={dayAct.timeOfDay || "Morning"}
                      onChange={(e) => handleFieldChange(day.dayNumber, 'timeOfDay', e.target.value)}
                      disabled={loading}
                      className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-2 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 w-full"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Cost (USD)"
                      value={dayAct.estimatedCostUSD || ''}
                      onChange={(e) => handleFieldChange(day.dayNumber, 'estimatedCostUSD', e.target.value)}
                      disabled={loading}
                      className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-2 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Short description (optional)..."
                  value={dayAct.description || ""}
                  onChange={(e) => handleFieldChange(day.dayNumber, 'description', e.target.value)}
                  disabled={loading}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleAddActivity(day.dayNumber)}
                    disabled={loading || !dayAct.title?.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1"
                  >
                    Add Activity
                  </button>
                </div>
              </div>

              {/* Regenerate Specific Day Form */}
              <div className="bg-slate-950/30 border border-dashed border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap self-start sm:self-center mt-1.5 sm:mt-0 font-medium">
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRegenning ? 'animate-spin' : ''}`} />
                  Regen Day {day.dayNumber}:
                </div>
                <input
                  type="text"
                  placeholder='e.g., "focus on art museums", "add hiking in the afternoon"...'
                  value={regenPrompts[day.dayNumber] || ''}
                  onChange={(e) => setRegenPrompts(prev => ({ ...prev, [day.dayNumber]: e.target.value }))}
                  disabled={loading || isRegenning}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-xs px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full flex-1"
                />
                <button
                  onClick={() => handleRegenerate(day.dayNumber)}
                  disabled={loading || isRegenning || !regenPrompts[day.dayNumber]?.trim()}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-indigo-300 text-xs font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap w-full sm:w-auto"
                >
                  {isRegenning ? 'Regenerating...' : 'Regen'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
