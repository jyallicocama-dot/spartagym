import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Plus, Search, Calendar, DollarSign, X, Filter, AlertTriangle, Clock, Edit, Trash2, RefreshCw } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

const Suscripciones = () => {
  const { clientes, pagos, agregarPago, editarPago, eliminarPago, getSuscripcionesPorVencer } = useData()
  const toast = useToast()
  const suscripcionesPorVencer = getSuscripcionesPorVencer()
  const [mostrarAlertaVencer, setMostrarAlertaVencer] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalConfirmar, setModalConfirmar] = useState(false)
  const [pagoAEliminar, setPagoAEliminar] = useState(null)
  const [pagoEditando, setPagoEditando] = useState(null)
  const [modalRenovar, setModalRenovar] = useState(false)
  const [suscripcionRenovar, setSuscripcionRenovar] = useState(null)
  const [tipoRenovacion, setTipoRenovacion] = useState('mensual')
  const [formData, setFormData] = useState({
    clienteId: '',
    tipo: 'mensual',
    monto: 80,
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
      monto: 80,
      mes: `${meses[new Date().getMonth()]} ${anioActual}`
    })
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setPagoEditando(null)
  }

  const abrirModalEditar = (pago) => {
    setPagoEditando(pago)
    setFormData({
      clienteId: pago.cliente_id || pago.clienteId,
      tipo: pago.tipo,
      monto: pago.monto,
      mes: pago.mes || ''
    })
    setModalAbierto(true)
  }

  const abrirConfirmacion = (pago) => {
    setPagoAEliminar(pago)
    setModalConfirmar(true)
  }

  const confirmarEliminacion = async () => {
    const result = await eliminarPago(pagoAEliminar.id)
    if (result) {
      toast.success('¡Suscripción Eliminada!', `La suscripción ha sido eliminada`)
    }
    setModalConfirmar(false)
    setPagoAEliminar(null)
  }

  // Calcular fecha de vencimiento para una suscripción específica
  const getFechaVencimiento = (pago) => {
    if (pago.tipo === 'diario') return null
    
    const diasPorTipo = { mensual: 30, trimestral: 90 }
    const clienteId = pago.cliente_id || pago.clienteId
    
    // Obtener todas las suscripciones del cliente ordenadas por fecha
    const suscripcionesCliente = pagos
      .filter(p => (p.cliente_id === clienteId || p.clienteId === clienteId) && p.tipo !== 'diario')
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    
    if (suscripcionesCliente.length === 0) return null
    
    // Encontrar el índice de esta suscripción
    const indexActual = suscripcionesCliente.findIndex(s => s.id === pago.id)
    if (indexActual === -1) return null
    
    // Calcular vencimiento acumulativo hasta esta suscripción
    let fechaVenc = new Date(suscripcionesCliente[0].fecha)
    fechaVenc.setDate(fechaVenc.getDate() + diasPorTipo[suscripcionesCliente[0].tipo])
    
    for (let i = 1; i <= indexActual; i++) {
      const p = suscripcionesCliente[i]
      const fechaPago = new Date(p.fecha)
      const diasNuevos = diasPorTipo[p.tipo]
      
      if (fechaVenc > fechaPago) {
        // Renovó antes de vencer: sumar días al vencimiento actual
        fechaVenc.setDate(fechaVenc.getDate() + diasNuevos)
      } else {
        // Ya había vencido: calcular desde fecha del nuevo pago
        fechaVenc = new Date(fechaPago)
        fechaVenc.setDate(fechaVenc.getDate() + diasNuevos)
      }
    }
    
    return fechaVenc
  }
  
  // Obtener vencimiento total del cliente (para el modal de renovar)
  const getFechaVencimientoCliente = (clienteId) => {
    const suscripcionesCliente = pagos
      .filter(p => (p.cliente_id === clienteId || p.clienteId === clienteId) && p.tipo !== 'diario')
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    
    if (suscripcionesCliente.length === 0) return null
    return getFechaVencimiento(suscripcionesCliente[suscripcionesCliente.length - 1])
  }

  // Abrir modal de renovar
  const abrirModalRenovar = (pago) => {
    setSuscripcionRenovar(pago)
    setTipoRenovacion(pago.tipo)
    setModalRenovar(true)
  }

  // Renovar suscripción (respeta días restantes)
  const handleRenovar = async () => {
    if (!suscripcionRenovar) return
    
    const montos = { diario: 7, mensual: 80, trimestral: 220 }
    const diasPorTipo = { diario: 1, mensual: 30, trimestral: 90 }
    
    // Calcular fecha de vencimiento actual
    const fechaVencActual = getFechaVencimiento(suscripcionRenovar)
    const hoy = new Date()
    
    // Si aún no vence, calcular días restantes
    let diasRestantes = 0
    if (fechaVencActual && fechaVencActual > hoy) {
      diasRestantes = Math.ceil((fechaVencActual - hoy) / (1000 * 60 * 60 * 24))
    }
    
    // Nueva fecha = hoy + días del nuevo plan + días restantes
    const diasNuevoPlan = diasPorTipo[tipoRenovacion]
    const nuevaFechaVenc = new Date()
    nuevaFechaVenc.setDate(nuevaFechaVenc.getDate() + diasNuevoPlan + diasRestantes)
    
    const mesActual = `${meses[new Date().getMonth()]} ${anioActual}`
    
    const resultado = await agregarPago({
      clienteId: suscripcionRenovar.cliente_id || suscripcionRenovar.clienteId,
      tipo: tipoRenovacion,
      monto: montos[tipoRenovacion],
      mes: tipoRenovacion !== 'diario' ? mesActual : null
    })
    
    if (resultado) {
      toast.success('¡Suscripción Renovada!', 
        diasRestantes > 0 
          ? `Se agregaron ${diasNuevoPlan} días + ${diasRestantes} días restantes`
          : `Plan ${tipoRenovacion} - S/${montos[tipoRenovacion]}`
      )
    }
    setModalRenovar(false)
    setSuscripcionRenovar(null)
    setModalConfirmar(false)
    setPagoAEliminar(null)
  }

  const handleTipoChange = (tipo) => {
    let monto = 7
    if (tipo === 'mensual') monto = 80
    if (tipo === 'trimestral') monto = 220
    
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
    
    if (pagoEditando) {
      const resultado = await editarPago(pagoEditando.id, formData)
      if (resultado) {
        toast.success('¡Suscripción Actualizada!', `${formData.tipo} de S/${formData.monto} actualizada`)
      } else {
        toast.error('Error', 'No se pudo actualizar la suscripción')
      }
    } else {
      const resultado = await agregarPago(formData)
      if (resultado) {
        toast.success('¡Suscripción Registrada!', `${formData.tipo} de S/${formData.monto} para ${cliente?.nombre || 'cliente'}`)
      } else {
        toast.error('Error', 'No se pudo registrar la suscripción')
      }
    }
    cerrarModal()
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Alerta de Suscripciones por Vencer */}
        <AnimatePresence>
          {suscripcionesPorVencer.length > 0 && mostrarAlertaVencer && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed right-4 top-20 w-80 z-40"
            >
              <div className="card-sparta p-4 border-l-4 border-orange-500 bg-orange-500/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <h4 className="font-semibold text-orange-500">Por Vencer ({suscripcionesPorVencer.length})</h4>
                  </div>
                  <button 
                    onClick={() => setMostrarAlertaVencer(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {suscripcionesPorVencer.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 truncate">{s.clienteNombre}</span>
                      <span className="text-orange-400 font-semibold">
                        {s.diasRestantes === 0 ? 'Hoy' : `${s.diasRestantes} días`}
                      </span>
                    </div>
                  ))}
                  {suscripcionesPorVencer.length > 5 && (
                    <p className="text-xs text-gray-500">+{suscripcionesPorVencer.length - 5} más...</p>
                  )}
                </div>
                <button
                  onClick={() => setMostrarAlertaVencer(false)}
                  className="w-full mt-3 py-2 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors text-sm font-medium"
                >
                  Aceptar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="table-sparta">
              <thead className="sticky top-0 bg-sparta-dark z-10">
                <tr>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Fecha Pago</th>
                  <th>Vence</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suscripcionesFiltradas.length > 0 ? suscripcionesFiltradas.map((item) => {
                  const fechaVenc = getFechaVencimiento(item)
                  const hoy = new Date()
                  const vencido = fechaVenc && fechaVenc < hoy
                  
                  return (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sparta-gold/20 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-sparta-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.clienteNombre}</p>
                          {item.clienteEmail && (
                            <p className="text-xs text-gray-400">{item.clienteEmail}</p>
                          )}
                        </div>
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
                    <td className="text-gray-300">{item.fecha}</td>
                    <td>
                      {fechaVenc ? (
                        <span className={`text-sm font-medium ${vencido ? 'text-red-500' : 'text-green-500'}`}>
                          {fechaVenc.toLocaleDateString('es-PE')}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="text-sparta-gold font-bold">S/ {Number(item.monto).toFixed(2)}</td>
                    <td>
                      <div className="flex gap-2">
                        {item.tipo !== 'diario' && (
                          <button
                            onClick={() => abrirModalRenovar(item)}
                            className="p-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 transition-colors"
                            title="Renovar suscripción"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => abrirModalEditar(item)}
                          className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirConfirmacion(item)}
                          className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
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
                    {pagoEditando ? 'Editar Suscripción' : 'Nueva Suscripción'}
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
                        <p className="text-xs text-gray-500">S/ 7</p>
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
                        <p className="text-xs text-gray-500">S/ 80</p>
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
                        <p className="text-xs text-gray-500">S/ 220</p>
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
                      {pagoEditando ? 'Guardar Cambios' : 'Registrar'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Confirmación Eliminar */}
        <AnimatePresence>
          {modalConfirmar && pagoAEliminar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setModalConfirmar(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="modal-content max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="font-sparta text-xl font-bold text-white mb-2">
                    Confirmar Eliminación
                  </h2>
                  <p className="text-gray-400 mb-6">
                    ¿Estás seguro de eliminar la suscripción de <span className="text-white font-semibold">"{pagoAEliminar.clienteNombre}"</span>?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setModalConfirmar(false)}
                      className="flex-1 py-3 border border-gray-600 text-gray-400 rounded hover:bg-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmarEliminacion}
                      className="flex-1 py-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Renovar Suscripción */}
        <AnimatePresence>
          {modalRenovar && suscripcionRenovar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setModalRenovar(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="modal-content max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-sparta text-xl font-bold text-sparta-gold">
                    Renovar Suscripción
                  </h2>
                  <button onClick={() => setModalRenovar(false)} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="card-sparta p-4 bg-sparta-darker">
                    <p className="text-white font-semibold">{suscripcionRenovar.clienteNombre}</p>
                    <p className="text-sm text-gray-400">
                      Vence: {getFechaVencimiento(suscripcionRenovar)?.toLocaleDateString('es-PE') || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tipo de Suscripción</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { tipo: 'mensual', precio: 80, label: 'Mensual', dias: 30 },
                        { tipo: 'trimestral', precio: 220, label: 'Trimestral', dias: 90 }
                      ].map(plan => (
                        <button
                          key={plan.tipo}
                          type="button"
                          onClick={() => setTipoRenovacion(plan.tipo)}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            tipoRenovacion === plan.tipo
                              ? 'border-sparta-gold bg-sparta-gold/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <p className={`font-semibold text-sm ${tipoRenovacion === plan.tipo ? 'text-sparta-gold' : 'text-gray-400'}`}>
                            {plan.label}
                          </p>
                          <p className="text-xs text-gray-500">S/ {plan.precio} - {plan.dias} días</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    * Si la suscripción aún no vence, los días restantes se sumarán al nuevo plan
                  </p>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalRenovar(false)}
                      className="flex-1 py-3 border border-gray-600 text-gray-400 rounded hover:bg-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleRenovar}
                      className="flex-1 sparta-button flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Renovar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Suscripciones
