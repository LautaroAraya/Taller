import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const price = parseFloat(body.price);
    const stock = parseInt(body.stock);

    // Validar que precio y stock no sean negativos
    if (price < 0) {
      return NextResponse.json({ error: 'El precio no puede ser negativo' }, { status: 400 });
    }
    if (stock < 0) {
      return NextResponse.json({ error: 'El stock no puede ser negativo' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price,
        stock,
        image: body.image,
        category: body.category,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
