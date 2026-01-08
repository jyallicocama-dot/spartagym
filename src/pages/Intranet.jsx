import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, CreditCard, Package, BarChart3, TrendingUp, DollarSign, UserPlus, ShoppingBag } from 'lucide-react'
import { useData } from '../context/DataContext'

const Intranet = () => {
  const { clientes, pagos, productos, ventas } = useData()

  const hoy = new Date().toISOString().split('T')[0]
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const pagosHoy = pagos.filter(p => p.fecha === hoy).reduce((acc, p) => acc + p.monto, 0)
  const ventasHoy = ventas.filter(v => v.fecha === hoy).reduce((acc, v) => acc + v.total, 0)
  const totalHoy = pagosHoy + ventasHoy

  const pagosMes = pagos.filter(p => p.fecha >= inicioMes).reduce((acc, p) => acc + p.monto, 0)
  const ventasMes = ventas.filter(v => v.fecha >= inicioMes).reduce((acc, v) => acc + v.total, 0)
  const totalMes = pagosMes + ventasMes

  const clientesActivos = clientes.filter(c => c.estado === 'activo').length
  const productosStock = productos.reduce((acc, p) => acc + p.stock, 0)

  const stats = [
    { 
      titulo: 'Ingresos Hoy', 
      valor: `S/ ${totalHoy.toFixed(2)}`, 
      icon: DollarSign, 
      color: 'from-green-500 to-emerald-600',
      subtitulo: `Pagos: S/${pagosHoy} | Ventas: S/${ventasHoy}`
    },
    { 
      titulo: 'Ingresos del Mes', 
      valor: `S/ ${totalMes.toFixed(2)}`, 
      icon: TrendingUp, 
      color: 'from-sparta-gold to-sparta-bronze',
      subtitulo: `Pagos: S/${pagosMes} | Ventas: S/${ventasMes}`
    },
    { 
      titulo: 'Clientes Activos', 
      valor: clientesActivos, 
      icon: Users, 
      color: 'from-blue-500 to-indigo-600',
      subtitulo: `${clientes.length} registrados en total`
    },
    { 
      titulo: 'Stock Productos', 
      valor: productosStock, 
      icon: Package, 
      color: 'from-purple-500 to-pink-600',
      subtitulo: `${productos.length} productos diferentes`
    },
  ]

  const accesosRapidos = [
    { titulo: 'Clientes', descripcion: 'Gestionar clientes', icon: Users, path: '/intranet/clientes', color: 'blue' },
    { titulo: 'Pagos', descripcion: 'Registrar pagos', icon: CreditCard, path: '/intranet/pagos', color: 'green' },
    { titulo: 'Productos', descripcion: 'Inventario y ventas', icon: Package, path: '/intranet/productos', color: 'purple' },
    { titulo: 'Reportes', descripcion: 'Ver estadísticas', icon: BarChart3, path: '/intranet/reportes', color: 'orange' },
  ]

  const ultimosPagos = pagos.slice(-5).reverse()
  const ultimasVentas = ventas.slice(-5).reverse()

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-sparta text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gradient">PANEL DE</span>
            <span className="text-white"> CONTROL</span>
          </h1>
          <p className="text-gray-400">Bienvenido al sistema de gestión de Sparta Gym</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-sparta p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.titulo}</h3>
              <p className="text-2xl font-bold text-white mb-1">{stat.valor}</p>
              <p className="text-xs text-gray-500">{stat.subtitulo}</p>
            </motion.div>
          ))}
        </div>

        {/* Accesos Rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="font-sparta text-xl font-bold text-sparta-gold mb-4">Accesos Rápidos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {accesosRapidos.map((acceso, index) => (
              <Link
                key={index}
                to={acceso.path}
                className="card-sparta p-6 text-center group hover:border-sparta-gold transition-all"
              >
                <div className={`w-14 h-14 mx-auto mb-3 rounded-full bg-${acceso.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <acceso.icon className={`w-7 h-7 text-sparta-gold`} />
                </div>
                <h3 className="font-semibold text-white mb-1">{acceso.titulo}</h3>
                <p className="text-xs text-gray-400">{acceso.descripcion}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Últimos Pagos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card-sparta p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sparta text-lg font-bold text-sparta-gold flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Últimos Pagos
              </h3>
              <Link to="/intranet/pagos" className="text-sm text-sparta-gold hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="space-y-3">
              {ultimosPagos.length > 0 ? ultimosPagos.map((pago, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-sparta-gold/10 last:border-0">
                  <div>
                    <p className="text-white font-medium">{pago.clienteNombre}</p>
                    <p className="text-xs text-gray-400">{pago.fecha} • {pago.tipo}</p>
                  </div>
                  <span className="text-sparta-gold font-semibold">S/ {pago.monto}</span>
                </div>
              )) : (
                <p className="text-gray-400 text-center py-4">No hay pagos registrados</p>
              )}
            </div>
          </motion.div>

          {/* Últimas Ventas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card-sparta p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sparta text-lg font-bold text-sparta-gold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Últimas Ventas
              </h3>
              <Link to="/intranet/productos" className="text-sm text-sparta-gold hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="space-y-3">
              {ultimasVentas.length > 0 ? ultimasVentas.map((venta, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-sparta-gold/10 last:border-0">
                  <div>
                    <p className="text-white font-medium">{venta.productoNombre}</p>
                    <p className="text-xs text-gray-400">{venta.fecha} • Cantidad: {venta.cantidad}</p>
                  </div>
                  <span className="text-sparta-gold font-semibold">S/ {venta.total}</span>
                </div>
              )) : (
                <p className="text-gray-400 text-center py-4">No hay ventas registradas</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Intranet
