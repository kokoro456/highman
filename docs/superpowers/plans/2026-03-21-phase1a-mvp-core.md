# Phase 1a: MVP Core Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundational B2B web platform for beauty shop management — project scaffolding, auth, shop/service setup, booking calendar, CRM, POS, staff management, and basic dashboard.

**Architecture:** Turborepo monorepo with Next.js 14+ (App Router) for B2B web, NestJS for REST API, PostgreSQL via Prisma ORM, Redis for caching/sessions. Row-level multi-tenancy via `shopId` on all entities.

**Tech Stack:** TypeScript, Turborepo, Next.js 14 (App Router), NestJS, Prisma, PostgreSQL, Redis, Tailwind CSS, Radix UI, Zod, React Query, NextAuth.js, JWT

**Spec:** `docs/superpowers/specs/2026-03-21-beauty-erp-design.md`

---

## File Structure

```
beauty-erp/
├── apps/
│   ├── api/                          # NestJS API server
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   └── shop-access.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── shop-context.interceptor.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── current-shop.decorator.ts
│   │   │   │   └── filters/
│   │   │   │       └── http-exception.filter.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   └── local.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       ├── login.dto.ts
│   │   │   │       └── register.dto.ts
│   │   │   ├── shop/
│   │   │   │   ├── shop.module.ts
│   │   │   │   ├── shop.controller.ts
│   │   │   │   ├── shop.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-shop.dto.ts
│   │   │   │       └── update-shop.dto.ts
│   │   │   ├── service/
│   │   │   │   ├── service.module.ts
│   │   │   │   ├── service.controller.ts
│   │   │   │   ├── service.service.ts
│   │   │   │   └── dto/
│   │   │   ├── booking/
│   │   │   │   ├── booking.module.ts
│   │   │   │   ├── booking.controller.ts
│   │   │   │   ├── booking.service.ts
│   │   │   │   └── dto/
│   │   │   ├── customer/
│   │   │   │   ├── customer.module.ts
│   │   │   │   ├── customer.controller.ts
│   │   │   │   ├── customer.service.ts
│   │   │   │   └── dto/
│   │   │   ├── payment/
│   │   │   │   ├── payment.module.ts
│   │   │   │   ├── payment.controller.ts
│   │   │   │   ├── payment.service.ts
│   │   │   │   └── dto/
│   │   │   ├── staff/
│   │   │   │   ├── staff.module.ts
│   │   │   │   ├── staff.controller.ts
│   │   │   │   ├── staff.service.ts
│   │   │   │   └── dto/
│   │   │   └── dashboard/
│   │   │       ├── dashboard.module.ts
│   │   │       ├── dashboard.controller.ts
│   │   │       └── dashboard.service.ts
│   │   ├── test/
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── jest-e2e.json
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── b2b-web/                      # Next.js B2B management web
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── (auth)/
│       │   │   │   ├── login/page.tsx
│       │   │   │   └── register/page.tsx
│       │   │   └── (dashboard)/
│       │   │       ├── layout.tsx
│       │   │       ├── page.tsx          # Dashboard home
│       │   │       ├── bookings/
│       │   │       │   └── page.tsx      # Calendar view
│       │   │       ├── customers/
│       │   │       │   ├── page.tsx      # Customer list
│       │   │       │   └── [id]/page.tsx # Customer detail
│       │   │       ├── payments/
│       │   │       │   └── page.tsx      # Payment/POS
│       │   │       ├── staff/
│       │   │       │   └── page.tsx      # Staff management
│       │   │       └── settings/
│       │   │           └── page.tsx      # Shop settings
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── sidebar.tsx
│       │   │   │   ├── header.tsx
│       │   │   │   └── mobile-nav.tsx
│       │   │   ├── booking/
│       │   │   │   ├── calendar-view.tsx
│       │   │   │   ├── booking-form.tsx
│       │   │   │   └── time-slot-picker.tsx
│       │   │   ├── customer/
│       │   │   │   ├── customer-table.tsx
│       │   │   │   ├── customer-form.tsx
│       │   │   │   └── treatment-timeline.tsx
│       │   │   ├── payment/
│       │   │   │   ├── payment-form.tsx
│       │   │   │   ├── pass-manager.tsx
│       │   │   │   └── sales-summary.tsx
│       │   │   ├── staff/
│       │   │   │   ├── staff-table.tsx
│       │   │   │   ├── staff-form.tsx
│       │   │   │   └── incentive-config.tsx
│       │   │   └── dashboard/
│       │   │       ├── stats-cards.tsx
│       │   │       ├── revenue-chart.tsx
│       │   │       └── booking-overview.tsx
│       │   ├── lib/
│       │   │   ├── api-client.ts
│       │   │   └── auth.ts
│       │   └── hooks/
│       │       └── use-api.ts
│       ├── tailwind.config.ts
│       ├── next.config.mjs
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── types/                        # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── user.ts
│   │   │   ├── shop.ts
│   │   │   ├── booking.ts
│   │   │   ├── customer.ts
│   │   │   ├── payment.ts
│   │   │   ├── staff.ts
│   │   │   └── enums.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── validators/                   # Shared Zod schemas
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── shop.ts
│   │   │   ├── booking.ts
│   │   │   ├── customer.ts
│   │   │   ├── payment.ts
│   │   │   └── staff.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── ui/                           # Shared UI components
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── select.tsx
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── config/                       # Shared configs
│       ├── eslint/
│       │   └── base.js
│       ├── typescript/
│       │   └── base.json
│       └── package.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── turbo.json
├── package.json
├── .env.example
├── .gitignore
├── docker-compose.yml                # PostgreSQL + Redis for local dev
└── README.md
```

