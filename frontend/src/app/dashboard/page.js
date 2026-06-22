'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tripAPI } from '../../utils/api';
import CreateTripForm from '../../components/CreateTripForm';
import ItineraryCard from '../../components/ItineraryCard';
import PackingList from '../../components/PackingList';
import { Plane, LogOut, Compass, DollarSign, Hotel, Award, Trash, Plus, Check } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Auth Guard & Loading
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchUserTrips();
  }, [router]);

  const fetchUserTrips = async () => {
    try {
      const data = await tripAPI.getTrips();
      setTrips(data);
      if (data.length > 0) {
        setSelectedTrip(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch user trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (formData) => {
    setFormLoading(true);
    try {
      const newTrip = await tripAPI.createTrip(formData);
      setTrips(prev => [newTrip, ...prev]);
      setSelectedTrip(newTrip);
      setShowCreateModal(false);
    } catch (err) {
      alert(err.message || 'Error generating trip. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTripData = async (updatedFields) => {
    if (!selectedTrip) return;
    try {
      const updatedData = await tripAPI.updateTrip(selectedTrip._id, updatedFields);
      setSelectedTrip(updatedData);
      setTrips(prev => prev.map(t => t._id === selectedTrip._id ? updatedData : t));
    } catch (err) {
      console.error('Failed to update trip:', err);
      alert('Failed to save update to database.');
    }
  };

  const handleTogglePacking = async (itemId) => {
    if (!selectedTrip) return;

    const updatedPacking = selectedTrip.packingList.map(item =>
      item._id === itemId
        ? { ...item, isPacked: !item.isPacked }
        : item
    );

    await handleUpdateTripData({ packingList: updatedPacking });
  };

  const handleRegenerateDay = async (dayNumber, instructions) => {
    if (!selectedTrip) return;
    const updatedData = await tripAPI.regenerateDay(selectedTrip._id, dayNumber, instructions);
    setSelectedTrip(updatedData);
    setTrips(prev => prev.map(t => t._id === selectedTrip._id ? updatedData : t));
  };

  const handleDeleteTrip = async (id) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) return;
    try {
      await tripAPI.deleteTrip(id);
      const updated = trips.filter(t => t._id !== id);
      setTrips(updated);
      setSelectedTrip(updated.length > 0 ? updated[0] : null);
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-slate-950 text-white min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Plane className="w-10 h-10 text-indigo-500 animate-pulse" />
          <p className="text-sm font-semibold tracking-wider text-slate-400">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Trao AI Dashboard</h1>
              <p className="text-[10px] text-slate-400 font-mono">Signed in</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden sm:inline text-xs font-semibold text-slate-300">
                Welcome, <span className="text-white font-bold">{user.name}</span>
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Sidebar (Active Trips & Financial Cost Ledger / Hotels) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Active Trips Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">Active Trips</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition flex items-center justify-center"
                title="Plan New Trip"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {trips.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl space-y-3">
                <Compass className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500">No itineraries found. Create one to begin!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-900/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Create Trip
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {trips.map((trip) => {
                  const isSelected = selectedTrip?._id === trip._id;
                  return (
                    <div
                      key={trip._id}
                      className={`group w-full flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-slate-200 group-hover:text-white transition">
                          {trip.destination}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {trip.durationDays} Days • {trip.budgetTier} Budget
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrip(trip._id);
                        }}
                        className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                        title="Delete Trip"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Budget Ledger details */}
          {selectedTrip && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">Financial Ledger</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Lodging & Accommodations:</span>
                  <span className="font-semibold text-slate-200 font-mono">${selectedTrip.estimatedBudget.accommodation}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Culinary & Dining:</span>
                  <span className="font-semibold text-slate-200 font-mono">${selectedTrip.estimatedBudget.food}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Activities & Sightseeing:</span>
                  <span className="font-semibold text-slate-200 font-mono">${selectedTrip.estimatedBudget.activities}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Transport & Transit:</span>
                  <span className="font-semibold text-slate-200 font-mono">${selectedTrip.estimatedBudget.transport}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-3 text-white font-bold">
                  <span>Grand Total Estimated Budget:</span>
                  <span className="font-mono text-emerald-400">${selectedTrip.estimatedBudget.total}</span>
                </div>
              </div>
            </div>
          )}

          {/* Hotel Recommendations */}
          {selectedTrip && selectedTrip.hotels && selectedTrip.hotels.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">Recommended Hotels</h2>
              <div className="space-y-3">
                {selectedTrip.hotels.map((hotel, index) => (
                  <div key={index} className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-bold text-slate-200">{hotel.name}</p>
                      <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                        {hotel.rating}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Tier: {hotel.tier}</span>
                      <span className="font-mono font-bold">${hotel.estimatedCostNightUSD}/night</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Selected Trip timeline & Packing Assistant */}
        <div className="space-y-6 lg:col-span-2">
          {selectedTrip ? (
            <>
              {/* Trip Header info */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white">{selectedTrip.destination}</h2>
                  <p className="text-xs text-slate-400">
                    A personalized <span className="font-bold text-slate-250">{selectedTrip.durationDays}-day</span> journey generated with a <span className="font-bold text-indigo-400">{selectedTrip.budgetTier}</span> budget plan.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedTrip.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-lg"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Day-by-Day Itinerary Component */}
              <ItineraryCard
                trip={selectedTrip}
                onUpdate={handleUpdateTripData}
                onRegenerateDay={handleRegenerateDay}
                loading={formLoading}
              />

              {/* Packing Assistant Component */}
              <PackingList
                packingList={selectedTrip.packingList}
                onToggle={handleTogglePacking}
                loading={formLoading}
              />
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-96 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <Compass className="w-16 h-16 text-slate-700 animate-spin" style={{ animationDuration: '6s' }} />
              <div>
                <h3 className="text-lg font-bold text-white">Select a Trip</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
                  Click on an existing travel plan in the sidebar, or create a brand new one to explore customized daily timelines.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                Plan New Trip ✈️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PLAN NEW TRIP MODAL DIALOG */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Travel Plan</h3>
                <p className="text-xs text-slate-400 mt-0.5">Let Gemini build your dream day-by-day plan</p>
              </div>
              <button
                onClick={() => !formLoading && setShowCreateModal(false)}
                disabled={formLoading}
                className="text-slate-500 hover:text-slate-300 font-bold p-1 hover:bg-slate-800 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <CreateTripForm onSubmit={handleCreateTrip} loading={formLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
