import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <section className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="glass-card p-10 max-w-md w-full text-center relative overflow-hidden">
        <div className="ambient-glow -top-20 -left-20 opacity-15 dark:opacity-30 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-md">
            <Compass className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary-600 via-indigo-500 to-purple-600 dark:from-primary-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Page Not Found</h2>
            <p className="text-xs text-slate-500 dark:text-dark-400 mt-2 leading-relaxed">
              The requested financial route or asset page does not exist or may have been relocated.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/dashboard" className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
