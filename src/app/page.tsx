import Link from 'next/link'
import {
  Cpu,
  ShieldCheck,
  Zap,
  ChevronRight,
  ArrowUpRight,
  Search,
  BarChart3
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Immersive Neural Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 mesh-gradient opacity-60" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-white p-1.5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
            <img src="/logo.png" alt="Bug Mind" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-black tracking-tighter">Bug<span className="text-indigo-500">Mind</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/auth/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Sign In</Link>
          <Link href="/auth/signup" className="px-5 py-2.5 bg-white text-black text-sm font-black rounded-xl hover:bg-indigo-50 transition-all shadow-xl shadow-white/5 active:scale-95">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-32 pb-20 overflow-visible">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 animate-fade-in ring-1 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Neural Engine v2.0 Active
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] animate-slide-up">
            Forge the Future of <br />
            <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
              Bug Management
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Enter an immersive triage environment powered by neural classification,
            instant duplicate detection, and deep-learning insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
            <Link
              href="/auth/signup"
              className="group relative px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg transition-all shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.6)] hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3 uppercase tracking-widest">
                Start Triage <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            </Link>

            <Link
              href="/features"
              className="px-10 py-5 glass-card rounded-2xl font-black text-lg hover:bg-white/10 transition-all flex items-center gap-3 uppercase tracking-widest border border-white/5"
            >
              View Capabilities <ArrowUpRight className="w-5 h-5 text-gray-500" />
            </Link>
          </div>

          {/* Feature Showcase Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-12 relative">
            <div className="glass-card p-10 rounded-[3rem] text-left group hover:bg-white/5 transition-all duration-500 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                <Cpu className="w-32 h-32 text-indigo-500" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Cpu className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Neural Classification</h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Automatically categorize incoming reports with 99.4% accuracy using our custom LLM fine-tuned for software triage.
              </p>
            </div>

            <div className="glass-card p-10 rounded-[3rem] text-left group hover:bg-white/5 transition-all duration-500 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                <Search className="w-32 h-32 text-cyan-500" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-8 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Vector Search</h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Detect duplicates instantly with semantic vector embedding. Stop redundant work before it even enters the queue.
              </p>
            </div>

            <div className="glass-card p-10 rounded-[3rem] text-left group hover:bg-white/5 transition-all duration-500 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                <BarChart3 className="w-32 h-32 text-emerald-500" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Predictive Insights</h3>
              <p className="text-gray-400 font-medium leading-relaxed">
                Go beyond tracking. Get AI-generated health reports and workload predictions to prevent bottlenecks before they occur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="relative z-10 py-12 border-t border-white/5 text-center">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">
          Powered by Neural Engine © 2026 Bug Mind
        </p>
      </footer>
    </div>
  )
}
