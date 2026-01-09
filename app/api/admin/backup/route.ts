import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const [users, products, orders, orderItems, settings] = await Promise.all([
      prisma.user.findMany(),
      prisma.product.findMany(),
      prisma.order.findMany(),
      prisma.orderItem.findMany(),
      prisma.settings.findMany(),
    ]);

    const backup = {
      meta: {
        generatedAt: new Date().toISOString(),
        version: 1,
        collections: ['users', 'products', 'orders', 'orderItems', 'settings'],
      },
      users,
      products,
      orders,
      orderItems,
      settings,
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="backup-taller.json"',
      },
    });
  } catch (error) {
    console.error('Error al generar backup', error);
    return NextResponse.json({ error: 'Error al generar backup' }, { status: 500 });
  }
}
