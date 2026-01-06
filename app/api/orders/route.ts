import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Validar datos obligatorios
    const name = String(body.customerName || '').trim();
    const phone = String(body.customerPhone || '').trim();
    const digits = phone.replace(/\D/g, '');
    if (!name || digits.length < 7) {
      return NextResponse.json(
        { error: 'Nombre y teléfono válidos son obligatorios' },
        { status: 400 }
      );
    }
    // Generar número de orden incremental simple: ORD-00001
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    });
    const extractNumber = (ord?: string | null) => {
      if (!ord) return 0;
      const m = ord.match(/(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    };
    const next = extractNumber(lastOrder?.orderNumber) + 1;
    const orderNumber = `ORD-${String(next).padStart(5, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: name,
        customerPhone: phone,
        total: body.total,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });
    
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 });
  }
}
