'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Bug, Zap, BarChart3, Users, Shield, ArrowRight, Check, Star,
  ChevronRight, Play, Menu, X, Brain, TrendingUp, Lock,
  Database, Github, Mail, Linkedin, Twitter, Eye,
} from 'lucide-react';

/* ── ANIMATED COUNTER ── */
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 2000, bounce: 0.1 });
  const [display, setDisplay] = useState('0');
  useEffect(() => { if (inView) motionVal.set(value); }, [inView, motionVal, value]);
  useEffect(() => spring.on('change', (v) => setDisplay(Math.round(v).toLocaleString())), [spring]);
  return <span ref={ref}>{display}{suffix}</span>;
}

/* ── SECTION LABEL ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4"
    >
      {children}
    </motion.span>
  );
}

/* ── NAVBAR ── */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#howitworks' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#stats' },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-blue-50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg group-hover:shadow-blue-300 transition-shadow">
            <Bug className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-slate-900 text-xl tracking-tight">
            Bug<span className="text-blue-600">Mind</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Log in</Link>
          <Link href="/auth/login" className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5">
            Start Free →
          </Link>
        </div>

        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-100 px-6 pb-5">
          <nav className="flex flex-col gap-3 pt-3">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 py-1">{l.label}</a>
            ))}
            <Link href="/auth/login" className="mt-2 text-sm font-bold bg-blue-600 text-white px-4 py-2.5 rounded-xl text-center">Start Free</Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
}

