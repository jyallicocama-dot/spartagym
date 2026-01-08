import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Plus, Search, Edit, Trash2, X, ShoppingCart, AlertTriangle, Tag, Settings } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

const Productos = () => {
  const { productos, ventas, categorias, agregarProducto, editarProducto, eliminarProducto, venderProducto, agregarCategoria: agregarCategoriaDB, eliminarCategoria, getProductosBajoStock } = useData()
  const toast = useToast()
  const productosBajoStock = getProductosBajoStock()
  const [mostrarAlertaStock, setMostrarAlertaStock] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [modalProducto, setModalProducto] = useState(false)
  const [modalVenta, setModalVenta] = useState(false)
  const [modalCategoria, setModalCategoria] = useState(false)
  const [modalGestionCategorias, setModalGestionCategorias] = useState(false)
  const [modalConfirmar, setModalConfirmar] = useState(false)
  const [itemAEliminar, setItemAEliminar] = useState(null)
  const [tipoEliminar, setTipoEliminar] = useState('')
  const [productoEditando, setProductoEditando] = useState(null)
  const [productoVenta, setProductoVenta] = useState(null)
  const [cantidadVenta, setCantidadVenta] = useState(1)
  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    categoria: 'Bebidas'
  })

  // Categorías desde BD + las que existan en productos
  const categoriasBase = ['Bebidas', 'Suplementos', 'Snacks', 'Accesorios']
  const categoriasDB = categorias?.map(c => c.nombre) || []
  const categoriasProductos = [...new Set(productos.map(p => p.categoria).filter(Boolean))]
  const todasCategorias = [...new Set([...categoriasBase, ...categoriasDB, ...categoriasProductos])]

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchCategoria = filtroCategoria === 'todas' || p.categoria === filtroCategoria
    return matchBusqueda && matchCategoria
  })

  const totalInventario = productos.reduce((acc, p) => acc + (p.precio * p.stock), 0)
  const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0)
  const productosStockBajo = productos.filter(p => p.stock < 10).length

  const abrirModalNuevo = () => {
    setProductoEditando(null)
    setFormData({ nombre: '', precio: '', stock: '', categoria: 'Bebidas' })
    setModalProducto(true)
  }

  const abrirModalEditar = (producto) => {
    setProductoEditando(producto)
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      categoria: producto.categoria
    })
    setModalProducto(true)
  }

  const abrirModalVenta = (producto) => {
    setProductoVenta(producto)
    setCantidadVenta(1)
    setModalVenta(true)
  }

  const cerrarModales = () => {
    setModalProducto(false)
    setModalVenta(false)
    setModalCategoria(false)
    setProductoEditando(null)
    setProductoVenta(null)
    setNuevaCategoria('')
  }

  const handleAgregarCategoria = async () => {
    if (nuevaCategoria.trim() && !todasCategorias.includes(nuevaCategoria.trim())) {
      const result = await agregarCategoriaDB(nuevaCategoria.trim())
      if (result) {
        setFormData({ ...formData, categoria: nuevaCategoria.trim() })
        toast.success('¡Categoría creada!', `${nuevaCategoria.trim()} guardada en la base de datos`)
      } else {
        setFormData({ ...formData, categoria: nuevaCategoria.trim() })
        toast.info('Categoría temporal', `${nuevaCategoria.trim()} disponible para este producto`)
      }
      setModalCategoria(false)
      setNuevaCategoria('')
    }
  }

  const handleEliminarCategoria = async (catNombre) => {
    const cat = categorias?.find(c => c.nombre === catNombre)
    if (cat) {
      const result = await eliminarCategoria(cat.id)
      if (result) {
        toast.success('¡Categoría eliminada!', `${catNombre} ha sido eliminada`)
      }
    }
  }

  const handleSubmitProducto = async (e) => {
    e.preventDefault()
    const datos = {
      nombre: formData.nombre,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      categoria: formData.categoria
    }
    
    if (productoEditando) {
      await editarProducto(productoEditando.id, datos)
      toast.success('¡Producto Actualizado!', `${datos.nombre} ha sido actualizado`)
    } else {
      const resultado = await agregarProducto(datos)
      if (resultado) {
        toast.success('¡Producto Agregado!', `${datos.nombre} ha sido agregado al inventario`)
      } else {
        toast.error('Error', 'No se pudo agregar el producto')
      }
    }
    cerrarModales()
  }

  const handleVenta = async () => {
    if (productoVenta && cantidadVenta > 0) {
      const resultado = await venderProducto(productoVenta.id, cantidadVenta)
      if (resultado) {
        toast.success('¡Venta Realizada!', `${cantidadVenta}x ${productoVenta.nombre} - Total: S/${(productoVenta.precio * cantidadVenta).toFixed(2)}`)
      } else {
        toast.error('Error', 'No se pudo completar la venta')
      }
      cerrarModales()
    }
  }

  const abrirConfirmacion = (item, tipo) => {
    setItemAEliminar(item)
    setTipoEliminar(tipo)
    setModalConfirmar(true)
  }

  const confirmarEliminacion = async () => {
    if (tipoEliminar === 'producto') {
      await eliminarProducto(itemAEliminar.id)
      toast.success('¡Producto Eliminado!', `${itemAEliminar?.nombre} ha sido eliminado del inventario`)
    } else if (tipoEliminar === 'categoria') {
      const cat = categorias?.find(c => c.nombre === itemAEliminar)
      if (cat) {
        const result = await eliminarCategoria(cat.id)
        if (result) {
          toast.success('¡Categoría Eliminada!', `${itemAEliminar} ha sido eliminada`)
        }
      }
    }
    setModalConfirmar(false)
    setItemAEliminar(null)
    setTipoEliminar('')
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Alerta de Stock Bajo */}
        <AnimatePresence>
          {productosBajoStock.length > 0 && mostrarAlertaStock && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed right-4 top-20 w-80 z-40"
            >
              <div className="card-sparta p-4 border-l-4 border-red-500 bg-red-500/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h4 className="font-semibold text-red-500">Stock Bajo ({productosBajoStock.length})</h4>
                  </div>
                  <button 
                    onClick={() => setMostrarAlertaStock(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {productosBajoStock.slice(0, 5).map(p => (
                    <div key={p.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 truncate">{p.nombre}</span>
                      <span className="text-red-400 font-semibold">{p.stock} uds</span>
                    </div>
                  ))}
                  {productosBajoStock.length > 5 && (
                    <p className="text-xs text-gray-500">+{productosBajoStock.length - 5} más...</p>
                  )}
                </div>
                <button
                  onClick={() => setMostrarAlertaStock(false)}
                  className="w-full mt-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm font-medium"
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
              <span className="text-gradient">INVENTARIO Y</span>
              <span className="text-white"> PRODUCTOS</span>
            </h1>
            <p className="text-gray-400">Gestiona el inventario y las ventas</p>
          </div>
          
          <button
            onClick={abrirModalNuevo}
            className="sparta-button flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
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
                <Package className="w-6 h-6 text-sparta-gold" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Productos</p>
                <p className="text-xl font-bold text-white">{productos.length}</p>
              </div>
            </div>
          </div>
          <div className="card-sparta p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Ventas</p>
                <p className="text-xl font-bold text-white">S/ {totalVentas.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="card-sparta p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Valor Inventario</p>
                <p className="text-xl font-bold text-white">S/ {totalInventario.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="card-sparta p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${productosStockBajo > 0 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                <AlertTriangle className={`w-6 h-6 ${productosStockBajo > 0 ? 'text-red-500' : 'text-green-500'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Stock Bajo</p>
                <p className="text-xl font-bold text-white">{productosStockBajo}</p>
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
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-sparta pl-12"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setFiltroCategoria('todas')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filtroCategoria === 'todas' 
                  ? 'bg-sparta-gold text-sparta-darker' 
                  : 'bg-sparta-dark text-gray-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            {todasCategorias.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filtroCategoria === cat 
                    ? 'bg-sparta-gold text-sparta-darker' 
                    : 'bg-sparta-dark text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setModalGestionCategorias(true)}
              className="p-2 bg-sparta-gold/20 text-sparta-gold rounded-lg hover:bg-sparta-gold/30 transition-colors"
              title="Gestionar categorías"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {productosFiltrados.length > 0 ? productosFiltrados.map((producto) => (
            <div key={producto.id} className="card-sparta p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  producto.categoria === 'Bebidas' ? 'bg-blue-500/20' :
                  producto.categoria === 'Suplementos' ? 'bg-purple-500/20' :
                  producto.categoria === 'Snacks' ? 'bg-orange-500/20' :
                  'bg-green-500/20'
                }`}>
                  <Package className={`w-6 h-6 ${
                    producto.categoria === 'Bebidas' ? 'text-blue-500' :
                    producto.categoria === 'Suplementos' ? 'text-purple-500' :
                    producto.categoria === 'Snacks' ? 'text-orange-500' :
                    'text-green-500'
                  }`} />
                </div>
                <span className="px-2 py-1 bg-sparta-gold/20 text-sparta-gold text-xs rounded-full">
                  {producto.categoria}
                </span>
              </div>
              
              <h3 className="font-semibold text-white mb-1">{producto.nombre}</h3>
              <p className="text-2xl font-bold text-sparta-gold mb-2">S/ {producto.precio.toFixed(2)}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm ${producto.stock < 10 ? 'text-red-500' : 'text-gray-400'}`}>
                  Stock: {producto.stock} unidades
                </span>
                {producto.stock < 10 && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => abrirModalVenta(producto)}
                  disabled={producto.stock === 0}
                  className={`flex-1 py-2 rounded flex items-center justify-center gap-1 transition-all ${
                    producto.stock === 0 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Vender
                </button>
                <button
                  onClick={() => abrirModalEditar(producto)}
                  className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => abrirConfirmacion(producto, 'producto')}
                  className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12 text-gray-400">
              No se encontraron productos
            </div>
          )}
        </motion.div>

        {/* Historial de Ventas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="font-sparta text-xl font-bold text-sparta-gold mb-4">Historial de Ventas</h2>
          <div className="card-sparta overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-sparta">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Fecha</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.length > 0 ? ventas.slice().reverse().map((venta) => (
                    <tr key={venta.id}>
                      <td className="font-medium text-white">{venta.productoNombre}</td>
                      <td className="text-gray-300">{venta.cantidad}</td>
                      <td className="text-gray-300">{venta.fecha}</td>
                      <td className="text-sparta-gold font-bold">S/ {venta.total.toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        No hay ventas registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Modal Producto */}
        <AnimatePresence>
          {modalProducto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={cerrarModales}
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
                    {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <button onClick={cerrarModales} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitProducto} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nombre del Producto</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="input-sparta"
                      placeholder="Ej: Proteína Whey"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Precio (S/)</label>
                      <input
                        type="number"
                        value={formData.precio}
                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                        className="input-sparta"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Stock</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="input-sparta"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Categoría</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        className="input-sparta flex-1"
                        required
                      >
                        {todasCategorias.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setModalCategoria(true)}
                        className="px-3 py-2 bg-sparta-gold/20 text-sparta-gold rounded hover:bg-sparta-gold/30 transition-colors"
                        title="Nueva categoría"
                      >
                        <Tag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cerrarModales}
                      className="flex-1 py-3 border border-gray-600 text-gray-400 rounded hover:bg-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sparta-button"
                    >
                      {productoEditando ? 'Guardar Cambios' : 'Agregar Producto'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Venta */}
        <AnimatePresence>
          {modalVenta && productoVenta && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={cerrarModales}
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
                    Registrar Venta
                  </h2>
                  <button onClick={cerrarModales} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="card-sparta p-4 bg-sparta-darker">
                    <h3 className="font-semibold text-white mb-1">{productoVenta.nombre}</h3>
                    <p className="text-sparta-gold text-lg font-bold">S/ {productoVenta.precio.toFixed(2)} c/u</p>
                    <p className="text-sm text-gray-400">Stock disponible: {productoVenta.stock}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Cantidad</label>
                    <input
                      type="number"
                      value={cantidadVenta}
                      onChange={(e) => setCantidadVenta(Math.min(parseInt(e.target.value) || 1, productoVenta.stock))}
                      className="input-sparta"
                      min="1"
                      max={productoVenta.stock}
                    />
                  </div>

                  <div className="card-sparta p-4 bg-sparta-gold/10 border-sparta-gold">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total a cobrar:</span>
                      <span className="text-2xl font-bold text-sparta-gold">
                        S/ {(productoVenta.precio * cantidadVenta).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cerrarModales}
                      className="flex-1 py-3 border border-gray-600 text-gray-400 rounded hover:bg-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleVenta}
                      className="flex-1 sparta-button flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Confirmar Venta
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Nueva Categoría */}
        <AnimatePresence>
          {modalCategoria && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setModalCategoria(false)}
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
                    Nueva Categoría
                  </h2>
                  <button onClick={() => setModalCategoria(false)} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nombre de la categoría</label>
                    <input
                      type="text"
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      className="input-sparta"
                      placeholder="Ej: Ropa deportiva"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalCategoria(false)}
                      className="flex-1 py-3 border border-gray-600 text-gray-400 rounded hover:bg-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAgregarCategoria}
                      disabled={!nuevaCategoria.trim()}
                      className="flex-1 sparta-button disabled:opacity-50"
                    >
                      Crear Categoría
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Confirmación Eliminar */}
        <AnimatePresence>
          {modalConfirmar && (
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
                    ¿Estás seguro de eliminar {tipoEliminar === 'producto' ? `"${itemAEliminar?.nombre}"` : `la categoría "${itemAEliminar}"`}?
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

        {/* Modal Gestión de Categorías */}
        <AnimatePresence>
          {modalGestionCategorias && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setModalGestionCategorias(false)}
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
                    Gestionar Categorías
                  </h2>
                  <button onClick={() => setModalGestionCategorias(false)} className="text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {categorias && categorias.length > 0 ? (
                    categorias.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-sparta-darker rounded-lg">
                        <div className="flex items-center gap-3">
                          <Tag className="w-4 h-4 text-sparta-gold" />
                          <span className="text-white">{cat.nombre}</span>
                        </div>
                        <button
                          onClick={() => {
                            setModalGestionCategorias(false)
                            abrirConfirmacion(cat.nombre, 'categoria')
                          }}
                          className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No hay categorías personalizadas</p>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  * Las categorías base (Bebidas, Suplementos, Snacks, Accesorios) no se pueden eliminar
                </p>

                <button
                  onClick={() => {
                    setModalGestionCategorias(false)
                    setModalCategoria(true)
                  }}
                  className="w-full sparta-button flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Categoría
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Productos
