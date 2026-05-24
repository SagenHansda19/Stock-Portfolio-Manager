import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthFormShell from '../components/AuthFormShell'
import { useAuth } from '../hooks/useAuth'

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
      setError(requestError.response?.data?.message || 'Unable to login')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormShell title="Login" subtitle="Use your account credentials to access protected pages.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <label className="block text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Password</span>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        New here?{' '}
        <Link to="/register" className="font-medium text-slate-950 underline">
          Create an account
        </Link>
      </p>
    </AuthFormShell>
  )
}

export default LoginPage
