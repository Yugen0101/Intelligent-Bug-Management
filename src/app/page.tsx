'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); // Normalized 0 to 1

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Helper to calculate magnetic movement
  const getTransform = (strength: number, inverted = false) => {
    const moveX = (mousePos.x - 0.5) * strength * (inverted ? -1 : 1);
    const moveY = (mousePos.y - 0.5) * strength * (inverted ? -1 : 1);
    return `translate(${moveX}px, ${moveY}px)`;
  };
  return (
    <div className="min-h-screen bg-[#0a1128] relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden"
        style={{ transform: getTransform(10, true), transition: 'transform 0.5s ease-out' }}>
        {/* Stars */}
        <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[15%] animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[20%] left-[80%] animate-pulse" style={{ animationDuration: '2s' }}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[30%] left-[25%] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[40%] left-[70%] animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[50%] left-[10%] animate-pulse" style={{ animationDuration: '3.5s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[60%] left-[90%] animate-pulse" style={{ animationDuration: '2s' }}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[70%] left-[40%] animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[15%] left-[60%] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[85%] left-[20%] animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[25%] left-[45%] animate-pulse" style={{ animationDuration: '3.5s' }}></div>

        {/* Additional Stars */}
        <div className="absolute w-1 h-1 bg-white rounded-full top-[45%] left-[85%] animate-pulse" style={{ animationDuration: '5s' }}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[12%] left-[33%] animate-pulse" style={{ animationDuration: '2.8s' }}></div>
        <div className="absolute w-1 h-1 bg-cyan-400 rounded-full top-[75%] left-[65%] animate-pulse" style={{ animationDuration: '4.2s' }}></div>
        <div className="absolute w-0.5 h-0.5 bg-purple-400 rounded-full top-[35%] left-[95%] animate-pulse" style={{ animationDuration: '3.7s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[92%] left-[48%] animate-pulse" style={{ animationDuration: '2.2s' }}></div>
        <div className="absolute w-0.5 h-0.5 bg-blue-300 rounded-full top-[5%] left-[72%] animate-pulse" style={{ animationDuration: '4.5s' }}></div>
        <div className="absolute w-1.5 h-1.5 bg-white/40 rounded-full top-[68%] left-[12%] blur-sm animate-pulse" style={{ animationDuration: '3.3s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[55%] left-[30%] animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[82%] left-[88%] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-[28%] left-[18%] animate-pulse" style={{ animationDuration: '3.1s' }}></div>

        {/* Saturn-like Planet */}
        <div className="absolute top-[8%] left-[12%] w-24 h-24 opacity-60">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="25" fill="url(#planetGrad1)" />
            <ellipse cx="50" cy="50" rx="45" ry="12" fill="none" stroke="url(#ringGrad)" strokeWidth="3" opacity="0.6" />
            <defs>
              <linearGradient id="planetGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFB84D" />
                <stop offset="100%" stopColor="#FF8B00" />
              </linearGradient>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#FFA500" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Purple Planet */}
        <div className="absolute top-[15%] right-[8%] w-32 h-32 opacity-50">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="35" fill="url(#planetGrad2)" />
            <circle cx="50" cy="50" r="8" fill="#9C27B0" opacity="0.4" />
            <circle cx="70" cy="65" r="5" fill="#7B1FA2" opacity="0.3" />
            <defs>
              <radialGradient id="planetGrad2">
                <stop offset="0%" stopColor="#BA68C8" />
                <stop offset="100%" stopColor="#8E24AA" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main Hero Content */}
          <div className="relative mb-16">
            {/* Astronaut Bug Hunter */}
            <div className="absolute top-[-40px] right-[10%] w-32 h-32 md:w-48 md:h-48 pointer-events-none"
              style={{
                transform: getTransform(60),
                transition: 'transform 0.2s ease-out'
              }}>
              <div className="animate-bounce" style={{ animationDuration: '3s' }}>
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#E3F2FD" />
                      <stop offset="100%" stopColor="#90CAF9" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="100" cy="120" rx="8" ry="3" fill="#000" opacity="0.2" />
                  <rect x="88" y="95" width="24" height="30" rx="3" fill="url(#suitGrad)" />
                  <rect x="83" y="105" width="34" height="20" rx="2" fill="#64B5F6" />
                  <rect x="94" y="90" width="12" height="20" rx="2" fill="#42A5F5" opacity="0.8" />
                  <circle cx="100" cy="95" r="2" fill="#1976D2" />
                  <path d="M88 105 Q75 100 68 108" stroke="#90CAF9" strokeWidth="5" strokeLinecap="round" />
                  <path d="M112 105 Q125 100 132 108" stroke="#90CAF9" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="135" cy="110" r="15" fill="none" stroke="#4CAF50" strokeWidth="2" />
                  <path d="M130 115 L132 145" stroke="#8D6E63" strokeWidth="3" />
                  <rect x="92" y="125" width="6" height="15" rx="3" fill="#64B5F6" />
                  <rect x="102" y="125" width="6" height="15" rx="3" fill="#64B5F6" />
                  <circle cx="100" cy="75" r="18" fill="#E1F5FE" opacity="0.3" stroke="#90CAF9" strokeWidth="2" />
                  <circle cx="100" cy="75" r="13" fill="#FDD835" />
                  <circle cx="96" cy="73" r="2" fill="#333" />
                  <circle cx="104" cy="73" r="2" fill="#333" />
                  <path d="M96 78 Q100 80 104 78" stroke="#333" strokeWidth="1.5" fill="none" />
                  <ellipse cx="92" cy="68" rx="6" ry="8" fill="white" opacity="0.4" transform="rotate(-30 92 68)" />
                </svg>
              </div>
            </div>

            {/* Flying Red Bug - Left */}
            <div className="absolute top-[20px] left-[5%] w-16 h-16 md:w-20 md:h-20 pointer-events-none"
              style={{
                transform: getTransform(40),
                transition: 'transform 0.15s ease-out'
              }}>
              <div style={{ animation: 'float 4s ease-in-out infinite' }}>
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="45" rx="18" ry="15" fill="#FF6B6B" />
                  <ellipse cx="40" cy="45" rx="14" ry="12" fill="#FF5252" />
                  <circle cx="40" cy="30" r="10" fill="#FF5252" />
                  <circle cx="36" cy="29" r="3" fill="#333" />
                  <circle cx="44" cy="29" r="3" fill="#333" />
                  <circle cx="36.5" cy="28" r="1" fill="white" opacity="0.8" />
                  <path d="M34 26 Q30 22 28 20" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M46 26 Q50 22 52 20" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="28" cy="20" r="2.5" fill="#FFC107" />
                  <circle cx="52" cy="20" r="2.5" fill="#FFC107" />
                  <path d="M24 40 L18 38" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M24 46 L18 48" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M24 52 L18 56" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M56 40 L62 38" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M56 46 L62 48" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M56 52 L62 56" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
                  <path d="M38 34 Q40 36 42 34" stroke="#333" strokeWidth="1" fill="none" />
                </svg>
              </div>
            </div>

            {/* Flying Purple Bug - Right */}
            <div className="absolute bottom-[-10px] right-[5%] w-14 h-14 md:w-18 md:h-18 pointer-events-none"
              style={{
                transform: getTransform(50),
                transition: 'transform 0.18s ease-out'
              }}>
              <div style={{ animation: 'float 5s ease-in-out infinite' }}>
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="45" rx="16" ry="14" fill="#9C27B0" opacity="0.9" />
                  <circle cx="40" cy="32" r="9" fill="#7B1FA2" />
                  <circle cx="37" cy="30" r="2" fill="#00E676" />
                  <circle cx="43" cy="30" r="2" fill="#00E676" />
                  <path d="M32 25 Q30 18 25 15" stroke="#9C27B0" strokeWidth="2" strokeLinecap="round" />
                  <path d="M48 25 Q50 18 55 15" stroke="#9C27B0" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="25" cy="15" r="2" fill="#00E676" />
                  <circle cx="55" cy="15" r="2" fill="#00E676" />
                  <path d="M24 42 L16 38" stroke="#7B1FA2" strokeWidth="1.5" />
                  <path d="M24 48 L16 52" stroke="#7B1FA2" strokeWidth="1.5" />
                  <path d="M56 42 L64 38" stroke="#7B1FA2" strokeWidth="1.5" />
                  <path d="M56 48 L64 52" stroke="#7B1FA2" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Floating Analytics Chart */}
            <div className="absolute bottom-[-40px] left-[2%] w-24 h-24 hidden lg:block pointer-events-none"
              style={{
                transform: getTransform(30),
                transition: 'transform 0.25s ease-out'
              }}>
              <div style={{ animation: 'float 7s ease-in-out infinite' }}>
                <div className="bg-white/5 backdrop-blur-md p-3 rounded-lg border border-white/20 shadow-2xl rotate-3">
                  <div className="flex items-end gap-1 h-12">
                    <div className="w-2 bg-cyan-400 rounded-t-sm" style={{ height: '40%' }}></div>
                    <div className="w-2 bg-blue-400 rounded-t-sm" style={{ height: '70%' }}></div>
                    <div className="w-2 bg-purple-400 rounded-t-sm" style={{ height: '55%' }}></div>
                    <div className="w-2 bg-green-400 rounded-t-sm" style={{ height: '90%' }}></div>
                    <div className="w-2 bg-yellow-400 rounded-t-sm" style={{ height: '30%' }}></div>
                  </div>
                  <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Kanban Board */}
            <div className="absolute top-[280px] left-[5%] w-20 h-24 hidden xl:block pointer-events-none"
              style={{
                transform: getTransform(45),
                transition: 'transform 0.2s ease-out'
              }}>
              <div style={{ animation: 'float 6s ease-in-out infinite' }}>
                <div className="bg-slate-900/40 backdrop-blur-md p-2 rounded-lg border border-white/10 shadow-xl -rotate-6">
                  <div className="text-[8px] text-white opacity-40 mb-2 uppercase font-bold tracking-tighter">Mission Progress</div>
                  <div className="space-y-1.5">
                    <div className="h-3 bg-white/5 rounded px-1 flex items-center">
                      <div className="w-6 h-1 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="h-3 bg-white/5 rounded px-1 flex items-center">
                      <div className="w-8 h-1 bg-yellow-500 rounded-full"></div>
                    </div>
                    <div className="h-3 bg-white/5 rounded px-1 flex items-center">
                      <div className="w-5 h-1 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats Card - Right Side */}
            <div className="absolute top-[400px] right-[10%] w-24 h-20 hidden lg:block pointer-events-none"
              style={{
                transform: getTransform(25),
                transition: 'transform 0.3s ease-out'
              }}>
              <div style={{ animation: 'float 8.5s ease-in-out infinite' }}>
                <div className="bg-white/5 backdrop-blur-md p-3 rounded-lg border border-white/20 shadow-2xl rotate-12">
                  <div className="text-[10px] text-cyan-400 font-bold mb-1 tracking-tighter">SYSTEM UPTIME</div>
                  <div className="text-xl font-mono text-white">99.9%</div>
                  <div className="mt-1 flex gap-0.5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1 h-3 bg-green-500/40 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Security Badge - Bottom Right */}
            <div className="absolute bottom-[-80px] right-[15%] w-20 h-20 hidden xl:block pointer-events-none"
              style={{
                transform: getTransform(55),
                transition: 'transform 0.1s ease-out'
              }}>
              <div style={{ animation: 'float 7.5s ease-in-out infinite' }}>
                <div className="bg-slate-900/60 backdrop-blur-md p-3 rounded-full border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-cyan-400">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              Bug Hunters
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                in Space!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto">
              Track bugs across the galaxy with AI-powered classification, duplicate detection, and mission-critical insights 🚀
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 relative z-20">
            <Link
              href="/auth/signup"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold text-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-400/60 hover:scale-105 transform"
            >
              <span className="flex items-center justify-center gap-2">
                Start Mission
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all shadow-lg border-2 border-white/30 hover:border-white/50"
            >
              Launch Control
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-32">
            {/* AI Classification */}
            <div className="group bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm p-8 rounded-2xl border border-blue-400/20 hover:border-blue-400/40 transition-all hover:transform hover:scale-105 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-4">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* AI Hologram */}
                    <rect x="20" y="40" width="60" height="45" rx="3" fill="#1E88E5" opacity="0.2" stroke="#42A5F5" strokeWidth="2" />
                    <circle cx="35" cy="55" r="4" fill="#00E676" />
                    <circle cx="50" cy="55" r="4" fill="#FFD600" />
                    <circle cx="65" cy="55" r="4" fill="#FF5252" />
                    <line x1="35" y1="60" x2="35" y2="75" stroke="#42A5F5" strokeWidth="2" />
                    <line x1="50" y1="60" x2="50" y2="70" stroke="#42A5F5" strokeWidth="2" />
                    <line x1="65" y1="60" x2="65" y2="78" stroke="#42A5F5" strokeWidth="2" />
                    {/* Astronaut viewing */}
                    <circle cx="50" cy="25" r="8" fill="#90CAF9" />
                    <rect x="44" y="33" width="12" height="8" rx="1" fill="#64B5F6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Classification</h3>
                <p className="text-blue-200">
                  Advanced neural networks analyze and categorize bugs automatically
                </p>
              </div>
            </div>

            {/* Duplicate Detection */}
            <div className="group bg-gradient-to-br from-cyan-900/40 to-blue-900/40 backdrop-blur-sm p-8 rounded-2xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all hover:transform hover:scale-105 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-4">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Magnifying glass */}
                    <circle cx="40" cy="40" r="15" fill="none" stroke="#00BCD4" strokeWidth="3" />
                    <circle cx="40" cy="40" r="15" fill="#00BCD4" opacity="0.1" />
                    <line x1="52" y1="52" x2="65" y2="65" stroke="#00BCD4" strokeWidth="4" strokeLinecap="round" />
                    {/* Bugs being compared */}
                    <ellipse cx="35" cy="38" rx="6" ry="5" fill="#FF6B6B" />
                    <ellipse cx="45" cy="42" rx="6" ry="5" fill="#FF6B6B" />
                    <path d="M38 40 L42 40" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Duplicate Detection</h3>
                <p className="text-cyan-200">
                  Vector similarity search finds matching bugs in milliseconds
                </p>
              </div>
            </div>

            {/* Smart Insights */}
            <div className="group bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm p-8 rounded-2xl border border-purple-400/20 hover:border-purple-400/40 transition-all hover:transform hover:scale-105 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-4">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Control panel */}
                    <rect x="25" y="35" width="50" height="40" rx="2" fill="#7E57C2" opacity="0.3" stroke="#9575CD" strokeWidth="2" />
                    {/* Screens */}
                    <rect x="30" y="42" width="18" height="12" rx="1" fill="#00E676" opacity="0.3" />
                    <rect x="52" y="42" width="18" height="12" rx="1" fill="#FFD600" opacity="0.3" />
                    <rect x="30" y="58" width="40" height="12" rx="1" fill="#42A5F5" opacity="0.3" />
                    {/* Graph */}
                    <path d="M32 66 L38 62 L44 64 L50 58 L56 60 L62 56 L68 59" stroke="#00E676" strokeWidth="2" fill="none" />
                    {/* Astronaut */}
                    <circle cx="50" cy="25" r="6" fill="#90CAF9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Mission Control</h3>
                <p className="text-purple-200">
                  Command center analytics and AI-powered decision support
                </p>
              </div>
            </div>
          </div>

          {/* Role-Based Section */}
          <div className="mt-32">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">We Do!</span>
            </h2>
            <p className="text-blue-200 text-lg mb-16">Every crew member has the tools they need</p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testers */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-green-400/30 group-hover:border-green-400/50 transition-all">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl">
                      🐛
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-green-400 mb-3">Bug Scouts</h3>
                  <p className="text-gray-300">
                    Report bugs with AI assistance and real-time duplicate checking
                  </p>
                </div>
              </div>

              {/* Developers */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-blue-400/30 group-hover:border-blue-400/50 transition-all">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl">
                      👨‍🚀
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-400 mb-3">Code Rangers</h3>
                  <p className="text-gray-300">
                    Squash bugs efficiently with smart assignment and solution history
                  </p>
                </div>
              </div>

              {/* Managers */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border-2 border-purple-400/30 group-hover:border-purple-400/50 transition-all">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl">
                      🎯
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-purple-400 mb-3">Mission Commanders</h3>
                  <p className="text-gray-300">
                    Strategic insights, team analytics, and AI-powered forecasting
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nebula Footer Section */}
      <section className="relative mt-20 pt-40 overflow-hidden">
        {/* Deep Space Background Continuity */}
        <div className="absolute inset-0 bg-[#0a1128] z-0"></div>

        {/* Cosmic Nebula Glow Behind Footer */}
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-transparent via-blue-900/20 to-[#0a1128] blur-3xl z-10 pointer-events-none opacity-60"></div>

        {/* Layered Background Waves */}
        <div className="absolute inset-0 z-10 opacity-70 pointer-events-none hidden md:block">
          <svg viewBox="0 -100 1200 250" preserveAspectRatio="none" className="absolute top-[-120px] w-full h-[320px]">
            {/* Wave 1: Deep Navy Base */}
            <path d="M0,0V120H1200V0C1132.19,23.1,1055.71,15.5,985.66-3c-79-20.83-161.89-61.83-241.83-78.64a702.3,702.3,0,0,0-250.45.39c-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,0Z" fill="url(#waveGrad1)" opacity="0.6"></path>
            {/* Wave 2: Mid Blue Overlay */}
            <path d="M0,40V120H1200V40c-67.8,23.1-144.29,15.5-214.34-3-79-20.83-161.89-61.83-241.83-78.64a702.3,702.3,0,0,0-250.45.39c-57.84,11.73-114.16,31.07-172,41.86A600.21,600.21,0,0,1,0,40Z" fill="url(#waveGrad2)" opacity="0.5"></path>
            {/* Wave 3: Light Blue Accent */}
            <path d="M0,80V120H1200V80c-67.8,23.1-144.29,15.5-214.34-3-70.05-18.48-146.53-26.09-214.34-3-112.79,35.71-232.44,61.44-353.58,64.29C299.39,141.08,172.74,127.93,58.54,92.19,39.3,86.17,19.33,81.44,0,80Z" fill="url(#waveGrad3)" opacity="0.4"></path>

            <defs>
              <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0a1128" />
              </linearGradient>
              <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0a1128" />
              </linearGradient>
              <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0a1128" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Closing Bottom Glow */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cyan-500/20 to-transparent blur-2xl z-10 pointer-events-none"></div>

        {/* Footer Component is now immersed in the Nebula */}
        <div className="relative z-20">
          <Footer />
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
      `}</style>
    </div>
  )
}
