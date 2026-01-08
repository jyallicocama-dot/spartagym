import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Plus, Search, Calendar, DollarSign, X, Filter } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

const Suscripciones = () => {
  const { clientes, pagos, agregarPago } = useData()
  const toast = useToast()
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formData, setFormData] = useState({
    clienteId: '',
    tipo: 'mensual',
    monto: 30,
    mes: ''
  })

  const suscripcionesFiltradas = pagos.filter(p => {
    const matchBusqueda = p.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo
    return matchBusqueda && matchTipo
  }).reverse()

  const totalMensuales = pagos.filter(p => p.tipo === 'mensual').reduce((acc, p) => acc + Number(p.monto), 0)
  const totalDiarios = pagos.filter(p => p.tipo === 'diario').reduce((acc, p) => acc + Number(p.monto), 0)
  const totalTrimestrales = pagos.filter(p => p.tipo === 'trimestral').reduce((acc, p) => acc + Number(p.monto), 0)

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  const anioActual = new Date().getFullYear()

  const abrirModal = () => {
    setFormData({
      clienteId: clientes[0]?.id || '',
      tipo: 'mensual',
      monto: 30,
      mes: `${meses[new Date().getMonth()]} ${anioActual}`
    })
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
  }

  const handleTipoChange = (tipo) => {
    let monto = 5
    if (tipo === 'mensual') monto = 30
    if (tipo === 'trimestral') monto = 80
    
    setFormData({
      ...formData,
      tipo,
      monto,
      mes: tipo !== 'diario' ? `${meses[new Date().getMonth()]} ${anioActual}` : null
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cliente = clientes.find(c => c.id === formData.clienteId)
    const resultado = await agregarPago(formData)
    if (resultado) {
      toast.success('¡Suscripción Registrada!', `${formData.tipo} de S/${formData.monto} para ${cliente?.nombre || 'cliente'}`)
    } else {
      toast.error('Error', 'No se pudo registrar la suscripción')
    }
    cerrarModal()
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-sparta text-3xl font-bold mb-2">
              <span className="text-gradient">GESTIÓN DE</span>
              <span className="text-white"> SUSCRIPCIONES</span>
            </h1>
            <p className="text-gray-400">Administra las membresías de los clientes</p>
          </div>
          
          <button
            onClick={abrirModal}
            className="sparta-button flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Suscripción
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="card-sparta p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sparta-gold/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-sparta-gold" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Recaudado</p>
                <p className="text-xl font-bold text-white">S/ {(totalMensuales + totalDiarios + totalTrimestrales).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="card-sparta p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Mensuales</p>
                <p className="text-xl font-bold text-white">S/ {totalMensuales.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="card-sparta p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Trimestrales</p>
                <p className="text-xl font-bold text-white">S/ {totalTrimestrales.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="card-sparta p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pases Diarios</p>
                <p className="text-xl font-bold text-white">S/ {totalDiarios.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-sparta pl-12"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filtroTipo === 'todos' 
                  ? 'bg-sparta-gold text-sparta-darker' 
                  : 'bg-sparta-dark text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo('mensual')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filtroTipo === 'mensual' 
                  ? 'bg-sparta-gold text-sparta-darker' 
                  : 'bg-sparta-dark text-gray-400 hover:text-white'
              }`}
            >
              Mensuales
            </button>
            <button
              onClick={() => setFiltroTipo('trimestral')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filtroTipo === 'trimestral' 
                  ? 'bg-sparta-gold text-sparta-darker' 
                  : 'bg-sparta-dark text-gray-400 hover:text-white'
              }`}
            >
              Trimestrales
            </button>
            <button
              onClick={() => setFiltroTipo('diario')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filtroTipo === 'diario' 
                  ? 'bg-sparta-gold text-sparta-darker' 
                  : 'bg-sparta-dark text-gray-400 hover:text-white'
              }`}
            >
              Diarios
            </button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-sparta overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table-sparta">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Periodo</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {suscripcionesFiltradas.length > 0 ? suscripcionesFiltradas.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sparta-gold/20 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-sparta-gold" />
                        </div>
                        <span className="font-medium text-white">{item.clienteNombre}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        item.tipo === 'mensual' 
                          ? 'bg-green-500/20 text-green-500' 
                          : item.tipo === 'trimestral'
                          ? 'bg-purple-500/20 text-purple-500'
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="text-gray-300">{item.mes || 'Pase diario'}</td>
                    <td className="text-gray-300">{item.fecha}</td>
                    <td className="text-sparta-gold font-bold">S/ {Number(item.monto).toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No se encontraron suscripciones
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {modalAbierto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={cerrarModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-sparta text-xl font-bold text-sparta-gold">
                    Nueva Suscripción
                  </h2>
                  <button onClick={cerrarModal} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Cliente</label>
                    <select
                      value={formData.clienteId}
                      onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                      className="input-sparta"
                      required
                    >
                      <option value="">Seleccionar cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} - {cliente.dni}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tipo de Suscripción</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleTipoChange('diario')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.tipo === 'diario'
                            ? 'border-sparta-gold bg-sparta-gold/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <CreditCard className={`w-5 h-5 mx-auto mb-1 ${formData.tipo === 'diario' ? 'text-sparta-gold' : 'text-gray-400'}`} />
                        <p className={`font-semibold text-sm ${formData.tipo === 'diario' ? 'text-sparta-gold' : 'text-gray-400'}`}>
                          Diario
                        </p>
                        <p className="text-xs text-gray-500">S/ 5</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTipoChange('mensual')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.tipo === 'mensual'
                            ? 'border-sparta-gold bg-sparta-gold/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <Calendar className={`w-5 h-5 mx-auto mb-1 ${formData.tipo === 'mensual' ? 'text-sparta-gold' : 'text-gray-400'}`} />
                        <p className={`font-semibold text-sm ${formData.tipo === 'mensual' ? 'text-sparta-gold' : 'text-gray-400'}`}>
                          Mensual
                        </p>
                        <p className="text-xs text-gray-500">S/ 30</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTipoChange('trimestral')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.tipo === 'trimestral'
                            ? 'border-sparta-gold bg-sparta-gold/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <DollarSign className={`w-5 h-5 mx-auto mb-1 ${formData.tipo === 'trimestral' ? 'text-sparta-gold' : 'text-gray-400'}`} />
                        <p className={`font-semibold text-sm ${formData.tipo === 'trimestral' ? 'text-sparta-gold' : 'text-gray-400'}`}>
                          Trimestral
                        </p>
                        <p className="text-xs text-gray-500">S/ 80</p>
                      </button>
                    </div>
                  </div>

                  {(formData.tipo === 'mensual' || formData.tipo === 'trimestral') && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Periodo</label>
                      <select
                        value={formData.mes}
                        onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                        className="input-sparta"
                        required
                      >
                        {meses.map(mes => (
                          <option key={mes} value={`${mes} ${anioActual}`}>
                            {mes} {anioActual}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Monto (S/)</label>
                    <input
                      type="number"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) })}
                      className="input-sparta"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="flex-1 py-3 border border-gray-600 text-gray-400 rounded hover:bg-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sparta-button"
                    >
                      Registrar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Suscripciones
