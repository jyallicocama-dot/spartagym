import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Dumbbell, Users, CreditCard, Package, BarChart3, Home, Shield, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const isIntranet = location.pathname.startsWith('/intranet')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setIsOpen(false)
  }

  const publicLinks = [
    { name: 'Inicio', path: '/', icon: Home, section: null },
    { name: 'Servicios', path: '/#servicios', icon: Dumbbell, section: 'servicios' },
    { name: 'Planes', path: '/#planes', icon: CreditCard, section: 'planes' },
    { name: 'Contacto', path: '/#contacto', icon: Users, section: 'contacto' },
  ]

  const intranetLinks = [
    { name: 'Dashboard', path: '/intranet', icon: Home },
    { name: 'Clientes', path: '/intranet/clientes', icon: Users },
    { name: 'Suscripciones', path: '/intranet/suscripciones', icon: CreditCard },
    { name: 'Productos', path: '/intranet/productos', icon: Package },
    { name: 'Reportes', path: '/intranet/reportes', icon: BarChart3 },
  ]

  const links = isIntranet ? intranetLinks : publicLinks

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-sparta-gold/50"
            >
              <img src="/logoSparta.png" alt="Sparta Gym" className="w-full h-full object-cover" />
            </motion.div>
            <span className="font-sparta text-xl font-bold text-gradient">SPARTA GYM</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              link.section ? (
                <button
                  key={link.path}
                  onClick={() => scrollToSection(link.section)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 text-gray-300 hover:text-sparta-gold hover:bg-sparta-gold/10"
                >
                  <link.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{link.name}</span>
                </button>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'bg-sparta-gold/20 text-sparta-gold'
                      : 'text-gray-300 hover:text-sparta-gold hover:bg-sparta-gold/10'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{link.name}</span>
                </Link>
              )
            ))}
            
            {!isIntranet && (
              <Link
                to="/login"
                className="ml-4 sparta-button text-sm flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Intranet</span>
              </Link>
            )}
            
            {isIntranet && (
              <div className="flex items-center gap-3 ml-4">
                <span className="text-sm text-gray-400">
                  Hola, <span className="text-sparta-gold">{user?.nombre}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition-all duration-300 text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-sparta-gold p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-effect border-t border-sparta-gold/20"
          >
            <div className="px-4 py-4 space-y-2">
              {links.map((link) => (
                link.section ? (
                  <button
                    key={link.path}
                    onClick={() => scrollToSection(link.section)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-gray-300 hover:text-sparta-gold w-full text-left"
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </button>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'bg-sparta-gold/20 text-sparta-gold'
                        : 'text-gray-300 hover:text-sparta-gold'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </Link>
                )
              ))}
              
              {!isIntranet && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 bg-sparta-gold text-sparta-darker rounded-lg font-semibold"
                >
                  <Shield className="w-5 h-5" />
                  <span>Intranet</span>
                </Link>
              )}
              {isIntranet && (
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="flex items-center space-x-3 px-4 py-3 bg-red-500/20 text-red-500 rounded-lg font-semibold w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
