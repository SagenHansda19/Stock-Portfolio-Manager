import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import PortfolioPage from '../pages/PortfolioPage'
import RegisterPage from '../pages/RegisterPage'
import { AuthProvider } from '../context/AuthProvider'
import ProtectedRoute from './ProtectedRoute'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default AppRoutes