---

## Task 1: Project Scaffolding (Turborepo Monorepo)

**Files:**
- Create: `package.json`, `turbo.json`, `.gitignore`, `.env.example`, `docker-compose.yml`
- Create: `apps/api/package.json`, `apps/api/nest-cli.json`, `apps/api/tsconfig.json`
- Create: `apps/b2b-web/package.json`, `apps/b2b-web/next.config.mjs`, `apps/b2b-web/tsconfig.json`, `apps/b2b-web/tailwind.config.ts`
- Create: `packages/types/package.json`, `packages/types/tsconfig.json`
- Create: `packages/validators/package.json`, `packages/validators/tsconfig.json`
- Create: `packages/config/package.json`

- [ ] **Step 1: Initialize root monorepo**

```bash
cd /c/highman
# Create new directory for the actual project
mkdir beauty-erp && cd beauty-erp
npm init -y
```

Create `package.json`:
```json
{
  "name": "beauty-erp",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.6.0"
  },
  "packageManager": "npm@10.0.0"
}
```

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 2: Create docker-compose.yml for local PostgreSQL + Redis**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: beauty_erp
      POSTGRES_PASSWORD: beauty_erp_dev
      POSTGRES_DB: beauty_erp
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

- [ ] **Step 3: Create .env.example**

```env
# Database
DATABASE_URL="postgresql://beauty_erp:beauty_erp_dev@localhost:5432/beauty_erp"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="change-me-in-production-refresh"
JWT_REFRESH_EXPIRES_IN="7d"

# App
API_PORT=4000
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
.next/
.env
.env.local
*.log
.turbo/
coverage/
.DS_Store
```

- [ ] **Step 5: Scaffold packages/types**

Create `packages/types/package.json`:
```json
{
  "name": "@beauty-erp/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.6.0"
  }
}
```

Create `packages/types/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

Create `packages/types/src/enums.ts`:
```typescript
export enum UserRole {
  ADMIN = 'ADMIN',
  SHOP_OWNER = 'SHOP_OWNER',
  SHOP_STAFF = 'SHOP_STAFF',
  CUSTOMER = 'CUSTOMER',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  PHONE = 'PHONE',
}

export enum BusinessType {
  NAIL = 'NAIL',
  EYELASH = 'EYELASH',
  WAXING = 'WAXING',
  HAIR = 'HAIR',
  SKIN = 'SKIN',
  SEMI_PERMANENT = 'SEMI_PERMANENT',
  TATTOO = 'TATTOO',
  MASSAGE = 'MASSAGE',
  BARBER = 'BARBER',
  TANNING = 'TANNING',
  SCALP = 'SCALP',
  MAKEUP = 'MAKEUP',
  PET_GROOMING = 'PET_GROOMING',
  OTHER = 'OTHER',
}

export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum BookingStatus {
  READY = 'READY',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum BookingSource {
  DIRECT = 'DIRECT',
  NAVER = 'NAVER',
  B2C_WEB = 'B2C_WEB',
  B2C_APP = 'B2C_APP',
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  PASS = 'PASS',
  MIXED = 'MIXED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
}

export enum PassType {
  TICKET = 'TICKET',
  MEMBERSHIP = 'MEMBERSHIP',
}

export enum PassStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  EXHAUSTED = 'EXHAUSTED',
  CANCELLED = 'CANCELLED',
}

