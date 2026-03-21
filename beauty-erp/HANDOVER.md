# Beauty ERP - Handover Document (인수인계)

> 랩탑 ↔ 데스크탑 간 이동 시 현재 상태를 빠르게 파악하기 위한 문서입니다.
> 매 작업 세션 종료 시 업데이트됩니다.

---

## Current Status

| 항목 | 상태 |
|------|------|
| **현재 Phase** | Phase 1a: MVP Core |
| **현재 Task** | Task 1: Project Scaffolding |
| **진행률** | 시작 단계 |
| **마지막 업데이트** | 2026-03-21 |
| **마지막 커밋** | (프로젝트 초기 설정 중) |

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
- [ ] Task 1: Project Scaffolding (진행 중)

---

## What's In Progress (진행 중인 작업)

### Task 1: Project Scaffolding
- Turborepo 모노레포 초기화
- 디렉토리 구조 생성
- 공유 패키지 설정 (types, validators, ui, config)
- Docker 환경 구성

**다음 작업자가 해야 할 것:**
1. `npm install` 실행하여 의존성 확인
2. `docker-compose up -d`로 DB 서비스 확인
3. 현재 Task의 남은 Step 확인 후 이어서 진행

---

## What's Next (다음 작업)

1. Task 2: Prisma Schema & DB Setup
2. Task 3: NestJS API Foundation
3. Task 4: Next.js B2B Web Setup
4. ... (Phase 1a plan 참조)

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
