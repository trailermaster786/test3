import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getNextStatus, shouldFlagForDestruction } from '@/lib/bottle-logic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { qrCode, type, orderId, notes } = body;

    if (!qrCode || !type) {
      return NextResponse.json({ error: 'QR code and type are required' }, { status: 400 });
    }

    const bottle = await prisma.bottle.findUnique({ where: { qrCode } });
    if (!bottle) {
      return NextResponse.json({ error: 'Bottle not found' }, { status: 404 });
    }

    // Determine next status based on event type
    let nextStatus: string | null = null;
    let newRefillCount = bottle.refillCount;

    switch (type) {
      case 'LOADED':
        nextStatus = 'LOADED_ON_TRUCK';
        break;
      case 'DELIVERED':
        nextStatus = 'DELIVERED';
        break;
      case 'COLLECTED':
        nextStatus = 'COLLECTED';
        break;
      case 'RETURNED':
        nextStatus = 'BACK_AT_FACTORY';
        newRefillCount = bottle.refillCount + 1;
        break;
      default:
        nextStatus = type;
    }

    // Check if bottle should be flagged for destruction
    if (nextStatus === 'BACK_AT_FACTORY' && shouldFlagForDestruction(newRefillCount, bottle.maxRefills)) {
      nextStatus = 'FLAGGED_FOR_DESTRUCTION';
    }

    // Update bottle status
    await prisma.bottle.update({
      where: { id: bottle.id },
      data: {
        status: nextStatus || bottle.status,
        refillCount: newRefillCount,
      },
    });

    // Create event
    const event = await prisma.bottleEvent.create({
      data: {
        bottleId: bottle.id,
        type,
        orderId: orderId || null,
        userId: user.userId,
        notes,
      },
    });

    return NextResponse.json({ event, bottle: { ...bottle, status: nextStatus, refillCount: newRefillCount } });
  } catch (error) {
    console.error('Create bottle event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
