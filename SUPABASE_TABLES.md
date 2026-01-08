# 🗄️ Estructura de Tablas para Supabase

## Tabla: `clientes`

```sql
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  dni VARCHAR(8) UNIQUE NOT NULL,
  telefono VARCHAR(15),
  email VARCHAR(255),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_clientes_dni ON clientes(dni);
CREATE INDEX idx_clientes_estado ON clientes(estado);
CREATE INDEX idx_clientes_fecha_registro ON clientes(fecha_registro);
```

### Campos:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| nombre | VARCHAR(255) | Nombre completo del cliente |
| dni | VARCHAR(8) | Documento Nacional de Identidad (único) |
| telefono | VARCHAR(15) | Número de teléfono |
| email | VARCHAR(255) | Correo electrónico |
| fecha_registro | TIMESTAMP | Fecha de registro en el gimnasio |
| estado | VARCHAR(20) | Estado: activo, inactivo, suspendido |
| created_at | TIMESTAMP | Fecha de creación del registro |
| updated_at | TIMESTAMP | Última actualización |

---

## Tabla: `pagos`

```sql
CREATE TABLE pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('mensual', 'diario')),
  monto DECIMAL(10,2) NOT NULL,
  mes VARCHAR(50), -- Ej: "Enero 2024" (null para pagos diarios)
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pagos_cliente_id ON pagos(cliente_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha);
CREATE INDEX idx_pagos_tipo ON pagos(tipo);
CREATE INDEX idx_pagos_mes ON pagos(mes);
```

### Campos:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| cliente_id | UUID | Referencia al cliente |
| tipo | VARCHAR(20) | Tipo de pago: mensual o diario |
| monto | DECIMAL(10,2) | Monto del pago (80 mensual, 5 diario) |
| mes | VARCHAR(50) | Mes pagado (solo para mensuales) |
| fecha | TIMESTAMP | Fecha del pago |
| metodo_pago | VARCHAR(50) | Método: efectivo, tarjeta, yape, plin |
| notas | TEXT | Notas adicionales |
| created_at | TIMESTAMP | Fecha de creación |

---

## Tabla: `productos`

```sql
CREATE TABLE productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER DEFAULT 10,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Bebidas', 'Suplementos', 'Snacks', 'Accesorios')),
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_stock ON productos(stock);
```

### Campos:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| nombre | VARCHAR(255) | Nombre del producto |
| descripcion | TEXT | Descripción del producto |
| precio | DECIMAL(10,2) | Precio de venta |
| stock | INTEGER | Cantidad en inventario |
| stock_minimo | INTEGER | Stock mínimo para alertas |
| categoria | VARCHAR(50) | Categoría del producto |
| imagen_url | TEXT | URL de la imagen |
| activo | BOOLEAN | Si está disponible para venta |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

---

## Tabla: `ventas`

```sql
CREATE TABLE ventas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL, -- Opcional
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ventas_producto_id ON ventas(producto_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_cliente_id ON ventas(cliente_id);
```

### Campos:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| producto_id | UUID | Referencia al producto |
| cantidad | INTEGER | Cantidad vendida |
| precio_unitario | DECIMAL(10,2) | Precio por unidad al momento de venta |
| total | DECIMAL(10,2) | Total de la venta (cantidad * precio) |
| fecha | TIMESTAMP | Fecha de la venta |
| cliente_id | UUID | Cliente (opcional) |
| metodo_pago | VARCHAR(50) | Método de pago |
| created_at | TIMESTAMP | Fecha de creación |

---

## Tabla: `usuarios` (Para autenticación del intranet)

```sql
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'empleado' CHECK (rol IN ('admin', 'empleado', 'cajero')),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
```

### Campos:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| email | VARCHAR(255) | Email del usuario (login) |
| nombre | VARCHAR(255) | Nombre del usuario |
| rol | VARCHAR(20) | Rol: admin, empleado, cajero |
| activo | BOOLEAN | Si puede acceder al sistema |
| ultimo_acceso | TIMESTAMP | Última vez que accedió |
| created_at | TIMESTAMP | Fecha de creación |

---

## 📊 Vistas útiles para reportes

### Vista: Resumen de ingresos por día

```sql
CREATE VIEW v_ingresos_diarios AS
SELECT 
  DATE(fecha) as dia,
  SUM(CASE WHEN tipo = 'mensual' THEN monto ELSE 0 END) as pagos_mensuales,
  SUM(CASE WHEN tipo = 'diario' THEN monto ELSE 0 END) as pagos_diarios,
  SUM(monto) as total_pagos
FROM pagos
GROUP BY DATE(fecha)
ORDER BY dia DESC;
```

### Vista: Ventas por producto

```sql
CREATE VIEW v_ventas_por_producto AS
SELECT 
  p.id,
  p.nombre,
  p.categoria,
  COUNT(v.id) as total_ventas,
  SUM(v.cantidad) as unidades_vendidas,
  SUM(v.total) as ingresos_totales
FROM productos p
LEFT JOIN ventas v ON p.id = v.producto_id
GROUP BY p.id, p.nombre, p.categoria
ORDER BY ingresos_totales DESC;
```

### Vista: Clientes con pagos del mes actual

```sql
CREATE VIEW v_clientes_pagados_mes AS
SELECT 
  c.id,
  c.nombre,
  c.dni,
  p.monto,
  p.fecha
FROM clientes c
INNER JOIN pagos p ON c.id = p.cliente_id
WHERE p.tipo = 'mensual'
  AND DATE_TRUNC('month', p.fecha) = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY p.fecha DESC;
```

---

## 🔐 Políticas de Seguridad (RLS)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Solo usuarios autenticados pueden leer/escribir
CREATE POLICY "Usuarios autenticados pueden ver clientes" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar clientes" ON clientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar clientes" ON clientes
  FOR UPDATE USING (auth.role() = 'authenticated');
  
-- Repetir para las demás tablas según necesidades
```

---

## 🚀 Script de inicialización completo

```sql
-- Ejecutar en orden en Supabase SQL Editor

-- 1. Tabla Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  dni VARCHAR(8) UNIQUE NOT NULL,
  telefono VARCHAR(15),
  email VARCHAR(255),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estado VARCHAR(20) DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla Pagos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  mes VARCHAR(50),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla Productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER DEFAULT 10,
  categoria VARCHAR(50) NOT NULL,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla Ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  metodo_pago VARCHAR(50) DEFAULT 'efectivo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'empleado',
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_clientes_dni ON clientes(dni);
CREATE INDEX IF NOT EXISTS idx_pagos_cliente_id ON pagos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
```

---

## 📝 Datos de ejemplo

```sql
-- Insertar productos de ejemplo
INSERT INTO productos (nombre, precio, stock, categoria) VALUES
  ('Agua Mineral 500ml', 2.00, 50, 'Bebidas'),
  ('Proteína Whey 1kg', 120.00, 15, 'Suplementos'),
  ('Creatina 300g', 65.00, 20, 'Suplementos'),
  ('Bebida Energética', 5.00, 30, 'Bebidas'),
  ('Barras Proteicas', 8.00, 40, 'Snacks');

-- Insertar cliente de ejemplo
INSERT INTO clientes (nombre, dni, telefono, email) VALUES
  ('Juan Pérez', '12345678', '987654321', 'juan@email.com');
```

---

**Nota:** Recuerda configurar las variables de entorno en tu proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```
