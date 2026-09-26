import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthFormShell from '../components/AuthFormShell'
import { useAuth } from '../hooks/useAuth'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/dashboard'

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(formData)
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to authenticate with provided credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormShell title="Sign In to Account" subtitle="Access your portfolio command center and live execution desk">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/25 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-dark-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-dark-400 pointer-events-none z-10" />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="trader@portfolio.com"
              required
              className="input-field !pl-11 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-dark-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-dark-400 pointer-events-none z-10" />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              required
              className="input-field !pl-11 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 text-sm font-bold shadow-lg shadow-primary-600/30 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              <span>Sign In to Dashboard</span>
            </div>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-dark-700/60 text-center text-xs text-slate-500 dark:text-dark-400">
        <span>Need an account? </span>
        <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
          Create an account
        </Link>
      </div>
    </AuthFormShell>
  )
}

export default LoginPage
