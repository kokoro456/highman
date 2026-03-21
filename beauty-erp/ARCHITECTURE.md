# Beauty ERP - Architecture & Conventions

> 이 문서는 프로젝트의 아키텍처 결정사항과 코드 컨벤션을 기록합니다.
> 모든 개발자는 코드 작성 전 이 문서를 숙지해야 합니다.

---

## 1. Core Principles

### 1.1 Anti-Spaghetti Rules
- **Single Responsibility**: 하나의 파일은 하나의 역할만 수행
- **Module Boundary**: 도메인 모듈 간 직접 import 금지 → 반드시 public API(index.ts)를 통해 접근
- **No Circular Dependencies**: 순환 참조 절대 금지
- **Explicit over Clever**: 영리한 코드보다 명시적인 코드 우선
- **Small Files**: 파일당 200줄 이하 권장, 300줄 이상이면 반드시 분리

### 1.2 Long-term Maintainability
- 매 Phase/Task 완료 시 git commit (롤백 가능)
- 모든 public API에는 JSDoc 주석 필수
- 새 모듈 추가 시 이 문서 업데이트 필수
- 외부 의존성 추가 시 사유 기록

---

## 2. Monorepo Structure

```
beauty-erp/
├── apps/
│   ├── api/          # NestJS REST API (Port 4000)
│   └── b2b-web/      # Next.js 14 B2B Dashboard (Port 3000)
├── packages/
│   ├── types/        # 공유 TypeScript 타입/인터페이스
│   ├── validators/   # 공유 Zod 스키마 (프론트+백 동일 검증)
│   ├── ui/           # 공유 UI 컴포넌트 (디자인 시스템)
│   └── config/       # 공유 ESLint, TSConfig
├── prisma/           # DB 스키마 & 마이그레이션
└── docs/             # 설계 문서, 기획서
```

### 2.1 Package Dependency Rules
```
apps/b2b-web → packages/ui, packages/types, packages/validators
apps/api     → packages/types, packages/validators
packages/ui  → packages/types (타입만)
packages/validators → packages/types (타입만)
packages/types → (의존성 없음)
```

---

## 3. Backend Conventions (NestJS API)

### 3.1 Module Structure
```
src/[domain]/
├── [domain].module.ts      # 모듈 정의
├── [domain].controller.ts  # HTTP 라우팅만 담당 (비즈니스 로직 X)
├── [domain].service.ts     # 비즈니스 로직
├── [domain].repository.ts  # DB 접근 (Prisma 쿼리 캡슐화) — 필요 시
└── dto/
    ├── create-[domain].dto.ts
    └── update-[domain].dto.ts
```

### 3.2 Naming Conventions
| 항목 | 규칙 | 예시 |
|------|------|------|
| 파일명 | kebab-case | `shop.service.ts` |
| 클래스명 | PascalCase | `ShopService` |
| 메서드명 | camelCase | `findByShopId()` |
| DTO | PascalCase + Dto | `CreateShopDto` |
| Enum | PascalCase | `BookingStatus` |
| DB 컬럼 | camelCase | `shopId`, `createdAt` |

### 3.3 API Response Format
```typescript
// 성공
{ "data": T, "message": "ok" }

// 에러
{ "error": { "code": "BOOKING_CONFLICT", "message": "..." }, "statusCode": 409 }

// 페이지네이션
{ "data": T[], "meta": { "total": number, "page": number, "limit": number, "totalPages": number } }
```

### 3.4 Multi-Tenancy
- 모든 엔티티에 `shopId` 필수
- `ShopAccessGuard`에서 요청별 shopId 검증
- Prisma middleware로 쿼리에 shopId 필터 자동 적용

---

## 4. Frontend Conventions (Next.js B2B Web)

### 4.1 Directory Structure
```
src/
├── app/               # App Router pages (라우팅만)
├── components/
│   ├── layout/        # 레이아웃 컴포넌트 (Sidebar, Header)
│   ├── [domain]/      # 도메인별 컴포넌트
│   └── common/        # 공통 컴포넌트
├── hooks/             # Custom React hooks
├── lib/               # 유틸리티, API 클라이언트
└── styles/            # 글로벌 스타일
```

### 4.2 Component Rules
- **Page 컴포넌트**: 데이터 fetching + 레이아웃 조합만 담당
- **Feature 컴포넌트**: 비즈니스 로직 포함, 도메인 폴더에 위치
- **UI 컴포넌트**: packages/ui에 위치, 비즈니스 로직 없음
- props 3개 이상이면 interface로 분리

### 4.3 State Management
- **Server State**: React Query (TanStack Query)
- **Form State**: React Hook Form + Zod
- **UI State**: React useState/useReducer (최소한으로)
- **Global State**: 필요 시 Zustand (Context API 지양)

### 4.4 Design System
- Tailwind CSS + Radix UI 기반
- 디자인 토큰은 tailwind.config.ts에서 중앙 관리
- 색상, 간격, 타이포그래피 모두 시맨틱 토큰 사용
- 하드코딩된 색상/크기 금지

---

## 5. Git Conventions

### 5.1 Commit Messages
```
<type>(<scope>): <description>

Types: feat, fix, refactor, docs, style, test, chore
Scope: api, web, ui, types, validators, prisma, config
```

### 5.2 Commit Points
- 매 Task 완료 시
- 중요 기능 구현 완료 시
- 데이터베이스 스키마 변경 시
- 큰 리팩토링 전/후

---

## 6. Dependency Decisions

| 패키지 | 버전 | 사유 |
|--------|------|------|
| Turborepo | ^2.3 | 모노레포 빌드 오케스트레이션 |
| Next.js | 14+ | App Router, SSR, 한국 사용자 최적화 |
| NestJS | ^10 | 엔터프라이즈급 백엔드 프레임워크 |
| Prisma | ^5 | 타입 안전 ORM, 마이그레이션 관리 |
| Tailwind CSS | ^3 | 유틸리티 퍼스트 CSS |
| Radix UI | latest | 접근성 기반 헤드리스 UI |
| Zod | ^3 | 프론트/백 공유 검증 |
| React Query | ^5 | 서버 상태 관리 |

---

## 7. Security Checklist
- [ ] PII 암호화 (phone, birthDate) — AES-256
- [ ] HTTPS only
- [ ] SQL Injection 방지 (Prisma parameterized queries)
- [ ] XSS 방지 (React 기본 + DOMPurify)
- [ ] CSRF 토큰 (쿠키 사용 시)
- [ ] Rate Limiting (비인증 100req/min, 인증 1000req/min)
- [ ] JWT 보안 (httpOnly cookie, short expiry)
