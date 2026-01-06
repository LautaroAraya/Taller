# Proyecto E-Commerce Taller Mecánico

## Stack Tecnológico
- Next.js 14 con App Router
- TypeScript
- Tailwind CSS
- Prisma ORM + SQLite
- NextAuth.js para autenticación

## Estructura del Proyecto
- `/app` - Páginas y rutas de Next.js
- `/components` - Componentes reutilizables
- `/lib` - Utilidades y configuraciones
- `/prisma` - Schema y migraciones de base de datos
- `/public` - Archivos estáticos e imágenes

## Roles de Usuario
- **Admin**: Acceso completo (agregar/editar/eliminar productos, gestionar usuarios, confirmar ventas)
- **Empleado**: Acceso limitado (ver productos, confirmar ventas)

## Funcionalidades Principales
1. Catálogo de productos público con imágenes, precios y stock
2. Carrito de compras con integración WhatsApp
3. Panel administrativo protegido
4. Control de inventario en tiempo real
5. Notificación automática cuando productos sin stock
