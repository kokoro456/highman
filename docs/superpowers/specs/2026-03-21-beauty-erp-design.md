# Beauty ERP System - Design Specification

**Date:** 2026-03-21
**Status:** Draft
**Version:** 1.0

---

## 1. Overview

### 1.1 Product Vision
뷰티 업종(속눈썹, 왁싱, 네일, 헤어, 피부관리, 반영구, 타투, 마사지 등) 전반을 위한 통합 ERP 시스템. 매장 운영자(B2B)와 고객(B2C) 양측을 연결하는 플랫폼.

### 1.2 Target Users
- **B2B (매장 운영자):** 원장님, 매니저, 직원 — 매장 관리 웹 + 모바일 앱
- **B2C (고객):** 서비스를 검색하고 예약하는 일반 소비자 — 고객 웹 + 모바일 앱

### 1.3 Revenue Model
SaaS 월 구독료 (매장 규모별 요금제 차등)

### 1.4 Benchmark Analysis
| 항목 | 공비서 (GongBiz) | 아하소프트 플러스 |
|------|-----------------|-----------------|
| 플랫폼 | B2B앱 + B2C앱 (양면) | 웹 SaaS |
| 업종 | 뷰티 전반 + 애견미용 | 뷰티 + 헬스케어 |
| 강점 | ZeroShop 인증, Cok 시술발견, Pass 시스템 | 네이버 연동, 아하콜, 인센티브 자동계산 |
| 약점 | B2C앱 미성숙, UI 노후화 | 앱 없음, AI 부재 |
| 기술 | Android Native (Kotlin) | Vue.js + jQuery |

### 1.5 Differentiation
- **AI 기반 분석:** 매출 예측, 고객 이탈 예측, 마케팅 자동화
- **현대적 UI/UX:** 프리미엄 디자인, 모바일 퍼스트
- **통합 대시보드:** 실시간 종합 분석
- **카드결제 자동 매출 인식:** PG 연동 기반 자동 매출 기록
- **웹 + 앱 완전 대응:** 공비서(앱 중심) + 아하소프트(웹 중심)의 장점 통합

---

## 2. Architecture

### 2.1 Approach: Modular Monorepo (Turborepo)

모듈러 모노레포를 선택한 이유:
- 4개 클라이언트(B2B 웹, B2C 웹, 원장님 앱, 고객 앱) 간 코드 재사용 극대화
- 독립적 배포 가능하면서도 단일 레포 관리의 이점
- 팀 확장 시 유연한 대응
- 향후 마이크로서비스로 점진적 전환 가능

### 2.2 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Monorepo** | Turborepo | 빌드 오케스트레이션, 캐싱 |
| **B2B Web** | Next.js 14+ (App Router) | 매장 관리 대시보드 |
| **B2C Web** | Next.js 14+ (App Router) | 고객 예약/검색 |
| **Mobile Apps** | React Native (Expo) | 원장님 앱 + 고객 앱 |
| **API** | NestJS | REST API Gateway |
| **ORM** | Prisma | DB 스키마 관리, 타입 안전 |
| **Database** | PostgreSQL | 메인 데이터 |
| **Cache** | Redis | 세션, 캐시, 실시간 큐 |
| **Storage** | S3 or R2 | 이미지/파일 저장 |
| **Auth** | NextAuth.js + JWT | 인증/인가 |
| **UI Library** | 공유 패키지 (Tailwind CSS + Radix UI) | 디자인 시스템 |

### 2.3 Monorepo Structure

```
beauty-erp/
├── apps/
│   ├── b2b-web/            # Next.js - 매장 관리 웹
│   ├── b2c-web/            # Next.js - 고객 예약 웹
│   ├── mobile-owner/       # React Native - 원장님 앱
│   ├── mobile-customer/    # React Native - 고객 앱
│   └── api/                # NestJS - API 서버
├── packages/
│   ├── ui/                 # 공유 UI 컴포넌트 (디자인 시스템)
│   ├── types/              # 공유 TypeScript 타입
│   ├── utils/              # 공유 유틸리티 함수
│   ├── validators/         # 공유 유효성 검증 (Zod)
│   ├── api-client/         # API 클라이언트 (React Query hooks)
│   └── config/             # 공유 설정 (ESLint, TSConfig 등)
├── prisma/
│   └── schema.prisma       # DB 스키마
├── turbo.json
└── package.json
```

