import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

const iconos = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

const colores = {
  success: 'from-green-500 to-emerald-600',
  error: 'from-red-500 to-red-600',
  warning: 'from-yellow-500 to-orange-500',
  info: 'from-blue-500 to-indigo-600'
}

const fondos = {
  success: 'bg-green-500/10 border-green-500/30',
  error: 'bg-red-500/10 border-red-500/30',
  warning: 'bg-yellow-500/10 border-yellow-500/30',
  info: 'bg-blue-500/10 border-blue-500/30'
}

const Toast = ({ toast, onClose }) => {
  const Icono = iconos[toast.tipo] || CheckCircle
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      className={`relative w-full max-w-md mx-auto p-6 rounded-xl border backdrop-blur-sm ${fondos[toast.tipo]} shadow-2xl`}
    >
      <button
        onClick={() => onClose(toast.id)}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${colores[toast.tipo]} flex items-center justify-center mb-4`}
        >
          <Icono className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-white mb-2"
        >
          {toast.titulo}
        </motion.h3>
        
        {toast.mensaje && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300"
          >
            {toast.mensaje}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const mostrarToast = useCallback(({ tipo = 'success', titulo, mensaje, duracion = 3000 }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, tipo, titulo, mensaje }])
    
    if (duracion > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duracion)
    }
    
    return id
  }, [])

  const cerrarToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((titulo, mensaje) => {
    return mostrarToast({ tipo: 'success', titulo, mensaje })
  }, [mostrarToast])

  const error = useCallback((titulo, mensaje) => {
    return mostrarToast({ tipo: 'error', titulo, mensaje, duracion: 5000 })
  }, [mostrarToast])

  const warning = useCallback((titulo, mensaje) => {
    return mostrarToast({ tipo: 'warning', titulo, mensaje })
  }, [mostrarToast])

  const info = useCallback((titulo, mensaje) => {
    return mostrarToast({ tipo: 'info', titulo, mensaje })
  }, [mostrarToast])

  return (
    <ToastContext.Provider value={{ mostrarToast, cerrarToast, success, error, warning, info }}>
      {children}
      
      {/* Overlay de Toasts */}
      <AnimatePresence>
        {toasts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => cerrarToast(toasts[toasts.length - 1]?.id)}
          >
            <div onClick={e => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                {toasts.slice(-1).map(toast => (
                  <Toast key={toast.id} toast={toast} onClose={cerrarToast} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  )
}
