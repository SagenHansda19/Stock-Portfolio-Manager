import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { analyzePortfolio } from '../services/portfolioService'
import { formatCurrency } from '../utils/formatters'
import StockLogo from './StockLogo'
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'

const CircularProgress = ({ value, label }) => {
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  let strokeColor = 'stroke-emerald-500 dark:stroke-emerald-400'
  let textColor = 'text-emerald-600 dark:text-emerald-400'
  if (value < 50) {
    strokeColor = 'stroke-rose-500 dark:stroke-rose-400'
    textColor = 'text-rose-600 dark:text-rose-400'
  } else if (value < 75) {
    strokeColor = 'stroke-amber-500 dark:stroke-amber-400'
    textColor = 'text-amber-600 dark:text-amber-400'
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-dark-900/60 border border-slate-200 dark:border-dark-700/60 shadow-xs">
      <div className="relative flex items-center justify-center">
        <svg className="w-20 h-20 -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-slate-200 dark:stroke-dark-800"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            className={`${strokeColor} transition-all duration-700`}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute text-lg font-black font-mono ${textColor}`}>{value}</span>
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-400">{label}</span>
    </div>
  )
}

const AiAdvisorModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)

  const steps = [
    'Aggregating ledger holdings and position weights...',
    'Evaluating sector correlations and volatility profiles...',
    'Analyzing risk-to-reward ratios and diversification metrics...',
    'Invoking Google Gemini AI Financial Engine...',
    'Synthesizing final diagnostic report and recommendations...',
  ]

  useEffect(() => {
    let intervalId
    if (loading) {
      setLoadingStep(0)
      intervalId = setInterval(() => {
        setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
      }, 1400)
    }
    return () => clearInterval(intervalId)
  }, [loading, steps.length])

  const runAnalysis = async () => {
    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await analyzePortfolio()
      setData(response)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to complete AI portfolio analysis.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      runAnalysis()
    }
  }, [isOpen])

  const getActionColor = (action) => {
    const act = (action || '').toUpperCase()
    if (act.includes('BUY')) {
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
    }
    if (act.includes('HOLD')) {
      return 'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/25'
    }
    if (act.includes('REVIEW')) {
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
    }
    if (act.includes('REDUCE') || act.includes('SELL')) {
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
    }
    return 'bg-slate-100 text-slate-600 dark:bg-dark-800 dark:text-dark-300 border border-slate-200 dark:border-dark-700'
  }

  const getRiskBadge = (risk) => {
    const r = (risk || '').toUpperCase()
    if (r.includes('LOW')) return 'badge-green'
    if (r.includes('MODERATE')) return 'badge-yellow'
    if (r.includes('HIGH')) return 'badge-red'
    return 'badge-blue'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative flex flex-col w-full max-w-4xl h-[88vh] bg-white dark:bg-dark-900/95 backdrop-blur-2xl border border-slate-200 dark:border-dark-700/80 rounded-3xl shadow-2xl overflow-hidden"
          >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-dark-700/60 bg-slate-50/80 dark:bg-dark-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-primary-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">AI Portfolio Advisor</h2>
                <span className="badge-purple text-[10px]">Gemini 1.5 Pro</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-dark-400">Institutional diagnostic portfolio analysis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:text-dark-400 dark:hover:text-white dark:hover:bg-dark-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* LOADING STATE */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full py-16 space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="h-20 w-20 rounded-full border-4 border-slate-200 dark:border-dark-800" />
                <div className="absolute h-20 w-20 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
                <Cpu className="w-8 h-8 text-primary-600 dark:text-primary-400 absolute" />
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Synthesizing Ledger Diagnostics</h3>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-mono min-h-[20px] animate-pulse">
                  {steps[loadingStep]}
                </p>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-full py-16 space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 border border-rose-200">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Analysis Interrupted</h3>
              <p className="text-xs text-slate-600 dark:text-dark-400 max-w-md">{error}</p>
              <button
                type="button"
                onClick={runAnalysis}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-2 mt-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Analysis</span>
              </button>
            </div>
          )}

          {/* DATA LOADED STATE */}
          {data && !loading && (
            <div className="space-y-6">
              {/* Gauges & Risk Profile Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CircularProgress value={data.portfolioScore} label="Health Score" />
                <CircularProgress value={data.diversificationScore} label="Diversification" />

                <div className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-dark-900/60 border border-slate-200 dark:border-dark-700/60 shadow-xs">
                  <span className={`${getRiskBadge(data.riskLevel)} text-sm font-bold px-3 py-1`}>
                    {data.riskLevel} Risk Profile
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-400">
                    Volatility Grade
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900/50 border border-slate-200 dark:border-dark-700/60 space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-300">
                    Executive Analysis Summary
                  </h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-dark-200 leading-relaxed font-normal">
                  {data.summary}
                </p>
              </div>

              {/* Strengths & Vulnerabilities */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Strengths */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-dark-900/40 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Portfolio Strengths
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-dark-200">
                    {data.strengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vulnerabilities */}
                <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-dark-900/40 border border-rose-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Identified Vulnerabilities
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-dark-200">
                    {data.weaknesses?.map((weak, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Asset Recommendations */}
              <div className="rounded-2xl border border-slate-200 dark:border-dark-700/60 overflow-hidden bg-white dark:bg-dark-900/40">
                <div className="px-5 py-3 border-b border-slate-200 dark:border-dark-700/60 flex items-center justify-between bg-slate-50 dark:bg-dark-900/60">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Position-Level Recommendations
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-dark-400 font-mono">
                    {data.recommendations?.length || 0} Assets Evaluated
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-dark-800/80">
                  {data.recommendations?.map((rec) => (
                    <div
                      key={rec.symbol}
                      className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 dark:hover:bg-dark-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-[170px]">
                        <StockLogo symbol={rec.symbol} size="md" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-sm block font-mono">
                            {rec.symbol}
                          </span>
                          <span
                            className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getActionColor(
                              rec.action
                            )}`}
                          >
                            {rec.action}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-dark-400">Model Confidence</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">{rec.confidence}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-dark-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-500 dark:to-indigo-500 h-full rounded-full transition-all duration-700"
                            style={{ width: `${rec.confidence}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-dark-300 leading-relaxed italic mt-1">
                          &ldquo;{rec.reason}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Improvements */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900/40 border border-slate-200 dark:border-dark-700/60 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span>Strategic Optimization Opportunities</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-dark-200">
                  {data.improvements?.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Callout Overall Recommendation */}
              <div className="p-5 rounded-2xl bg-primary-50 dark:bg-gradient-to-r dark:from-primary-950/60 dark:via-dark-900/80 dark:to-purple-950/40 border border-primary-500/40 shadow-md space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                    Final Strategic Verdict
                  </h3>
                </div>
                <p className="text-sm text-slate-900 dark:text-white font-semibold leading-relaxed">
                  {data.overallRecommendation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-200/80 dark:border-dark-700/60 bg-slate-50/80 dark:bg-dark-900/80 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-dark-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Encrypted AI Analysis</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-5 cursor-pointer"
          >
            Close Report
          </button>
        </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AiAdvisorModal