### 2.4 System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│
│  │B2B Web   │ │B2C Web   │ │Owner App │ │Cust App ││
│  │(Next.js) │ │(Next.js) │ │(RN/Expo) │ │(RN/Expo)││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘│
└───────┼─────────────┼────────────┼────────────┼─────┘
        │             │            │            │
        └─────────────┼────────────┼────────────┘
                      ▼            ▼
┌─────────────────────────────────────────────────────┐
│              API GATEWAY (NestJS)                    │
│  Auth │ Rate Limiting │ Validation │ Logging         │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│              DOMAIN MODULES                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Booking │ │Customer│ │Payment │ │Staff   │       │
│  │Module  │ │Module  │ │Module  │ │Module  │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│  ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │Shop    │ │Notif.  │ │Dash-   │                   │
│  │Module  │ │Module  │ │board   │                   │
│  └────────┘ └────────┘ └────────┘                   │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│              DATA LAYER                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │PostgreSQL│ │  Redis   │ │  S3/R2   │            │
│  │(Prisma)  │ │(Cache)   │ │(Storage) │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│           EXTERNAL INTEGRATIONS                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Naver     │ │PG (Toss/ │ │Kakao     │ │AI      │ │
│  │Booking   │ │NHN KCP)  │ │AlimTalk  │ │(Claude)│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 3. Domain Modules

### 3.1 Booking Module (예약 관리)

**Purpose:** 캘린더 기반 예약 생성, 수정, 취소 및 스케줄 관리

**Core Entities:**
- `Booking` — 예약 건 (고객, 서비스, 직원, 시간, 상태)
- `Schedule` — 직원별 근무 스케줄
- `TimeSlot` — 예약 가능 시간대
- `WaitList` — 대기 명단 (V2)

**Key Features (MVP):**
- 캘린더 뷰 (일/주/월)
- 직원별 스케줄 관리
- 예약 생성/수정/취소
- 노쇼/중복예약 방지 (시간 슬롯 잠금)
- 네이버 예약 양방향 동기화
- B2C 온라인 예약 페이지
- 예약 상태 관리 (READY → BOOKING → COMPLETED / CANCELLED / NO_SHOW)

**Data Model:**
```
Booking {
  id              UUID PK
  shopId          UUID FK → Shop
  customerId      UUID FK → Customer
  staffId         UUID FK → Staff
  serviceId       UUID FK → Service
  startTime       DateTime
  endTime         DateTime
  status          Enum(READY, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
  source          Enum(DIRECT, NAVER, B2C_WEB, B2C_APP)
  memo            String?
  naverBookingId  String?   // 네이버 예약 연동 ID
  createdAt       DateTime
  updatedAt       DateTime
}

Schedule {
  id              UUID PK
  shopId          UUID FK → Shop
  staffId         UUID FK → Staff
  dayOfWeek       Int(0-6)
  startTime       Time
  endTime         Time
  breakStartTime  Time?
  breakEndTime    Time?
  isActive        Boolean
}
```

### 3.2 Customer Module (고객 CRM)

**Purpose:** 고객 정보, 시술 이력, 사진, 메모 관리

**Core Entities:**
- `Customer` — 고객 기본 정보
- `TreatmentHistory` — 시술 이력
- `CustomerPhoto` — 시술 전후 사진
- `CustomerMemo` — 메모/특이사항

**Key Features (MVP):**
- 고객 등록/검색/조회
- 시술 이력 타임라인
- 시술 전후 사진 관리
- 고객 메모/특이사항 기록
- 고객별 매출 요약

**Data Model:**
```
Customer {
  id              UUID PK
  shopId          UUID FK → Shop
  name            String
  phone           String (encrypted)
  email           String?
  gender          Enum(MALE, FEMALE, OTHER)?
  birthDate       Date?
  firstVisitDate  Date
  lastVisitDate   Date?
  visitCount      Int default(0)
  totalSpent      Decimal default(0)
  tier            Enum(NORMAL, VIP, VVIP) default(NORMAL)  // V2
  memo            String?
  tags            String[]
  consentMarketing Boolean default(false)
  createdAt       DateTime
  updatedAt       DateTime
}

TreatmentHistory {
  id              UUID PK
  customerId      UUID FK → Customer
  bookingId       UUID FK → Booking
  staffId         UUID FK → Staff
  serviceId       UUID FK → Service
  serviceName     String   // 시점의 서비스명 보존
  price           Decimal
  notes           String?
  photos          CustomerPhoto[]
  treatmentDate   DateTime
  createdAt       DateTime
}

CustomerPhoto {
  id              UUID PK
  customerId      UUID FK → Customer
  treatmentId     UUID FK → TreatmentHistory?
  type            Enum(BEFORE, AFTER, REFERENCE)
  imageUrl        String
  caption         String?
  createdAt       DateTime
}
```

