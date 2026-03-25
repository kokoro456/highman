const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function main() {
  const shop = await prisma.shop.findFirst();
  if (!shop) { console.log('No shop found'); return; }

  const customers = await prisma.customer.findMany({ where: { shopId: shop.id } });
  const staff = await prisma.staff.findMany({ where: { shopId: shop.id } });
  const services = await prisma.service.findMany({ where: { shopId: shop.id } });

  console.log(`Shop: ${shop.name}, Customers: ${customers.length}, Staff: ${staff.length}, Services: ${services.length}`);

  const methods = ['CARD', 'CASH', 'TRANSFER', 'CARD', 'CARD'];
  let paymentCount = 0;
  let bookingCount = 0;

  // === March 1-25 결제 데이터 ===
  for (let day = 1; day <= 25; day++) {
    const dow = new Date(2026, 2, day).getDay();
    if (dow === 0) continue; // Skip Sunday

    const numPayments = randInt(4, 10);
    for (let i = 0; i < numPayments; i++) {
      const customer = pick(customers);
      const staffMember = pick(staff);
      const service = pick(services);
      const hour = randInt(10, 19);
      const minute = randInt(0, 59);
      const amount = Number(service.price);
      const discount = Math.random() < 0.15 ? randInt(5000, 20000) : 0;

      await prisma.payment.create({
        data: {
          shopId: shop.id,
          customerId: customer.id,
          staffId: staffMember.id,
          amount,
          discount,
          finalAmount: amount - discount,
          method: pick(methods),
          status: 'COMPLETED',
          memo: 'TEST 결제 데이터',
          paidAt: new Date(2026, 2, day, hour, minute, 0, 0),
        }
      });
      paymentCount++;
    }
  }

  // === March 26-31 + April 1-25 예약 데이터 ===
  for (let day = 26; day <= 31; day++) {
    const dow = new Date(2026, 2, day).getDay();
    if (dow === 0) continue;

    const num = randInt(3, 7);
    for (let i = 0; i < num; i++) {
      const service = pick(services);
      const hour = randInt(10, 18);
      const startTime = new Date(2026, 2, day, hour, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + Number(service.duration) * 60000);

      await prisma.booking.create({
        data: {
          shopId: shop.id,
          customerId: pick(customers).id,
          staffId: pick(staff).id,
          serviceId: service.id,
          startTime,
          endTime,
          status: 'CONFIRMED',
          source: 'DIRECT',
          memo: 'TEST 예약 데이터',
        }
      });
      bookingCount++;
    }
  }

  for (let day = 1; day <= 25; day++) {
    const dow = new Date(2026, 3, day).getDay();
    if (dow === 0) continue;

    const num = randInt(2, 6);
    for (let i = 0; i < num; i++) {
      const service = pick(services);
      const hour = randInt(10, 18);
      const startTime = new Date(2026, 3, day, hour, 0, 0, 0);
      const endTime = new Date(startTime.getTime() + Number(service.duration) * 60000);

      await prisma.booking.create({
        data: {
          shopId: shop.id,
          customerId: pick(customers).id,
          staffId: pick(staff).id,
          serviceId: service.id,
          startTime,
          endTime,
          status: 'CONFIRMED',
          source: 'DIRECT',
          memo: 'TEST 예약 데이터',
        }
      });
      bookingCount++;
    }
  }

  // === 고객별 visitCount, totalSpent 업데이트 ===
  for (const c of customers) {
    const totalSpent = await prisma.payment.aggregate({
      where: { customerId: c.id, status: 'COMPLETED' },
      _sum: { finalAmount: true },
    });
    const visitCount = await prisma.booking.count({
      where: { customerId: c.id, status: { in: ['COMPLETED', 'CONFIRMED'] } },
    });

    await prisma.customer.update({
      where: { id: c.id },
      data: {
        totalSpent: Number(totalSpent._sum.finalAmount || 0),
        visitCount,
        lastVisitDate: new Date(2026, 2, randInt(20, 25)),
      }
    });
  }

  console.log(`Created ${paymentCount} TEST payments (March 1-25)`);
  console.log(`Created ${bookingCount} TEST bookings (March 26 - April 25)`);
  console.log('Updated customer stats');
}

main().catch(console.error).finally(() => prisma.$disconnect());
