'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plane, Home, LayoutDashboard, Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex-1 flex flex-col bg-slate-950 min-h-screen relative overflow-hidden">
            {/* Decorative Glow Elements */}
            <div className="absolute top-[-12%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-12%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-slate-900 z-10">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white">
                        <Plane className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                        TrailForge AI
                    </span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 relative">
                {/* Text Section */}
                <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-1.5 bg-slate-900/80 border border-slate-850 px-4 py-2 rounded-full text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-6">
                        <Compass className="w-3.5 h-3.5" />
                        Off the Planned Route
                    </div>

                    <h1 className="text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                        404
                    </h1>

                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                        Lost Beyond the Trail
                    </h2>

                    <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                        Looks like this destination is not part of your itinerary. Let TrailForge AI guide you back to your next adventure.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                        <Link
                            href="/"
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl transition text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Return Home
                        </Link>

                        <Link
                            href="/dashboard"
                            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold px-8 py-4 rounded-xl transition text-sm flex items-center justify-center gap-2"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Go to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Image Card */}
                <div className="relative">
                    <div className="absolute inset-10 bg-indigo-600/20 blur-3xl rounded-full" />

                    <div className="relative p-6 md:p-10 shadow-2xl bg-transparent">
                        <Image
                            src="/not-found.png"
                            alt="Lost traveler using map"
                            width={700}
                            height={700}
                            priority
                            className="w-full max-w-[580px] mx-auto h-auto drop-shadow-[0_0_40px_rgba(99,102,241,0.25)]"
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-slate-900 text-center text-xs text-slate-500 z-10">
                <p>&copy; {new Date().getFullYear()} TrailForge AI. AI-Powered Travel Planner.</p>
            </footer>
        </div>
    );
}