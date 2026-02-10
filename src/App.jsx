import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Intranet from './pages/Intranet'
import Clientes from './pages/Clientes'
import Suscripciones from './pages/Suscripciones'
import Productos from './pages/Productos'
import Reportes from './pages/Reportes'
import Deudas from './pages/Deudas'
import { DataProvider } from './context/DataContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

function AppContent() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/login'

  return (
    <div className="min-h-screen bg-sparta-darker">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/intranet" element={<ProtectedRoute><Intranet /></ProtectedRoute>} />
        <Route path="/intranet/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
        <Route path="/intranet/suscripciones" element={<ProtectedRoute><Suscripciones /></ProtectedRoute>} />
        <Route path="/intranet/productos" element={<ProtectedRoute><Productos /></ProtectedRoute>} />
        <Route path="/intranet/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
        <Route path="/intranet/deudas" element={<ProtectedRoute><Deudas /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DataProvider>
          <Router>
            <AppContent />
          </Router>
        </DataProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
