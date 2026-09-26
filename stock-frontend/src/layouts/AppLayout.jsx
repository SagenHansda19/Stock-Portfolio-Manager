import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { formatCurrency } from '../utils/formatters'
import {
  TrendingUp,
  LayoutDashboard,
  PieChart,
  ArrowLeftRight,
  SlidersHorizontal,
  Newspaper,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Wallet,
  User,
} from 'lucide-react'
import { Toaster } from 'react-hot-toast'

const AppLayout = () => {
  const { isAuthenticated, logout, cashBalance } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const isLandingPage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portfolio', label: 'Portfolio', icon: PieChart },
    { to: '/buy-sell', label: 'Buy / Sell', icon: ArrowLeftRight },
    { to: '/screener', label: 'Screener', icon: SlidersHorizontal },
    { to: '/news', label: 'News', icon: Newspaper },
  ]

  const navbarClass = isLandingPage && !isScrolled
    ? 'bg-transparent border-transparent'
    : 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-xs'

  // Unauthenticated Layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-zinc-950 dark:bg-black dark:text-zinc-100 relative flex flex-col selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-black transition-colors duration-200 w-full overflow-x-hidden">
        <header className={`sticky top-0 z-50 transition-all duration-300 ${navbarClass}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="p-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-black/10 dark:border-white/20 shadow-xs group-hover:scale-105 transition-transform duration-200">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
                    StockVerse
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 -mt-1">
                    Portfolio Manager
                  </span>
                </div>
              </Link>

              <div className="hidden sm:flex items-center gap-1.5 ml-6">
                <Link
                  to="/screener"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                >
                  Screener
                </Link>
                <Link
                  to="/news"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                >
                  News
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
                </button>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-2 px-4 shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </header>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold rounded-xl border border-zinc-800 dark:border-zinc-200 shadow-xl',
          }}
        />

        <main className={`flex-1 relative z-10 ${isLandingPage ? 'w-full p-0 m-0' : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
          <Outlet />
        </main>
      </div>
    )
  }

  // Authenticated Layout
  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-black dark:text-zinc-100 relative flex flex-col selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-black transition-colors duration-200 w-full overflow-x-hidden">
      {/* Linear / Vercel Glass Top Navigation Bar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${navbarClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Brand Logo & Desktop Links (Always routes to '/') */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="p-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-black/10 dark:border-white/20 shadow-xs group-hover:scale-105 transition-transform duration-200">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold tracking-tight text-zinc-950 dark:text-white">
                    StockVerse
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 -mt-1">
                    Portfolio Manager
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = location.pathname === link.to
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white border border-zinc-200/80 dark:border-zinc-800 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900/60 border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>

            {/* Right: Balance Chip + Controls */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Cash Balance Display Pill */}
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-100/80 border border-zinc-200/80 dark:bg-zinc-900/80 dark:border-zinc-800 shadow-xs">
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold leading-none">
                    Cash Balance
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight font-mono">
                    {cashBalance !== null ? formatCurrency(cashBalance) : '$0.00'}
                  </span>
                </div>
              </div>

              {/* User Status Chip */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-100/80 border border-zinc-200/80 dark:bg-zinc-900/80 dark:border-zinc-800">
                <div className="w-5 h-5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center text-[10px] font-bold">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Trader</span>
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-lg text-zinc-600 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 transition-all cursor-pointer"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="p-2 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Hamburger */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-3">
            {/* Mobile Cash Balance */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-2">
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">Cash Balance:</span>
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                {cashBalance !== null ? formatCurrency(cashBalance) : '$0.00'}
              </span>
            </div>

            {/* Nav links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.to
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </NavLink>
                )
              })}
            </div>

            {/* Mobile Actions */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white font-medium"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Global Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-semibold rounded-xl border border-zinc-800 dark:border-zinc-200 shadow-xl',
        }}
      />

      {/* Main Content Area */}
      <main className={`flex-1 relative z-10 ${isLandingPage ? 'w-full p-0 m-0' : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
