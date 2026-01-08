# 🏛️ SPARTA GYM

Sistema web completo para la gestión de gimnasio con landing page moderna y sistema de intranet.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## ✨ Características

### Landing Page
- Diseño moderno con temática espartana
- Animaciones 3D con Three.js (pesas, escudo espartano, esferas flotantes)
- Secciones: Hero, Stats, Servicios, Planes, Testimonios, Contacto
- Totalmente responsive
- Animaciones suaves con Framer Motion

### Intranet (Sistema de Gestión)
- **Dashboard**: Vista general con estadísticas del día y mes
- **Clientes**: CRUD completo de clientes (nombre, DNI, teléfono, email)
- **Pagos**: Registro de pagos mensuales (S/ 80) y diarios (S/ 5)
- **Productos**: Gestión de inventario y ventas
- **Reportes**: Estadísticas con gráficos y filtros por rango de fechas

## 🛠️ Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **React Router** - Navegación
- **Framer Motion** - Animaciones
- **Three.js / React Three Fiber** - Gráficos 3D
- **Recharts** - Gráficos estadísticos
- **Lucide React** - Iconos
- **Supabase** (preparado para integración)

## 🎨 Paleta de Colores

- **Gold**: #D4AF37
- **Bronze**: #CD7F32  
- **Red**: #8B0000
- **Dark**: #1a1a1a
- **Darker**: #0d0d0d

## 📱 Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing Page |
| `/intranet` | Dashboard principal |
| `/intranet/clientes` | Gestión de clientes |
| `/intranet/pagos` | Registro de pagos |
| `/intranet/productos` | Inventario y ventas |
| `/intranet/reportes` | Reportes y estadísticas |

## 🗄️ Estructura de Base de Datos (Supabase)

Ver archivo `SUPABASE_TABLES.md` para la estructura completa de las tablas.

---

Desarrollado con 💪 para Sparta Gym
