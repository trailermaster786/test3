import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPass = await bcrypt.hash('admin123', 10);
  const driverPass = await bcrypt.hash('driver123', 10);
  const customerPass = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@gmail.com', password: adminPass, phone: '+971501234567', role: 'admin' },
  });

  const driver1 = await prisma.user.upsert({
    where: { email: 'driver@gmail.com' },
    update: {},
    create: { name: 'Ahmed Driver', email: 'driver@gmail.com', password: driverPass, phone: '+971502345678', role: 'driver' },
  });

  const driver2 = await prisma.user.upsert({
    where: { email: 'driver2@gmail.com' },
    update: {},
    create: { name: 'Saeed Driver', email: 'driver2@gmail.com', password: driverPass, phone: '+971503456789', role: 'driver' },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@gmail.com' },
    update: {},
    create: { name: 'Mohammed Customer', email: 'customer@gmail.com', password: customerPass, phone: '+971504567890', role: 'customer' },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'fatima@gmail.com' },
    update: {},
    create: { name: 'Fatima Customer', email: 'fatima@gmail.com', password: customerPass, phone: '+971505678901', role: 'customer' },
  });

  const customer3 = await prisma.user.upsert({
    where: { email: 'khalid@gmail.com' },
    update: {},
    create: { name: 'Khalid Customer', email: 'khalid@gmail.com', password: customerPass, phone: '+971506789012', role: 'customer' },
  });

  console.log('Users seeded');

  const product1 = await prisma.product.upsert({
    where: { id: 'prod-1' },
    update: {},
    create: { id: 'prod-1', name: 'Standard Water 18L', description: 'Pure drinking water, 18 liters', price: 5, liter: 18, stock: 200 },
  });

  const product2 = await prisma.product.upsert({
    where: { id: 'prod-2' },
    update: {},
    create: { id: 'prod-2', name: 'Premium Mineral 18L', description: 'Premium mineral water, 18 liters', price: 8, liter: 18, stock: 150 },
  });

  await prisma.product.upsert({
    where: { id: 'prod-3' },
    update: {},
    create: { id: 'prod-3', name: 'Standard Water 5L', description: 'Pure drinking water, 5 liters', price: 2.5, liter: 5, stock: 300 },
  });

  await prisma.product.upsert({
    where: { id: 'prod-4' },
    update: {},
    create: { id: 'prod-4', name: 'Premium Mineral 5L', description: 'Premium mineral water, 5 liters', price: 4, liter: 5, stock: 250 },
  });

  console.log('Products seeded');

  for (let i = 1; i <= 70; i++) {
    const status = i <= 50 ? 'IN_FACTORY' : i <= 60 ? 'DELIVERED' : 'BACK_AT_FACTORY';
    const refillCount = status === 'BACK_AT_FACTORY' ? Math.floor(Math.random() * 15) : 0;
    await prisma.bottle.upsert({
      where: { qrCode: `AQUA-${String(i).padStart(4, '0')}` },
      update: {},
      create: { qrCode: `AQUA-${String(i).padStart(4, '0')}`, status, refillCount, maxRefills: 30 },
    });
  }

  console.log('Bottles seeded');

  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const addr1 = await prisma.address.create({
      data: { userId: customer1.id, label: 'Home', street: '123 Al Mamzar Street', city: 'Dubai', isDefault: true },
    });

    const addr2 = await prisma.address.create({
      data: { userId: customer2.id, label: 'Office', street: '456 Business Bay', city: 'Dubai', isDefault: true },
    });

    await prisma.order.create({
      data: {
        status: 'DELIVERED', userId: customer1.id, driverId: driver1.id, addressId: addr1.id,
        totalAmount: 15, finalAmount: 15, paymentMethod: 'cash', paymentStatus: 'paid',
        items: { create: [{ productId: product1.id, quantity: 3, unitPrice: 5 }] },
      },
    });

    await prisma.order.create({
      data: {
        status: 'IN_TRANSIT', userId: customer2.id, driverId: driver2.id, addressId: addr2.id,
        totalAmount: 16, discount: 1.5, finalAmount: 14.5, paymentMethod: 'card', paymentStatus: 'paid',
        items: { create: [{ productId: product2.id, quantity: 2, unitPrice: 8 }] },
      },
    });

    await prisma.order.create({
      data: {
        status: 'PENDING', userId: customer3.id,
        totalAmount: 10, finalAmount: 10, paymentMethod: 'cash', paymentStatus: 'pending',
        items: { create: [{ productId: product1.id, quantity: 2, unitPrice: 5 }] },
      },
    });

    console.log('Orders seeded');
  }

  await prisma.truck.upsert({
    where: { plate: 'DXB-1234' },
    update: {},
    create: { plate: 'DXB-1234', model: 'Toyota Hilux', capacity: 50, driverId: driver1.id },
  });

  await prisma.truck.upsert({
    where: { plate: 'DXB-5678' },
    update: {},
    create: { plate: 'DXB-5678', model: 'Nissan Navara', capacity: 40, driverId: driver2.id },
  });

  console.log('Trucks seeded');

  await prisma.promoOffer.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10', description: '10% off your first order', type: 'percentage', value: 10,
      minOrder: 5, maxUses: 100, isActive: true, startsAt: new Date(), endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.promoOffer.upsert({
    where: { code: 'SAVE5' },
    update: {},
    create: {
      code: 'SAVE5', description: 'AED 5 off orders over AED 20', type: 'fixed', value: 5,
      minOrder: 20, maxUses: 50, isActive: true, startsAt: new Date(), endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Promos seeded');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const existingTargets = await prisma.salesTarget.count();
  if (existingTargets === 0) {
    await prisma.salesTarget.create({
      data: { userId: driver1.id, targetType: 'monthly', period: `${currentMonth}/${currentYear}`, targetAmount: 5000, achievedAmount: 3200, month: currentMonth, year: currentYear },
    });
    await prisma.salesTarget.create({
      data: { userId: driver2.id, targetType: 'monthly', period: `${currentMonth}/${currentYear}`, targetAmount: 4000, achievedAmount: 2800, month: currentMonth, year: currentYear },
    });
    console.log('Sales targets seeded');
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
