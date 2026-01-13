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
    const users = Array.isArray(payload.users) ? payload.users : [];
    const products = Array.isArray(payload.products) ? payload.products : [];
    const orders = Array.isArray(payload.orders) ? payload.orders : [];
    const orderItems = Array.isArray(payload.orderItems) ? payload.orderItems : [];
    const settings = Array.isArray(payload.settings) ? payload.settings : [];

    const hasRestorableData = users.length + products.length + orders.length + orderItems.length + settings.length > 0;
    if (!hasRestorableData) {
      return NextResponse.json({ error: 'El archivo de backup está vacío o no es válido.' }, { status: 400 });
    }

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

      // Asegurar que quede al menos una configuración válida
      const existsSettings = await tx.settings.findFirst();
      if (!existsSettings) {
        await tx.settings.create({
          data: {
            shopName: 'Taller Mecánico',
            shopSubtitle: 'Repuestos y Mercadería',
            shopAddress: '',
            shopPhone: '',
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error al restaurar backup', error);
    return NextResponse.json({ error: 'Error al restaurar backup' }, { status: 500 });
  }
}
