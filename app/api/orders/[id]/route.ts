import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Obtener estado actual y items
    const current = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!current) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const prevStatus = current.status;
    const nextStatus = String(body.status || '').toUpperCase();

    // Transacciones para mantener consistencia de stock + estado
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Si pasa de no-PAGADO a PAGADO, descontar stock
      if (prevStatus !== 'PAID' && nextStatus === 'PAID') {
        // Validar stock disponible
        for (const item of current.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true },
          });
          if (!product) {
            throw new Error('Producto no encontrado');
          }
          if (product.stock < item.quantity) {
            throw new Error('Stock insuficiente para completar el pago');
          }
        }
        // Descontar
        for (const item of current.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Si pasa de PAGADO a otro estado, re-sumar stock
      if (prevStatus === 'PAID' && nextStatus !== 'PAID') {
        for (const item of current.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Actualizar estado de la orden
      const updated = await tx.order.update({
        where: { id: params.id },
        data: { status: nextStatus },
        include: {
          items: { include: { product: true } },
        },
      });

      return updated;
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    const msg = typeof error?.message === 'string' ? error.message : 'Error al actualizar pedido';
    const status = msg.includes('Stock insuficiente') ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Solo ADMIN puede eliminar pedidos
  // @ts-ignore - user.rol personalizado
  if (session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
  }

  try {
    // Recuperar orden y sus items
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Si la orden estaba pagada, re-sumar stock
      if (order.status === 'PAID') {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      // Eliminar la orden
      await tx.order.delete({ where: { id: params.id } });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar pedido' }, { status: 500 });
  }
}
