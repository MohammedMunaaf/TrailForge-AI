'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plane, Shield, Sun, DollarSign, Calendar, Hotel } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 min-h-screen relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-slate-900 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Plane className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            TrailForge AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 text-sm"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-300 hover:text-white font-semibold transition text-sm px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 md:py-24 flex flex-col items-center text-center justify-center z-10 relative">
        <div className="inline-flex items-center gap-1.5 bg-slate-900/80 border border-slate-850 px-4 py-2 rounded-full text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-6">
          <span>✨</span> Next-Gen AI Travel Architect
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-tight">
          Craft Your Perfect Journey in{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            Seconds
          </span>
        </h1>
        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Experience personalized, day-by-day travel plans, budget breakdowns, hotel recommendations, and dynamic packing checklists—fully isolated, secure, and tailored to you.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl transition text-base shadow-lg shadow-indigo-600/30 text-center"
            >
              Enter Dashboard ✈️
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl transition text-base shadow-lg shadow-indigo-600/30 text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold px-8 py-4 rounded-xl transition text-base text-center"
              >
                Sign In to Account
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-24">
          <div className="bg-slate-900/60 border border-slate-850 p-8 rounded-2xl text-left shadow-xl hover:border-slate-800 transition">
            <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 p-3 rounded-xl w-fit mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dynamic Itinerary Board</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate full schedules and adjust activities inline. Add or delete items to customize plans on the fly.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-850 p-8 rounded-2xl text-left shadow-xl hover:border-slate-800 transition">
            <div className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl w-fit mb-6">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Weather Packing Assistant</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Auto-generates climate-smart, activity-aware checklist recommendations matching your custom schedule context.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-850 p-8 rounded-2xl text-left shadow-xl hover:border-slate-800 transition">
            <div className="bg-purple-600/10 border border-purple-500/20 text-purple-400 p-3 rounded-xl w-fit mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secure User Enclave</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Strict cryptographic JWT auth ensures private storage. Your travels belong only to you.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-slate-900 text-center text-xs text-slate-500 z-10">
        <p>&copy; {new Date().getFullYear()} TrailForge AI Travel Planner. Built with Google Gemini 2.5 API.</p>
      </footer>
    </div>
  );
}
