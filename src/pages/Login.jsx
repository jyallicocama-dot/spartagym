import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      toast.success('¡Bienvenido!', 'Has iniciado sesión correctamente')
      setTimeout(() => navigate('/intranet'), 1500)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-sparta-darker">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="card-sparta p-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-sparta-gold/50 shadow-lg shadow-sparta-gold/20">
              <img src="/logoSparta.png" alt="Sparta Gym" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-sparta text-2xl font-bold text-gradient">
              SPARTA GYM
            </h1>
            <p className="text-gray-400 text-sm">Intranet</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-sparta-darker border border-sparta-gold/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-sparta-gold"
                placeholder="correo@spartagym.pe"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-sparta-darker border border-sparta-gold/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-sparta-gold pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-sparta-gold text-xs"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sparta-button py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-sparta-darker border-t-transparent rounded-full animate-spin" />
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4">
          <Link to="/" className="text-sparta-gold hover:underline">
            ← Volver al sitio
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login
