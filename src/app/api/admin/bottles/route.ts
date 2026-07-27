import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.qrCode = { contains: search };

    const bottles = await prisma.bottle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bottles });
  } catch (error) {
    console.error('Get bottles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
