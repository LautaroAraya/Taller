import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    
    // Si no existe configuración, crear una por defecto
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          shopName: 'Taller Mecánico',
          shopSubtitle: 'Repuestos y Mercadería',
          shopAddress: '',
          shopPhone: '',
        },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    const data = await request.json();
    const { shopName, shopSubtitle, logo, shopAddress, shopPhone } = data;
    
    let settings = await prisma.settings.findFirst();
    
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { shopName, shopSubtitle, logo, shopAddress, shopPhone },
      });
    } else {
      settings = await prisma.settings.create({
        data: { shopName, shopSubtitle, logo, shopAddress, shopPhone },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 });
  }
}
