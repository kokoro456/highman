# Beauty ERP - Handover Document (인수인계)

> 랩탑 ↔ 데스크탑 간 이동 시 현재 상태를 빠르게 파악하기 위한 문서입니다.
> 매 작업 세션 종료 시 업데이트됩니다.

---

## Current Status

| 항목 | 상태 |
|------|------|
| **현재 Phase** | Phase 1a: MVP Core |
| **현재 Task** | Phase 1a 완료 + UI/UX 개선 완료 |
| **진행률** | 배포 완료, CRUD 동작, 토스트/로그아웃 추가됨 |
| **마지막 업데이트** | 2026-03-21 |
| **프론트엔드** | https://highman.vercel.app |
| **API 서버** | https://highman-production.up.railway.app |
| **DB** | Supabase PostgreSQL (Seoul) |
| **마지막 커밋** | `7fc8684` feat(erp): UI/UX improvements |

---

## Environment Setup (환경 설정)

### Prerequisites
- Node.js 20+ (LTS)
- npm 10+
- Docker Desktop (PostgreSQL + Redis)
- Git

### Quick Start
```bash
cd C:/highman/beauty-erp
npm install
docker-compose up -d          # PostgreSQL + Redis 시작
cp .env.example .env          # 환경변수 복사
npx prisma migrate dev        # DB 마이그레이션
npx prisma db seed            # 시드 데이터
npm run dev                   # 전체 개발 서버 시작
```

### Ports
| 서비스 | 포트 |
|--------|------|
| B2B Web (Next.js) | 3000 |
| API (NestJS) | 4000 |
| PostgreSQL | 5432 |
| Redis | 6379 |

---

## What's Done (완료된 작업)

- [x] 설계 스펙 문서 작성 (`docs/superpowers/specs/`)
- [x] Phase 1a 구현 계획 작성 (`docs/superpowers/plans/`)
- [x] 프로젝트 문서 생성 (ARCHITECTURE.md, ERROR_LOG.md, HANDOVER.md)
- [x] Task 1: Project Scaffolding (Turborepo 모노레포 + 99파일)
- [x] Task 2: Prisma Schema (18 models, 16 enums)
- [x] Task 3: NestJS API Foundation (Auth JWT + Passport)
- [x] Task 4: Next.js B2B Web (High-end UI, Geist font, Emerald accent)
- [x] Task 5: Shop/Service Module (API CRUD + Settings UI)
- [x] Task 6: Booking Module (Conflict detection + Calendar UI)
- [x] Task 7: Customer Module (Paginated search + Detail/Timeline UI)
- [x] Task 8: Payment Module (Transaction + Pass deduction + Dashboard UI)
- [x] Task 9: Staff Module (Schedule upsert + Staff cards UI)
- [x] Task 10: Dashboard Module (Overview metrics + Revenue chart API)
- [x] npm install 완료 (795 packages)

---

## What's In Progress (진행 중인 작업)

### Docker/DB 설정 필요
- Docker Desktop이 아직 설치되지 않음
- PostgreSQL + Redis 컨테이너 필요

**다음 작업자가 해야 할 것:**
1. Docker Desktop 설치
2. `cd C:/highman/beauty-erp && docker compose up -d`
3. `cp .env.example .env`
4. `npx prisma migrate dev --name init` (DB 스키마 적용)
5. `npx prisma db seed` (시드 데이터 — 아직 미작성)
6. `npm run dev` (전체 개발 서버 시작)

---

## What's Next (다음 작업)

1. Docker 설치 + DB 연결 + Prisma 마이그레이션
2. Prisma seed 데이터 작성 (테스트용 샘플 데이터)
3. API-Frontend 연동 (mock 데이터 → 실제 API 호출로 전환)
4. Phase 1b: PG 결제 연동, 네이버 예약, 카카오 알림톡, B2C 웹

---

## Known Issues (알려진 이슈)

_현재 알려진 이슈 없음_

---

## Key Files Reference

| 파일 | 용도 |
|------|------|
| `docs/superpowers/specs/2026-03-21-beauty-erp-design.md` | 전체 설계 스펙 |
| `docs/superpowers/plans/2026-03-21-phase1a-mvp-core.md` | Phase 1a 구현 계획 |
| `ARCHITECTURE.md` | 아키텍처 & 코딩 컨벤션 |
| `ERROR_LOG.md` | 오류 기록 (오답노트) |
| `HANDOVER.md` | 이 문서 (인수인계) |

---

## Git Branch Strategy

- `main`: 안정된 코드 (Phase 완료 시 머지)
- `dev`: 개발 통합 브랜치
- `feat/*`: 기능 개발 브랜치
- 현재 작업 브랜치: `main` (초기 설정 중)
