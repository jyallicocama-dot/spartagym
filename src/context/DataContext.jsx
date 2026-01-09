import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [clientesRes, pagosRes, productosRes, ventasRes, categoriasRes] = await Promise.all([
        supabase.from('clientes').select('*').order('created_at', { ascending: false }),
        supabase.from('pagos').select('*, clientes(nombre, email)').order('fecha', { ascending: false }),
        supabase.from('productos').select('*').order('nombre'),
        supabase.from('ventas').select('*, productos(nombre)').order('fecha', { ascending: false }),
        supabase.from('categorias').select('*').order('nombre')
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
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          nombre: cliente.nombre?.trim() || null,
          dni: cliente.dni?.trim() || null,
          telefono: cliente.telefono?.trim() || null,
          email: cliente.email?.trim() || null,
          estado: 'activo'
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
          mes: pago.mes
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
        .insert([producto])
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

  const venderProducto = async (productoId, cantidad) => {
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
      const { data, error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          producto_id: productoId,
          cantidad,
          precio_unitario: producto.precio,
          total: producto.precio * cantidad
        }])
        .select('*, productos(nombre)')
        .single()

      if (ventaError) throw ventaError

      setProductos(productos.map(p => 
        p.id === productoId ? { ...p, stock: p.stock - cantidad } : p
      ))

      const nuevaVenta = {
        ...data,
        productoNombre: data.productos?.nombre || producto.nombre,
        fecha: data.fecha?.split('T')[0]
      }
      setVentas([nuevaVenta, ...ventas])
      return nuevaVenta
    } catch (error) {
      console.error('Error en venta:', error)
      return null
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

    const totalPagos = pagosEnRango.reduce((acc, p) => acc + Number(p.monto), 0)
    const totalVentas = ventasEnRango.reduce((acc, v) => acc + Number(v.total), 0)

    return {
      pagos: pagosEnRango,
      ventas: ventasEnRango,
      totalPagos,
      totalVentas,
      totalGeneral: totalPagos + totalVentas
    }
  }

  // Funciones de categorías
  const agregarCategoria = async (nombre) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([{ nombre }])
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
