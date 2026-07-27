import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'customer' && user.role !== 'driver')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, addressId, paymentMethod, promoCode, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
      }
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    // Apply promo
    let discount = 0;
    let appliedPromoId = null;
    if (promoCode) {
      const promo = await prisma.promoOffer.findUnique({ where: { code: promoCode.toUpperCase() } });
      if (promo && promo.isActive && promo.usedCount < promo.maxUses) {
        if (new Date() >= (promo.startsAt || new Date()) && new Date() <= (promo.endsAt || new Date('2099-12-31'))) {
          if (totalAmount >= promo.minOrder) {
            if (promo.type === 'percentage') {
              discount = totalAmount * (promo.value / 100);
            } else {
              discount = Math.min(promo.value, totalAmount);
            }
            appliedPromoId = promo.id;
          }
        }
      }
    }

    const finalAmount = totalAmount - discount;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        addressId: addressId || null,
        totalAmount,
        discount,
        finalAmount,
        paymentMethod: paymentMethod || 'cash',
        notes,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    // Decrement stock for each product
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (appliedPromoId) {
      await prisma.promoOffer.update({
        where: { id: appliedPromoId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
