import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Calendar, DollarSign, TrendingUp, Download, Filter, FileSpreadsheet, FileText } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

const Reportes = () => {
  const { pagos, ventas, clientes, obtenerReporte } = useData()
  const toast = useToast()
  
  const hoy = new Date()
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]
  
  const [fechaInicio, setFechaInicio] = useState(primerDiaMes)
  const [fechaFin, setFechaFin] = useState(ultimoDiaMes)
  const [tipoReporte, setTipoReporte] = useState('general')

  const reporte = useMemo(() => obtenerReporte(fechaInicio, fechaFin), [fechaInicio, fechaFin, pagos, ventas])

  const COLORS = ['#D4AF37', '#CD7F32', '#8B0000', '#4CAF50', '#2196F3']

  const datosBarras = useMemo(() => {
    const datos = {}
    
    reporte.pagos.forEach(p => {
      const fecha = p.fecha
      if (!datos[fecha]) datos[fecha] = { fecha, pagos: 0, ventas: 0 }
      datos[fecha].pagos += p.monto
    })
    
    reporte.ventas.forEach(v => {
      const fecha = v.fecha
      if (!datos[fecha]) datos[fecha] = { fecha, pagos: 0, ventas: 0 }
      datos[fecha].ventas += v.total
    })
    
    return Object.values(datos).sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  }, [reporte])

  const datosPie = useMemo(() => [
    { name: 'Pagos Mensuales', value: reporte.pagos.filter(p => p.tipo === 'mensual').reduce((acc, p) => acc + p.monto, 0) },
    { name: 'Pagos Diarios', value: reporte.pagos.filter(p => p.tipo === 'diario').reduce((acc, p) => acc + p.monto, 0) },
    { name: 'Ventas Productos', value: reporte.totalVentas },
  ].filter(d => d.value > 0), [reporte])

  const ventasPorCategoria = useMemo(() => {
    const categorias = {}
    reporte.ventas.forEach(v => {
      const categoria = v.productoNombre.includes('Agua') || v.productoNombre.includes('Bebida') 
        ? 'Bebidas' 
        : v.productoNombre.includes('Proteína') || v.productoNombre.includes('Creatina')
        ? 'Suplementos'
        : 'Otros'
      if (!categorias[categoria]) categorias[categoria] = 0
      categorias[categoria] += v.total
    })
    return Object.entries(categorias).map(([name, value]) => ({ name, value }))
  }, [reporte])

  const setPreset = (preset) => {
    const hoy = new Date()
    let inicio, fin
    
    switch (preset) {
      case 'hoy':
        inicio = fin = hoy.toISOString().split('T')[0]
        break
      case 'semana':
        const inicioSemana = new Date(hoy)
        inicioSemana.setDate(hoy.getDate() - hoy.getDay())
        inicio = inicioSemana.toISOString().split('T')[0]
        fin = hoy.toISOString().split('T')[0]
        break
      case 'mes':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
        fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]
        break
      case 'anio':
        inicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0]
        fin = new Date(hoy.getFullYear(), 11, 31).toISOString().split('T')[0]
        break
      default:
        return
    }
    
    setFechaInicio(inicio)
    setFechaFin(fin)
  }

  // Función para descargar Excel (CSV)
  const descargarExcel = () => {
    let csv = 'REPORTE SPARTA GYM\n'
    csv += `Período: ${fechaInicio} al ${fechaFin}\n\n`
    
    // Resumen
    csv += 'RESUMEN\n'
    csv += `Total Membresías,S/ ${reporte.totalPagos.toFixed(2)}\n`
    csv += `Total Ventas Productos,S/ ${reporte.totalVentas.toFixed(2)}\n`
    csv += `TOTAL GENERAL,S/ ${reporte.totalGeneral.toFixed(2)}\n\n`
    
    // Detalle Pagos
    csv += 'DETALLE DE MEMBRESÍAS\n'
    csv += 'Cliente,Tipo,Fecha,Monto\n'
    reporte.pagos.forEach(p => {
      csv += `${p.clienteNombre},${p.tipo},${p.fecha},${p.monto}\n`
    })
    
    csv += '\nDETALLE DE VENTAS\n'
    csv += 'Producto,Cantidad,Fecha,Total\n'
    reporte.ventas.forEach(v => {
      csv += `${v.productoNombre},${v.cantidad},${v.fecha},${v.total}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte_sparta_${fechaInicio}_${fechaFin}.csv`
    link.click()
    toast.success('¡Excel Descargado!', 'El reporte se ha exportado correctamente')
  }

  // Función para descargar PDF (HTML imprimible)
  const descargarPDF = () => {
    const ventana = window.open('', '_blank')
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte Sparta Gym</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
          h2 { color: #CD7F32; margin-top: 30px; }
          .resumen { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .resumen p { margin: 10px 0; font-size: 18px; }
          .total { font-size: 24px; font-weight: bold; color: #D4AF37; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #D4AF37; color: #000; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f9f9f9; }
          .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>🏛️ SPARTA GYM - Reporte</h1>
        <p><strong>Período:</strong> ${fechaInicio} al ${fechaFin}</p>
        
        <div class="resumen">
          <h2>📊 Resumen</h2>
          <p>Ingresos por Membresías: <strong>S/ ${reporte.totalPagos.toFixed(2)}</strong></p>
          <p>Ingresos por Productos: <strong>S/ ${reporte.totalVentas.toFixed(2)}</strong></p>
          <p class="total">TOTAL GENERAL: S/ ${reporte.totalGeneral.toFixed(2)}</p>
        </div>

        <h2>💳 Detalle de Membresías (${reporte.pagos.length})</h2>
        <table>
          <thead><tr><th>Cliente</th><th>Tipo</th><th>Fecha</th><th>Monto</th></tr></thead>
          <tbody>
            ${reporte.pagos.map(p => `<tr><td>${p.clienteNombre}</td><td>${p.tipo}</td><td>${p.fecha}</td><td>S/ ${Number(p.monto).toFixed(2)}</td></tr>`).join('')}
          </tbody>
        </table>

        <h2>🛒 Detalle de Ventas (${reporte.ventas.length})</h2>
        <table>
          <thead><tr><th>Producto</th><th>Cantidad</th><th>Fecha</th><th>Total</th></tr></thead>
          <tbody>
            ${reporte.ventas.map(v => `<tr><td>${v.productoNombre}</td><td>${v.cantidad}</td><td>${v.fecha}</td><td>S/ ${Number(v.total).toFixed(2)}</td></tr>`).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generado el ${new Date().toLocaleString()} - Sparta Gym © ${new Date().getFullYear()}</p>
        </div>
        
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    ventana.document.close()
    toast.success('¡PDF Generado!', 'Se abrió la ventana de impresión')
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-sparta text-3xl font-bold mb-2">
            <span className="text-gradient">REPORTES Y</span>
            <span className="text-white"> ESTADÍSTICAS</span>
          </h1>
          <p className="text-gray-400">Analiza el rendimiento de Sparta Gym</p>
        </motion.div>

        {/* Filtros de Fecha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-sparta p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1">
              <h3 className="font-semibold text-sparta-gold mb-3 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtrar por Fecha
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setPreset('hoy')}
                  className="px-4 py-2 bg-sparta-dark text-gray-400 rounded-lg hover:text-sparta-gold transition-colors"
                >
                  Hoy
                </button>
                <button
                  onClick={() => setPreset('semana')}
                  className="px-4 py-2 bg-sparta-dark text-gray-400 rounded-lg hover:text-sparta-gold transition-colors"
                >
                  Esta Semana
                </button>
                <button
                  onClick={() => setPreset('mes')}
                  className="px-4 py-2 bg-sparta-dark text-gray-400 rounded-lg hover:text-sparta-gold transition-colors"
                >
                  Este Mes
                </button>
                <button
                  onClick={() => setPreset('anio')}
                  className="px-4 py-2 bg-sparta-dark text-gray-400 rounded-lg hover:text-sparta-gold transition-colors"
                >
                  Este Año
                </button>
              </div>
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="input-sparta"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="input-sparta"
                  />
                </div>
              </div>
            </div>
            
            {/* Botones de descarga */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-400 mb-1">Descargar Reporte</p>
              <div className="flex gap-2">
                <button
                  onClick={descargarExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  onClick={descargarPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="card-sparta p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-sparta-gold to-sparta-bronze rounded-lg flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-sparta-darker" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Ingresos Totales</p>
                <p className="text-2xl font-bold text-sparta-gold">S/ {reporte.totalGeneral.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="card-sparta p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Por Membresías</p>
                <p className="text-2xl font-bold text-green-500">S/ {reporte.totalPagos.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="card-sparta p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Por Productos</p>
                <p className="text-2xl font-bold text-blue-500">S/ {reporte.totalVentas.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="card-sparta p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Transacciones</p>
                <p className="text-2xl font-bold text-purple-500">{reporte.pagos.length + reporte.ventas.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-sparta p-6"
          >
            <h3 className="font-sparta text-lg font-bold text-sparta-gold mb-4">Ingresos por Día</h3>
            {datosBarras.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosBarras}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="fecha" stroke="#888" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#888" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF37', borderRadius: '8px' }}
                    labelStyle={{ color: '#D4AF37' }}
                  />
                  <Legend />
                  <Bar dataKey="pagos" name="Membresías" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ventas" name="Productos" fill="#CD7F32" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No hay datos para mostrar en este rango de fechas
              </div>
            )}
          </motion.div>

          {/* Gráfico Pie */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="card-sparta p-6"
          >
            <h3 className="font-sparta text-lg font-bold text-sparta-gold mb-4">Distribución de Ingresos</h3>
            {datosPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF37', borderRadius: '8px' }}
                    formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Monto']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No hay datos para mostrar
              </div>
            )}
          </motion.div>
        </div>

        {/* Tablas de Detalle */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Detalle Pagos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-sparta overflow-hidden"
          >
            <div className="p-4 border-b border-sparta-gold/20">
              <h3 className="font-sparta text-lg font-bold text-sparta-gold">Detalle de Membresías</h3>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="table-sparta">
                <thead className="sticky top-0">
                  <tr>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.pagos.length > 0 ? reporte.pagos.map((pago, index) => (
                    <tr key={index}>
                      <td className="text-white">{pago.clienteNombre}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          pago.tipo === 'mensual' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {pago.tipo}
                        </span>
                      </td>
                      <td className="text-gray-400">{pago.fecha}</td>
                      <td className="text-sparta-gold font-semibold">S/ {pago.monto.toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        No hay pagos en este periodo
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-sparta-gold/20 bg-sparta-darker">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Membresías:</span>
                <span className="text-xl font-bold text-sparta-gold">S/ {reporte.totalPagos.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Detalle Ventas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-sparta overflow-hidden"
          >
            <div className="p-4 border-b border-sparta-gold/20">
              <h3 className="font-sparta text-lg font-bold text-sparta-gold">Detalle de Ventas</h3>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="table-sparta">
                <thead className="sticky top-0">
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Fecha</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.ventas.length > 0 ? reporte.ventas.map((venta, index) => (
                    <tr key={index}>
                      <td className="text-white">{venta.productoNombre}</td>
                      <td className="text-gray-400">{venta.cantidad}</td>
                      <td className="text-gray-400">{venta.fecha}</td>
                      <td className="text-sparta-gold font-semibold">S/ {venta.total.toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">
                        No hay ventas en este periodo
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-sparta-gold/20 bg-sparta-darker">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Ventas:</span>
                <span className="text-xl font-bold text-sparta-gold">S/ {reporte.totalVentas.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Resumen Final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 card-sparta p-6 bg-gradient-to-r from-sparta-gold/10 to-sparta-bronze/10 border-sparta-gold"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-sparta text-xl font-bold text-sparta-gold mb-1">Resumen del Periodo</h3>
              <p className="text-gray-400">Del {fechaInicio} al {fechaFin}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400 mb-1">INGRESOS TOTALES</p>
              <p className="text-4xl font-bold text-gradient">S/ {reporte.totalGeneral.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Reportes
