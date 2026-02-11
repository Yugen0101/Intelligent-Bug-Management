'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1128] relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
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
            <div className="absolute top-[-40px] right-[10%] w-32 h-32 md:w-48 md:h-48 animate-bounce" style={{ animationDuration: '3s' }}>
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Astronaut */}
                <defs>
                  <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E3F2FD" />
                    <stop offset="100%" stopColor="#90CAF9" />
                  </linearGradient>
                </defs>
                {/* Body */}
                <ellipse cx="100" cy="120" rx="8" ry="3" fill="#000" opacity="0.2" />
                <rect x="88" y="95" width="24" height="30" rx="3" fill="url(#suitGrad)" />
                <rect x="83" y="105" width="34" height="20" rx="2" fill="#64B5F6" />
                {/* Oxygen pack */}
                <rect x="94" y="90" width="12" height="20" rx="2" fill="#42A5F5" opacity="0.8" />
                <circle cx="100" cy="95" r="2" fill="#1976D2" />
                {/* Arms */}
                <path d="M88 105 Q75 100 68 108" stroke="#90CAF9" strokeWidth="5" strokeLinecap="round" />
                <path d="M112 105 Q125 100 132 108" stroke="#90CAF9" strokeWidth="5" strokeLinecap="round" />
                {/* Bug Net */}
                <circle cx="135" cy="110" r="15" fill="none" stroke="#4CAF50" strokeWidth="2" />
                <path d="M130 115 L132 145" stroke="#8D6E63" strokeWidth="3" />
                {/* Legs */}
                <rect x="92" y="125" width="6" height="15" rx="3" fill="#64B5F6" />
                <rect x="102" y="125" width="6" height="15" rx="3" fill="#64B5F6" />
                {/* Helmet */}
                <circle cx="100" cy="75" r="18" fill="#E1F5FE" opacity="0.3" stroke="#90CAF9" strokeWidth="2" />
                <circle cx="100" cy="75" r="13" fill="#FDD835" />
                {/* Face */}
                <circle cx="96" cy="73" r="2" fill="#333" />
                <circle cx="104" cy="73" r="2" fill="#333" />
                <path d="M96 78 Q100 80 104 78" stroke="#333" strokeWidth="1.5" fill="none" />
                {/* Helmet reflection */}
                <ellipse cx="92" cy="68" rx="6" ry="8" fill="white" opacity="0.4" transform="rotate(-30 92 68)" />
              </svg>
            </div>

            {/* Floating Bug - Left */}
            <div className="absolute top-[20px] left-[5%] w-16 h-16 md:w-20 md:h-20" style={{ animation: 'float 4s ease-in-out infinite' }}>
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

      {/* Wavy Cosmic Footer */}
      <div className="relative mt-32">
        <svg className="w-full h-auto" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,160 C320,100 420,200 720,160 C1020,120 1120,220 1440,160 L1440,320 L0,320 Z" fill="url(#wave1)" opacity="0.3" />
          <path d="M0,192 C360,140 460,240 720,192 C980,144 1080,244 1440,192 L1440,320 L0,320 Z" fill="url(#wave2)" opacity="0.3" />
          <path d="M0,224 C400,180 500,280 720,224 C940,168 1040,268 1440,224 L1440,320 L0,320 Z" fill="url(#wave3)" opacity="0.4" />
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="wave2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="wave3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  )
}
