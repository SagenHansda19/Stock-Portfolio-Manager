import { TrendingUp } from 'lucide-react'

const AuthFormShell = ({ title, subtitle, children }) => {
  return (
    <section className="mx-auto max-w-md w-full my-6 sm:my-10">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-xl shadow-primary-600/30 mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-dark-400">{subtitle}</p>
      </div>

      {/* Glass Card Container */}
      <div className="glass-card p-6 sm:p-8 relative">
        <div className="ambient-glow -top-20 -left-20 opacity-15 dark:opacity-25 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </div>
    </section>
  )
}

export default AuthFormShell