export enum StaffRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  DESIGNER = 'DESIGNER',
  ASSISTANT = 'ASSISTANT',
  INTERN = 'INTERN',
}

export enum IncentiveType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum CustomerTier {
  NORMAL = 'NORMAL',
  VIP = 'VIP',
  VVIP = 'VVIP',
}

export enum PhotoType {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
  REFERENCE = 'REFERENCE',
}
```

Create `packages/types/src/index.ts`:
```typescript
export * from './enums';
```

- [ ] **Step 6: Scaffold packages/validators**

Create `packages/validators/package.json`:
```json
{
  "name": "@beauty-erp/validators",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0"
  }
}
```

Create `packages/validators/src/index.ts`:
```typescript
export * from './auth';
export * from './shop';
```

Create `packages/validators/src/auth.ts`:
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(50),
  phone: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

Create `packages/validators/src/shop.ts`:
```typescript
import { z } from 'zod';

const businessHoursDay = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
  isOpen: z.boolean(),
});

export const createShopSchema = z.object({
  name: z.string().min(1).max(100),
  businessType: z.string(),
  phone: z.string().min(1),
  address: z.string().min(1),
  addressDetail: z.string().optional(),
  description: z.string().optional(),
  businessHours: z.record(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']), businessHoursDay).optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
```

- [ ] **Step 7: Scaffold NestJS API app**

```bash
cd apps
npx @nestjs/cli new api --package-manager npm --skip-git --strict
```

Update `apps/api/package.json` to add workspace dependencies:
```json
{
  "dependencies": {
    "@beauty-erp/types": "*",
    "@beauty-erp/validators": "*",
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@prisma/client": "^5.20.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "zod": "^3.23.0"
  }
}
```

- [ ] **Step 8: Scaffold Next.js B2B web app**

```bash
npx create-next-app@latest b2b-web --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

Update `apps/b2b-web/package.json` to add workspace dependencies:
```json
{
  "dependencies": {
    "@beauty-erp/types": "*",
    "@beauty-erp/validators": "*",
    "@tanstack/react-query": "^5.60.0",
    "next-auth": "^4.24.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "lucide-react": "^0.460.0",
    "date-fns": "^4.1.0"
  }
}
```

- [ ] **Step 9: Install all dependencies and verify build**

```bash
cd /c/highman/beauty-erp
npm install
npx turbo build
```

Expected: all packages build without errors.

- [ ] **Step 10: Start Docker containers and verify**

```bash
docker compose up -d
```

Expected: PostgreSQL on port 5432, Redis on port 6379.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Turborepo monorepo with NestJS API and Next.js B2B web"
```

---

## Task 2: Prisma Schema & Database Setup

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`

- [ ] **Step 1: Create Prisma schema with all MVP entities**

Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTH
// ============================================

model User {
  id           String   @id @default(uuid()) @db.Uuid
  email        String?  @unique
  phone        String?  @unique
  name         String
  role         String   @default("SHOP_OWNER") // UserRole enum
  authProvider String   @default("EMAIL")       // AuthProvider enum
  passwordHash String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  shops Shop[]
  staff Staff[]
}

// ============================================
// SHOP
// ============================================

model Shop {
  id               String   @id @default(uuid()) @db.Uuid
  ownerId          String   @db.Uuid
  name             String
  businessType     String   // BusinessType enum
  phone            String
  address          String
  addressDetail    String?
  latitude         Decimal? @db.Decimal(10, 8)
  longitude        Decimal? @db.Decimal(11, 8)
  description      String?
  profileImageUrl  String?
  coverImageUrl    String?
  businessHours    Json?    // {MON: {open, close, isOpen}, ...}
  closedDays       String[] @default([])
  subscriptionTier String   @default("FREE") // SubscriptionTier enum
  naverPlaceId     String?
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  owner             User               @relation(fields: [ownerId], references: [id])
  serviceCategories ServiceCategory[]
  services          Service[]
  staff             Staff[]
  customers         Customer[]
  bookings          Booking[]
  payments          Payment[]
  passes            Pass[]
  schedules         Schedule[]
  staffIncentives   StaffIncentive[]
  dailySales        DailySales[]
}

model ServiceCategory {
  id        String   @id @default(uuid()) @db.Uuid
  shopId    String   @db.Uuid
  name      String
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  shop     Shop      @relation(fields: [shopId], references: [id])
  services Service[]
}

model Service {
  id          String   @id @default(uuid()) @db.Uuid
  shopId      String   @db.Uuid
  categoryId  String   @db.Uuid
  name        String
  description String?
  duration    Int      // minutes
  price       Decimal  @db.Decimal(12, 2)
  b2cPrice    Decimal? @db.Decimal(12, 2)
  isLinkedB2c Boolean  @default(true)
  imageUrl    String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  shop     Shop            @relation(fields: [shopId], references: [id])
  category ServiceCategory @relation(fields: [categoryId], references: [id])
  bookings Booking[]
}

// ============================================
// BOOKING
// ============================================

model Booking {
  id             String   @id @default(uuid()) @db.Uuid
  shopId         String   @db.Uuid
  customerId     String   @db.Uuid
  staffId        String   @db.Uuid
  serviceId      String   @db.Uuid
  startTime      DateTime
  endTime        DateTime
  status         String   @default("READY") // BookingStatus enum
  source         String   @default("DIRECT") // BookingSource enum
  memo           String?
  naverBookingId String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  shop     Shop     @relation(fields: [shopId], references: [id])
  customer Customer @relation(fields: [customerId], references: [id])
  staff    Staff    @relation(fields: [staffId], references: [id])
  service  Service  @relation(fields: [serviceId], references: [id])
  payments Payment[]
  treatmentHistories TreatmentHistory[]
}

model Schedule {
  id             String   @id @default(uuid()) @db.Uuid
  shopId         String   @db.Uuid
  staffId        String   @db.Uuid
  dayOfWeek      Int      // 0=Sun, 6=Sat
  startTime      String   // "09:00"
  endTime        String   // "18:00"
  breakStartTime String?  // "12:00"
  breakEndTime   String?  // "13:00"
  isActive       Boolean  @default(true)

  shop  Shop  @relation(fields: [shopId], references: [id])
  staff Staff @relation(fields: [staffId], references: [id])

  @@unique([shopId, staffId, dayOfWeek])
}

// ============================================
// CUSTOMER (CRM)
// ============================================

model Customer {
  id               String   @id @default(uuid()) @db.Uuid
  shopId           String   @db.Uuid
  name             String
  phone            String   // encrypted
  email            String?
  gender           String?  // Gender enum
  birthDate        String?  // encrypted date
  firstVisitDate   DateTime @default(now())
  lastVisitDate    DateTime?
  visitCount       Int      @default(0)
  totalSpent       Decimal  @default(0) @db.Decimal(12, 2)
  tier             String   @default("NORMAL") // CustomerTier enum
  memo             String?
  tags             String[] @default([])
  consentMarketing Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  shop               Shop               @relation(fields: [shopId], references: [id])
  bookings           Booking[]
  payments           Payment[]
  passes             Pass[]
  treatmentHistories TreatmentHistory[]
  photos             CustomerPhoto[]
}

model TreatmentHistory {
  id            String   @id @default(uuid()) @db.Uuid
  shopId        String   @db.Uuid
  customerId    String   @db.Uuid
  bookingId     String?  @db.Uuid
  staffId       String   @db.Uuid
  serviceId     String   @db.Uuid
  serviceName   String
  price         Decimal  @db.Decimal(12, 2)
  notes         String?
  treatmentDate DateTime
  createdAt     DateTime @default(now())

  customer Customer        @relation(fields: [customerId], references: [id])
  booking  Booking?        @relation(fields: [bookingId], references: [id])
  photos   CustomerPhoto[]
}

model CustomerPhoto {
  id          String   @id @default(uuid()) @db.Uuid
  customerId  String   @db.Uuid
  treatmentId String?  @db.Uuid
  type        String   // PhotoType enum
  imageUrl    String
  caption     String?
  createdAt   DateTime @default(now())

  customer  Customer          @relation(fields: [customerId], references: [id])
  treatment TreatmentHistory? @relation(fields: [treatmentId], references: [id])
}

// ============================================
// PAYMENT (POS)
// ============================================

model Payment {
  id              String   @id @default(uuid()) @db.Uuid
  shopId          String   @db.Uuid
  customerId      String   @db.Uuid
  bookingId       String?  @db.Uuid
  staffId         String   @db.Uuid
  amount          Decimal  @db.Decimal(12, 2)
  discount        Decimal  @default(0) @db.Decimal(12, 2)
  finalAmount     Decimal  @db.Decimal(12, 2)
  method          String   // PaymentMethod enum
  status          String   @default("PENDING") // PaymentStatus enum
  pgTransactionId String?
  cardLastFour    String?
  passId          String?  @db.Uuid
  passAmount      Decimal? @db.Decimal(12, 2)
  memo            String?
  paidAt          DateTime @default(now())
  createdAt       DateTime @default(now())

  shop       Shop       @relation(fields: [shopId], references: [id])
  customer   Customer   @relation(fields: [customerId], references: [id])
  booking    Booking?   @relation(fields: [bookingId], references: [id])
  pass       Pass?      @relation(fields: [passId], references: [id])
  passUsages PassUsage[]
}

model Pass {
  id              String    @id @default(uuid()) @db.Uuid
  shopId          String    @db.Uuid
  customerId      String    @db.Uuid
  type            String    // PassType enum
  name            String
  totalCount      Int?
  remainingCount  Int?
  totalAmount     Decimal?  @db.Decimal(12, 2)
  remainingAmount Decimal?  @db.Decimal(12, 2)
  price           Decimal   @db.Decimal(12, 2)
  startDate       DateTime
  expiryDate      DateTime?
  status          String    @default("ACTIVE") // PassStatus enum
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  shop       Shop        @relation(fields: [shopId], references: [id])
  customer   Customer    @relation(fields: [customerId], references: [id])
  payments   Payment[]
  passUsages PassUsage[]
}

model PassUsage {
  id              String   @id @default(uuid()) @db.Uuid
  passId          String   @db.Uuid
  paymentId       String   @db.Uuid
  shopId          String   @db.Uuid
  type            String   // "USE" | "REFUND"
  countUsed       Int?
  amountUsed      Decimal? @db.Decimal(12, 2)
  remainingCount  Int?
  remainingAmount Decimal? @db.Decimal(12, 2)
  memo            String?
  usedAt          DateTime @default(now())
  createdAt       DateTime @default(now())

  pass    Pass    @relation(fields: [passId], references: [id])
  payment Payment @relation(fields: [paymentId], references: [id])
}

// ============================================
// STAFF
// ============================================

model Staff {
  id              String   @id @default(uuid()) @db.Uuid
  shopId          String   @db.Uuid
  userId          String?  @db.Uuid
  name            String
  phone           String
  email           String?
  role            String   @default("DESIGNER") // StaffRole enum
  specialties     String[] @default([])
  profileImageUrl String?
  color           String   @default("#6366f1")
  sortOrder       Int      @default(0)
  isActive        Boolean  @default(true)
  hiredAt         DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  shop       Shop             @relation(fields: [shopId], references: [id])
  user       User?            @relation(fields: [userId], references: [id])
  bookings   Booking[]
  schedules  Schedule[]
  incentives StaffIncentive[]
}

model StaffIncentive {
  id        String   @id @default(uuid()) @db.Uuid
  staffId   String   @db.Uuid
  shopId    String   @db.Uuid
  type      String   // IncentiveType enum
  serviceId String?  @db.Uuid
  rate      Decimal  @db.Decimal(5, 2)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  staff Staff @relation(fields: [staffId], references: [id])
  shop  Shop  @relation(fields: [shopId], references: [id])
}

// ============================================
// DASHBOARD
// ============================================

model DailySales {
  id                     String   @id @default(uuid()) @db.Uuid
  shopId                 String   @db.Uuid
  date                   DateTime @db.Date
  totalRevenue           Decimal  @default(0) @db.Decimal(12, 2)
  cardRevenue            Decimal  @default(0) @db.Decimal(12, 2)
  cashRevenue            Decimal  @default(0) @db.Decimal(12, 2)
  transferRevenue        Decimal  @default(0) @db.Decimal(12, 2)
  passRevenue            Decimal  @default(0) @db.Decimal(12, 2)
  refundAmount           Decimal  @default(0) @db.Decimal(12, 2)
  bookingCount           Int      @default(0)
  completedCount         Int      @default(0)
  cancelledCount         Int      @default(0)
  noShowCount            Int      @default(0)
  newCustomerCount       Int      @default(0)
  returningCustomerCount Int      @default(0)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  shop Shop @relation(fields: [shopId], references: [id])

  @@unique([shopId, date])
}
```

- [ ] **Step 2: Install Prisma and run initial migration**

```bash
cd /c/highman/beauty-erp
npm install prisma @prisma/client --save-dev
npx prisma migrate dev --name init
```

Expected: Migration creates all tables in PostgreSQL.

- [ ] **Step 3: Create seed file**

Create `prisma/seed.ts` with a test owner user, shop, service category, services, and one staff member.

- [ ] **Step 4: Run seed**

```bash
npx prisma db seed
```

- [ ] **Step 5: Verify with Prisma Studio**

```bash
npx prisma studio
```

Expected: All tables visible with seed data.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema with all MVP entities and seed data"
```

---

## Task 3: NestJS API Foundation (Auth Module)

**Files:**
- Create: `apps/api/src/auth/` (module, controller, service, strategies, DTOs)
- Create: `apps/api/src/common/` (guards, decorators, filters)
- Create: `apps/api/src/prisma/` (Prisma service module)

- [ ] **Step 1: Create Prisma service for NestJS**

Create `apps/api/src/prisma/prisma.service.ts`:
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Create `apps/api/src/prisma/prisma.module.ts`:
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 2: Write test for auth registration**

Create `apps/api/src/auth/auth.service.spec.ts` with test for `register()` that creates a user with hashed password.

- [ ] **Step 3: Run test to verify it fails**

```bash
cd apps/api && npm test -- --testPathPattern=auth.service.spec
```

Expected: FAIL

- [ ] **Step 4: Implement auth service (register, login, JWT)**

Create `apps/api/src/auth/auth.service.ts` with:
- `register(dto)`: hash password with bcrypt, create user in DB
- `validateUser(email, password)`: compare hash
- `login(user)`: generate JWT access + refresh tokens

- [ ] **Step 5: Implement JWT strategy and guards**

Create `apps/api/src/auth/strategies/jwt.strategy.ts`
Create `apps/api/src/common/guards/jwt-auth.guard.ts`
Create `apps/api/src/common/decorators/current-user.decorator.ts`

- [ ] **Step 6: Implement auth controller**

Create `apps/api/src/auth/auth.controller.ts` with:
- `POST /auth/register` — register new user
- `POST /auth/login` — login, return tokens
- `POST /auth/refresh` — refresh access token
- `GET /auth/me` — get current user (protected)

- [ ] **Step 7: Run tests and verify they pass**

```bash
cd apps/api && npm test
```

Expected: All auth tests PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: implement auth module with JWT registration and login"
```

---

## Task 4: Shop & Service CRUD API

**Files:**
- Create: `apps/api/src/shop/` (module, controller, service, DTOs)
- Create: `apps/api/src/service/` (module, controller, service, DTOs)

- [ ] **Step 1: Write tests for shop CRUD**
- [ ] **Step 2: Run to verify fail**
- [ ] **Step 3: Implement shop service** — CRUD with shopId scoping
- [ ] **Step 4: Implement shop controller**
  - `POST /shops` — create shop (sets current user as owner)
  - `GET /shops` — list user's shops
  - `GET /shops/:id` — get shop detail
  - `PATCH /shops/:id` — update shop
- [ ] **Step 5: Implement shop-access guard** — verify user owns/belongs to shop
- [ ] **Step 6: Write tests for service CRUD**
- [ ] **Step 7: Implement service module** — CRUD scoped to shopId
  - `POST /shops/:shopId/categories` — create category
  - `GET /shops/:shopId/categories` — list categories
  - `POST /shops/:shopId/services` — create service
  - `GET /shops/:shopId/services` — list services
  - `PATCH /shops/:shopId/services/:id` — update service
- [ ] **Step 8: Run all tests, verify pass**
- [ ] **Step 9: Commit**

```bash
git commit -m "feat: implement shop and service CRUD with multi-tenancy"
```

---

## Task 5: Staff Module API

**Files:**
- Create: `apps/api/src/staff/` (module, controller, service, DTOs)

- [ ] **Step 1: Write tests for staff CRUD + incentive config**
- [ ] **Step 2: Implement staff service**
  - CRUD staff members scoped to shopId
  - Create/update incentive rules
  - Calculate incentive for a payment
- [ ] **Step 3: Implement staff controller**
  - `POST /shops/:shopId/staff` — add staff
  - `GET /shops/:shopId/staff` — list staff
  - `PATCH /shops/:shopId/staff/:id` — update staff
  - `POST /shops/:shopId/staff/:id/incentives` — set incentive
  - `GET /shops/:shopId/staff/:id/incentives` — get incentives
- [ ] **Step 4: Write tests for schedule CRUD**
- [ ] **Step 5: Implement schedule endpoints**
  - `PUT /shops/:shopId/staff/:id/schedule` — set weekly schedule
  - `GET /shops/:shopId/staff/:id/schedule` — get schedule
- [ ] **Step 6: Run all tests, verify pass**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat: implement staff management with schedules and incentives"
```

---

## Task 6: Customer (CRM) Module API

**Files:**
- Create: `apps/api/src/customer/` (module, controller, service, DTOs)

- [ ] **Step 1: Write tests for customer CRUD**
- [ ] **Step 2: Implement customer service** — CRUD with phone encryption (AES-256)
- [ ] **Step 3: Implement customer controller**
  - `POST /shops/:shopId/customers` — create customer
  - `GET /shops/:shopId/customers` — list/search customers
  - `GET /shops/:shopId/customers/:id` — get customer with treatment history
  - `PATCH /shops/:shopId/customers/:id` — update customer
- [ ] **Step 4: Implement treatment history endpoints**
  - `POST /shops/:shopId/customers/:id/treatments` — add treatment record
  - `GET /shops/:shopId/customers/:id/treatments` — get treatment timeline
- [ ] **Step 5: Run all tests, verify pass**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: implement customer CRM with encrypted PII and treatment history"
```

---

## Task 7: Booking Module API

**Files:**
- Create: `apps/api/src/booking/` (module, controller, service, DTOs)

- [ ] **Step 1: Write tests for booking creation with overlap detection**
- [ ] **Step 2: Implement booking service**
  - Create booking with time slot validation (no overlap for same staff)
  - Status transitions (READY → CONFIRMED → IN_PROGRESS → COMPLETED/CANCELLED/NO_SHOW)
  - List bookings by date range, staff, status
- [ ] **Step 3: Implement booking controller**
  - `POST /shops/:shopId/bookings` — create booking
  - `GET /shops/:shopId/bookings` — list bookings (filter by date, staff, status)
  - `GET /shops/:shopId/bookings/:id` — get booking detail
  - `PATCH /shops/:shopId/bookings/:id/status` — update status
  - `PATCH /shops/:shopId/bookings/:id` — update booking
  - `GET /shops/:shopId/bookings/available-slots` — get available time slots for a staff+date
- [ ] **Step 4: Test overlap prevention**

Run test that books 10:00-11:00 for Staff A, then tries to book 10:30-11:30 for same staff.
Expected: Second booking rejected with 409 Conflict.

- [ ] **Step 5: Run all tests, verify pass**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: implement booking system with overlap detection and status flow"
```

---

## Task 8: Payment (POS) Module API

**Files:**
- Create: `apps/api/src/payment/` (module, controller, service, DTOs)

- [ ] **Step 1: Write tests for payment creation + pass usage**
- [ ] **Step 2: Implement payment service**
  - Create payment (CARD, CASH, TRANSFER, PASS, MIXED)
  - Pass (회원권) creation and usage with remaining count/amount tracking
  - Refund processing (update Customer.totalSpent, PassUsage)
  - Update Customer.visitCount and totalSpent on payment completion
  - Update DailySales aggregation
- [ ] **Step 3: Implement payment controller**
  - `POST /shops/:shopId/payments` — create payment
  - `GET /shops/:shopId/payments` — list payments (filter by date, staff, method)
  - `POST /shops/:shopId/payments/:id/refund` — process refund
  - `POST /shops/:shopId/passes` — create pass for customer
  - `GET /shops/:shopId/customers/:customerId/passes` — list customer's passes
- [ ] **Step 4: Test pass usage flow**

Create TICKET pass with 10 uses. Use 1. Verify remainingCount = 9. Use all. Verify status = EXHAUSTED.

- [ ] **Step 5: Run all tests, verify pass**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: implement POS with payment processing, pass system, and sales tracking"
```

---

## Task 9: Dashboard Module API

**Files:**
- Create: `apps/api/src/dashboard/` (module, controller, service)

- [ ] **Step 1: Write tests for dashboard aggregation queries**
- [ ] **Step 2: Implement dashboard service**
  - Today's summary (revenue, booking count, new customers)
  - Date range sales data (from DailySales table)
  - Staff performance comparison
  - Customer stats (new vs returning ratio)
- [ ] **Step 3: Implement dashboard controller**
  - `GET /shops/:shopId/dashboard/summary` — today's stats
  - `GET /shops/:shopId/dashboard/sales?from=&to=` — sales data
  - `GET /shops/:shopId/dashboard/staff-performance?from=&to=` — staff comparison
- [ ] **Step 4: Run all tests, verify pass**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: implement dashboard with sales summary and staff performance"
```

---

## Task 10: B2B Web — Layout & Auth Pages

**Files:**
- Create: `apps/b2b-web/src/app/layout.tsx`, auth pages, dashboard layout, sidebar

- [ ] **Step 1: Set up Tailwind with dark theme defaults**
- [ ] **Step 2: Create auth pages** — `/login`, `/register` with form validation (Zod)
- [ ] **Step 3: Create dashboard layout** — sidebar navigation + header with user menu
- [ ] **Step 4: Set up API client** — axios/fetch wrapper with JWT token management
- [ ] **Step 5: Set up React Query provider**
- [ ] **Step 6: Implement auth flow** — login → store token → redirect to dashboard
- [ ] **Step 7: Verify manually** — register user, login, see dashboard skeleton
- [ ] **Step 8: Commit**

```bash
git commit -m "feat: implement B2B web layout with auth pages and dashboard shell"
```

---

## Task 11: B2B Web — Shop Settings Page

- [ ] **Step 1: Create settings page** — shop info form (name, type, address, hours)
- [ ] **Step 2: Service category management** — add/edit/reorder categories
- [ ] **Step 3: Service menu management** — add/edit services with price, duration, B2C visibility
- [ ] **Step 4: Commit**

```bash
git commit -m "feat: implement shop settings with service menu management"
```

---

## Task 12: B2B Web — Booking Calendar

- [ ] **Step 1: Create calendar day view** — time grid with staff columns, booking blocks
- [ ] **Step 2: Create calendar week view** — condensed weekly overview
- [ ] **Step 3: Create booking form dialog** — select customer, service, staff, time
- [ ] **Step 4: Implement available slot picker** — shows open times based on staff schedule
- [ ] **Step 5: Implement booking status actions** — confirm, start, complete, cancel, no-show
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: implement booking calendar with day/week views and booking form"
```

---

## Task 13: B2B Web — Customer Management

- [ ] **Step 1: Create customer list page** — searchable table with pagination
- [ ] **Step 2: Create customer detail page** — info, treatment timeline, payment history, pass list
- [ ] **Step 3: Create customer add/edit form** — with phone input
- [ ] **Step 4: Create treatment history component** — timeline with notes
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: implement customer CRM with list, detail, and treatment timeline"
```

---

## Task 14: B2B Web — Payment / POS

- [ ] **Step 1: Create payment form** — select customer, services, apply pass/discount, choose method
- [ ] **Step 2: Create pass management** — issue pass to customer, view usage history
- [ ] **Step 3: Create payment history list** — filterable by date, staff, method
- [ ] **Step 4: Create sales summary widget** — today's revenue breakdown
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: implement POS page with payment form, pass management, and sales summary"
```

---

## Task 15: B2B Web — Staff Management

- [ ] **Step 1: Create staff list page** — table with role, status, specialty
- [ ] **Step 2: Create staff add/edit form** — profile, role, color for calendar
- [ ] **Step 3: Create schedule editor** — weekly timetable with drag-to-set hours
- [ ] **Step 4: Create incentive configuration** — per-service rate setting
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: implement staff management with schedule and incentive configuration"
```

---

## Task 16: B2B Web — Dashboard Home

- [ ] **Step 1: Create stats cards** — today's revenue, bookings, new customers, no-shows
- [ ] **Step 2: Create revenue chart** — daily/weekly/monthly bar chart
- [ ] **Step 3: Create upcoming bookings widget** — next 5 bookings
- [ ] **Step 4: Create staff performance comparison** — bar chart of revenue per staff
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: implement dashboard with stats cards, charts, and booking overview"
```

---

## Task 17: Integration Test & Polish

- [ ] **Step 1: Run full API test suite**

```bash
cd apps/api && npm test
```

Expected: All tests PASS.

- [ ] **Step 2: Run full E2E flow manually**

Register → Create Shop → Add Services → Add Staff → Set Schedule → Add Customer → Create Booking → Process Payment → View Dashboard

- [ ] **Step 3: Fix any issues found**
- [ ] **Step 4: Final commit and push**

```bash
git add -A
git commit -m "test: complete integration testing and polish for Phase 1a MVP"
git push origin main
```

---

## Summary

| Task | Module | Scope |
|------|--------|-------|
| 1 | Scaffolding | Turborepo monorepo setup |
| 2 | Database | Prisma schema + migrations + seed |
| 3 | Auth API | Register, login, JWT, guards |
| 4 | Shop API | Shop + Service CRUD |
| 5 | Staff API | Staff + Schedule + Incentive |
| 6 | Customer API | CRM + Treatment history |
| 7 | Booking API | Calendar + overlap detection |
| 8 | Payment API | POS + Pass system |
| 9 | Dashboard API | Sales summary + analytics |
| 10 | B2B Web | Layout + Auth pages |
| 11 | B2B Web | Shop settings |
| 12 | B2B Web | Booking calendar |
| 13 | B2B Web | Customer management |
| 14 | B2B Web | Payment/POS |
| 15 | B2B Web | Staff management |
| 16 | B2B Web | Dashboard home |
| 17 | Integration | E2E testing + polish |
