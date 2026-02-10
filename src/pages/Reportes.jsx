import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Calendar, DollarSign, TrendingUp, Download, Filter, FileSpreadsheet, FileText, AlertTriangle } from 'lucide-react'
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
  const [filtroVenta, setFiltroVenta] = useState('todos')

  const reporte = useMemo(() => obtenerReporte(fechaInicio, fechaFin), [fechaInicio, fechaFin, pagos, ventas])

  const COLORS = ['#D4AF37', '#CD7F32', '#8B0000', '#4CAF50', '#2196F3']

  const datosBarras = useMemo(() => {
    const datos = {}

    // Pagos de membresías (ya vienen filtrados)
    reporte.pagos.forEach(p => {
      const fecha = p.fecha
      if (!datos[fecha]) datos[fecha] = { fecha, pagos: 0, ventas: 0, fiados: 0 }
      datos[fecha].pagos += p.monto
    })

    // Ventas en efectivo
    reporte.ventas.filter(v => v.metodo_pago === 'efectivo').forEach(v => {
      const fecha = v.fecha
      if (!datos[fecha]) datos[fecha] = { fecha, pagos: 0, ventas: 0, fiados: 0 }
      datos[fecha].ventas += v.total
    })

    // Abonos de deudas (Pagos tipo producto)
    if (reporte.pagosProductos) {
      reporte.pagosProductos.forEach(p => {
        const fecha = p.fecha
        if (!datos[fecha]) datos[fecha] = { fecha, pagos: 0, ventas: 0, fiados: 0 }
        datos[fecha].ventas += p.monto
      })
    }

    // Fiados Generados (Deuda creada)
    reporte.ventas.filter(v => v.metodo_pago === 'fiado').forEach(v => {
      const fecha = v.fecha
      if (!datos[fecha]) datos[fecha] = { fecha, pagos: 0, ventas: 0, fiados: 0 }
      datos[fecha].fiados += v.total
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
    csv += 'RESUMEN DE CAJA\n'
    csv += `Total Membresías,S/ ${reporte.totalPagos.toFixed(2)}\n`
    csv += `Total Ventas (Efectivo),S/ ${(reporte.totalVentasEfectivo || 0).toFixed(2)}\n`
    csv += `Total Cobros (Deudas),S/ ${(reporte.totalAbonosProductos || 0).toFixed(2)}\n`
    csv += `TOTAL RECIBIDO (CAJA),S/ ${reporte.totalGeneral.toFixed(2)}\n`
    csv += `TOTAL FIADOS GENERADOS (DEUDA),S/ ${(reporte.totalFiadoGenerado || 0).toFixed(2)}\n\n`

    // Detalle Pagos
    csv += 'DETALLE DE MEMBRESÍAS\n'
    csv += 'Cliente,Tipo,Fecha,Monto\n'
    reporte.pagos.forEach(p => {
      csv += `${p.clienteNombre},${p.tipo},${p.fecha},${p.monto}\n`
    })

    csv += '\nDETALLE DE MOVIMIENTO DE PRODUCTOS\n'
    csv += 'Producto,Cantidad,Fecha,Metodo,Total\n'
    reporte.ventas.forEach(v => {
      csv += `${v.productoNombre},${v.cantidad},${v.fecha},${v.metodo_pago.toUpperCase()},${v.total}\n`
    })

    if (reporte.pagosProductos?.length > 0) {
      csv += '\nCOBROS DE DEUDAS (FIADOS)\n'
      csv += 'Cliente,Nota,Fecha,Monto Pago\n'
      reporte.pagosProductos.forEach(p => {
        csv += `${p.clienteNombre},${p.notas || 'Cobro Fiado'},${p.fecha},${p.monto}\n`
      })
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte_sparta_${fechaInicio}_${fechaFin}.csv`
    link.click()
    toast.success('¡Excel Descargado!', 'El reporte se ha exportado correctamente')
  }

  // Función para descargar PDF (HTML imprimible profesional)
  const descargarPDF = () => {
    const ventana = window.open('', '_blank')
    const logoUrl = window.location.origin + '/logoSparta.png'
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte Financiero - Sparta Gym</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; background: #fff; }
          .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 30px 40px; display: flex; align-items: center; justify-content: space-between; }
          .header-left { display: flex; align-items: center; gap: 20px; }
          .logo { width: 60px; height: 60px; border-radius: 50%; border: 3px solid #D4AF37; }
          .header h1 { font-size: 28px; color: #D4AF37; margin: 0; letter-spacing: 2px; }
          .header-right { text-align: right; }
          .header-right p { color: #aaa; font-size: 12px; margin-bottom: 5px; }
          .header-right .periodo { color: #fff; font-size: 14px; font-weight: 600; }
          .content { padding: 40px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
          .summary-card { background: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center; border-left: 4px solid #D4AF37; }
          .summary-card.green { border-left-color: #28a745; }
          .summary-card.blue { border-left-color: #007bff; }
          .summary-card.purple { border-left-color: #6f42c1; }
          .summary-card h3 { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
          .summary-card .value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
          .section { margin-bottom: 40px; }
          .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e9ecef; }
          .section-header h2 { font-size: 18px; color: #1a1a2e; font-weight: 600; }
          .section-header .badge { background: #D4AF37; color: #000; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #1a1a2e; color: #D4AF37; padding: 14px 16px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          td { padding: 14px 16px; border-bottom: 1px solid #e9ecef; color: #333; }
          tr:nth-child(even) { background: #f8f9fa; }
          .badge-tipo { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
          .badge-mensual { background: #d4edda; color: #155724; }
          .badge-diario { background: #cce5ff; color: #004085; }
          .badge-trimestral { background: #e2d5f1; color: #4a235a; }
          .monto { font-weight: 700; color: #D4AF37; }
          .total-row { background: #1a1a2e !important; }
          .total-row td { color: #fff; font-weight: 700; font-size: 14px; }
          .total-row .monto { color: #D4AF37; font-size: 16px; }
          .footer { background: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #e9ecef; margin-top: 40px; }
          .footer p { color: #666; font-size: 11px; }
          .no-data { text-align: center; padding: 40px; color: #999; font-style: italic; }
          @media print { 
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } 
            .header { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <img src="${logoUrl}" alt="Sparta Gym" class="logo" onerror="this.style.display='none'"/>
            <div>
              <h1>SPARTA GYM</h1>
              <p style="color: #aaa; margin-top: 4px;">Reporte Financiero</p>
            </div>
          </div>
          <div class="header-right">
            <p>Documento generado el</p>
            <p class="periodo">${new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin-top: 10px; color: #D4AF37; font-weight: 600;">Período: ${fechaInicio} al ${fechaFin}</p>
          </div>
        </div>
        
        <div class="content">
          <div class="summary-grid">
            <div class="summary-card">
              <h3>Dinero en Caja</h3>
              <div class="value">S/ ${reporte.totalGeneral.toFixed(2)}</div>
            </div>
            <div class="summary-card green">
              <h3>Membresías</h3>
              <div class="value">S/ ${reporte.totalPagos.toFixed(2)}</div>
            </div>
            <div class="summary-card blue">
              <h3>Ventas (Caja)</h3>
              <div class="value">S/ ${reporte.totalVentas.toFixed(2)}</div>
            </div>
            <div class="summary-card purple" style="border-left-color: #FF5733;">
              <h3>Fiados (Deuda)</h3>
              <div class="value">S/ ${(reporte.totalFiadoGenerado || 0).toFixed(2)}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <h2>Detalle de Membresías</h2>
              <span class="badge">${reporte.pagos.length} registros</span>
            </div>
            ${reporte.pagos.length > 0 ? `
            <table>
              <thead><tr><th>Cliente</th><th>Tipo</th><th>Fecha</th><th style="text-align:right">Monto</th></tr></thead>
              <tbody>
                ${reporte.pagos.map(p => `
                  <tr>
                    <td>${p.clienteNombre}</td>
                    <td><span class="badge-tipo badge-${p.tipo}">${p.tipo}</span></td>
                    <td>${p.fecha}</td>
                    <td style="text-align:right" class="monto">S/ ${Number(p.monto).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3">SUBTOTAL MEMBRESÍAS</td>
                  <td style="text-align:right" class="monto">S/ ${reporte.totalPagos.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            ` : '<div class="no-data">No hay membresías en este período</div>'}
          </div>

          <div class="section">
            <div class="section-header">
              <h2>Detalle de Movimiento de Productos</h2>
              <span class="badge">${reporte.ventas.length} registros</span>
            </div>
            ${reporte.ventas.length > 0 ? `
            <table>
              <thead><tr><th>Producto</th><th>Cant.</th><th>Fecha</th><th>Método</th><th style="text-align:right">Total</th></tr></thead>
              <tbody>
                ${reporte.ventas.map(v => `
                  <tr>
                    <td>${v.productoNombre}</td>
                    <td>${v.cantidad}</td>
                    <td>${v.fecha}</td>
                    <td><span class="badge-tipo" style="background: ${v.metodo_pago === 'fiado' ? '#fff3e0' : '#e8f5e9'}; color: ${v.metodo_pago === 'fiado' ? '#e65100' : '#2e7d32'};">${v.metodo_pago.toUpperCase()}</span></td>
                    <td style="text-align:right" class="monto">S/ ${Number(v.total).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ` : '<div class="no-data">No hay movimientos en este período</div>'}
          </div>

          ${reporte.pagosProductos?.length > 0 ? `
          <div class="section">
            <div class="section-header">
              <h2>Cobros de Deudas (Fiados)</h2>
              <span class="badge">${reporte.pagosProductos.length} registros</span>
            </div>
            <table>
              <thead><tr><th>Cliente</th><th>Nota</th><th>Fecha</th><th style="text-align:right">Monto Pago</th></tr></thead>
              <tbody>
                ${reporte.pagosProductos.map(p => `
                  <tr>
                    <td>${p.clienteNombre}</td>
                    <td style="font-style: italic; color: #666;">${p.notas || 'Cobro de Fiado'}</td>
                    <td>${p.fecha}</td>
                    <td style="text-align:right" class="monto">S/ ${Number(p.monto).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3">TOTAL COBROS FIADOS</td>
                  <td style="text-align:right" class="monto">S/ ${reporte.pagosProductos.reduce((acc, p) => acc + Number(p.monto), 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          ` : ''}

          <div style="margin-top: 50px; border-top: 2px solid #1a1a2e; padding-top: 20px; text-align: right;">
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; color: #666; font-size: 14px;">
                <span>Ventas Directas (Efectivo):</span>
                <span>S/ ${(reporte.totalVentasEfectivo || 0).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #666; font-size: 14px;">
                <span>Cobros de Fiados:</span>
                <span>S/ ${(reporte.totalAbonosProductos || 0).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                <h2 style="font-size: 20px; color: #1a1a2e;">TOTAL RECAUDADO (CAJA)</h2>
                <span style="font-size: 28px; font-weight: 800; color: #D4AF37;">S/ ${reporte.totalVentas.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Sparta Gym</strong> | Sistema de Gestión | Documento generado automáticamente</p>
          <p style="margin-top: 5px;">© ${new Date().getFullYear()} Todos los derechos reservados</p>
        </div>
        
        <script>window.onload = function() { setTimeout(() => window.print(), 500); }</script>
      </body>
      </html>
    `)
    ventana.document.close()
    toast.success('¡Reporte Generado!', 'Se abrió la ventana de impresión')
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
                <p className="text-sm text-gray-400">Membresías</p>
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
                <p className="text-sm text-gray-400">Ventas (Caja)</p>
                <p className="text-2xl font-bold text-blue-500">S/ {reporte.totalVentas.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card-sparta p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Fiados (Deuda)</p>
                <p className="text-2xl font-bold text-orange-500">S/ {reporte.totalFiadoGenerado?.toFixed(2) || '0.00'}</p>
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
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="pagos" name="Membresías" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ventas" name="Efectivo" fill="#CD7F32" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fiados" name="Fiados" fill="#FF5733" radius={[4, 4, 0, 0]} />
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
                        <span className={`px-2 py-1 rounded-full text-xs ${pago.tipo === 'mensual' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
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
            <div className="p-4 border-b border-sparta-gold/20 flex items-center justify-between gap-4">
              <h3 className="font-sparta text-lg font-bold text-sparta-gold">Detalle de Ventas</h3>
              <div className="flex bg-sparta-darker p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setFiltroVenta('todos')}
                  className={`px-3 py-1 text-[10px] uppercase font-bold rounded transition-all ${filtroVenta === 'todos' ? 'bg-sparta-gold text-sparta-dark' : 'text-gray-400 hover:text-white'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroVenta('productos')}
                  className={`px-3 py-1 text-[10px] uppercase font-bold rounded transition-all ${filtroVenta === 'productos' ? 'bg-sparta-gold text-sparta-dark' : 'text-gray-400 hover:text-white'}`}
                >
                  Ventas
                </button>
                <button
                  onClick={() => setFiltroVenta('cobros')}
                  className={`px-3 py-1 text-[10px] uppercase font-bold rounded transition-all ${filtroVenta === 'cobros' ? 'bg-sparta-gold text-sparta-dark' : 'text-gray-400 hover:text-white'}`}
                >
                  Cobros
                </button>
              </div>
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
                <tbody className="divide-y divide-white/5">
                  {/* Sección: Ventas */}
                  {(filtroVenta === 'todos' || filtroVenta === 'productos') && (
                    <>
                      <tr className="bg-white/5">
                        <td colSpan={4} className="py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Movimiento de Productos
                        </td>
                      </tr>
                      {reporte.ventas.length > 0 ? reporte.ventas.map((venta, index) => (
                        <tr key={index}>
                          <td className="text-white">
                            <div className="flex flex-col">
                              <span>{venta.productoNombre}</span>
                              {venta.metodo_pago === 'fiado' ? (
                                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-tighter">● A Crédito</span>
                              ) : (
                                <span className="text-[10px] text-green-500/70 font-bold uppercase tracking-tighter">● En Efectivo</span>
                              )}
                            </div>
                          </td>
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
                    </>
                  )}

                  {/* Sección: Cobros */}
                  {(filtroVenta === 'todos' || filtroVenta === 'cobros') && (
                    <>
                      {reporte.pagosProductos?.length > 0 && (
                        <tr className="bg-sparta-gold/10">
                          <td colSpan={4} className="py-2 px-4 text-[10px] font-bold text-sparta-gold uppercase tracking-widest">
                            Cobros de Deudas (Fiados)
                          </td>
                        </tr>
                      )}
                      {reporte.pagosProductos?.map((pago, index) => (
                        <tr key={`pago-${index}`} className="bg-sparta-gold/5">
                          <td className="text-white">
                            <div className="flex flex-col">
                              <span className="text-sparta-gold font-bold">Cobro de Fiado</span>
                              <span className="text-[10px] text-gray-400 italic">{pago.clienteNombre}</span>
                            </div>
                          </td>
                          <td className="text-gray-400">-</td>
                          <td className="text-gray-400">{pago.fecha}</td>
                          <td className="text-green-500 font-bold">S/ {pago.monto.toFixed(2)}</td>
                        </tr>
                      ))}
                      {reporte.pagosProductos?.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-gray-400">
                            No hay cobros en este periodo
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-sparta-gold/20 bg-sparta-darker space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Ventas Directas (Efectivo):</span>
                <span>S/ {(reporte.totalVentasEfectivo || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Cobros de Fiados:</span>
                <span>S/ {(reporte.totalAbonosProductos || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="font-bold text-white text-sm">TOTAL RECAUDADO (CAJA):</span>
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
