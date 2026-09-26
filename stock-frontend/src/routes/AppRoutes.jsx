import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import LandingPage from '../pages/LandingPage'
import BuySellPage from '../pages/BuySellPage'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import PortfolioPage from '../pages/PortfolioPage'
import RegisterPage from '../pages/RegisterPage'
import News from '../pages/News'
import Screener from '../pages/Screener'
import { AuthProvider } from '../context/AuthProvider'
import { ThemeProvider } from '../context/ThemeProvider'
import ProtectedRoute from './ProtectedRoute'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/news" element={<News />} />
              <Route path="/screener" element={<Screener />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/buy-sell" element={<BuySellPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default AppRoutes
