import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Cpu,
  BarChart3,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

const LandingPage = () => {
  const coreFeatures = [
    {
      icon: TrendingUp,
      title: 'Real-Time Paper Trading',
      desc: 'Simulate high-volume equity trades with $100,000 in virtual cash. Real-time tick charts, price quotes, and instant market execution without capital risk.',
      badge: 'Zero Risk',
    },
    {
      icon: Cpu,
      title: 'AI Portfolio Advisor',
      desc: 'Powered by Google Gemini 1.5 Pro. Automated health checks, diversification scoring, vulnerability diagnostics, and actionable position recommendations.',
      badge: 'Gemini AI',
    },
    {
      icon: BarChart3,
      title: 'Institutional Analytics',
      desc: 'Mark-to-market valuations, allocation donut breakdowns, unrealized profit & loss attribution, and live macro index tracking across S&P 500 & Nasdaq.',
      badge: 'Enterprise SaaS',
    },
  ]

  const workflowSteps = [
    {
      step: '01',
      title: 'Initialize Virtual Capital',
      desc: 'Create an instant trading account pre-loaded with $100,000 in simulated buying power.',
    },
    {
      step: '02',
      title: 'Research & Execute',
      desc: 'Analyze live price trends, technical time ranges, and execute simulated Buy & Sell orders.',
    },
    {
      step: '03',
      title: 'Optimize with Gemini AI',
      desc: 'Run real-time diagnostics to measure portfolio volatility, diversification, and growth potential.',
    },
  ]

  // Staggered hero container animation
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  }

  // Hero text item animation
  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 280,
      },
    },
  }

  // Hero badge animation
  const badgeVariants = {
    hidden: { opacity: 0, y: -12, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', damping: 20, stiffness: 320 },
    },
  }

  // Feature grid container variant
  const featureGridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
      },
    },
  }

  // Feature card variant
  const featureCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 22,
        stiffness: 240,
      },
    },
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden p-0 m-0">
      {/* Hero Section - Bleeds Edge-to-Edge (0px to 100vw) */}
      <motion.section
        variants={heroContainerVariants}
        initial="hidden"
        animate="visible"
        className="w-full relative pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-black/5 dark:border-white/5 overflow-hidden"
      >
        {/* Full-Bleed Linear / Vercel Subtle Spotlight & Developer Grid */}
        <div className="linear-spotlight" />
        <div className="absolute inset-0 w-full h-full linear-grid opacity-60 pointer-events-none -z-10" />

        {/* Hero Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Pill Badge */}
          <motion.div
            variants={badgeVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/10 text-zinc-800 dark:text-zinc-300 text-xs font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Next-Generation Paper Trading &amp; Gemini AI</span>
          </motion.div>

          {/* Headline with Linear-style Metallic Gradient */}
          <motion.h1
            variants={heroItemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.08]"
          >
            Master Market Dynamics.{' '}
            <span className="block mt-2 bg-gradient-to-b from-zinc-950 via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent">
              Trade with Zero Risk.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={heroItemVariants}
            className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Institutional-grade equity tracking, practice trading with $100,000 in simulated liquidity, and continuous diagnostic insights powered by Google Gemini AI.
          </motion.p>

          {/* High-Contrast Monochrome Functional CTA Button Row */}
          <motion.div
            variants={heroItemVariants}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/register"
                className="btn-primary text-sm py-3 px-7 w-full sm:w-auto flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
              >
                <span>Start Trading for Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/login"
                className="btn-secondary text-sm py-3 px-7 w-full sm:w-auto flex items-center justify-center cursor-pointer shadow-xs"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Live Metrics Row */}
          <motion.div
            variants={heroItemVariants}
            className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto pt-8 border-t border-black/5 dark:border-white/5"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white font-mono">$100k</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">Virtual Capital</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white font-mono">Gemini 1.5</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">AI Advisor</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white font-mono">100%</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">Zero Risk</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Grid Section - Bleeds Edge-to-Edge */}
      <section className="w-full py-20 sm:py-28 border-b border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto space-y-3 mb-16"
          >
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Core Pillars
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-white tracking-tight">
              Built for Modern Active Investors
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              Essential tools for equity analysis, portfolio rebalancing, and algorithmic insights.
            </p>
          </motion.div>

          <motion.div
            variants={featureGridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {coreFeatures.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <motion.div
                  key={idx}
                  variants={featureCardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="glass-card p-6 flex flex-col justify-between group cursor-default"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-100 group-hover:scale-105 transition-transform duration-200">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/10">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-950 dark:text-white mb-2 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                      {feat.title}
                    </h3>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center text-xs font-medium text-zinc-900 dark:text-zinc-200 gap-1.5">
                    <span>View capability</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Workflow Section - Bleeds Edge-to-Edge */}
      <section className="w-full py-20 sm:py-28 border-b border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 sm:p-12"
          >
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                How It Works
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
                Streamlined Execution Workflow
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Three simple steps from initial setup to continuous AI diagnostics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {workflowSteps.map((ws, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.14, duration: 0.45 }}
                  className="space-y-2.5"
                >
                  <span className="text-2xl font-bold text-zinc-400 dark:text-zinc-600 font-mono block">
                    {ws.step}
                  </span>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">{ws.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{ws.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pre-Footer CTA Card - Bleeds Edge-to-Edge */}
      <section className="w-full py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-zinc-950 dark:bg-[#0a0a0a] text-white p-8 sm:p-14 text-center border border-white/10 shadow-2xl"
          >
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                Ready to Take Control of Your Portfolio?
              </h2>
              <p className="text-sm sm:text-base text-zinc-400">
                Open your simulated brokerage account in seconds. Test trading strategies with zero capital risk.
              </p>
              <div className="pt-3">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-block"
                >
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-sm px-6 py-3 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <span>Get Started Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Minimalist Monochrome Footer - Bleeds Edge-to-Edge */}
      <footer className="w-full py-10 border-t border-black/5 dark:border-white/5 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            StockVerse &copy; {new Date().getFullYear()} — Institutional Portfolio Simulator
          </p>
          <p className="max-w-md mx-auto text-[11px] text-zinc-500 dark:text-zinc-500">
            Educational paper trading platform. Market simulations do not execute on live financial exchanges.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
