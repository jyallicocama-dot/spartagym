import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const [clientes, setClientes] = useState([])
  const [pagos, setPagos] = useState([])
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()

  // Cargar datos cuando el usuario cambie o inicie sesión
  useEffect(() => {
    if (user) {
      cargarDatos()
    } else {
      // Limpiar datos si no hay usuario
      setClientes([])
      setPagos([])
      setProductos([])
      setVentas([])
      setCategorias([])
      setLoading(false)
    }
  }, [user])

  const cargarDatos = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [clientesRes, pagosRes, productosRes, ventasRes, categoriasRes] = await Promise.all([
        supabase.from('clientes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('pagos').select('*, clientes(nombre, email)').eq('user_id', user.id).order('fecha', { ascending: false }),
        supabase.from('productos').select('*').eq('user_id', user.id).order('nombre'),
        supabase.from('ventas').select('*, productos(nombre), clientes(nombre)').eq('user_id', user.id).order('fecha', { ascending: false }),
        supabase.from('categorias').select('*').eq('user_id', user.id).order('nombre')
      ])

      if (clientesRes.data) setClientes(clientesRes.data.map(c => ({
        ...c,
        fechaRegistro: c.fecha_registro?.split('T')[0] || c.created_at?.split('T')[0]
      })))

      if (pagosRes.data) setPagos(pagosRes.data.map(p => ({
        ...p,
        clienteNombre: p.clientes?.nombre || 'Sin nombre',
        clienteEmail: p.clientes?.email || '',
        fecha: p.fecha?.split('T')[0]
      })))

      if (productosRes.data) setProductos(productosRes.data)

      if (ventasRes.data) setVentas(ventasRes.data.map(v => ({
        ...v,
        productoNombre: v.productos?.nombre || 'Sin nombre',
        clienteNombre: v.clientes?.nombre || 'General',
        fecha: v.fecha?.split('T')[0]
      })))

      if (categoriasRes.data) setCategorias(categoriasRes.data)
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
    setLoading(false)
  }

  const agregarCliente = async (cliente) => {
    try {
      // Nombre y teléfono son obligatorios
      if (!cliente.nombre?.trim() || !cliente.telefono?.trim()) {
        throw new Error('Nombre y teléfono son obligatorios')
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          nombre: cliente.nombre.trim(),
          telefono: cliente.telefono.trim(),
          dni: cliente.dni?.trim() || null,
          email: cliente.email?.trim() || null,
          estado: 'activo',
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error

      const nuevoCliente = { ...data, fechaRegistro: data.created_at?.split('T')[0] }
      setClientes([nuevoCliente, ...clientes])
      return nuevoCliente
    } catch (error) {
      console.error('Error agregando cliente:', error)
      return null
    }
  }

  const editarCliente = async (id, datosActualizados) => {
    try {
      // Limpiar datos: convertir strings vacíos a null
      const datosLimpios = {}
      for (const key in datosActualizados) {
        const val = datosActualizados[key]
        datosLimpios[key] = typeof val === 'string' && val.trim() === '' ? null : val
      }

      const { error } = await supabase
        .from('clientes')
        .update(datosLimpios)
        .eq('id', id)

      if (error) throw error
      setClientes(clientes.map(c => c.id === id ? { ...c, ...datosLimpios } : c))
    } catch (error) {
      console.error('Error editando cliente:', error)
    }
  }

  const eliminarCliente = async (id) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setClientes(clientes.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error eliminando cliente:', error)
    }
  }

  const agregarPago = async (pago) => {
    try {
      const { data, error } = await supabase
        .from('pagos')
        .insert([{
          cliente_id: pago.clienteId,
          tipo: pago.tipo,
          monto: pago.monto,
          mes: pago.mes,
          user_id: user.id
        }])
        .select('*, clientes(nombre)')
        .single()

      if (error) throw error

      const nuevoPago = {
        ...data,
        clienteNombre: data.clientes?.nombre || 'Cliente',
        fecha: data.fecha?.split('T')[0]
      }
      setPagos([nuevoPago, ...pagos])
      return nuevoPago
    } catch (error) {
      console.error('Error agregando pago:', error)
      return null
    }
  }

  const editarPago = async (id, datosActualizados) => {
    try {
      const { error } = await supabase
        .from('pagos')
        .update({
          tipo: datosActualizados.tipo,
          monto: datosActualizados.monto,
          mes: datosActualizados.mes
        })
        .eq('id', id)

      if (error) throw error
      setPagos(pagos.map(p => p.id === id ? { ...p, ...datosActualizados } : p))
      return true
    } catch (error) {
      console.error('Error editando pago:', error)
      return false
    }
  }

  const eliminarPago = async (id) => {
    try {
      const { error } = await supabase
        .from('pagos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPagos(pagos.filter(p => p.id !== id))
      return true
    } catch (error) {
      console.error('Error eliminando pago:', error)
      return false
    }
  }

  const agregarProducto = async (producto) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([{ ...producto, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setProductos([...productos, data])
      return data
    } catch (error) {
      console.error('Error agregando producto:', error)
      return null
    }
  }

  const editarProducto = async (id, datosActualizados) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update(datosActualizados)
        .eq('id', id)

      if (error) throw error
      setProductos(productos.map(p => p.id === id ? { ...p, ...datosActualizados } : p))
    } catch (error) {
      console.error('Error editando producto:', error)
    }
  }

  const eliminarProducto = async (id) => {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProductos(productos.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error eliminando producto:', error)
    }
  }

  const venderProducto = async (productoId, cantidad, clienteId = null, metodoPago = 'efectivo') => {
    const producto = productos.find(p => p.id === productoId)
    if (!producto || producto.stock < cantidad) return null

    try {
      // Actualizar stock
      const { error: stockError } = await supabase
        .from('productos')
        .update({ stock: producto.stock - cantidad })
        .eq('id', productoId)

      if (stockError) throw stockError

      // Registrar venta
      const estadoPago = metodoPago === 'fiado' ? 'pendiente' : 'pagado'
      const { data, error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          producto_id: productoId,
          cliente_id: clienteId,
          cantidad,
          precio_unitario: producto.precio,
          total: producto.precio * cantidad,
          metodo_pago: metodoPago,
          estado_pago: estadoPago,
          user_id: user.id
        }])
        .select('*, productos(nombre), clientes(nombre)')
        .single()

      if (ventaError) throw ventaError

      setProductos(productos.map(p =>
        p.id === productoId ? { ...p, stock: p.stock - cantidad } : p
      ))

      const nuevaVenta = {
        ...data,
        productoNombre: data.productos?.nombre || producto.nombre,
        clienteNombre: data.clientes?.nombre || 'General',
        fecha: data.fecha?.split('T')[0]
      }
      setVentas([nuevaVenta, ...ventas])
      return nuevaVenta
    } catch (error) {
      console.error('Error en venta:', error)
      return null
    }
  }

  const pagarDeuda = async (ventaId, montoAPagar, metodoPago = 'efectivo') => {
    try {
      // 1. Obtener la venta
      const venta = ventas.find(v => v.id === ventaId)
      if (!venta) throw new Error('Venta no encontrada')

      const nuevoMontoPagado = (Number(venta.monto_pagado) || 0) + Number(montoAPagar)
      const esPagoTotal = nuevoMontoPagado >= Number(venta.total)
      const estadoFinal = esPagoTotal ? 'pagado' : 'pendiente'

      // 2. Registrar el pago
      const notaAbono = esPagoTotal
        ? `Cancelación total: ${venta.productoNombre}`
        : `Abono a cuenta: ${venta.productoNombre} (Saldo rest: S/ ${(Number(venta.total) - nuevoMontoPagado).toFixed(2)})`

      const { data: pagoData, error: pagoError } = await supabase
        .from('pagos')
        .insert([{
          cliente_id: venta.cliente_id,
          tipo: 'producto',
          monto: Number(montoAPagar),
          metodo_pago: metodoPago,
          notas: notaAbono,
          user_id: user.id
        }])
        .select('*, clientes(nombre)')
        .single()

      if (pagoError) throw pagoError

      // 3. Actualizar la venta
      const { error: ventaError } = await supabase
        .from('ventas')
        .update({
          estado_pago: estadoFinal,
          monto_pagado: nuevoMontoPagado
        })
        .eq('id', ventaId)

      if (ventaError) throw ventaError

      // 4. Actualizar estado local
      setVentas(ventas.map(v => v.id === ventaId ? {
        ...v,
        estado_pago: estadoFinal,
        monto_pagado: nuevoMontoPagado
      } : v))

      const nuevoPago = {
        ...pagoData,
        clienteNombre: pagoData.clientes?.nombre || 'Cliente',
        fecha: pagoData.fecha?.split('T')[0]
      }
      setPagos([nuevoPago, ...pagos])

      return true
    } catch (error) {
      console.error('Error pagando deuda:', error)
      return false
    }
  }

  const obtenerReporte = (fechaInicio, fechaFin) => {
    const pagosEnRango = pagos.filter(p => {
      const fecha = new Date(p.fecha)
      return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin)
    })

    const ventasEnRango = ventas.filter(v => {
      const fecha = new Date(v.fecha)
      return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin)
    })

    // Separar cobros
    const pagosMembresias = pagosEnRango.filter(p => p.tipo !== 'producto')
    const pagosProductos = pagosEnRango.filter(p => p.tipo === 'producto')

    // Ingresos por Membresías (Mensuales, Diarios, etc)
    const totalPagos = pagosMembresias.reduce((acc, p) => acc + Number(p.monto), 0)

    // Ingresos por Productos = Ventas en Efectivo + Cobros de Deudas Fiado
    const totalVentasEfectivo = ventasEnRango
      .filter(v => v.metodo_pago === 'efectivo')
      .reduce((acc, v) => acc + Number(v.total), 0)
    const totalAbonosProductos = pagosProductos.reduce((acc, p) => acc + Number(p.monto), 0)

    const totalVentas = totalVentasEfectivo + totalAbonosProductos

    // Deudas Generadas (Total de ventas marcadas como fiado en este periodo)
    const totalFiadoGenerado = ventasEnRango
      .filter(v => v.metodo_pago === 'fiado')
      .reduce((acc, v) => acc + Number(v.total), 0)

    return {
      pagos: pagosMembresias,
      pagosProductos: pagosProductos,
      ventas: ventasEnRango,
      totalPagos,
      totalVentas,
      totalVentasEfectivo,
      totalAbonosProductos,
      totalFiadoGenerado,
      totalGeneral: totalPagos + totalVentas
    }
  }

  // Funciones de categorías
  const agregarCategoria = async (nombre) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([{ nombre, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setCategorias([...categorias, data])
      return data
    } catch (error) {
      console.error('Error agregando categoría:', error)
      return null
    }
  }

  const eliminarCategoria = async (id) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCategorias(categorias.filter(c => c.id !== id))
      return true
    } catch (error) {
      console.error('Error eliminando categoría:', error)
      return false
    }
  }

  // Obtener productos con bajo stock
  const getProductosBajoStock = () => {
    return productos.filter(p => p.stock < 10)
  }

  // Obtener suscripciones por vencer (mensuales y trimestrales)
  const getSuscripcionesPorVencer = () => {
    const hoy = new Date()
    const diasAviso = 5 // Avisar 5 días antes

    return pagos.filter(p => {
      if (p.tipo === 'diario') return false

      const fechaPago = new Date(p.fecha)
      let fechaVencimiento

      if (p.tipo === 'mensual') {
        fechaVencimiento = new Date(fechaPago)
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1)
      } else if (p.tipo === 'trimestral') {
        fechaVencimiento = new Date(fechaPago)
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 3)
      }

      if (!fechaVencimiento) return false

      const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24))
      return diasRestantes >= 0 && diasRestantes <= diasAviso
    }).map(p => {
      const fechaPago = new Date(p.fecha)
      let fechaVencimiento = new Date(fechaPago)
      if (p.tipo === 'mensual') {
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1)
      } else {
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 3)
      }
      const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24))
      return { ...p, fechaVencimiento, diasRestantes }
    })
  }

  return (
    <DataContext.Provider value={{
      clientes,
      pagos,
      productos,
      ventas,
      categorias,
      loading,
      cargarDatos,
      agregarCliente,
      editarCliente,
      eliminarCliente,
      agregarPago,
      editarPago,
      eliminarPago,
      agregarProducto,
      editarProducto,
      eliminarProducto,
      venderProducto,
      pagarDeuda,
      obtenerReporte,
      agregarCategoria,
      eliminarCategoria,
      getProductosBajoStock,
      getSuscripcionesPorVencer
    }}>
      {children}
    </DataContext.Provider>
  )
}
