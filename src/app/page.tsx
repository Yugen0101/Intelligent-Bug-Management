'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Bug,
  Zap,
  BarChart3,
  Users,
  Shield,
  GitBranch,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Play,
  Menu,
  X,
  Brain,
  TrendingUp,
  Lock,
  Eye,
  Database,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from 'lucide-react';

/* ─────────────────────────  ANIMATION HELPERS  ───────────────────────── */

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 2000, bounce: 0.1 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, motionVal, value]);

  useEffect(() => {
    return spring.on('change', (v) => setDisplay(Math.round(v).toLocaleString()));
  }, [spring]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4"
    >
      {children}
    </motion.span>
  );
}

/* ─────────────────────────  NAV  ───────────────────────── */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#stats' },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md group-hover:shadow-violet-300 transition-shadow">
            <Bug className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            Bug<span className="text-violet-600">Mind</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-700 hover:text-violet-600 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-100 px-6 pb-4"
        >
          <nav className="flex flex-col gap-3 pt-2">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-violet-600 transition-colors py-1"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/auth/login"
              className="mt-2 text-sm font-semibold bg-violet-600 text-white px-4 py-2.5 rounded-lg text-center"
            >
              Start Free Trial
            </Link>
          </nav>
        </motion.div>
      )}
    </header>
  );
}

