import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const AppLayout = () => {
  const { isAuthenticated, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <Link to="/" className="text-lg font-semibold">
              Stock Portfolio Manager
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <NavLink to="/login" className="text-slate-600 hover:text-[#0594A4] dark:text-slate-300">
                Login
              </NavLink>
              <NavLink to="/register" className="text-slate-600 hover:text-[#0594A4] dark:text-slate-300">
                Register
              </NavLink>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Outlet />
        </main>
      </div>
    )
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? 'bg-[#0594A4]/10 text-[#0594A4]'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0594A4] font-semibold text-white">
            SP
          </span>
          <div>
            <p className="font-semibold">Stock Portfolio</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manager</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-2">
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/portfolio" className={navLinkClass}>
            Portfolio
          </NavLink>
          <NavLink to="/buy-sell" className={navLinkClass}>
            Buy/Sell
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Logout
          </button>
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2 lg:hidden">
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/portfolio" className={navLinkClass}>
                Portfolio
              </NavLink>
              <NavLink to="/buy-sell" className={navLinkClass}>
                Buy/Sell
              </NavLink>
            </div>

            <label className="relative block w-full xl:max-w-md">
              <span className="sr-only">Search</span>
              <input
                placeholder="Search stocks, symbols, holdings..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0594A4] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </label>

            <div className="flex items-center justify-between gap-3 xl:justify-end">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                {isDark ? 'Light mode' : 'Dark mode'}
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0594A4] text-sm font-semibold text-white">
                  U
                </span>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">User</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Investor</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
