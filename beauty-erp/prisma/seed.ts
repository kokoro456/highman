import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create admin user
  const adminPassword = await bcrypt.hash('admin1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@beauty-erp.kr' },
    update: {},
    create: {
      email: 'admin@beauty-erp.kr',
      name: '관리자',
      role: 'ADMIN',
      authProvider: 'EMAIL',
      passwordHash: adminPassword,
    },
  });
  console.log('Admin user created:', admin.email);

  // 2. Create shop owner
  const ownerPassword = await bcrypt.hash('owner1234', 12);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@beauty-erp.kr' },
    update: {},
    create: {
      email: 'owner@beauty-erp.kr',
      name: '김미영',
      phone: '010-1234-5678',
      role: 'SHOP_OWNER',
      authProvider: 'EMAIL',
      passwordHash: ownerPassword,
    },
  });
  console.log('Owner user created:', owner.email);

  // 3. Create shop
  const shop = await prisma.shop.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      ownerId: owner.id,
      name: 'Beauty Nail Studio',
      businessType: 'NAIL',
      phone: '02-1234-5678',
      address: '서울 강남구 역삼동 123-45',
      addressDetail: '2층',
      description: '속눈썹, 네일, 왁싱 전문 뷰티샵',
      subscriptionTier: 'PROFESSIONAL',
      businessHours: {
        MON: { open: '10:00', close: '20:00', isOpen: true },
        TUE: { open: '10:00', close: '20:00', isOpen: true },
        WED: { open: '10:00', close: '20:00', isOpen: true },
        THU: { open: '10:00', close: '20:00', isOpen: true },
        FRI: { open: '10:00', close: '21:00', isOpen: true },
        SAT: { open: '11:00', close: '18:00', isOpen: true },
        SUN: { open: '00:00', close: '00:00', isOpen: false },
      },
      closedDays: ['SUN'],
    },
  });
  console.log('Shop created:', shop.name);

  const shopId = shop.id;

  // 4. Create service categories & services
  const categories = [
    {
      name: '속눈썹',
      sortOrder: 0,
      services: [
        { name: '속눈썹 연장 (자연)', duration: 90, price: 89000 },
        { name: '속눈썹 연장 (볼륨)', duration: 120, price: 119000 },
        { name: '속눈썹 리터치', duration: 45, price: 49000 },
        { name: '속눈썹 제거', duration: 30, price: 20000 },
      ],
    },
    {
      name: '네일',
      sortOrder: 1,
      services: [
        { name: '젤네일 풀세트', duration: 120, price: 75000 },
        { name: '아트네일', duration: 150, price: 95000 },
        { name: '네일 리무브', duration: 30, price: 15000 },
        { name: '손톱 케어', duration: 45, price: 35000 },
        { name: '페디큐어', duration: 60, price: 55000 },
      ],
    },
    {
      name: '왁싱',
      sortOrder: 2,
      services: [
        { name: '브라질리언 왁싱', duration: 60, price: 65000 },
        { name: '겨드랑이 왁싱', duration: 20, price: 15000 },
        { name: '다리 왁싱 (하프)', duration: 40, price: 35000 },
        { name: '다리 왁싱 (풀)', duration: 60, price: 55000 },
      ],
    },
  ];

  for (const cat of categories) {
    const category = await prisma.serviceCategory.create({
      data: { shopId, name: cat.name, sortOrder: cat.sortOrder },
    });

    for (let i = 0; i < cat.services.length; i++) {
      await prisma.service.create({
        data: {
          shopId,
          categoryId: category.id,
          name: cat.services[i].name,
          duration: cat.services[i].duration,
          price: cat.services[i].price,
          sortOrder: i,
        },
      });
    }
    console.log(`Category "${cat.name}" with ${cat.services.length} services created`);
  }

  // 5. Create staff
  const staffData = [
    { name: '박서연', phone: '010-4821-7293', role: 'DESIGNER' as const, color: '#10B981', specialties: ['속눈썹', '왁싱'], sortOrder: 0 },
    { name: '이하은', phone: '010-3847-1926', role: 'DESIGNER' as const, color: '#6366F1', specialties: ['네일', '아트네일'], sortOrder: 1 },
    { name: '김도윤', phone: '010-9182-4637', role: 'ASSISTANT' as const, color: '#F59E0B', specialties: ['속눈썹 리터치'], sortOrder: 2 },
  ];

  const staffRecords = [];
  for (const s of staffData) {
    const staff = await prisma.staff.create({
      data: {
        shopId,
        name: s.name,
        phone: s.phone,
        role: s.role,
        color: s.color,
        specialties: s.specialties,
        sortOrder: s.sortOrder,
        hiredAt: new Date('2025-01-15'),
      },
    });
    staffRecords.push(staff);

    // Create schedules for each staff (Mon-Fri: 10:00-20:00, Sat: 11:00-18:00)
    const weekdaySchedule = { startTime: '10:00', endTime: '20:00', breakStartTime: '13:00', breakEndTime: '14:00' };
    const satSchedule = { startTime: '11:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00' };

    for (let day = 1; day <= 5; day++) {
      await prisma.schedule.create({
        data: { shopId, staffId: staff.id, dayOfWeek: day, ...weekdaySchedule, isActive: true },
      });
    }
    await prisma.schedule.create({
      data: { shopId, staffId: staff.id, dayOfWeek: 6, ...satSchedule, isActive: true },
    });

    console.log(`Staff "${s.name}" with schedule created`);
  }

  // 6. Create incentives
  for (const staff of staffRecords) {
    await prisma.staffIncentive.create({
      data: {
        shopId,
        staffId: staff.id,
        type: 'PERCENTAGE',
        rate: staff.role === 'DESIGNER' ? 20 : 10,
      },
    });
  }
  console.log('Staff incentives created');

  // 7. Create customers
  const customersData = [
    { name: '정민서', phone: '010-4821-7293', tags: ['VIP', '속눈썹'], visitCount: 12, totalSpent: 847000 },
    { name: '최유진', phone: '010-3847-1926', tags: ['네일'], visitCount: 8, totalSpent: 562000 },
    { name: '한소희', phone: '010-9182-4637', tags: ['VVIP', '왁싱', '속눈썹'], visitCount: 23, totalSpent: 1834000 },
    { name: '오서윤', phone: '010-2738-8461', tags: ['신규'], visitCount: 3, totalSpent: 189000 },
    { name: '윤채원', phone: '010-6194-3728', tags: ['VIP', '네일', '피부'], visitCount: 15, totalSpent: 1247000 },
    { name: '김나연', phone: '010-5283-9174', tags: ['속눈썹'], visitCount: 6, totalSpent: 423000 },
    { name: '박지우', phone: '010-7392-4815', tags: ['VVIP', '왁싱'], visitCount: 31, totalSpent: 2891000 },
    { name: '이수빈', phone: '010-8461-2739', tags: ['신규'], visitCount: 1, totalSpent: 65000 },
    { name: '장서윤', phone: '010-3928-1746', tags: ['네일', '속눈썹'], visitCount: 9, totalSpent: 673000 },
    { name: '강하늘', phone: '010-7183-4926', tags: ['왁싱'], visitCount: 4, totalSpent: 260000 },
  ];

  const customers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        shopId,
        name: c.name,
        phone: c.phone,
        tags: c.tags,
        visitCount: c.visitCount,
        totalSpent: c.totalSpent,
        firstVisitDate: new Date(Date.now() - c.visitCount * 14 * 24 * 60 * 60 * 1000),
        lastVisitDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        tier: c.totalSpent > 1500000 ? 'VVIP' : c.totalSpent > 500000 ? 'VIP' : 'NORMAL',
        consentMarketing: Math.random() > 0.3,
      },
    });
    customers.push(customer);
  }
  console.log(`${customers.length} customers created`);

  // 8. Create some bookings for today and upcoming days
  const services = await prisma.service.findMany({ where: { shopId } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookingSlots = [
    { customerIdx: 0, staffIdx: 0, serviceIdx: 0, hour: 10, minute: 0, status: 'CONFIRMED' as const },
    { customerIdx: 1, staffIdx: 1, serviceIdx: 4, hour: 11, minute: 0, status: 'IN_PROGRESS' as const },
    { customerIdx: 2, staffIdx: 0, serviceIdx: 9, hour: 13, minute: 0, status: 'CONFIRMED' as const },
    { customerIdx: 3, staffIdx: 2, serviceIdx: 2, hour: 14, minute: 0, status: 'READY' as const },
    { customerIdx: 4, staffIdx: 1, serviceIdx: 5, hour: 15, minute: 0, status: 'READY' as const },
    { customerIdx: 5, staffIdx: 0, serviceIdx: 0, hour: 16, minute: 30, status: 'READY' as const },
  ];

  for (const slot of bookingSlots) {
    const service = services[slot.serviceIdx] || services[0];
    const startTime = new Date(today);
    startTime.setHours(slot.hour, slot.minute);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    await prisma.booking.create({
      data: {
        shopId,
        customerId: customers[slot.customerIdx].id,
        staffId: staffRecords[slot.staffIdx].id,
        serviceId: service.id,
        startTime,
        endTime,
        status: slot.status,
        source: 'DIRECT',
      },
    });
  }
  console.log(`${bookingSlots.length} bookings created for today`);

  // 9. Create some payments (past week)
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 7);
    const paidAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    paidAt.setHours(10 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60));

    const service = services[Math.floor(Math.random() * services.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const staff = staffRecords[Math.floor(Math.random() * staffRecords.length)];
    const methods = ['CARD', 'CARD', 'CARD', 'CASH', 'TRANSFER'] as const;
    const method = methods[Math.floor(Math.random() * methods.length)];

    await prisma.payment.create({
      data: {
        shopId,
        customerId: customer.id,
        staffId: staff.id,
        amount: Number(service.price),
        discount: 0,
        finalAmount: Number(service.price),
        method,
        status: 'COMPLETED',
        paidAt,
      },
    });
  }
  console.log('15 sample payments created');

  // 10. Create passes for VIP customers
  const vipCustomers = customers.filter((_, i) => customersData[i].tags.includes('VIP') || customersData[i].tags.includes('VVIP'));
  for (const customer of vipCustomers.slice(0, 3)) {
    await prisma.pass.create({
      data: {
        shopId,
        customerId: customer.id,
        type: 'TICKET',
        name: '속눈썹 10회 이용권',
        totalCount: 10,
        remainingCount: Math.floor(Math.random() * 8) + 2,
        price: 790000,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    });
  }
  console.log('VIP passes created');

  console.log('\nSeed completed successfully!');
  console.log('---');
  console.log('Login credentials:');
  console.log('  Admin: admin@beauty-erp.kr / admin1234');
  console.log('  Owner: owner@beauty-erp.kr / owner1234');
  console.log(`  Shop ID: ${shopId}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
