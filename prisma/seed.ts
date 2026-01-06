import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taller.com' },
    update: {},
    create: {
      email: 'admin@taller.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuario admin creado:', admin.email);

  // Crear usuario empleado
  const employeePassword = await bcrypt.hash('empleado123', 10);
  const employee = await prisma.user.upsert({
    where: { email: 'empleado@taller.com' },
    update: {},
    create: {
      email: 'empleado@taller.com',
      name: 'Empleado',
      password: employeePassword,
      role: 'EMPLOYEE',
    },
  });

  console.log('✅ Usuario empleado creado:', employee.email);

  // Crear productos de ejemplo
  const productos = [
    {
      name: 'Filtro de Aceite',
      description: 'Filtro de aceite para motor de auto',
      price: 15000,
      stock: 25,
      category: 'Filtros',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    },
    {
      name: 'Pastillas de Freno',
      description: 'Juego de pastillas de freno delanteras',
      price: 28000,
      stock: 15,
      category: 'Frenos',
      image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
    },
    {
      name: 'Bujía NGK',
      description: 'Bujía de alta calidad NGK',
      price: 8500,
      stock: 40,
      category: 'Encendido',
      image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
    },
    {
      name: 'Aceite Sintético 5W30',
      description: 'Aceite sintético 5W30 para motor, 4 litros',
      price: 35000,
      stock: 8,
      category: 'Lubricantes',
      image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
    },
    {
      name: 'Correa de Distribución',
      description: 'Correa de distribución con tensor',
      price: 45000,
      stock: 3,
      category: 'Motor',
      image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
    },
    {
      name: 'Batería 12V 60Ah',
      description: 'Batería de auto 12V 60Ah',
      price: 75000,
      stock: 0,
      category: 'Eléctrico',
      image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400',
    },
  ];

  for (const producto of productos) {
    await prisma.product.create({
      data: producto,
    });
  }

  console.log('✅ Productos de ejemplo creados');

  // Crear configuración por defecto
  await prisma.settings.upsert({
    where: { id: 'settings-default' },
    update: {},
    create: {
      id: 'settings-default',
      shopName: 'Taller Mecánico',
      shopSubtitle: 'Repuestos y Mercadería',
    },
  });

  console.log('✅ Configuración por defecto creada');

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
