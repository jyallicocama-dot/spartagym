import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DollarSign,
    Search,
    Filter,
    User,
    Calendar,
    ShoppingBag,
    ChevronDown,
    ChevronUp,
    CreditCard,
    CheckCircle2,
    Clock,
    X,
    Wallet
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

const Deudas = () => {
    const { clientes, ventas, pagarDeuda } = useData()
    const toast = useToast()
    const [busqueda, setBusqueda] = useState('')
    const [expandidos, setExpandidos] = useState({})
    const [tabActiva, setTabActiva] = useState('pendientes') // 'pendientes' o 'historial'
    const [paginaActualHistorial, setPaginaActualHistorial] = useState(1)
    const itemsPorPagina = 10

    // Estados para el modal de pago parcial
    const [modalPago, setModalPago] = useState(false)
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
    const [montoAbono, setMontoAbono] = useState('')
    const [cargando, setCargando] = useState(false)

    // Resetear a página 1 al cambiar de tab o buscar
    useEffect(() => {
        setPaginaActualHistorial(1)
    }, [tabActiva, busqueda])

    // Obtener solo ventas pendientes
    const deudasPendientes = ventas.filter(v => v.estado_pago === 'pendiente')

    // Agrupar deudas por cliente
    const deudasPorCliente = deudasPendientes.reduce((acc, venta) => {
        const clienteId = venta.cliente_id
        if (!acc[clienteId]) {
            const cliente = clientes.find(c => c.id === clienteId)
            const saldoAnterior = 0 // Podríamos calcular saldos de meses anteriores aquí

            acc[clienteId] = {
                id: clienteId,
                nombre: cliente?.nombre || 'Desconocido',
                dni: cliente?.dni || '---',
                total: 0,
                ventas: []
            }
        }
        const pendienteVenta = venta.total - (venta.monto_pagado || 0)
        acc[clienteId].total += pendienteVenta
        acc[clienteId].ventas.push(venta)
        return acc
    }, {})

    const listaClientesConDeuda = Object.values(deudasPorCliente)
        .filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
        .sort((a, b) => b.total - a.total)

    // Estadísticas temporales
    const hoy = new Date().toISOString().split('T')[0]
    const inicioSemana = new Date()
    inicioSemana.setDate(inicioSemana.getDate() - 7)
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

    const deudaHoy = deudasPendientes
        .filter(v => v.fecha === hoy)
        .reduce((acc, v) => acc + (v.total - (v.monto_pagado || 0)), 0)

    const deudaSemana = deudasPendientes
        .filter(v => v.fecha >= inicioSemana.toISOString().split('T')[0])
        .reduce((acc, v) => acc + (v.total - (v.monto_pagado || 0)), 0)

    const deudaMes = deudasPendientes
        .filter(v => v.fecha >= inicioMes)
        .reduce((acc, v) => acc + (v.total - (v.monto_pagado || 0)), 0)

    const deudaTotal = deudasPendientes.reduce((acc, v) => acc + (v.total - (v.monto_pagado || 0)), 0)

    const toggleExpandir = (id) => {
        setExpandidos(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const abrirModalPago = (venta) => {
        const pendiente = venta.total - (venta.monto_pagado || 0)
        setVentaSeleccionada(venta)
        setMontoAbono(pendiente.toString())
        setModalPago(true)
    }

    const handleConfirmarPago = async (e) => {
        e.preventDefault()
        if (!ventaSeleccionada || !montoAbono) return

        const monto = parseFloat(montoAbono)
        const pendiente = ventaSeleccionada.total - (ventaSeleccionada.monto_pagado || 0)

        if (monto <= 0) {
            toast.error('Error', 'El monto debe ser mayor a 0')
            return
        }

        if (monto > pendiente) {
            toast.error('Error', 'El monto supera la deuda pendiente')
            return
        }

        setCargando(true)
        const result = await pagarDeuda(ventaSeleccionada.id, monto)
        setCargando(false)

        if (result) {
            const esTotal = monto >= pendiente
            toast.success(
                esTotal ? '¡Deuda Cancelada!' : '¡Abono Registrado!',
                esTotal ? 'Se ha saldado el total de la deuda' : `Se abonó S/ ${monto.toFixed(2)} correctamente`
            )
            setModalPago(false)
            setVentaSeleccionada(null)
        } else {
            toast.error('Error', 'No se pudo registrar el pago')
        }
    }

    const stats = [
        { titulo: 'Total Pendiente', valor: `S/ ${deudaTotal.toFixed(2)}`, icon: DollarSign, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { titulo: 'Fiado Hoy', valor: `S/ ${deudaHoy.toFixed(2)}`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { titulo: 'Fiado esta Semana', valor: `S/ ${deudaSemana.toFixed(2)}`, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { titulo: 'Fiado este Mes', valor: `S/ ${deudaMes.toFixed(2)}`, icon: Filter, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ]

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
                        <span className="text-gradient">CONTROL DE</span>
                        <span className="text-white"> FIADOS Y DEUDAS</span>
                    </h1>
                    <p className="text-gray-400">Gestiona abonos y cobra los productos pendientes de pago</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card-sparta p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">{stat.titulo}</p>
                                    <p className="text-xl font-bold text-white">{stat.valor}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-white/5">
                    <button
                        onClick={() => setTabActiva('pendientes')}
                        className={`pb-4 px-2 font-bold transition-all relative ${tabActiva === 'pendientes' ? 'text-sparta-gold' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Deudas Pendientes
                        {tabActiva === 'pendientes' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-sparta-gold" />
                        )}
                    </button>
                    <button
                        onClick={() => setTabActiva('historial')}
                        className={`pb-4 px-2 font-bold transition-all relative ${tabActiva === 'historial' ? 'text-sparta-gold' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Historial de Pagos
                        {tabActiva === 'historial' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-sparta-gold" />
                        )}
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="input-sparta pl-12"
                        />
                    </div>
                </div>

                {/* List Content */}
                {tabActiva === 'pendientes' ? (
                    <div className="space-y-4">
                        {listaClientesConDeuda.length > 0 ? (
                            listaClientesConDeuda.map((cliente, index) => (
                                <motion.div
                                    key={cliente.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="card-sparta overflow-hidden"
                                >
                                    {/* User Info Row */}
                                    <div
                                        className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => toggleExpandir(cliente.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-sparta-gold/20 flex items-center justify-center border border-sparta-gold/30 text-sparta-gold">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg">{cliente.nombre}</h3>
                                                <p className="text-gray-400 text-sm">DNI: {cliente.dni}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-8">
                                            <div className="text-right">
                                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Saldo de Cuenta</p>
                                                <p className="text-2xl font-black text-orange-500">S/ {cliente.total.toFixed(2)}</p>
                                            </div>
                                            <div className="bg-white/10 p-2 rounded-full">
                                                {expandidos[cliente.id] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Products (Expandable) */}
                                    <AnimatePresence>
                                        {expandidos[cliente.id] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/5 bg-sparta-darker px-4 md:px-6 py-4"
                                            >
                                                <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 flex items-center gap-2">
                                                    <ShoppingBag className="w-3 h-3" />
                                                    Cuentas Pendientes
                                                </h4>

                                                <div className="space-y-3">
                                                    {cliente.ventas.map((venta) => {
                                                        const pendiente = venta.total - (venta.monto_pagado || 0)
                                                        const esMesPasado = new Date(venta.fecha).getMonth() < new Date().getMonth()

                                                        return (
                                                            <div key={venta.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white/5 rounded-lg border border-white/5 group transition-all hover:border-sparta-gold/30">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-sparta-dark rounded">
                                                                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-white font-medium">{venta.productoNombre}</p>
                                                                            {esMesPasado && (
                                                                                <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-[10px] rounded border border-white/5">SALDO ANTERIOR</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-gray-500">
                                                                            {venta.fecha} • S/ {venta.total} Total {venta.monto_pagado > 0 && `(Pagado: S/ ${venta.monto_pagado})`}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between md:justify-end gap-4">
                                                                    <div className="text-right">
                                                                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Pendiente</p>
                                                                        <p className="font-bold text-white leading-tight">S/ {pendiente.toFixed(2)}</p>
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            abrirModalPago(venta)
                                                                        }}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded transition-colors shadow-lg shadow-green-500/10"
                                                                    >
                                                                        <Wallet className="w-3 h-3" />
                                                                        COBRAR
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        ) : (
                            <div className="card-sparta p-12 text-center">
                                <div className="w-16 h-16 bg-sparta-dark flex items-center justify-center rounded-full mx-auto mb-4 border border-white/10">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-2">¡Todo al día!</h3>
                                <p className="text-gray-400">No se encontraron deudas pendientes en este momento.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card-sparta overflow-hidden">
                        <div className="overflow-x-auto w-full">
                            <table className="table-sparta border-collapse">
                                <thead className="bg-sparta-dark z-10">
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th>Producto</th>
                                        <th>Monto Pagado</th>
                                        <th>Total Venta</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const ventasFiltradas = ventas.filter(v =>
                                            v.metodo_pago === 'fiado' &&
                                            (v.estado_pago === 'pagado' || (v.monto_pagado > 0)) &&
                                            v.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase())
                                        )

                                        const totalPaginas = Math.ceil(ventasFiltradas.length / itemsPorPagina)
                                        const inicio = (paginaActualHistorial - 1) * itemsPorPagina
                                        const ventasPagina = ventasFiltradas.slice(inicio, inicio + itemsPorPagina)

                                        return (
                                            <>
                                                {ventasPagina.map((venta) => (
                                                    <tr key={venta.id}>
                                                        <td className="text-gray-400 text-sm">{venta.fecha}</td>
                                                        <td className="font-bold text-white">{venta.clienteNombre}</td>
                                                        <td className="text-gray-300">{venta.productoNombre}</td>
                                                        <td className="text-green-500 font-bold">S/ {venta.monto_pagado || 0}</td>
                                                        <td className="text-gray-400">S/ {venta.total}</td>
                                                        <td>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${venta.estado_pago === 'pagado' ? 'bg-green-500/20 text-green-500 border border-green-500/20' : 'bg-orange-500/20 text-orange-500 border border-orange-500/20'
                                                                }`}>
                                                                {venta.estado_pago}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {ventasFiltradas.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="text-center py-12 text-gray-500 italic">
                                                            No hay historial de cobros realizados.
                                                        </td>
                                                    </tr>
                                                )}
                                                {/* Paginación */}
                                                {totalPaginas > 1 && (
                                                    <tr>
                                                        <td colSpan={6} className="p-4 border-t border-white/5">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {[...Array(totalPaginas)].map((_, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => setPaginaActualHistorial(i + 1)}
                                                                        className={`w-10 h-10 rounded-lg font-bold transition-all ${paginaActualHistorial === i + 1
                                                                            ? 'bg-sparta-gold text-sparta-dark scale-110 shadow-lg shadow-sparta-gold/20'
                                                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                                            }`}
                                                                    >
                                                                        {i + 1}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        )
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal de Pago Parcial */}
                <AnimatePresence>
                    {modalPago && ventaSeleccionada && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="card-sparta w-full max-w-md overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold font-sparta text-gradient">COBRAR DEUDA</h2>
                                        <button onClick={() => setModalPago(false)} className="text-gray-400 hover:text-white">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="bg-sparta-darker p-4 rounded-lg border border-white/5 mb-6">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Producto / Concepto</p>
                                        <p className="text-white font-bold">{ventaSeleccionada.productoNombre}</p>
                                        <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
                                            <div>
                                                <p className="text-gray-500 text-[10px] uppercase">Total Deuda</p>
                                                <p className="text-gray-300 text-sm font-semibold">S/ {ventaSeleccionada.total}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-orange-500 text-[10px] uppercase font-bold">Saldo Pendiente</p>
                                                <p className="text-orange-500 text-lg font-black tracking-tighter">S/ {(ventaSeleccionada.total - (ventaSeleccionada.monto_pagado || 0)).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleConfirmarPago} className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Monto a Cobrar (S/)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sparta-gold" />
                                                <input
                                                    type="number"
                                                    value={montoAbono}
                                                    onChange={(e) => setMontoAbono(e.target.value)}
                                                    className="input-sparta pl-12 text-2xl font-black text-white"
                                                    step="0.10"
                                                    min="0.10"
                                                    max={ventaSeleccionada.total - (ventaSeleccionada.monto_pagado || 0)}
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-2 italic">
                                                * El monto ingresado se registrará como un ingreso en caja.
                                            </p>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setModalPago(false)}
                                                className="flex-1 py-4 border border-white/10 text-gray-400 rounded-xl font-bold hover:bg-white/5 transition-all"
                                            >
                                                CANCELAR
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={cargando}
                                                className="flex-1 py-4 bg-sparta-gold text-sparta-darker rounded-xl font-black hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {cargando ? 'PROCESANDO...' : 'CONFIRMAR COBRO'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default Deudas