### 3.3 Payment Module (매출/결제 POS)

**Purpose:** 결제 처리, 매출 자동 기록, 회원권 관리, 통계

**Core Entities:**
- `Payment` — 결제 건
- `Pass` — 회원권 (횟수권/금액권)
- `PassUsage` — 회원권 사용 내역
- `DailySales` — 일별 매출 집계

**Key Features (MVP):**
- 카드결제 연동 (PG사 통한 자동 매출 인식)
- 현금/카드/이체 결제 처리
- 회원권 발급 및 사용 관리
  - TICKET: 횟수권 (잔여 횟수 차감)
  - MEMBERSHIP: 금액권 (잔액 차감)
- 일별/월별 매출 통계
- 직원별 매출 추적
- 환불 처리

**Data Model:**
```
Payment {
  id              UUID PK
  shopId          UUID FK → Shop
  customerId      UUID FK → Customer
  bookingId       UUID FK → Booking?
  staffId         UUID FK → Staff
  amount          Decimal
  discount        Decimal default(0)
  finalAmount     Decimal
  method          Enum(CARD, CASH, TRANSFER, PASS, MIXED)
  status          Enum(PENDING, COMPLETED, REFUNDED, PARTIAL_REFUND)
  pgTransactionId String?  // PG사 거래 ID
  cardLastFour    String?
  passId          UUID FK → Pass?
  passAmount      Decimal? // Pass에서 차감된 금액
  memo            String?
  paidAt          DateTime
  createdAt       DateTime
}

Pass {
  id              UUID PK
  shopId          UUID FK → Shop
  customerId      UUID FK → Customer
  type            Enum(TICKET, MEMBERSHIP)
  name            String
  totalCount      Int?     // TICKET: 총 횟수
  remainingCount  Int?     // TICKET: 잔여 횟수
  totalAmount     Decimal? // MEMBERSHIP: 총 금액
  remainingAmount Decimal? // MEMBERSHIP: 잔여 금액
  price           Decimal  // 구매 금액
  startDate       Date
  expiryDate      Date?
  status          Enum(ACTIVE, EXPIRED, EXHAUSTED, CANCELLED)
  createdAt       DateTime
  updatedAt       DateTime
}
```

### 3.4 Staff Module (직원/인사)

**Purpose:** 직원 관리, 스케줄, 인센티브 계산

**Core Entities:**
- `Staff` — 직원 정보
- `StaffIncentive` — 인센티브 규칙 및 정산

**Key Features (MVP):**
- 직원 등록/프로필 관리
- 직원별 근무 스케줄 관리
- 인센티브 자동 계산 (서비스별/매출별)
- 직원별 예약/매출 현황

**Data Model:**
```
Staff {
  id              UUID PK
  shopId          UUID FK → Shop
  userId          UUID FK → User?
  name            String
  phone           String
  email           String?
  role            Enum(OWNER, MANAGER, DESIGNER, ASSISTANT, INTERN)
  specialties     String[]   // 전문 시술 목록
  profileImageUrl String?
  color           String     // 캘린더 표시 색상
  sortOrder       Int
  isActive        Boolean default(true)
  hiredAt         Date
  createdAt       DateTime
  updatedAt       DateTime
}

StaffIncentive {
  id              UUID PK
  staffId         UUID FK → Staff
  shopId          UUID FK → Shop
  type            Enum(PERCENTAGE, FIXED)
  serviceId       UUID FK → Service?  // null이면 전체 서비스
  rate            Decimal  // PERCENTAGE: 비율, FIXED: 고정금액
  isActive        Boolean default(true)
  createdAt       DateTime
}
```

### 3.5 Shop Module (매장 관리)

**Purpose:** 매장 정보, 업종 설정, 서비스/메뉴 관리

