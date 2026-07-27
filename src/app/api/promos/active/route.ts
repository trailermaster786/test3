import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const promos = await prisma.promoOffer.findMany({
      where: {
        isActive: true,
      },
    });

    // Filter by date range in code since Prisma null handling is tricky
    const activePromos = promos.filter((promo) => {
      if (promo.startsAt && promo.startsAt > now) return false;
      if (promo.endsAt && promo.endsAt < now) return false;
      if (promo.usedCount >= promo.maxUses) return false;
      return true;
    });

    return NextResponse.json({ promos: activePromos });
  } catch (error) {
    console.error('Get active promos error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