/* ── HERO ── */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #EFF6FF 100%)' }}>
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #93C5FD, transparent 70%)' }} />
        <div className="absolute bottom-0 left-[-60px] w-[400px] h-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #3B82F6, transparent 70%)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #93C5FD 1.5px, transparent 1.5px)', backgroundSize: '36px 36px' }} />
        {/* Wave divider */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left */}
        <div>

          <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
            Stop Chasing Bugs.<br />
            <span style={{ background: 'linear-gradient(90deg, #2563EB, #1D4ED8, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Let AI Hunt Them.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
            BugMind uses AI to automatically detect, classify, and prioritize bugs — so your team ships faster and resolves issues smarter. No more manual triage. No more missed critical bugs.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-3 mb-10">
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-blue-300/50 hover:-translate-y-1 hover:shadow-blue-400/50 text-sm">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-blue-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 text-sm">
              <Play className="w-4 h-4 text-blue-600 fill-blue-600" /> Watch Demo
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['#2563EB', '#1D4ED8', '#F59E0B', '#10B981'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow"
                  style={{ backgroundColor: c }}>
                  {['Y', 'A', 'R', 'K'][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-xs text-slate-500 mt-0.5">Loved by 200+ engineering teams</p>
            </div>
          </motion.div>
        </div>

        {/* Right — cartoon illustration */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
          className="relative flex items-center justify-center">

          {/* Floating badges */}
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute top-4 -left-4 z-20 bg-white rounded-2xl shadow-xl border border-blue-100 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">AI Resolved</p>
              <p className="text-sm font-bold text-slate-900">+23 bugs today</p>
            </div>
          </motion.div>

          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
            className="absolute bottom-8 -right-2 z-20 bg-white rounded-2xl shadow-xl border border-blue-100 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Resolution Rate</p>
              <p className="text-sm font-bold text-slate-900">89% this week</p>
            </div>
          </motion.div>

          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/2 -right-6 z-20 hidden lg:flex bg-white rounded-2xl shadow-xl border border-orange-100 px-4 py-3 items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
              <Brain className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">AI Priority</p>
              <p className="text-sm font-bold text-slate-900">Critical → Dev</p>
            </div>
          </motion.div>

          {/* Illustration */}
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-4 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #93C5FD, transparent)' }} />
            <Image src="/hero-cartoon.png" alt="BugMind AI hero" width={560} height={480} className="w-full drop-shadow-2xl relative z-10" priority />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── TRUSTED BY ── */
function TrustedBy() {
  const companies = ['Google', 'Stripe', 'Notion', 'Linear', 'Vercel', 'Figma'];
  return (
    <section className="py-14 bg-white border-y border-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by teams at</p>
        <div className="flex flex-wrap justify-center items-center gap-12">
          {companies.map((c) => (
            <span key={c} className="text-xl font-extrabold text-slate-200 tracking-tight hover:text-blue-300 transition-colors cursor-default">{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FEATURES ── */
const FEATURES = [
  { icon: Brain, title: 'AI Bug Detection', desc: 'NLP models parse incoming reports and detect real bugs vs noise with 94% accuracy.', color: 'blue' },
  { icon: TrendingUp, title: 'Auto Severity Classification', desc: 'Every bug is instantly tagged Critical, High, Medium or Low — powered by a trained model.', color: 'indigo' },
  { icon: Zap, title: 'Smart Prioritization', desc: 'AI factors in user impact, frequency, and business context to surface the right bugs.', color: 'sky' },
  { icon: Users, title: 'Real-time Collaboration', desc: 'Developers, testers, and managers share a live workspace with instant status updates.', color: 'blue' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Resolution trends, team workload charts, severity heatmaps — visibility you actually need.', color: 'indigo' },
  { icon: Bug, title: 'Duplicate Detection', desc: 'AI identifies similar reports to prevent team members from working on the same issue twice.', color: 'sky' },
];

const colorMap: Record<string, { bg: string; icon: string; border: string; glow: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100', glow: 'hover:shadow-blue-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100', glow: 'hover:shadow-indigo-100' },
  sky: { bg: 'bg-sky-50', icon: 'text-sky-600', border: 'border-sky-100', glow: 'hover:shadow-sky-100' },
};

function Features() {
  return (
    <section id="features" className="py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-5 -translate-y-1/2" style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel><Zap className="w-3 h-3" /> Core Capabilities</SectionLabel>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Everything your team needs to{' '}
            <span style={{ background: 'linear-gradient(90deg,#2563EB,#1D4ED8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              squash bugs faster
            </span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-500 text-lg leading-relaxed">
            From detection to resolution, BugMind handles the heavy lifting so your engineers focus on building great software.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const c = colorMap[f.color];
            const Icon = f.icon;
            return (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`group p-7 rounded-2xl border ${c.border} bg-white hover:shadow-xl ${c.glow} transition-all duration-300 cursor-default`}>
                <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ── */
const STEPS = [
  { num: '01', title: 'Report a Bug', desc: 'Developers or testers submit a bug with description, steps, and environment info. Takes under 60 seconds.' },
  { num: '02', title: 'AI Classifies It', desc: 'BugMind\'s NLP engine reads the report and instantly assigns severity, category, and checks for duplicates.' },
  { num: '03', title: 'Auto-Assigned to Team', desc: 'Based on workload and expertise, the bug is routed to the right developer automatically.' },
  { num: '04', title: 'Resolved & Documented', desc: 'The team resolves it with AI suggestions, marks it complete, and analytics update in real-time.' },
];

function HowItWorks() {
  return (
    <section id="howitworks" className="py-28" style={{ background: 'linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)' }}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionLabel><Eye className="w-3 h-3" /> How It Works</SectionLabel>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
            From{' '}
            <span style={{ background: 'linear-gradient(90deg,#2563EB,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              report to resolved
            </span>
            {' '}in 4 steps
          </motion.h2>
          <div className="space-y-6 mt-10">
            {STEPS.map((s, i) => (
              <motion.div key={s.num}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-5 items-start group">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                  {s.num}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team cartoon */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #93C5FD, transparent)' }} />
          <Image src="/team-cartoon.png" alt="BugMind team collaboration" width={560} height={460} className="w-full drop-shadow-2xl relative z-10" />
        </motion.div>
      </div>
    </section>
  );
}

/* ── STATS ── */
const STATS = [
  { value: 40, suffix: '%', label: 'Faster Bug Resolution', icon: TrendingUp },
  { value: 99, suffix: '.9%', label: 'Platform Uptime', icon: Shield },
  { value: 10000, suffix: '+', label: 'Issues Managed Daily', icon: Bug },
  { value: 200, suffix: '+', label: 'Teams Using BugMind', icon: Users },
];

function Stats() {
  return (
    <section id="stats" className="py-20 bg-blue-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
      <div className="relative max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center text-white">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 mb-4">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-5xl font-extrabold tracking-tight">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="text-blue-100 mt-2 font-medium text-sm">{s.label}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ── AI SHOWCASE ── */
const BULLETS = [
  'AI-generated fix suggestions for each bug',
  'Duplicate bug detection with semantic similarity',
  'Real-time resolution status across all team members',
  'Role-based dashboards: Manager, Developer & Tester',
  'Historical analytics to track team performance',
  'Automated weekly bug report generation',
];

function AIShowcase() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Dashboard cartoon */}
        <motion.div
          initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #93C5FD, transparent)' }} />
          <Image src="/dashboard-cartoon.png" alt="BugMind dashboard" width={560} height={460} className="w-full drop-shadow-2xl relative z-10" />
        </motion.div>

        <div>
          <SectionLabel><Brain className="w-3 h-3" /> AI-Powered Intelligence</SectionLabel>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            A dashboard built for{' '}
            <span style={{ background: 'linear-gradient(90deg,#2563EB,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              clarity and speed
            </span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-500 mb-8 leading-relaxed">
            BugMind&apos;s analytics give every stakeholder the right view — from high-level KPIs for managers to granular bug details for developers.
          </motion.p>
          <div className="space-y-3 mb-8">
            {BULLETS.map((b, i) => (
              <motion.div key={b}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.07 }}
                className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-blue-600" />
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{b}</p>
              </motion.div>
            ))}
          </div>
          <Link href="/auth/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5 text-sm">
            Explore the Dashboard <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── SECURITY ── */
const TRUST_ITEMS = [
  { icon: Lock, title: 'End-to-End Encryption', desc: 'All data is encrypted at rest and in transit using AES-256 and TLS 1.3.' },
  { icon: Shield, title: 'Enterprise Compliance', desc: 'SOC 2 Type II compliant. Full GDPR and HIPAA readiness on Enterprise.' },
  { icon: Brain, title: 'AI Transparency', desc: 'Understand exactly how BugMind\'s AI makes decisions — no black box.' },
  { icon: Database, title: 'Data Privacy First', desc: 'Your bug data is never used to train models. You own your data, always.' },
];

function Security() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #1D4ED8 50%, #1E3A5F 100%)' }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-200 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
            <Shield className="w-3 h-3" /> Security & Trust
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-white tracking-tight mb-4">
            Enterprise-grade security,{' '}
            <span className="text-blue-300">built in from day one</span>
          </motion.h2>
          <p className="text-blue-200 leading-relaxed">Your codebase is sensitive. BugMind treats your data with the protections it deserves.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div key={t.title}
                initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/8 border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-all backdrop-blur-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-400/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="font-bold text-white mb-2">{t.title}</h3>
                <p className="text-sm text-blue-200 leading-relaxed">{t.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── TESTIMONIALS ── */
const TESTIMONIALS = [
  { name: 'Sarah Chen', role: 'CTO', company: 'PixelStack', initials: 'SC', color: '#2563EB', rating: 5, review: 'BugMind cut our average resolution time by 40%. The AI severity classification alone saved our QA team hours of manual triage every single day.' },
  { name: 'Arjun Mehta', role: 'Engineering Lead', company: 'Cloudify', initials: 'AM', color: '#F59E0B', rating: 5, review: 'The duplicate detection is eerily accurate. We used to spend 20% of sprint time re-triaging duplicates. Not anymore.' },
  { name: 'Lena Hoffmann', role: 'Product Manager', company: 'FormSync', initials: 'LH', color: '#10B981', rating: 5, review: 'Finally a bug tracker that feels modern. The dashboards are beautiful and our team actually uses it — that says everything.' },
];

function Testimonials() {
  return (
    <section className="py-24" style={{ background: '#F8FAFF' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel><Star className="w-3 h-3" /> What Teams Say</SectionLabel>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Engineering teams{' '}
            <span style={{ background: 'linear-gradient(90deg,#2563EB,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              love BugMind
            </span>
          </motion.h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-blue-100 p-7 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all hover:-translate-y-1">
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-6">&ldquo;{t.review}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── PRICING ── */
const PLANS = [
  {
    name: 'Starter', price: '0', period: '/month', target: 'Small Teams', highlight: false,
    features: ['Up to 5 team members', '500 bugs / month', 'Basic AI classification', 'Email support', 'Standard analytics'],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro', price: '29', period: '/month', target: 'Growing Teams', highlight: true,
    features: ['Up to 25 team members', 'Unlimited bugs', 'Full AI suite', 'Priority support', 'Advanced analytics', 'Custom workflows'],
    cta: 'Start Pro Trial',
  },
  {
    name: 'Enterprise', price: '99', period: '/month', target: 'Large Orgs', highlight: false,
    features: ['Unlimited members', 'Unlimited bugs', 'AI + custom models', 'Dedicated support', 'SSO & SAML', 'SLA guarantee'],
    cta: 'Contact Sales',
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #2563EB 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel><Zap className="w-3 h-3" /> Simple Pricing</SectionLabel>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Plans that grow{' '}
            <span style={{ background: 'linear-gradient(90deg,#2563EB,#3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              with your team
            </span>
          </motion.h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {PLANS.map((p, i) => (
            <motion.div key={p.name}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-2xl p-8 border relative ${p.highlight ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-2xl shadow-blue-300' : 'bg-white border-blue-100 hover:shadow-lg transition-shadow'}`}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${p.highlight ? 'text-blue-200' : 'text-blue-600'}`}>{p.target}</p>
              <h3 className={`text-2xl font-extrabold mb-1 ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className={`text-5xl font-extrabold ${p.highlight ? 'text-white' : 'text-slate-900'}`}>${p.price}</span>
                <span className={`text-sm mb-2 ${p.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${p.highlight ? 'bg-white/20' : 'bg-blue-100'}`}>
                      <Check className={`w-3 h-3 ${p.highlight ? 'text-white' : 'text-blue-600'}`} />
                    </div>
                    <span className={p.highlight ? 'text-blue-100' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/login"
                className={`block text-center font-bold py-3 rounded-xl transition-all text-sm ${p.highlight ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}>
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA BANNER ── */
function CTABanner() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 50%, #DBEAFE 100%)' }}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #93C5FD 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-300">
            <Bug className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-5">
            Ready to ship{' '}
            <span style={{ background: 'linear-gradient(90deg,#2563EB,#1D4ED8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              bug-free software?
            </span>
          </h2>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            Join 200+ engineering teams using BugMind to squash bugs faster with AI. Start free, no credit card required.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-300 hover:-translate-y-1 text-sm">
              Start For Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl border border-blue-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 text-sm">
              Request a Demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── FOOTER ── */
function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl">Bug<span className="text-blue-400">Mind</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              AI-powered bug management for modern engineering teams.
            </p>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>
              ))}
            </div>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms', 'Security', 'GDPR'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-slate-500 hover:text-blue-400 text-sm transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2025 BugMind. All rights reserved.</p>
          <p className="text-slate-600 text-xs">This site is protected by reCAPTCHA and the Google <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a> and <a href="#" className="text-blue-500 hover:underline">Terms</a> apply.</p>
        </div>
      </div>
    </footer>
  );
}

/* ── MAIN PAGE ── */
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <Stats />
        <AIShowcase />
        <Security />
        <Testimonials />
        <Pricing />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
