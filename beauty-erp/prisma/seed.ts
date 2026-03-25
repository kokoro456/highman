import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// Helper utilities
// ============================================================

/** Return a Date set to `yyyy-mm-dd HH:MM` in local time */
function dt(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

/** Add days to a date (returns new Date) */
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Random integer in [min, max] */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick random element */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Is a working day? (Mon-Sat, dayOfWeek: 0=Sun) */
function isWorkDay(d: Date): boolean {
  return d.getDay() !== 0; // Sunday off
}

/** Generate working days in a date range [start, end] */
function workingDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endD = new Date(end);
  endD.setHours(23, 59, 59, 999);
  while (cur <= endD) {
    if (isWorkDay(cur)) days.push(new Date(cur));
    cur = addDays(cur, 1);
  }
  return days;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🌱 Seeding demo database (TEST data)...\n');

  // ----------------------------------------------------------
  // 0. Clean up existing data (order matters for FK constraints)
  // ----------------------------------------------------------
  console.log('Cleaning existing data...');
  await prisma.passUsage.deleteMany();
  await prisma.membershipUsage.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.pointTransaction.deleteMany();
  await prisma.onlinePayment.deleteMany();
  await prisma.membershipCard.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.inAppNotification.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationTemplate.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.customerPhoto.deleteMany();
  await prisma.treatmentHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.dailySales.deleteMany();
  await prisma.pass.deleteMany();
  await prisma.staffIncentive.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();
  console.log('  Done.\n');

  // ----------------------------------------------------------
  // 1. Users
  // ----------------------------------------------------------
  const ownerPw = await bcrypt.hash('owner1234', 12);
  const adminPw = await bcrypt.hash('admin1234', 12);

  const owner = await prisma.user.create({
    data: {
      email: 'owner@beauty-erp.kr',
      name: 'TEST 김미영',
      phone: '01012345678',
      role: 'SHOP_OWNER',
      authProvider: 'EMAIL',
      passwordHash: ownerPw,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@beauty-erp.kr',
      name: 'TEST 관리자',
      role: 'ADMIN',
      authProvider: 'EMAIL',
      passwordHash: adminPw,
    },
  });
  console.log('Users created:', owner.email, admin.email);

  // ----------------------------------------------------------
  // 2. Shop
  // ----------------------------------------------------------
  const SHOP_ID = '00000000-0000-4000-8000-000000000001';
  const shop = await prisma.shop.create({
    data: {
      id: SHOP_ID,
      ownerId: owner.id,
      name: 'TEST Beauty Nail Studio',
      businessType: 'NAIL',
      phone: '02-1234-5678',
      address: '서울 강남구 역삼동 123-45',
      addressDetail: '2층',
      description: 'TEST 네일, 속눈썹, 왁싱, 피부관리 전문 뷰티샵',
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

  // ----------------------------------------------------------
  // 3. Staff
  // ----------------------------------------------------------
  const staffDefs = [
    { name: 'TEST 박서연', phone: '01048217293', role: 'DESIGNER' as const, color: '#FF6B6B', specialties: ['속눈썹', '왁싱'], sortOrder: 0, incentiveRate: 15 },
    { name: 'TEST 김도윤', phone: '01038471926', role: 'ASSISTANT' as const, color: '#FFA07A', specialties: ['네일 케어', '속눈썹 리터치'], sortOrder: 1, incentiveRate: 10 },
    { name: 'TEST 이하은', phone: '01091824637', role: 'DESIGNER' as const, color: '#4ECDC4', specialties: ['네일', '아트네일', '피부관리'], sortOrder: 2, incentiveRate: 15 },
  ];

  const staffRecords = [];
  for (const s of staffDefs) {
    const staff = await prisma.staff.create({
      data: {
        shopId,
        name: s.name,
        phone: s.phone,
        role: s.role,
        color: s.color,
        specialties: s.specialties,
        sortOrder: s.sortOrder,
        hiredAt: dt(2025, 9, 1),
      },
    });
    staffRecords.push(staff);

    // Schedules Mon(1)-Sat(6)
    const wkDay = { startTime: '10:00', endTime: '20:00', breakStartTime: '13:00', breakEndTime: '14:00' };
    const sat = { startTime: '11:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00' };
    for (let d = 1; d <= 5; d++) {
      await prisma.schedule.create({ data: { shopId, staffId: staff.id, dayOfWeek: d, ...wkDay, isActive: true } });
    }
    await prisma.schedule.create({ data: { shopId, staffId: staff.id, dayOfWeek: 6, ...sat, isActive: true } });

    // Incentive
    await prisma.staffIncentive.create({
      data: { shopId, staffId: staff.id, type: 'PERCENTAGE', rate: s.incentiveRate },
    });
  }
  console.log(`${staffRecords.length} staff + schedules + incentives created`);

  // ----------------------------------------------------------
  // 4. Service Categories & Services
  // ----------------------------------------------------------
  const catDefs = [
    {
      name: '네일', sortOrder: 0,
      services: [
        { name: 'TEST 젤네일 원컬러', duration: 40, price: 35000 },
        { name: 'TEST 젤네일 풀세트', duration: 90, price: 65000 },
        { name: 'TEST 네일 케어', duration: 30, price: 20000 },
        { name: 'TEST 네일아트', duration: 120, price: 85000 },
      ],
    },
    {
      name: '속눈썹', sortOrder: 1,
      services: [
        { name: 'TEST 속눈썹 연장', duration: 60, price: 55000 },
        { name: 'TEST 속눈썹 리터치', duration: 40, price: 35000 },
        { name: 'TEST 래쉬 리프트', duration: 50, price: 45000 },
      ],
    },
    {
      name: '왁싱', sortOrder: 2,
      services: [
        { name: 'TEST 브라질리언 왁싱', duration: 40, price: 45000 },
        { name: 'TEST 페이스 왁싱', duration: 20, price: 25000 },
        { name: 'TEST 바디 왁싱', duration: 30, price: 35000 },
      ],
    },
    {
      name: '피부관리', sortOrder: 3,
      services: [
        { name: 'TEST 수분 관리', duration: 60, price: 70000 },
        { name: 'TEST 모공 관리', duration: 50, price: 60000 },
        { name: 'TEST 리프팅 관리', duration: 70, price: 90000 },
      ],
    },
  ];

  const allServices: Array<{ id: string; name: string; duration: number; price: number }> = [];
  for (const cat of catDefs) {
    const category = await prisma.serviceCategory.create({
      data: { shopId, name: cat.name, sortOrder: cat.sortOrder },
    });
    for (let i = 0; i < cat.services.length; i++) {
      const s = cat.services[i];
      const svc = await prisma.service.create({
        data: { shopId, categoryId: category.id, name: s.name, duration: s.duration, price: s.price, sortOrder: i },
      });
      allServices.push({ id: svc.id, name: svc.name, duration: svc.duration, price: Number(svc.price) });
    }
  }
  console.log(`${allServices.length} services across ${catDefs.length} categories created`);

  // ----------------------------------------------------------
  // 5. Customers (20)
  // ----------------------------------------------------------
  const custDefs: Array<{
    name: string; phone: string; tier: 'NORMAL' | 'SILVER' | 'GOLD' | 'VIP' | 'VVIP';
    visitCount: number; totalSpent: number; tags: string[];
    memo?: string; birthDate?: Date; gender?: 'FEMALE' | 'MALE';
  }> = [
    { name: 'TEST 김민지', phone: '01011112222', tier: 'VVIP', visitCount: 45, totalSpent: 2500000, tags: ['단골', 'VIP', '네일매니아'], memo: 'TEST 젤네일 항상 풀세트, 아트 선호', birthDate: dt(1992, 3, 15), gender: 'FEMALE' },
    { name: 'TEST 이서윤', phone: '01022223333', tier: 'VIP', visitCount: 32, totalSpent: 1800000, tags: ['단골', 'VIP', '속눈썹단골'], memo: 'TEST J컬 선호, 알레르기 주의', birthDate: dt(1995, 7, 22), gender: 'FEMALE' },
    { name: 'TEST 박지현', phone: '01033334444', tier: 'VIP', visitCount: 28, totalSpent: 1500000, tags: ['단골', 'VIP', '피부관리'], gender: 'FEMALE' },
    { name: 'TEST 최유나', phone: '01044445555', tier: 'GOLD', visitCount: 20, totalSpent: 1100000, tags: ['단골', '왁싱전문'], birthDate: dt(1988, 11, 3), gender: 'FEMALE' },
    { name: 'TEST 정수빈', phone: '01055556666', tier: 'GOLD', visitCount: 18, totalSpent: 950000, tags: ['네일매니아', '속눈썹단골'], gender: 'FEMALE' },
    { name: 'TEST 한소희', phone: '01066667777', tier: 'GOLD', visitCount: 15, totalSpent: 820000, tags: ['단골', '피부관리'], birthDate: dt(1993, 5, 28), gender: 'FEMALE' },
    { name: 'TEST 윤채원', phone: '01077778888', tier: 'SILVER', visitCount: 12, totalSpent: 650000, tags: ['네일매니아'], gender: 'FEMALE' },
    { name: 'TEST 강하늘', phone: '01088889999', tier: 'SILVER', visitCount: 10, totalSpent: 520000, tags: ['왁싱전문'], gender: 'FEMALE' },
    { name: 'TEST 오서연', phone: '01099990000', tier: 'SILVER', visitCount: 9, totalSpent: 480000, tags: ['속눈썹단골'], birthDate: dt(1997, 1, 10), gender: 'FEMALE' },
    { name: 'TEST 장미래', phone: '01010101010', tier: 'SILVER', visitCount: 8, totalSpent: 420000, tags: ['피부관리', '신규'], gender: 'FEMALE' },
    { name: 'TEST 임하영', phone: '01020202020', tier: 'NORMAL', visitCount: 6, totalSpent: 310000, tags: ['네일매니아'], gender: 'FEMALE' },
    { name: 'TEST 신예진', phone: '01030303030', tier: 'NORMAL', visitCount: 5, totalSpent: 275000, tags: ['속눈썹단골'], birthDate: dt(1990, 9, 5), gender: 'FEMALE' },
    { name: 'TEST 조은서', phone: '01040404040', tier: 'NORMAL', visitCount: 5, totalSpent: 250000, tags: ['왁싱전문'], gender: 'FEMALE' },
    { name: 'TEST 류지아', phone: '01050505050', tier: 'NORMAL', visitCount: 4, totalSpent: 220000, tags: ['피부관리'], gender: 'FEMALE' },
    { name: 'TEST 배수현', phone: '01060606060', tier: 'NORMAL', visitCount: 4, totalSpent: 195000, tags: ['네일매니아', '신규'], gender: 'FEMALE' },
    { name: 'TEST 송다은', phone: '01070707070', tier: 'NORMAL', visitCount: 3, totalSpent: 165000, tags: ['신규'], gender: 'FEMALE' },
    { name: 'TEST 권나연', phone: '01080808080', tier: 'NORMAL', visitCount: 3, totalSpent: 140000, tags: ['신규'], birthDate: dt(2000, 12, 25), gender: 'FEMALE' },
    { name: 'TEST 홍서아', phone: '01090909090', tier: 'NORMAL', visitCount: 2, totalSpent: 90000, tags: ['신규'], gender: 'FEMALE' },
    { name: 'TEST 남지우', phone: '01011223344', tier: 'NORMAL', visitCount: 1, totalSpent: 55000, tags: ['신규'], gender: 'FEMALE' },
    { name: 'TEST 문현우', phone: '01055667788', tier: 'NORMAL', visitCount: 1, totalSpent: 35000, tags: ['신규'], gender: 'MALE' },
  ];

  const customers: Array<{ id: string; name: string }> = [];
  for (const c of custDefs) {
    const cust = await prisma.customer.create({
      data: {
        shopId,
        name: c.name,
        phone: c.phone,
        gender: c.gender,
        tier: c.tier,
        visitCount: c.visitCount,
        totalSpent: c.totalSpent,
        tags: c.tags,
        memo: c.memo,
        birthDate: c.birthDate,
        consentMarketing: Math.random() > 0.3,
        firstVisitDate: addDays(dt(2025, 12, 25), -randInt(0, c.visitCount * 3)),
        lastVisitDate: addDays(new Date(), -randInt(0, 14)),
      },
    });
    customers.push({ id: cust.id, name: cust.name });
  }
  console.log(`${customers.length} customers created`);

  // ----------------------------------------------------------
  // 6. Bookings + Payments + TreatmentHistories
  // ----------------------------------------------------------
  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  // Date boundaries
  const PAST_START = dt(2025, 12, 25);
  const YESTERDAY = addDays(TODAY, -1);
  const TOMORROW = addDays(TODAY, 1);
  const FUTURE_END = addDays(TODAY, 31); // ~1 month ahead

  const pastDays = workingDays(PAST_START, YESTERDAY);
  const futureDays = workingDays(TOMORROW, FUTURE_END);

  // Booking time slots
  const timeSlots = [
    { h: 10, m: 0 }, { h: 10, m: 30 }, { h: 11, m: 0 }, { h: 11, m: 30 },
    { h: 12, m: 0 }, { h: 13, m: 0 }, { h: 13, m: 30 }, { h: 14, m: 0 },
    { h: 14, m: 30 }, { h: 15, m: 0 }, { h: 15, m: 30 }, { h: 16, m: 0 },
    { h: 16, m: 30 }, { h: 17, m: 0 }, { h: 17, m: 30 }, { h: 18, m: 0 },
    { h: 18, m: 30 }, { h: 19, m: 0 },
  ];

  const paymentMethods: Array<'CARD' | 'CASH' | 'TRANSFER' | 'PASS'> = [
    'CARD', 'CARD', 'CARD', 'CARD', 'CARD',   // 50%
    'CASH', 'CASH', 'CASH',                     // ~25% (adjusted slightly due to rounding with 10 elements)
    'TRANSFER', 'TRANSFER',                      // ~15%  (adjusted slightly)
  ];

  const treatmentNotes = [
    'TEST 시술 완료. 고객 만족',
    'TEST 시술 완료. 다음 방문 2주 후 추천',
    'TEST 시술 완료. 컬러 변경 요청',
    'TEST 정기 관리 완료',
    'TEST 시술 완료. 리터치 3주 후 안내',
    'TEST 시술 완료. 피부 상태 양호',
    'TEST 첫 방문 시술. 상담 후 진행',
    'TEST 시술 완료. 왁싱 후 진정 크림 도포',
  ];

  // We'll collect daily aggregates as we go
  const dailyAgg: Record<string, {
    total: number; card: number; cash: number; transfer: number; pass: number;
    bookings: number; completed: number; cancelled: number; noShow: number;
    newCust: number; returning: number;
  }> = {};

  function dayKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function ensureDay(d: Date) {
    const k = dayKey(d);
    if (!dailyAgg[k]) {
      dailyAgg[k] = { total: 0, card: 0, cash: 0, transfer: 0, pass: 0, bookings: 0, completed: 0, cancelled: 0, noShow: 0, newCust: 0, returning: 0 };
    }
    return dailyAgg[k];
  }

  // Track which customers have visited before (for newCustomer tracking)
  const visitedCustomers = new Set<string>();

  // --- 6a. Past bookings (~180) ---
  console.log('Creating past bookings...');
  let pastBookingCount = 0;
  const targetPast = 180;
  const bookingsPerDay = Math.ceil(targetPast / pastDays.length); // ~2-3 per day

  for (const day of pastDays) {
    const count = randInt(Math.max(1, bookingsPerDay - 1), bookingsPerDay + 2);
    for (let i = 0; i < count && pastBookingCount < targetPast; i++) {
      const slot = pick(timeSlots);
      const startTime = new Date(day);
      startTime.setHours(slot.h, slot.m, 0, 0);

      const service = pick(allServices);
      const endTime = new Date(startTime.getTime() + service.duration * 60000);
      const staffMember = pick(staffRecords);
      const customer = pick(customers);

      // Status distribution: ~75% COMPLETED, ~15% CANCELLED, ~5% NO_SHOW, ~5% CONFIRMED (late ones)
      const roll = Math.random();
      let status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'CONFIRMED';
      if (roll < 0.75) status = 'COMPLETED';
      else if (roll < 0.90) status = 'CANCELLED';
      else if (roll < 0.95) status = 'NO_SHOW';
      else status = 'CONFIRMED'; // a few past confirmed that slipped

      const sources: Array<'DIRECT' | 'NAVER' | 'B2C_WEB'> = ['DIRECT', 'DIRECT', 'DIRECT', 'NAVER', 'B2C_WEB'];

      const booking = await prisma.booking.create({
        data: {
          shopId,
          customerId: customer.id,
          staffId: staffMember.id,
          serviceId: service.id,
          startTime,
          endTime,
          status,
          source: pick(sources),
          createdAt: addDays(startTime, -randInt(0, 7)), // booked 0-7 days prior
        },
      });

      const agg = ensureDay(day);
      agg.bookings++;

      if (status === 'COMPLETED') {
        agg.completed++;

        // Payment
        const method = pick(paymentMethods);
        const discount = Math.random() < 0.15 ? randInt(1, 5) * 1000 : 0;
        const finalAmount = service.price - discount;

        await prisma.payment.create({
          data: {
            shopId,
            customerId: customer.id,
            bookingId: booking.id,
            staffId: staffMember.id,
            amount: service.price,
            discount,
            finalAmount,
            method,
            status: 'COMPLETED',
            paidAt: endTime,
          },
        });

        agg.total += finalAmount;
        if (method === 'CARD') agg.card += finalAmount;
        else if (method === 'CASH') agg.cash += finalAmount;
        else if (method === 'TRANSFER') agg.transfer += finalAmount;
        else agg.pass += finalAmount;

        // Treatment History
        await prisma.treatmentHistory.create({
          data: {
            shopId,
            customerId: customer.id,
            bookingId: booking.id,
            staffId: staffMember.id,
            serviceId: service.id,
            serviceName: service.name,
            price: service.price,
            notes: pick(treatmentNotes),
            treatmentDate: startTime,
          },
        });

        if (!visitedCustomers.has(customer.id)) {
          visitedCustomers.add(customer.id);
          agg.newCust++;
        } else {
          agg.returning++;
        }
      } else if (status === 'CANCELLED') {
        agg.cancelled++;
      } else if (status === 'NO_SHOW') {
        agg.noShow++;
      }

      pastBookingCount++;
    }
  }
  console.log(`  ${pastBookingCount} past bookings created`);

  // --- 6b. Today's bookings (7) ---
  console.log('Creating today\'s bookings...');
  const todaySlots = [
    { h: 10, m: 0, status: 'COMPLETED' as const },
    { h: 11, m: 0, status: 'COMPLETED' as const },
    { h: 12, m: 0, status: 'COMPLETED' as const },
    { h: 13, m: 30, status: 'IN_PROGRESS' as const },
    { h: 14, m: 30, status: 'CONFIRMED' as const },
    { h: 16, m: 0, status: 'CONFIRMED' as const },
    { h: 17, m: 30, status: 'CONFIRMED' as const },
  ];

  const todayAgg = ensureDay(TODAY);
  for (let i = 0; i < todaySlots.length; i++) {
    const ts = todaySlots[i];
    const startTime = new Date(TODAY);
    startTime.setHours(ts.h, ts.m, 0, 0);
    const service = allServices[i % allServices.length];
    const endTime = new Date(startTime.getTime() + service.duration * 60000);
    const staffMember = staffRecords[i % staffRecords.length];
    const customer = customers[i % customers.length];

    const booking = await prisma.booking.create({
      data: {
        shopId,
        customerId: customer.id,
        staffId: staffMember.id,
        serviceId: service.id,
        startTime,
        endTime,
        status: ts.status,
        source: 'DIRECT',
      },
    });

    todayAgg.bookings++;
    if (ts.status === 'COMPLETED') {
      todayAgg.completed++;
      const method = pick(paymentMethods);
      await prisma.payment.create({
        data: {
          shopId,
          customerId: customer.id,
          bookingId: booking.id,
          staffId: staffMember.id,
          amount: service.price,
          discount: 0,
          finalAmount: service.price,
          method,
          status: 'COMPLETED',
          paidAt: endTime,
        },
      });
      todayAgg.total += service.price;
      if (method === 'CARD') todayAgg.card += service.price;
      else if (method === 'CASH') todayAgg.cash += service.price;
      else if (method === 'TRANSFER') todayAgg.transfer += service.price;
      else todayAgg.pass += service.price;

      await prisma.treatmentHistory.create({
        data: {
          shopId,
          customerId: customer.id,
          bookingId: booking.id,
          staffId: staffMember.id,
          serviceId: service.id,
          serviceName: service.name,
          price: service.price,
          notes: pick(treatmentNotes),
          treatmentDate: startTime,
        },
      });
    }
  }
  console.log(`  ${todaySlots.length} today bookings created`);

  // --- 6c. Future bookings (~60) ---
  console.log('Creating future bookings...');
  let futureBookingCount = 0;
  const targetFuture = 60;
  const futurePerDay = Math.ceil(targetFuture / futureDays.length);

  for (const day of futureDays) {
    const count = randInt(Math.max(1, futurePerDay - 1), futurePerDay + 1);
    for (let i = 0; i < count && futureBookingCount < targetFuture; i++) {
      const slot = pick(timeSlots);
      const startTime = new Date(day);
      startTime.setHours(slot.h, slot.m, 0, 0);

      const service = pick(allServices);
      const endTime = new Date(startTime.getTime() + service.duration * 60000);
      const staffMember = pick(staffRecords);
      const customer = pick(customers);

      await prisma.booking.create({
        data: {
          shopId,
          customerId: customer.id,
          staffId: staffMember.id,
          serviceId: service.id,
          startTime,
          endTime,
          status: 'CONFIRMED',
          source: pick(['DIRECT', 'DIRECT', 'NAVER', 'B2C_WEB'] as const),
          createdAt: addDays(startTime, -randInt(1, 14)),
        },
      });
      futureBookingCount++;
    }
  }
  console.log(`  ${futureBookingCount} future bookings created`);

  // ----------------------------------------------------------
  // 7. Daily Sales
  // ----------------------------------------------------------
  console.log('Creating DailySales records...');
  let dailySalesCount = 0;
  for (const [dateStr, agg] of Object.entries(dailyAgg)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    await prisma.dailySales.create({
      data: {
        shopId,
        date: new Date(Date.UTC(y, m - 1, d)),
        totalRevenue: agg.total,
        cardRevenue: agg.card,
        cashRevenue: agg.cash,
        transferRevenue: agg.transfer,
        passRevenue: agg.pass,
        bookingCount: agg.bookings,
        completedCount: agg.completed,
        cancelledCount: agg.cancelled,
        noShowCount: agg.noShow,
        newCustomerCount: agg.newCust,
        returningCustomerCount: agg.returning,
      },
    });
    dailySalesCount++;
  }
  console.log(`  ${dailySalesCount} DailySales records created`);

  // ----------------------------------------------------------
  // 8. Inventory Items
  // ----------------------------------------------------------
  const invDefs = [
    { name: 'TEST 젤 폴리시 세트', category: '네일', unit: '세트', quantity: 12, minQuantity: 5, price: 45000 },
    { name: 'TEST 리무버', category: '네일', unit: '병', quantity: 8, minQuantity: 3, price: 12000 },
    { name: 'TEST 속눈썹 (J컬)', category: '속눈썹', unit: '박스', quantity: 3, minQuantity: 5, price: 25000 }, // near low stock!
    { name: 'TEST 속눈썹 글루', category: '속눈썹', unit: '개', quantity: 6, minQuantity: 3, price: 18000 },
    { name: 'TEST 왁스', category: '왁싱', unit: '통', quantity: 4, minQuantity: 3, price: 32000 },
    { name: 'TEST 화장솜', category: '소모품', unit: '팩', quantity: 15, minQuantity: 5, price: 3000 },
    { name: 'TEST 클렌저', category: '피부관리', unit: '병', quantity: 7, minQuantity: 3, price: 28000 },
    { name: 'TEST 마스크팩', category: '피부관리', unit: '박스', quantity: 2, minQuantity: 5, price: 35000 }, // near low stock!
    { name: 'TEST 일회용 장갑', category: '소모품', unit: '박스', quantity: 10, minQuantity: 3, price: 8000 },
    { name: 'TEST 네일 팁 세트', category: '네일', unit: '세트', quantity: 5, minQuantity: 4, price: 15000 },
  ];

  for (const inv of invDefs) {
    await prisma.inventoryItem.create({
      data: { shopId, name: inv.name, category: inv.category, unit: inv.unit, quantity: inv.quantity, minQuantity: inv.minQuantity, price: inv.price },
    });
  }
  console.log(`${invDefs.length} inventory items created`);

  // ----------------------------------------------------------
  // 9. In-App Notifications (15)
  // ----------------------------------------------------------
  const notifDefs = [
    { type: 'BOOKING_NEW', title: 'TEST 새 예약', message: 'TEST 김민지 님이 젤네일 풀세트를 예약했습니다', daysAgo: 0 },
    { type: 'BOOKING_NEW', title: 'TEST 새 예약', message: 'TEST 이서윤 님이 속눈썹 연장을 예약했습니다', daysAgo: 0 },
    { type: 'BOOKING_NEW', title: 'TEST 새 예약', message: 'TEST 박지현 님이 수분 관리를 예약했습니다', daysAgo: 1 },
    { type: 'BOOKING_CANCEL', title: 'TEST 예약 취소', message: 'TEST 예약이 취소되었습니다 - 최유나 님 (브라질리언 왁싱)', daysAgo: 1 },
    { type: 'BOOKING_NEW', title: 'TEST 새 예약', message: 'TEST 정수빈 님이 네일아트를 예약했습니다', daysAgo: 2 },
    { type: 'NO_SHOW', title: 'TEST 노쇼 처리', message: 'TEST 노쇼 처리되었습니다 - 홍서아 님 (래쉬 리프트)', daysAgo: 2 },
    { type: 'PAYMENT', title: 'TEST 결제 완료', message: 'TEST 한소희 님 모공 관리 60,000원 카드결제 완료', daysAgo: 3 },
    { type: 'BOOKING_NEW', title: 'TEST 새 예약', message: 'TEST 윤채원 님이 젤네일 원컬러를 예약했습니다', daysAgo: 3 },
    { type: 'LOW_STOCK', title: 'TEST 재고 부족', message: 'TEST 속눈썹 (J컬) 재고가 부족합니다 (현재 3개 / 최소 5개)', daysAgo: 4 },
    { type: 'BOOKING_CANCEL', title: 'TEST 예약 취소', message: 'TEST 예약이 취소되었습니다 - 남지우 님 (페이스 왁싱)', daysAgo: 4 },
    { type: 'BOOKING_NEW', title: 'TEST 새 예약', message: 'TEST 강하늘 님이 바디 왁싱을 예약했습니다', daysAgo: 5 },
    { type: 'PAYMENT', title: 'TEST 결제 완료', message: 'TEST 오서연 님 속눈썹 리터치 35,000원 현금결제 완료', daysAgo: 5 },
    { type: 'LOW_STOCK', title: 'TEST 재고 부족', message: 'TEST 마스크팩 재고가 부족합니다 (현재 2개 / 최소 5개)', daysAgo: 6 },
    { type: 'NO_SHOW', title: 'TEST 노쇼 처리', message: 'TEST 노쇼 처리되었습니다 - 문현우 님 (네일 케어)', daysAgo: 7 },
    { type: 'BOOKING_NEW', title: 'TEST 새 예약', message: 'TEST 장미래 님이 리프팅 관리를 예약했습니다', daysAgo: 7 },
  ];

  for (const n of notifDefs) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - n.daysAgo);
    createdAt.setHours(randInt(9, 19), randInt(0, 59), 0, 0);
    await prisma.inAppNotification.create({
      data: {
        shopId,
        userId: owner.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.daysAgo > 3,
        createdAt,
      },
    });
  }
  console.log(`${notifDefs.length} in-app notifications created`);

  // ----------------------------------------------------------
  // 10. Passes for VIP customers
  // ----------------------------------------------------------
  const vipCusts = customers.slice(0, 3); // VVIP and VIP
  for (const c of vipCusts) {
    await prisma.pass.create({
      data: {
        shopId,
        customerId: c.id,
        type: 'TICKET',
        name: 'TEST 속눈썹 10회 이용권',
        totalCount: 10,
        remainingCount: randInt(3, 8),
        price: 490000,
        startDate: addDays(new Date(), -60),
        expiryDate: addDays(new Date(), 120),
        status: 'ACTIVE',
      },
    });
  }
  console.log('VIP passes created');

  // ----------------------------------------------------------
  // Done
  // ----------------------------------------------------------
  console.log('\n✅ Seed completed successfully!');
  console.log('---');
  console.log('Login credentials:');
  console.log('  Owner: owner@beauty-erp.kr / owner1234');
  console.log('  Admin: admin@beauty-erp.kr / admin1234');
  console.log(`  Shop ID: ${shopId}`);
  console.log(`\nSummary:`);
  console.log(`  Users: 2`);
  console.log(`  Staff: ${staffRecords.length}`);
  console.log(`  Services: ${allServices.length}`);
  console.log(`  Customers: ${customers.length}`);
  console.log(`  Past Bookings: ~${pastBookingCount}`);
  console.log(`  Today Bookings: ${todaySlots.length}`);
  console.log(`  Future Bookings: ~${futureBookingCount}`);
  console.log(`  DailySales: ${dailySalesCount}`);
  console.log(`  Inventory: ${invDefs.length}`);
  console.log(`  Notifications: ${notifDefs.length}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
