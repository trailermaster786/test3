import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trucks = await prisma.truck.findMany({
      include: {
        driver: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ trucks });
  } catch (error) {
    console.error('Get fleet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plate, model, capacity, driverId } = body;

    const existingTruck = await prisma.truck.findUnique({ where: { plate } });
    if (existingTruck) {
      return NextResponse.json({ error: 'Plate already exists' }, { status: 400 });
    }

    const truck = await prisma.truck.create({
      data: { plate, model, capacity: parseInt(capacity), driverId: driverId || null },
    });

    return NextResponse.json({ truck }, { status: 201 });
  } catch (error) {
    console.error('Create truck error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, plate, model, capacity, driverId, isActive } = body;

    const truck = await prisma.truck.update({
      where: { id },
      data: { plate, model, capacity: capacity ? parseInt(capacity) : undefined, driverId, isActive },
    });

    return NextResponse.json({ truck });
  } catch (error) {
    console.error('Update truck error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
