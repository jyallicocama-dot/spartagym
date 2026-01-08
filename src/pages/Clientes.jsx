import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Edit, Trash2, X, UserPlus, Phone, Mail, Calendar, RefreshCw, AlertTriangle, UserCheck, UserX } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

const Clientes = () => {
  const { clientes, pagos, agregarCliente, editarCliente, eliminarCliente, agregarPago } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const [modalRenovar, setModalRenovar] = useState(false)
  const [clienteRenovar, setClienteRenovar] = useState(null)
  const [tipoRenovacion, setTipoRenovacion] = useState('mensual')
  const [modalConfirmar, setModalConfirmar] = useState(false)
  const [clienteAEliminar, setClienteAEliminar] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    email: ''
  })

  // Calcular fecha de vencimiento de suscripción
  const getFechaVencimiento = (clienteId) => {
    const suscripciones = pagos.filter(p => (p.cliente_id === clienteId || p.clienteId === clienteId) && p.tipo !== 'diario')
    if (suscripciones.length === 0) return null
    
    const ultima = suscripciones[suscripciones.length - 1]
    const fechaPago = new Date(ultima.fecha)
    
    if (ultima.tipo === 'mensual') {
      fechaPago.setMonth(fechaPago.getMonth() + 1)
    } else if (ultima.tipo === 'trimestral') {
      fechaPago.setMonth(fechaPago.getMonth() + 3)
    }
    
    return fechaPago
  }

  const clientesFiltrados = clientes.filter(c => {
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.dni && c.dni.includes(busqueda)) ||
      (c.telefono && c.telefono.includes(busqueda))
    const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado
    return matchBusqueda && matchEstado
  })

  const abrirModalNuevo = () => {
    setClienteEditando(null)
    setFormData({ nombre: '', dni: '', telefono: '', email: '' })
    setModalAbierto(true)
  }

  const abrirModalEditar = (cliente) => {
    setClienteEditando(cliente)
    setFormData({
      nombre: cliente.nombre,
      dni: cliente.dni,
      telefono: cliente.telefono,
      email: cliente.email
    })
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setClienteEditando(null)
    setFormData({ nombre: '', dni: '', telefono: '', email: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (clienteEditando) {
      await editarCliente(clienteEditando.id, formData)
      toast.success('¡Cliente Actualizado!', `${formData.nombre} ha sido actualizado correctamente`)
    } else {
      const resultado = await agregarCliente(formData)
      if (resultado) {
        toast.success('¡Cliente Registrado!', `${formData.nombre} ha sido agregado exitosamente`)
      } else {
        toast.error('Error', 'No se pudo registrar el cliente')
      }
    }
    cerrarModal()
  }

  const abrirConfirmacion = (cliente) => {
    setClienteAEliminar(cliente)
    setModalConfirmar(true)
  }

  const confirmarEliminacion = async () => {
    await eliminarCliente(clienteAEliminar.id)
    toast.success('¡Cliente Eliminado!', `${clienteAEliminar?.nombre} ha sido eliminado`)
    setModalConfirmar(false)
    setClienteAEliminar(null)
  }

  const cambiarEstado = async (cliente) => {
    const nuevoEstado = cliente.estado === 'activo' ? 'inactivo' : 'activo'
    await editarCliente(cliente.id, { estado: nuevoEstado })
    toast.success('¡Estado Actualizado!', `${cliente.nombre} ahora está ${nuevoEstado}`)
  }

  // Obtener última suscripción de un cliente
  const getUltimaSuscripcion = (clienteId) => {
    const suscripciones = pagos.filter(p => p.clienteId === clienteId || p.cliente_id === clienteId)
    return suscripciones.length > 0 ? suscripciones[suscripciones.length - 1] : null
  }

  const abrirModalRenovar = (cliente) => {
    setClienteRenovar(cliente)
    const ultima = getUltimaSuscripcion(cliente.id)
    setTipoRenovacion(ultima?.tipo || 'mensual')
    setModalRenovar(true)
  }

  const handleRenovar = async () => {
    if (!clienteRenovar) return
    const montos = { diario: 7, mensual: 80, trimestral: 220 }
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const mesActual = `${meses[new Date().getMonth()]} ${new Date().getFullYear()}`
    
    const resultado = await agregarPago({
      clienteId: clienteRenovar.id,
      tipo: tipoRenovacion,
      monto: montos[tipoRenovacion],
      mes: tipoRenovacion !== 'diario' ? mesActual : null
    })
    
    if (resultado) {
      toast.success('¡Suscripción Renovada!', `${clienteRenovar.nombre} - Plan ${tipoRenovacion} S/${montos[tipoRenovacion]}`)
    }
    setModalRenovar(false)
    setClienteRenovar(null)
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
              <span className="text-white"> CLIENTES</span>
            </h1>
            <p className="text-gray-400">Administra los guerreros de Sparta Gym</p>
          </div>
          
          <button
            onClick={abrirModalNuevo}
            className="sparta-button flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Nuevo Cliente
          </button>
        </motion.div>

        {/* Search Bar y Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-sparta pl-12"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filtroEstado === 'todos' 
                  ? 'bg-sparta-gold text-sparta-darker' 
                  : 'bg-sparta-dark text-gray-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroEstado('activo')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                filtroEstado === 'activo' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-sparta-dark text-gray-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Activos
            </button>
            <button
              onClick={() => setFiltroEstado('inactivo')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                filtroEstado === 'inactivo' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-sparta-dark text-gray-400 hover:text-white'
              }`}
            >
              <UserX className="w-4 h-4" />
              Inactivos
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="card-sparta p-4 text-center">
            <p className="text-2xl font-bold text-sparta-gold">{clientes.length}</p>
            <p className="text-sm text-gray-400">Total Clientes</p>
          </div>
          <div className="card-sparta p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{clientes.filter(c => c.estado === 'activo').length}</p>
            <p className="text-sm text-gray-400">Activos</p>
          </div>
          <div className="card-sparta p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{clientesFiltrados.length}</p>
            <p className="text-sm text-gray-400">Mostrando</p>
          </div>
          <div className="card-sparta p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">
              {clientes.filter(c => {
                const fecha = new Date(c.fechaRegistro)
                const ahora = new Date()
                return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
              }).length}
            </p>
            <p className="text-sm text-gray-400">Nuevos este mes</p>
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
                  <th>DNI</th>
                  <th>Contacto</th>
                  <th>Registro</th>
                  <th>Vence</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length > 0 ? clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sparta-gold/20 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-sparta-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{cliente.nombre}</p>
                          <p className="text-xs text-gray-400">{cliente.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-300">{cliente.dni}</td>
                    <td>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4 text-sparta-gold" />
                        {cliente.telefono}
                      </div>
                    </td>
                    <td className="text-gray-300">{cliente.fechaRegistro}</td>
                    <td>
                      {(() => {
                        const fechaVenc = getFechaVencimiento(cliente.id)
                        if (!fechaVenc) return <span className="text-gray-500">Sin suscripción</span>
                        const hoy = new Date()
                        const vencido = fechaVenc < hoy
                        return (
                          <span className={`text-sm ${vencido ? 'text-red-500' : 'text-green-500'}`}>
                            {fechaVenc.toLocaleDateString('es-PE')}
                          </span>
                        )
                      })()}
                    </td>
                    <td>
                      <button
                        onClick={() => cambiarEstado(cliente)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                          cliente.estado === 'activo' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                        {cliente.estado}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirModalRenovar(cliente)}
                          className="p-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 transition-colors"
                          title="Renovar suscripción"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModalEditar(cliente)}
                          className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 transition-colors"
                          title="Editar cliente"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirConfirmacion(cliente)}
                          className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No se encontraron clientes
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
                    {clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'}
                  </h2>
                  <button onClick={cerrarModal} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="input-sparta"
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Celular <span className="text-sparta-gold">*</span></label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="input-sparta"
                      placeholder="Ej: 987654321"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">DNI <span className="text-gray-500">(opcional)</span></label>
                    <input
                      type="text"
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      className="input-sparta"
                      placeholder="Ej: 12345678"
                      maxLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-sparta"
                      placeholder="Ej: correo@ejemplo.com"
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
                      {clienteEditando ? 'Guardar Cambios' : 'Registrar Cliente'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Renovar Suscripción */}
        <AnimatePresence>
          {modalRenovar && clienteRenovar && (
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
                    <p className="text-white font-semibold">{clienteRenovar.nombre}</p>
                    <p className="text-sm text-gray-400">{clienteRenovar.telefono}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tipo de Suscripción</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { tipo: 'diario', precio: 7, label: 'Diario' },
                        { tipo: 'mensual', precio: 80, label: 'Mensual' },
                        { tipo: 'trimestral', precio: 220, label: 'Trimestral' }
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
                          <p className="text-xs text-gray-500">S/ {plan.precio}</p>
                        </button>
                      ))}
                    </div>
                  </div>

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

        {/* Modal Confirmación Eliminar */}
        <AnimatePresence>
          {modalConfirmar && clienteAEliminar && (
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
                    ¿Estás seguro de eliminar a <span className="text-white font-semibold">"{clienteAEliminar.nombre}"</span>?
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
      </div>
    </div>
  )
}

export default Clientes
