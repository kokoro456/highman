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

  console.log(`Shop: ${shop.name}`);
  console.log(`Customers: ${customers.length}, Staff: ${staff.length}, Services: ${services.length}`);

  if (!customers.length || !staff.length || !services.length) {
    console.log('Missing data'); return;
  }

  // === 1. Delete old TEST data ===
  const deletedPayments = await prisma.payment.deleteMany({
    where: { shopId: shop.id, memo: 'TEST 결제 데이터' }
  });
  const deletedBookings = await prisma.booking.deleteMany({
    where: { shopId: shop.id, memo: 'TEST 예약 데이터' }
  });
  console.log(`Deleted ${deletedPayments.count} old TEST payments, ${deletedBookings.count} old TEST bookings`);

  const methods = ['CARD', 'CASH', 'TRANSFER', 'CARD', 'CARD', 'CARD'];
  let paymentCount = 0;
  let bookingCount = 0;

  // === 2. March 1-25: Create booking + linked payment ===
  for (let day = 1; day <= 25; day++) {
    const dow = new Date(2026, 2, day).getDay();
    if (dow === 0) continue; // Skip Sunday

    const numItems = randInt(5, 12);
    for (let i = 0; i < numItems; i++) {
      const customer = pick(customers);
      const staffMember = pick(staff);
      const service = pick(services);
      const hour = randInt(10, 19);
      const minute = randInt(0, 55);
      const startTime = new Date(2026, 2, day, hour, minute, 0, 0);
      const duration = Number(service.duration) || 60;
      const endTime = new Date(startTime.getTime() + duration * 60000);
      const amount = Number(service.price);
      const discount = Math.random() < 0.15 ? randInt(3000, 15000) : 0;

      // Create booking first
      const booking = await prisma.booking.create({
        data: {
          shopId: shop.id,
          customerId: customer.id,
          staffId: staffMember.id,
          serviceId: service.id,
          startTime,
          endTime,
          status: 'COMPLETED',
          source: 'DIRECT',
          memo: 'TEST 예약 데이터',
        }
      });

      // Create linked payment
      await prisma.payment.create({
        data: {
          shopId: shop.id,
          customerId: customer.id,
          staffId: staffMember.id,
          bookingId: booking.id,
          amount,
          discount,
          finalAmount: amount - discount,
          method: pick(methods),
          status: 'COMPLETED',
          memo: 'TEST 결제 데이터',
          paidAt: new Date(2026, 2, day, hour + 1, minute, 0, 0),
        }
      });
      paymentCount++;
      bookingCount++;
    }
  }

  // === 3. Future bookings: March 26 - April 25 ===
  for (let month = 2; month <= 3; month++) {
    const startDay = month === 2 ? 26 : 1;
    const endDay = month === 2 ? 31 : 25;

    for (let day = startDay; day <= endDay; day++) {
      const dow = new Date(2026, month, day).getDay();
      if (dow === 0) continue;

      const num = randInt(3, 7);
      for (let i = 0; i < num; i++) {
        const service = pick(services);
        const hour = randInt(10, 18);
        const startTime = new Date(2026, month, day, hour, 0, 0, 0);
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
  }

  // === 4. Update customer stats ===
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

  console.log(`\nCreated ${paymentCount} TEST payments with booking links (March 1-25)`);
  console.log(`Created ${bookingCount} TEST bookings total`);
  console.log('Updated customer stats');
  console.log('\nService distribution:');

  // Show service distribution
  const svcCount = {};
  for (const s of services) { svcCount[s.name] = 0; }
  const allPayments = await prisma.payment.findMany({
    where: { shopId: shop.id, memo: 'TEST 결제 데이터' },
    include: { booking: { include: { service: true } } }
  });
  for (const p of allPayments) {
    const name = p.booking?.service?.name || '직접 결제';
    svcCount[name] = (svcCount[name] || 0) + 1;
  }
  for (const [name, count] of Object.entries(svcCount)) {
    if (count > 0) console.log(`  ${name}: ${count}건`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
