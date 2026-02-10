import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============= CLIENTES =============
export const clientesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(cliente) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('clientes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async search(query) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nombre.ilike.%${query}%,dni.ilike.%${query}%,telefono.ilike.%${query}%`)
    if (error) throw error
    return data
  }
}

// ============= PAGOS =============
export const pagosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        clientes (id, nombre, dni)
      `)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async getByDateRange(fechaInicio, fechaFin) {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        clientes (id, nombre, dni)
      `)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async create(pago) {
    const { data, error } = await supabase
      .from('pagos')
      .insert([pago])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getByCliente(clienteId) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  }
}

// ============= PRODUCTOS =============
export const productosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    if (error) throw error
    return data
  },

  async create(producto) {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('productos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', id)
    if (error) throw error
    return data
  },

  async updateStock(id, cantidad) {
    const { data: producto } = await supabase
      .from('productos')
      .select('stock')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('productos')
      .update({ stock: producto.stock - cantidad })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// ============= VENTAS =============
export const ventasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        productos (id, nombre, categoria)
      `)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async getByDateRange(fechaInicio, fechaFin) {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        productos (id, nombre, categoria)
      `)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async create(venta) {
    const { data, error } = await supabase
      .from('ventas')
      .insert([venta])
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateEstadoPago(id, estado) {
    const { data, error } = await supabase
      .from('ventas')
      .update({ estado_pago: estado })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }
}

// ============= DEUDAS =============
export const deudasService = {
  async getPendientes() {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        clientes (id, nombre, dni),
        productos (id, nombre)
      `)
      .eq('estado_pago', 'pendiente')
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async getPorCliente(clienteId) {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        productos (id, nombre)
      `)
      .eq('cliente_id', clienteId)
      .eq('estado_pago', 'pendiente')
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  async pagarDeuda(ventaId, metodo_pago = 'efectivo') {
    // 1. Obtener la venta para saber el monto y cliente
    const { data: venta, error: fetchError } = await supabase
      .from('ventas')
      .select('*')
      .eq('id', ventaId)
      .single()

    if (fetchError) throw fetchError

    // 2. Crear el registro en Pagos
    const nuevoPago = {
      cliente_id: venta.cliente_id,
      tipo: 'producto',
      monto: venta.total,
      metodo_pago: metodo_pago,
      fecha: new Date().toISOString(),
      notas: `Pago de deuda por venta ID: ${ventaId}`
    }

    const { error: pagoError } = await supabase
      .from('pagos')
      .insert([nuevoPago])

    if (pagoError) throw pagoError

    // 3. Marcar la venta como pagada
    const { data, error: updateError } = await supabase
      .from('ventas')
      .update({ estado_pago: 'pagado' })
      .eq('id', ventaId)
      .select()
      .single()

    if (updateError) throw updateError
    return data
  }
}

// ============= REPORTES =============
export const reportesService = {
  async getResumenPorFecha(fechaInicio, fechaFin) {
    const [pagos, ventas] = await Promise.all([
      pagosService.getByDateRange(fechaInicio, fechaFin),
      ventasService.getByDateRange(fechaInicio, fechaFin)
    ])

    const totalPagos = pagos.reduce((acc, p) => acc + parseFloat(p.monto), 0)
    const totalVentas = ventas.reduce((acc, v) => acc + parseFloat(v.total), 0)

    return {
      pagos,
      ventas,
      totalPagos,
      totalVentas,
      totalGeneral: totalPagos + totalVentas
    }
  }
}
