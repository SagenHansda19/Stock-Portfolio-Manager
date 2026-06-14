import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthFormShell from '../components/AuthFormShell'
import { useAuth } from '../hooks/useAuth'

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      await register(formData)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to register')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormShell title="Register" subtitle="Create an account to manage your stock portfolio.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <label className="block text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">Full name</span>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#0594A4] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="block text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#0594A4] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <label className="block text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">Password</span>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#0594A4] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#0594A4] px-4 py-2 text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-[#0594A4] underline">
          Login
        </Link>
      </p>
    </AuthFormShell>
  )
}

export default RegisterPage
