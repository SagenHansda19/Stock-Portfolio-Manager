import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const AppLayout = () => {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold">
            Stock Portfolio Manager
          </Link>

          <div className="flex items-center gap-4 text-sm">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className="text-slate-700 hover:text-slate-950">
                  Dashboard
                </NavLink>
                <NavLink to="/portfolio" className="text-slate-700 hover:text-slate-950">
                  Portfolio
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded border px-3 py-1.5 hover:bg-slate-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="text-slate-700 hover:text-slate-950">
                  Login
                </NavLink>
                <NavLink to="/register" className="text-slate-700 hover:text-slate-950">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