/* ─────────────────────────  HERO  ───────────────────────── */

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/40 to-purple-50/60" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-radial from-violet-200/40 via-transparent to-transparent rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-purple-200/30 via-transparent to-transparent rounded-full translate-y-1/4 -translate-x-1/4" />
        {/* Grid dots */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle, #c4b5fd 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6"
          >
            Intelligent Bug
            <br />
            Management for{' '}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Modern Teams
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg"
          >
            BugMind uses AI to automatically detect, classify, and prioritize bugs — so your team
            ships faster and resolves issues smarter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-violet-300/50 hover:-translate-y-0.5"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl border border-slate-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              <Play className="w-4 h-4 text-violet-600" />
              Watch Demo
            </button>
          </motion.div>

          {/* Social proof chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 mt-10"
          >
            <div className="flex -space-x-2">
              {['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: c }}
                >
                  {['Y', 'A', 'R', 'K'][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-500">Loved by 200+ engineering teams</p>
            </div>
          </motion.div>
        </div>

        {/* Right — Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
          className="relative"
        >
          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -top-4 -left-4 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">AI Resolved</p>
              <p className="text-sm font-bold text-slate-900">+23 bugs today</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -bottom-4 -right-4 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Resolution rate</p>
              <p className="text-sm font-bold text-slate-900">89% this week</p>
            </div>
          </motion.div>

          <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200/70 ring-1 ring-violet-100">
            <Image
              src="/hero-dashboard.png"
              alt="BugMind AI Dashboard"
              width={720}
              height={480}
              className="w-full object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────  LOGOS  ───────────────────────── */

function TrustedBy() {
  const companies = ['Stripe', 'Notion', 'Linear', 'Vercel', 'Loom', 'Figma'];
  return (
    <section className="py-12 border-y border-slate-100 bg-white/50">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-10">
          {companies.map((c) => (
            <span key={c} className="text-xl font-extrabold text-slate-300 tracking-tight">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  FEATURES  ───────────────────────── */

const FEATURES = [
  {
    icon: Brain,
    color: 'violet',
    title: 'AI Bug Detection',
    desc: 'NLP models automatically parse incoming reports and detect real bugs vs noise with 94% accuracy.',
  },
  {
    icon: TrendingUp,
    color: 'purple',
    title: 'Auto Severity Classification',
    desc: 'Every bug is instantly tagged Critical, High, Medium or Low — powered by a trained classification model.',
  },
  {
    icon: Zap,
    color: 'indigo',
    title: 'Smart Prioritization',
    desc: 'AI factors in user impact, frequency, and business context to surface the right bugs for your team.',
  },
  {
    icon: Users,
    color: 'sky',
    title: 'Real-time Collaboration',
    desc: 'Developers, testers, and managers share a live workspace with instant status updates and comments.',
  },
  {
    icon: BarChart3,
    color: 'emerald',
    title: 'Analytics Dashboard',
    desc: 'Resolution trends, team workload charts, severity heatmaps — visibility you actually need.',
  },
  {
    icon: Bug,
    color: 'amber',
    title: 'Duplicate Bug Detection',
    desc: 'AI automatically identifies similar reports to prevent team members from working on the same issue twice.',
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100' },
  sky: { bg: 'bg-sky-50', icon: 'text-sky-600', border: 'border-sky-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
};

function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel>
            <Zap className="w-3 h-3" /> Core Capabilities
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4"
          >
            Everything your team needs to{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              squash bugs faster
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-500 text-lg leading-relaxed"
          >
            From detection to resolution, BugMind handles the heavy lifting so your engineers can
            focus on building great software.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const c = colorMap[f.color];
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.09 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group p-6 rounded-2xl border ${c.border} bg-white hover:shadow-lg transition-all duration-300 cursor-default`}
              >
                <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  PRODUCT SHOWCASE  ───────────────────────── */

const SHOWCASE_BULLETS = [
  'AI-generated fix suggestions for each bug',
  'Duplicate bug detection with semantic similarity',
  'Real-time resolution status across all team members',
  'Role-based dashboards for Managers, Devs & Testers',
  'Historical analytics to track team performance',
  'Automated weekly bug report generation',
];

function ProductShowcase() {
  return (
    <section id="product" className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — screenshot */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-br from-violet-200/30 to-purple-200/20 rounded-3xl blur-xl" />
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/70">
            <Image
              src="/showcase-dashboard.png"
              alt="BugMind Analytics Dashboard"
              width={680}
              height={460}
              className="w-full object-cover"
            />
          </div>
        </motion.div>

        {/* Right — content */}
        <div>
          <SectionLabel>
            <Eye className="w-3 h-3" /> Product Deep Dive
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4"
          >
            A dashboard built for{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              clarity and speed
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-500 mb-8 leading-relaxed"
          >
            BugMind&apos;s analytics give every stakeholder the right view — from high-level KPIs for
            managers to granular bug details for developers.
          </motion.p>

          <div className="space-y-3">
            {SHOWCASE_BULLETS.map((b, i) => (
              <motion.div
                key={b}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-violet-600" />
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{b}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8"
          >
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-violet-300/40 hover:-translate-y-0.5"
            >
              Explore the Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  STATS  ───────────────────────── */

const STATS = [
  { value: 40, suffix: '%', label: 'Faster Bug Resolution', icon: TrendingUp, color: 'text-violet-600' },
  { value: 99, suffix: '.9%', label: 'Platform Uptime SLA', icon: Shield, color: 'text-emerald-600' },
  { value: 10000, suffix: '+', label: 'Issues Managed Daily', icon: Bug, color: 'text-purple-600' },
  { value: 200, suffix: '+', label: 'Teams Using BugMind', icon: Users, color: 'text-indigo-600' },
];

function Stats() {
  return (
    <section id="stats" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 mb-4 ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm text-slate-500 mt-1 font-medium">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  SECURITY  ───────────────────────── */

const TRUST_ITEMS = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    desc: 'All data is encrypted at rest and in transit using AES-256 and TLS 1.3.',
  },
  {
    icon: Shield,
    title: 'Enterprise Compliance',
    desc: 'SOC 2 Type II compliant. Full GDPR and HIPAA readiness available on Enterprise.',
  },
  {
    icon: Brain,
    title: 'AI Model Transparency',
    desc: "Understand exactly how BugMind's AI makes decisions — no black box nonsense.",
  },
  {
    icon: Database,
    title: 'Data Privacy First',
    desc: 'Your bug data is never used to train models. You own your data, always.',
  },
];

function Security() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4"
          >
            <Shield className="w-3 h-3" /> Security & Trust
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight mb-4"
          >
            Enterprise-grade security,{' '}
            <span className="text-violet-400">built in from day one</span>
          </motion.h2>
          <p className="text-slate-400 leading-relaxed">
            Your codebase is sensitive. BugMind treats your data with the protections it deserves.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{t.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  TESTIMONIALS  ───────────────────────── */

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'CTO',
    company: 'PixelStack',
    initials: 'SC',
    color: '#7c3aed',
    review:
      "BugMind cut our average resolution time by 40%. The AI severity classification alone saved our QA team hours of manual triage every single day.",
    rating: 5,
  },
  {
    name: 'Arjun Mehta',
    role: 'Engineering Lead',
    company: 'Cloudify',
    initials: 'AM',
    color: '#0ea5e9',
    review:
      "The duplicate detection is eerily accurate. We used to spend 20% of sprint time re-triaging duplicates. Not anymore.",
    rating: 5,
  },
  {
    name: 'Lena Hoffmann',
    role: 'Product Manager',
    company: 'FormSync',
    initials: 'LH',
    color: '#10b981',
    review:
      "Finally a bug tracker that feels modern. The dashboards are beautiful and our team actually uses it — that says everything.",
    rating: 5,
  },
];

function Testimonials() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel>
            <Star className="w-3 h-3" /> What Teams Say
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Engineering teams{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              love BugMind
            </span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-6">&ldquo;{t.review}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  PRICING  ───────────────────────── */

const PLANS = [
  {
    name: 'Starter',
    price: '0',
    period: '/month',
    target: 'Small Teams',
    highlight: false,
    features: [
      'Up to 5 team members',
      '500 bugs / month',
      'Basic AI classification',
      'Email support',
      'Standard analytics',
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    price: '49',
    period: '/month',
    target: 'Growing Startups',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Up to 25 team members',
      'Unlimited bugs',
      'Full AI suite (NLP + prioritization)',
      'Smarter duplicate detection',
      'Advanced analytics',
      'Priority email + chat support',
    ],
    cta: 'Start Pro Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    target: 'Large Companies',
    highlight: false,
    features: [
      'Unlimited team members',
      'Custom AI model fine-tuning',
      'SSO & SAML',
      'Dedicated SLA & uptime guarantee',
      'Custom dashboards',
      'Onboarding & training',
    ],
    cta: 'Book a Demo',
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel>
            <Zap className="w-3 h-3" /> Simple Pricing
          </SectionLabel>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4"
          >
            Start free.{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Scale when ready.
            </span>
          </motion.h2>
          <p className="text-slate-500">No hidden fees. Cancel anytime. 14-day free trial on Pro.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-7 transition-all ${p.highlight
                ? 'border-violet-500 shadow-xl shadow-violet-100 bg-gradient-to-b from-violet-600 to-purple-700 text-white scale-[1.03]'
                : 'border-slate-200 bg-white hover:shadow-md'
                }`}
            >
              {p.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  {p.badge}
                </span>
              )}
              <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${p.highlight ? 'text-violet-200' : 'text-violet-600'}`}>
                {p.target}
              </p>
              <h3 className={`text-xl font-bold mb-4 ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                {p.price !== 'Custom' && <span className={`text-sm font-medium ${p.highlight ? 'text-violet-200' : 'text-slate-400'}`}>$</span>}
                <span className={`text-4xl font-extrabold ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.price}</span>
                <span className={`text-sm ${p.highlight ? 'text-violet-200' : 'text-slate-400'}`}>{p.period}</span>
              </div>

              <ul className="space-y-2.5 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.highlight ? 'text-violet-200' : 'text-violet-500'}`} />
                    <span className={`text-sm ${p.highlight ? 'text-violet-100' : 'text-slate-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/login"
                className={`block text-center font-semibold text-sm py-3 rounded-xl transition-all ${p.highlight
                  ? 'bg-white text-violet-700 hover:bg-violet-50 shadow-md'
                  : 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm hover:shadow-md'
                  }`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  FINAL CTA  ───────────────────────── */

function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6"
        >
          Ready to fix bugs smarter?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="text-violet-100 text-lg mb-8 leading-relaxed"
        >
          Join 200+ engineering teams using BugMind to ship reliable software, faster.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-7 py-3.5 rounded-xl hover:bg-violet-50 transition-all shadow-xl hover:-translate-y-0.5"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-all hover:-translate-y-0.5">
            <Play className="w-4 h-4" />
            Book a Demo
          </button>
        </motion.div>
        <p className="text-violet-300 text-sm mt-6">
          No credit card required · Free 14-day trial · Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────  FOOTER  ───────────────────────── */

const FOOTER_LINKS = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Resources: ['Documentation', 'API Reference', 'Blog', 'Status'],
  Company: ['About', 'Careers', 'Press', 'Legal'],
  Contact: ['support@bugmind.ai', 'Twitter / X', 'LinkedIn', 'GitHub'],
};

function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                <Bug className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Bug<span className="text-violet-400">Mind</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              AI-powered bug management for modern engineering teams. Detect, classify, and resolve
              faster.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { Icon: Twitter, href: '#' },
                { Icon: Linkedin, href: '#' },
                { Icon: Github, href: '#' },
                { Icon: Mail, href: 'mailto:support@bugmind.ai' },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
                {category}
              </p>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} BugMind. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map((l) => (
              <a key={l} href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────  PAGE ROOT  ───────────────────────── */

export default function LandingPage() {
  return (
    <div className="bg-white antialiased">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <ProductShowcase />
      <Stats />
      <Security />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
