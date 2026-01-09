import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface BackupPayload {
  users?: any[];
  products?: any[];
  orders?: any[];
  orderItems?: any[];
  settings?: any[];
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as BackupPayload;
    const users = payload.users || [];
    const products = payload.products || [];
    const orders = payload.orders || [];
    const orderItems = payload.orderItems || [];
    const settings = payload.settings || [];

    await prisma.$transaction(async (tx) => {
      // Limpiar en orden de dependencias
      await tx.orderItem.deleteMany({});
      await tx.order.deleteMany({});
      await tx.product.deleteMany({});
      await tx.user.deleteMany({});
      await tx.settings.deleteMany({});

      // MongoDB no soporta skipDuplicates en createMany, usar create en bucle
      if (users.length) {
        for (const user of users) {
          await tx.user.create({ data: user });
        }
      }
      if (products.length) {
        for (const product of products) {
          await tx.product.create({ data: product });
        }
      }
      if (orders.length) {
        for (const order of orders) {
          await tx.order.create({ data: order });
        }
      }
      if (orderItems.length) {
        for (const item of orderItems) {
          await tx.orderItem.create({ data: item });
        }
      }
      if (settings.length) {
        for (const setting of settings) {
          await tx.settings.create({ data: setting });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al restaurar backup', error);
    return NextResponse.json({ error: 'Error al restaurar backup' }, { status: 500 });
  }
}
