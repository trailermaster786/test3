import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bottles = await prisma.bottle.findMany({
      where: { status: 'FLAGGED_FOR_DESTRUCTION' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bottles });
  } catch (error) {
    console.error('Get destruction queue error:', error);
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
    const { bottleIds } = body;

    const result = await prisma.bottle.updateMany({
      where: { id: { in: bottleIds } },
      data: { status: 'DESTROYED' },
    });

    // Create events for destroyed bottles
    for (const bottleId of bottleIds) {
      await prisma.bottleEvent.create({
        data: {
          bottleId,
          type: 'DESTROYED',
          userId: user.userId,
          notes: 'Destroyed by admin',
        },
      });
    }

    return NextResponse.json({ destroyed: result.count });
  } catch (error) {
    console.error('Destroy bottles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
