import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { code, description, type, value, minOrder, maxUses, isActive, startsAt, endsAt } = body;

    const promo = await prisma.promoOffer.update({
      where: { id },
      data: {
        code,
        description,
        type,
        value: value ? parseFloat(value) : undefined,
        minOrder: minOrder ? parseFloat(minOrder) : undefined,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        isActive,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
      },
    });

    return NextResponse.json({ promo });
  } catch (error) {
    console.error('Update promo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
