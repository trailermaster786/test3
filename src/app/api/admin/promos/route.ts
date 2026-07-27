import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promos = await prisma.promoOffer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ promos });
  } catch (error) {
    console.error('Get promos error:', error);
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
    const { code, description, type, value, minOrder, maxUses, startsAt, endsAt } = body;

    const existingPromo = await prisma.promoOffer.findUnique({ where: { code: code.toUpperCase() } });
    if (existingPromo) {
      return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
    }

    const promo = await prisma.promoOffer.create({
      data: {
        code: code.toUpperCase(),
        description,
        type,
        value: parseFloat(value),
        minOrder: parseFloat(minOrder) || 0,
        maxUses: parseInt(maxUses) || 100,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });

    return NextResponse.json({ promo }, { status: 201 });
  } catch (error) {
    console.error('Create promo error:', error);
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
    const { id, code, description, type, value, minOrder, maxUses, isActive, startsAt, endsAt } = body;

    if (!id) {
      return NextResponse.json({ error: 'Promo ID required' }, { status: 400 });
    }

    const promo = await prisma.promoOffer.update({
      where: { id },
      data: {
        ...(code !== undefined && { code: code.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(minOrder !== undefined && { minOrder: parseFloat(minOrder) }),
        ...(maxUses !== undefined && { maxUses: parseInt(maxUses) }),
        ...(isActive !== undefined && { isActive }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
        ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
      },
    });

    return NextResponse.json({ promo });
  } catch (error) {
    console.error('Update promo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Promo ID required' }, { status: 400 });
    }

    await prisma.promoOffer.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete promo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