**Core Entities:**
- `Shop` — 매장 기본 정보
- `Service` — 시술 메뉴
- `ServiceCategory` — 시술 카테고리

**Data Model:**
```
Shop {
  id              UUID PK
  ownerId         UUID FK → User
  name            String
  businessType    Enum(NAIL, EYELASH, WAXING, HAIR, SKIN, SEMI_PERMANENT, TATTOO, MASSAGE, BARBER, TANNING, SCALP, MAKEUP, PET_GROOMING, OTHER)
  phone           String
  address         String
  addressDetail   String?
  latitude        Decimal?
  longitude       Decimal?
  description     String?
  profileImageUrl String?
  coverImageUrl   String?
  businessHours   Json     // {mon: {open: "09:00", close: "21:00"}, ...}
  closedDays      String[] // ["SUN", "HOLIDAY"]
  subscriptionTier Enum(FREE, BASIC, PROFESSIONAL, ENTERPRISE)
  naverPlaceId    String?  // 네이버 예약 연동
  isActive        Boolean default(true)
  createdAt       DateTime
  updatedAt       DateTime
}

ServiceCategory {
  id              UUID PK
  shopId          UUID FK → Shop
  name            String
  sortOrder       Int
  isActive        Boolean default(true)
}

Service {
  id              UUID PK
  shopId          UUID FK → Shop
  categoryId      UUID FK → ServiceCategory
  name            String
  description     String?
  duration         Int      // 소요시간 (분)
  price           Decimal
  b2cPrice        Decimal? // B2C 노출 가격 (다를 경우)
  isLinkedB2c     Boolean default(true) // B2C 노출 여부
  imageUrl        String?
  sortOrder       Int
  isActive        Boolean default(true)
  createdAt       DateTime
  updatedAt       DateTime
}
```

### 3.6 Notification Module (알림)

**Purpose:** 푸시 알림, 카카오 알림톡, 예약 리마인더

**Key Features (MVP):**
- 예약 확정 알림 (카카오 알림톡)
- 예약 리마인드 (1일 전, 1시간 전)
- 예약 취소 알림
- 앱 푸시 알림 (FCM)

---

## 4. Authentication & Authorization

### 4.1 Auth Flow
- **매장 운영자:** 이메일/비밀번호 + 소셜 로그인 (카카오, 네이버)
- **고객:** 전화번호 인증 (SMS OTP) + 소셜 로그인
- **JWT 기반:** Access Token (15min) + Refresh Token (7d)

### 4.2 Role-Based Access Control (RBAC)
```
User {
  id              UUID PK
  email           String? unique
  phone           String? unique
  name            String
  role            Enum(ADMIN, SHOP_OWNER, SHOP_STAFF, CUSTOMER)
  authProvider    Enum(EMAIL, KAKAO, NAVER, PHONE)
  passwordHash    String?
  isActive        Boolean default(true)
  createdAt       DateTime
  updatedAt       DateTime
}
```

**Permission Matrix:**
| Action | ADMIN | SHOP_OWNER | SHOP_STAFF | CUSTOMER |
|--------|-------|------------|------------|----------|
| Manage Shop Settings | All | Own shop | - | - |
| View Dashboard | All | Own shop | Own stats | - |
| Manage Bookings | All | Own shop | Assigned | Own bookings |
| Manage Customers | All | Own shop | Assigned | Own profile |
| Process Payments | All | Own shop | With permission | - |
| Manage Staff | All | Own shop | - | - |
| View Reports | All | Own shop | Limited | - |

---

## 5. External Integrations

### 5.1 Naver Booking (네이버 예약)
- 양방향 동기화: 네이버 → 시스템, 시스템 → 네이버
- Webhook 기반 실시간 업데이트
- 네이버 플레이스 예약 API 활용

### 5.2 PG Payment (카드결제)
- 토스페이먼츠 또는 NHN KCP 연동
- 결제 완료 시 자동 매출 기록
- 환불 처리 지원

### 5.3 Kakao AlimTalk (카카오 알림톡)
- 예약 확정/변경/취소 알림
- 예약 리마인드 (D-1, H-1)
- 마케팅 메시지 (V2, 고객 동의 필요)

### 5.4 Push Notifications (FCM)
- Firebase Cloud Messaging 기반
- 앱 푸시 알림 (예약, 공지 등)

