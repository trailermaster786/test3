import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targets = await prisma.salesTarget.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ targets });
  } catch (error) {
    console.error('Get sales targets error:', error);
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
    const { userId, targetType, period, targetAmount, month, year } = body;

    const target = await prisma.salesTarget.create({
      data: {
        userId,
        targetType: targetType || 'monthly',
        period,
        targetAmount: parseFloat(targetAmount),
        month: parseInt(month),
        year: parseInt(year),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ target }, { status: 201 });
  } catch (error) {
    console.error('Create sales target error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
