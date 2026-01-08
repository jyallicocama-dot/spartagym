import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Search, Edit, Trash2, X, UserPlus, Phone, Mail, Calendar } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

const Clientes = () => {
  const { clientes, agregarCliente, editarCliente, eliminarCliente } = useData()
  const toast = useToast()
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    email: ''
  })

  const clientesFiltrados = clientes.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.dni.includes(busqueda) ||
    c.telefono.includes(busqueda)
  )

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

  const handleEliminar = async (id) => {
    const cliente = clientes.find(c => c.id === id)
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      await eliminarCliente(id)
      toast.success('¡Cliente Eliminado!', `${cliente?.nombre} ha sido eliminado`)
    }
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

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-sparta pl-12"
            />
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
          <div className="overflow-x-auto">
            <table className="table-sparta">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>DNI</th>
                  <th>Contacto</th>
                  <th>Registro</th>
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cliente.estado === 'activo' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {cliente.estado}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirModalEditar(cliente)}
                          className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(cliente.id)}
                          className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
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
                    <label className="block text-sm text-gray-400 mb-2">DNI</label>
                    <input
                      type="text"
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      className="input-sparta"
                      placeholder="Ej: 12345678"
                      maxLength={8}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Teléfono</label>
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
      </div>
    </div>
  )
}

export default Clientes
