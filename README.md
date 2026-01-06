# 🔧 Taller Mecánico - E-Commerce

Sistema completo de e-commerce para taller mecánico con catálogo de productos, integración WhatsApp y panel de administración.

## ✨ Características

### Para Clientes
- **Catálogo de productos** con imágenes, precios y disponibilidad
- **Carrito de compras** funcional
- **Integración WhatsApp** para enviar consultas directamente
- **Indicador de stock** en tiempo real
- **Diseño responsive** para móviles y desktop

### Panel de Administración
- **Dos roles de usuario**: Administrador y Empleado
- **Gestión de productos**: Agregar, editar y eliminar productos
- **Control de inventario**: Stock en tiempo real con alertas
- **Gestión de pedidos**: Confirmar ventas y actualizar inventario
- **Gestión de usuarios**: Solo administradores (crear usuarios, asignar roles)
- **Dashboard**: Estadísticas y alertas de stock bajo/agotado

## 🚀 Tecnologías

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: SQLite + Prisma ORM
- **Autenticación**: NextAuth.js
- **Encriptación**: bcryptjs

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio** (o ya estás en la carpeta del proyecto)

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
El archivo `.env` ya está creado con:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="tu-secreto-super-seguro-cambialo-en-produccion"
NEXTAUTH_URL="http://localhost:3000"
```

⚠️ **IMPORTANTE**: Cambia `NEXTAUTH_SECRET` en producción.

4. **Crear la base de datos**:
```bash
npx prisma db push
```

5. **Poblar con datos de ejemplo**:
```bash
npx prisma db seed
```

Esto creará:
- Usuario Admin: `admin@taller.com` / `admin123`
- Usuario Empleado: `empleado@taller.com` / `empleado123`
- 6 productos de ejemplo

## 🏃‍♂️ Ejecutar el Proyecto

### Modo Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

### Modo Producción
```bash
npm run build
npm start
```

## 📱 Uso del Sistema

### Tienda (Público)
1. Visita `http://localhost:3000`
2. Navega por el catálogo de productos
3. Agrega productos al carrito
4. Envía la consulta por WhatsApp

### Panel de Administración
1. Accede a `http://localhost:3000/admin`
2. Inicia sesión con las credenciales:
   - **Admin**: `admin@taller.com` / `admin123`
   - **Empleado**: `empleado@taller.com` / `empleado123`

#### Funciones por Rol

**Administrador** (acceso completo):
- ✅ Ver dashboard con estadísticas
- ✅ Agregar/editar/eliminar productos
- ✅ Confirmar/cancelar pedidos
- ✅ Gestionar usuarios (crear, eliminar)

**Empleado** (acceso limitado):
- ✅ Ver dashboard
- ✅ Ver productos (solo lectura)
- ✅ Confirmar/cancelar pedidos
- ❌ No puede modificar productos
- ❌ No puede gestionar usuarios

## 📁 Estructura del Proyecto

```
Taller/
├── app/                          # Páginas y rutas (App Router)
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticación NextAuth
│   │   ├── products/             # CRUD productos
│   │   ├── orders/               # Gestión de pedidos
│   │   └── users/                # Gestión de usuarios
│   ├── admin/                    # Panel administrativo
│   │   ├── dashboard/            # Dashboard con estadísticas
│   │   ├── products/             # Gestión de productos
│   │   ├── orders/               # Gestión de pedidos
│   │   ├── users/                # Gestión de usuarios (admin)
│   │   └── login/                # Login
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página de inicio (tienda)
│   └── globals.css               # Estilos globales
├── components/                   # Componentes reutilizables
│   └── ProductCard.tsx           # Card de producto con carrito
├── lib/                          # Utilidades
│   ├── prisma.ts                 # Cliente de Prisma
│   └── auth.ts                   # Configuración NextAuth
├── prisma/                       # Base de datos
│   ├── schema.prisma             # Schema de la BD
│   ├── seed.ts                   # Datos iniciales
│   └── dev.db                    # Base de datos SQLite
├── types/                        # Tipos TypeScript
│   └── next-auth.d.ts            # Tipos NextAuth
└── package.json                  # Dependencias
```

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Rutas protegidas con middleware NextAuth
- Validación de roles en API routes
- CSRF protection de NextAuth

## 🗄️ Base de Datos

El proyecto usa SQLite con Prisma. Modelos:

- **User**: Usuarios del sistema (admin/empleado)
- **Product**: Productos del catálogo
- **Order**: Pedidos de clientes
- **OrderItem**: Items de cada pedido

### Comandos útiles de Prisma

```bash
# Ver base de datos en navegador
npx prisma studio

# Resetear base de datos
npx prisma db push --force-reset

# Generar cliente de Prisma
npx prisma generate
```

## 📸 Funcionalidades Destacadas

### Control de Inventario Inteligente
- ✅ Descuento automático de stock al confirmar venta
- ✅ Alertas de stock bajo (menos de 5 unidades)
- ✅ Indicador "SIN STOCK" en productos agotados
- ✅ Prevención de venta de productos sin stock

### Integración WhatsApp
- ✅ Genera mensaje con productos seleccionados
- ✅ Incluye cantidades y precios
- ✅ Calcula total automáticamente
- ✅ Abre WhatsApp con mensaje pre-llenado

## 🔧 Personalización

### Cambiar datos de contacto de WhatsApp
Edita [components/ProductCard.tsx](components/ProductCard.tsx#L40):
```typescript
const whatsappUrl = `https://wa.me/TU_NUMERO?text=${encodeURIComponent(fullMessage)}`;
```

### Modificar límite de stock bajo
Edita [app/admin/dashboard/page.tsx](app/admin/dashboard/page.tsx#L75):
```typescript
const lowStockProducts = products.filter(p => p.stock < 5); // Cambiar el 5
```

## 🐛 Solución de Problemas

### Error de compilación
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Base de datos corrupta
```bash
rm prisma/dev.db
npx prisma db push
npx prisma db seed
```

### Problemas de autenticación
Verifica que `NEXTAUTH_SECRET` esté en `.env` y reinicia el servidor.

## 📄 Licencia

Este proyecto está bajo licencia MIT - ver el archivo LICENSE para más detalles.

## 👨‍💻 Autor

Desarrollado para el taller mecánico.

---

**¿Preguntas o problemas?** Abre un issue o contacta al desarrollador.