---

## 6. Subscription Tiers

| Tier | 대상 | 주요 기능 |
|------|------|----------|
| **FREE** | 체험용 | 기본 예약/고객 관리 (제한적) |
| **BASIC** | 1인 매장 | 전체 MVP 기능, 직원 1명 |
| **PROFESSIONAL** | 소규모 (2-10명) | 전체 기능, 직원 10명, 고급 통계 |
| **ENTERPRISE** | 대규모/다점포 | 무제한 직원, 다점포 관리, API 접근 |

---

## 7. Development Phases

### Phase 1: MVP (Foundation)
- 프로젝트 세팅 (Turborepo 모노레포)
- 인증/인가 시스템 (JWT, RBAC)
- 매장/서비스 설정 모듈
- 예약 캘린더 (일/주/월 뷰)
- 고객 CRM (기본 정보, 시술 이력, 사진)
- POS/결제 (카드결제 자동 매출 인식, 회원권)
- 직원 관리 (스케줄, 인센티브)
- 기본 대시보드 (매출 요약, 예약 현황)
- 네이버 예약 연동
- 카카오 알림톡
- B2B 웹 (매장 관리)
- B2C 웹 (온라인 예약)

### Phase 2: Growth (확장)
- React Native 모바일 앱 (원장님 + 고객)
- 회원권/쿠폰 고급 기능
- 리뷰 시스템
- VIP 등급 관리
- 출퇴근 관리
- 시술동의서 전자서명
- SMS/LMS 문자 발송
- 고급 통계/분석

### Phase 3: AI & Scale (차별화)
- AI 매출 예측
- AI 고객 이탈 예측
- AI 마케팅 자동화 (문구 생성)
- AI 예약 최적화 추천
- 다점포 통합 관리/비교 분석
- 인스타그램 연동
- 세금계산서 연동

### Phase 4: Platform (플랫폼화)
- 마켓플레이스 기능
- 서드파티 플러그인 시스템
- API 공개 (개발자 생태계)
- 화이트라벨 지원
- 엔터프라이즈 기능

---

## 8. Non-Functional Requirements

### 8.1 Performance
- API 응답 시간: < 200ms (P95)
- 페이지 로드: < 2s (LCP)
- 동시 접속 처리: 매장당 10명 이상

### 8.2 Security
- 고객 전화번호 암호화 저장 (AES-256)
- HTTPS 전체 적용
- SQL Injection, XSS 방지 (Prisma + Zod validation)
- 개인정보보호법 준수

### 8.3 Scalability
- 수평 확장 가능한 API 서버 (stateless)
- DB 읽기 복제본 지원
- CDN 기반 정적 자산 배포

### 8.4 Monitoring
- 에러 추적 (Sentry)
- APM (Application Performance Monitoring)
- 로그 수집 (structured logging)

---

## 9. Infrastructure (TBD)

인프라는 MVP 개발 진행 중 결정 예정. 후보:
- **Vercel + Supabase:** Next.js 최적화, 빠른 초기 개발
- **AWS (ECS + RDS):** 프로덕션 안정성, 한국 리전
- **Cloudflare:** 엣지 컴퓨팅, 비용 효율

---

## 10. Benchmark-Derived Features

공비서/아하소프트 분석에서 도출한 구현 참고사항:

### From 공비서 (GongBiz):
- **이중 가격 시스템:** `price` (B2B) + `b2cPrice` (B2C 노출가) + `isLinkedB2c` 플래그 → 적용
- **Pass 시스템:** TICKET (횟수권) + MEMBERSHIP (금액권) 이중 구조 → 적용
- **ZeroShop 인증:** 매장 인증/뱃지 시스템 → Phase 2에서 고려
- **Cok (시술 발견):** 개별 시술 기반 검색/추천 → Phase 2 B2C에서 고려
- **블록 기반 CMS:** 메인 페이지 동적 구성 → Phase 2에서 고려

### From 아하소프트:
- **인센티브 자동 계산:** 직원별/서비스별 비율/고정 설정 → MVP 적용
- **네이버 예약 연동:** 양방향 동기화 → MVP 적용
- **노쇼/중복예약 방지:** 시간 슬롯 잠금 → MVP 적용
- **다양한 회원권 유형:** 금액권/할인권/횟수권/포인트/가족 → 점진적 확장
